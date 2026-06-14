import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  const { id } = await params;
  const { query } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    console.log("[documents/scenario-answer] Fetching document:", id);

    // 1. Fetch document metadata from database using raw SQL
    const docs = await prisma.$queryRaw`
      SELECT id, analysis, "scenarioAnswers"
      FROM "Document"
      WHERE id = ${id} AND "userId" = ${userId}
    `;

    if (!docs || (docs as any[]).length === 0) {
      console.error("[documents/scenario-answer] Document not found");
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const doc = (docs as any[])[0];

    console.log("[documents/scenario-answer] Document found, has analysis:", !!doc.analysis);

    if (!doc.analysis) {
      console.error("[documents/scenario-answer] Document has no analysis");
      return NextResponse.json({ error: "Document has not been analyzed yet." }, { status: 400 });
    }

    // 2. Check if answer is already cached
    const scenarioAnswers = doc.scenarioAnswers as Record<string, string> | null;
    if (scenarioAnswers && scenarioAnswers[query]) {
      console.log("[documents/scenario-answer] Returning cached answer");
      return NextResponse.json({ answer: scenarioAnswers[query] });
    }

    // 3. Call Gemini API to answer the scenario question
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[documents/scenario-answer] GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables. Please add it to your .env file." },
        { status: 400 }
      );
    }

    const prompt = `
You are an insurance policy expert. Based on the following insurance policy analysis, answer the user's question.

Policy Analysis:
${JSON.stringify(doc.analysis, null, 2)}

User Question: ${query}

Provide a clear, concise answer that explains:
1. Whether this scenario is covered or not
2. What the coverage limits are (if applicable)
3. Any conditions or exclusions that apply
4. What the user should do or expect in this situation

Keep your answer under 200 words and use simple, easy-to-understand language.
`;

    console.log("[documents/scenario-answer] Calling Gemini API...");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    console.log("[documents/scenario-answer] Gemini API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[documents/scenario-answer] Gemini API error:", errorText);

      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few minutes." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Gemini API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

    console.log("[documents/scenario-answer] Successfully got answer, caching it");

    // 4. Cache the answer
    const updatedAnswers = { ...(scenarioAnswers || {}), [query]: responseText };
    await prisma.$executeRaw`
      UPDATE "Document"
      SET "scenarioAnswers" = ${JSON.stringify(updatedAnswers)}::jsonb
      WHERE id = ${id}
    `;

    return NextResponse.json({ answer: responseText });
  } catch (err) {
    console.error("[documents/scenario-answer] error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to get answer: ${errorMessage}` },
      { status: 500 }
    );
  }
}
