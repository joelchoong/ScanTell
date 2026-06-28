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
  const { query, scenarioId } = await req.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    // Fetch document from database
    const doc = await prisma.document.findFirst({
      where: { id, userId },
      select: {
        id: true,
        extractedText: true,
        analysis: true,
        scenarioAnswers: true,
      },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const scenarioAnswers = doc.scenarioAnswers as Record<string, string> | null;
    let answer = scenarioAnswers?.[query] || (scenarioId ? scenarioAnswers?.[scenarioId] : null);

    // If answer is not cached or is the generic fallback error string, generate it on-the-fly
    const isInvalidAnswer = !answer || answer === "Answer not available. Please re-analyze the document.";
    
    if (isInvalidAnswer) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "GEMINI_API_KEY is not configured." },
          { status: 500 }
        );
      }

      const contextText = doc.extractedText || JSON.stringify(doc.analysis, null, 2);
      const prompt = `You are an insurance policy analyst. Answer the question below using ONLY facts from the policy context.

Formatting rules — follow these exactly:
1. Use terse "Label: Value" format. Example: "Annual Limit: RM7,300,000."
2. CONSOLIDATE related items. Group exclusions/items by category on ONE line using commas. Example: "Death Exclusions: suicide (1st year). (Page 13)" NOT separate lines for each exclusion.
3. Maximum 10 output lines total. Merge aggressively — combine similar items.
4. Strip filler words — never start with "The", "This", "It is", "Benefit payable is". Lead with the fact.
5. Each line ≤20 words. No full sentences or paragraphs.
6. Include page/section references (e.g. "Section 4.2", "Page 12") ONLY when the source text contains them. One reference per grouped line is enough.
7. Prefer exact values: amounts, percentages, durations, ages, waiting periods, caps.
8. If information is not found, state "Not specified in policy".
9. Never invent or infer information not present in the policy text.
10. Limit response to at most 120 words.
11. CRITICAL: For waiting periods, ALWAYS use "Condition: Duration" format. Examples: "Hospitalisation: 30 days", "Surgery: 14 days", "Critical Illness: 90 days". Never provide just "30 days" without the condition label.
12. CRITICAL: For premium/charge tables with age brackets, use semicolon-separated format: "Up to 80: RM250; 81-85: RM1,340; 86-90: RM2,290". This enables table rendering.
13. CRITICAL: Group all exclusions together under single labels like "Exclusions" or "Excluded Treatments". Combine multiple exclusion categories into one consolidated list.

Policy Context:
${contextText}

Question:
${query}`;

      console.log(`[scenario-answer] Generating dynamic answer using Gemini for document ${id}...`);

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error("[scenario-answer] Gemini API Error:", errText);
        throw new Error("Failed to generate response from Gemini API");
      }

      const geminiData = await geminiRes.json();
      answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!answer) {
        answer = "Answer not specified in policy.";
      }

      // Save the newly generated answer to the database
      const updatedAnswers: Record<string, string> = {
        ...(scenarioAnswers || {}),
        [query]: answer,
      };
      if (scenarioId) {
        updatedAnswers[scenarioId] = answer;
      }

      await prisma.document.update({
        where: { id },
        data: {
          scenarioAnswers: updatedAnswers as any,
        },
      });
      
      console.log(`[scenario-answer] Successfully saved dynamic answer for document ${id}.`);
    }

    return NextResponse.json({ answer });
  } catch (err) {
    console.error("[documents/scenario-answer] error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to get answer: ${errorMessage}` },
      { status: 500 }
    );
  }
}

