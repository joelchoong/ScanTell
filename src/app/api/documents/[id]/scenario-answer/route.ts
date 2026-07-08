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

Core guidelines:
- Use ONLY information explicitly stated in the provided policy text. Do not use external insurance knowledge, assumptions, interpretations, or typical industry practices.
- Extract facts only. Preserve conditions, exceptions, qualifiers, limitations, and eligibility requirements.
- TRANSLATE policy jargon into plain English. Never quote internal item numbers, schedule references, or clause codes that a layperson wouldn't understand. For example:
  - "No limit for items 2 to 27" → "No lifetime limit on your coverage"
  - "SmartMedic Shield items 2-27" → "your core medical coverage"
  - "IL Premium Waiver Extra Rider" → "premium waiver rider"
  - "Next birthday" age references → just state the age plainly, e.g. "up to age 100"
- Prioritize information in this order:
  1. Coverage amounts and annual/lifetime limits
  2. Coverage age / maximum coverage age
  3. Eligibility and durations
  4. Waiting periods
  5. Exclusions
  6. Charges/premiums
  7. Claim requirements
- Never create page/section references. Include references only when explicitly present in the policy text.
- If information is unavailable, output: "Not specified in policy."

Formatting rules — follow these exactly:
1. EVERY line MUST use "Label: Value" format. Example: "Annual Limit: RM1,650,000" or "Coverage Age: Up to age 100".
2. Each DISTINCT concept MUST be its own separate line. Do NOT combine fundamentally different topics on one line. Examples of distinct concepts: annual limit, lifetime limit, coverage age, waiting periods, exclusions.
3. Within a single concept, consolidate related sub-items using semicolons. Example: "Annual Limit: SmartMedic Shield RM1,650,000; Extender additional RM2,000,000; Double Limit additional RM3,650,000; Overall RM7,300,000".
   - All annual limit breakdowns (base + extensions + overall total) = ONE line labelled "Annual Limit"
   - All lifetime limit info = ONE line labelled "Lifetime Limit"
   - All coverage age info = ONE line labelled "Coverage Age"
4. Group all exclusions into ONE line: "Exclusions: cosmetic surgery, congenital conditions".
5. For premium/charge tables, use semicolon-separated age brackets: "Premium by Age: Up to 80 RM250; 81-85 RM1,340".
6. For waiting periods, use condition:duration format: "Waiting Periods: Hospitalisation 30 days; Critical Illness 90 days".
7. Maximum 15 output lines. Each line ≤30 words.
8. No markdown, no bullet points, no blank lines, no standalone headers.
9. Include page references only when present in source text, appended in parentheses: "Label: Value. (Page 12)".
10. Never invent or infer information not in the policy text.
11. ALWAYS include coverage age / maximum age if mentioned in the policy — this is critical information.

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
        // Parse the error for a user-friendly message
        let geminiErrorMsg = "Failed to generate response from Gemini API";
        try {
          const errJson = JSON.parse(errText);
          const status = errJson?.error?.status;
          const message = errJson?.error?.message;
          if (status === "RESOURCE_EXHAUSTED") {
            geminiErrorMsg = "AI quota exceeded. Please try again later or check your Gemini API billing.";
          } else if (status === "INVALID_ARGUMENT") {
            geminiErrorMsg = "Invalid request to AI. Please try again.";
          } else if (message) {
            geminiErrorMsg = message;
          }
        } catch {}
        throw new Error(geminiErrorMsg);
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
        data: { scenarioAnswers: updatedAnswers as any },
      });

      // Log Q&A for training analysis — fire and forget
      prisma.userQuestion.create({
        data: {
          userId,
          question: query,
          answer,
          source: "scenario",
          aiModel: "gemini-2.5-flash",
          documentId: id,
        },
      }).catch((err) => console.error("[scenario-answer] Failed to log Q&A:", err));
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

