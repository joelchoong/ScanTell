import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "application/octet-stream";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  const { id } = await params;

  try {
    // 1. Fetch document metadata
    const doc = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // 2. Skip if already analyzed (both analysis metadata and extractedText must exist)
    if (doc.analysis && doc.extractedText) {
      let scenarios: any[] = [];

      if (doc.isInsuranceDocument) {
        const rawScenarios = await prisma.$queryRaw`
          SELECT id, title, icon, query, description, "documentTypes", "usageCount"
          FROM "Scenario"
          WHERE "documentTypes" @> ARRAY['insurance']::text[]
          ORDER BY "usageCount" DESC
          LIMIT 4
        `;
        scenarios = rawScenarios as any[];
      }

      return NextResponse.json({ document: doc, scenarios });
    }

    // 3. Env checks
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY missing" },
        { status: 400 }
      );
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json(
        { error: "BLOB_READ_WRITE_TOKEN missing" },
        { status: 500 }
      );
    }

    // 4. Fetch file
    const fileResponse = await fetch(doc.fileUrl, {
      headers: {
        Authorization: `Bearer ${blobToken}`,
      },
    });

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      return NextResponse.json(
        {
          error: `Failed to fetch file: ${fileResponse.status} ${errorText}`,
        },
        { status: 500 }
      );
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const mimeType = getMimeType(doc.name);

    // 5. Gemini document analysis
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                {
                  text:
                    "Analyze this document. Extract all readable text (OCR) from the document and return it in the extractedText field, along with the structured analysis.",
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 65536,
            responseSchema: {
              type: "OBJECT",
              properties: {
                isInsuranceDocument: {
                  type: "BOOLEAN",
                  description: "Whether this document is an insurance document.",
                },
                summary: {
                  type: "STRING",
                  description: "Brief 2-3 sentence summary of what the document covers.",
                },
                extractedText: {
                  type: "STRING",
                  description: "All readable text extracted from the document (OCR).",
                },
                analysis: {
                  type: "OBJECT",
                  properties: {
                    insurer: { type: "STRING" },
                    policyType: { type: "STRING" },
                    policyHolder: { type: "STRING" },
                    coverageLimits: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          item: { type: "STRING" },
                          limit: { type: "STRING" },
                        },
                        required: ["item", "limit"],
                      },
                    },
                    exclusions: {
                      type: "ARRAY",
                      items: { type: "STRING" },
                    },
                    deductible: { type: "STRING" },
                    startDate: { type: "STRING" },
                    expiryDate: { type: "STRING" },
                  },
                  required: ["insurer", "policyType", "policyHolder", "coverageLimits", "exclusions"],
                },
              },
              required: ["isInsuranceDocument", "summary", "extractedText", "analysis"],
            },
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const responseText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json(
        { error: "No Gemini response" },
        { status: 500 }
      );
    }

    const parsedData = JSON.parse(responseText);

    // 6. Save base analysis
    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        isInsuranceDocument: parsedData.isInsuranceDocument,
        summary: parsedData.summary,
        extractedText: parsedData.extractedText || "",
        analysis: parsedData.analysis,
      },
    });

    // 7. Load scenarios
    let scenarios: any[] = [];
    let scenarioIds: string[] = [];

    if (parsedData.isInsuranceDocument) {
      const rawScenarios = await prisma.$queryRaw`
        SELECT id, title, icon, query, description, "documentTypes", "usageCount"
        FROM "Scenario"
        WHERE "documentTypes" @> ARRAY['insurance']::text[]
        ORDER BY "usageCount" DESC
        LIMIT 4
      `;

      scenarios = rawScenarios as any[];
      scenarioIds = scenarios.map((s) => s.id);
    }

    await prisma.$executeRaw`
      UPDATE "Document"
      SET "scenarioIds" = ${scenarioIds}::text[]
      WHERE id = ${id}
    `;

    // 8. SINGLE Gemini call for ALL scenario answers
    let scenarioAnswers: Record<string, string> = {};

    if (parsedData.isInsuranceDocument && scenarios.length > 0) {
      const contextText = parsedData.extractedText || JSON.stringify(parsedData.analysis, null, 2);
      const batchPrompt = `
You are an insurance policy analyst. Respond ONLY with valid JSON — no markdown, no prose.

Return EXACTLY this structure:

{
"coverageLimits": {
"summary": "",
"annualLimit": "",
"lifetimeLimit": "",
"importantNotes": []
},
"claimsRequirements": {
"summary": "",
"waitingPeriods": [],
"preApprovalRequirements": [],
"claimRejectionReasons": []
},
"surgeryExclusions": {
"summary": "",
"excludedProcedures": [],
"importantNotes": []
},
"premiumChanges": {
"summary": "",
"premiumIncreaseRules": [],
"coverageChangeRules": [],
"claimImpact": []
},
"answers": {
"question text here": "answer text here"
}
}

Core guidelines:
- Use ONLY information explicitly stated in the provided policy text. Do not use external insurance knowledge, assumptions, interpretations, or typical industry practices.
- Extract facts only. Preserve conditions, exceptions, qualifiers, limitations, and eligibility requirements.
- Prioritize information in this order:
  1. Benefits and coverage amounts
  2. Eligibility and durations
  3. Waiting periods
  4. Exclusions
  5. Charges/premiums
  6. Claim requirements
- Never create page/section references. Include references only when explicitly present in the policy text.
- If information is unavailable, output: "Not specified in policy."

Formatting rules — follow these exactly:
1. EVERY line in the output MUST start with a terse "Label: Value" format. Example: "Annual Limit: RM7,300,000." or "Claim Impact: Not specified in policy." NEVER output standalone headers, page numbers, list symbols, or blank lines on separate lines by themselves.
2. CONSOLIDATE related items. Group exclusions, benefits, or items by category on ONE line using commas. Example: "Excluded Treatments: cosmetic surgery, congenital conditions. (Page 14)" or "Benefits: dialysis RM5,000, daily cash RM150. (Page 11)" — NOT separate lines or different sections for each category or page.
3. Maximum 5 items per list. Merge aggressively — combine similar items into one entry.
4. Summaries: ≤15 words. No filler words — never start with "The", "This", "It is".
5. Include page/section references once per grouped line. Append them to the end of the line inside parentheses. Example: "Label: Value. (Page 12)". Do not fabricate references.
6. Prefer exact values: amounts, percentages, durations, ages, caps.
7. If information is not found, state "Not specified in policy" directly after the label. Example: "Label: Not specified in policy."
8. Never invent or infer information not present in the policy text.
9. CRITICAL: For waiting periods, ALWAYS use "Condition: Duration" format. Examples: "Hospitalisation: 30 days", "Surgery: 14 days", "Critical Illness: 90 days". Never provide just "30 days" without the condition label.
10. CRITICAL: For premium/charge tables with age brackets, use semicolon-separated format: "Up to 80: RM250; 81-85: RM1,340; 86-90: RM2,290". This enables table rendering.
11. CRITICAL: Group all exclusions (including excluded surgeries, procedures, conditions, and treatments) together into ONE single consolidated line. Use a single label like "Excluded Treatments" or "Exclusions". Do NOT split exclusions into different lines, lists, or categories.
12. CRITICAL: Group all benefits, coverage limits, sub-limits, and daily cash amounts together into ONE single consolidated line. Use a single label like "Coverage Limits" or "Benefits" for the entire list. Do NOT split different benefit types onto different lines.

Policy Text:
${contextText}

Questions to answer (use the EXACT question as the key in the "answers" object):
${scenarios.map((s, i) => `${i + 1}. ${s.query}`).join("\n")}
`;

      const batchRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: batchPrompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 65536,
            },
          }),
        }
      );

      if (batchRes.ok) {
        const data = await batchRes.json();
        const finishReason = data.candidates?.[0]?.finishReason;
        const text =
          data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
          try {
            const parsed = JSON.parse(text);
            const rawAnswers = parsed.answers || {};

            // Map both query text and scenario ID for maximum compatibility
            for (const scenario of scenarios) {
              const matchedKey = Object.keys(rawAnswers).find(
                key => key.toLowerCase().trim() === scenario.query.toLowerCase().trim()
              );
              const answer = matchedKey ? rawAnswers[matchedKey] : null;
              if (answer) {
                scenarioAnswers[scenario.query] = answer;
                scenarioAnswers[scenario.id] = answer;
              }
            }
          } catch (parseErr) {
            console.warn(`[documents/analyze] Batch JSON parse failed (finishReason: ${finishReason}). Scenario answers will be generated on-demand.`, parseErr);
          }
        }
      }
    }

    // 9. Save scenario answers and retrieve final document
    let finalDoc = updatedDoc;
    if (Object.keys(scenarioAnswers).length > 0) {
      finalDoc = await prisma.document.update({
        where: { id },
        data: {
          scenarioAnswers: scenarioAnswers as any,
        },
      });
    }

    return NextResponse.json({
      document: finalDoc,
      scenarios,
    });

  } catch (err) {
    console.error("[documents/analyze] error:", err);

    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}