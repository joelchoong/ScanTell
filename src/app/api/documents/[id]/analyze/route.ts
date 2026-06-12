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
    // 1. Fetch document metadata from database
    const doc = await prisma.document.findFirst({
      where: { id, userId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    // 2. If analysis already exists, return it without re-analyzing
    if (doc.extractedText && doc.analysis) {
      return NextResponse.json({ document: doc });
    }

    // 2. Ensure GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in environment variables. Please add it to your .env file." },
        { status: 400 }
      );
    }

    // 3. Fetch file from Vercel Blob with authentication
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN is not configured" }, { status: 500 });
    }

    let fileResponse: Response;
    try {
      fileResponse = await fetch(doc.fileUrl, {
        headers: {
          Authorization: `Bearer ${blobToken}`,
        },
      });
    } catch (fetchError) {
      console.error(`Network error fetching file from url: ${doc.fileUrl}`, fetchError);
      return NextResponse.json({ error: `Network error accessing storage: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` }, { status: 500 });
    }

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error(`Failed to fetch file from url: ${doc.fileUrl}`, fileResponse.status, fileResponse.statusText, errorText);
      return NextResponse.json({ error: `Failed to download document from storage (HTTP ${fileResponse.status}): ${fileResponse.statusText}` }, { status: 500 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");
    const mimeType = getMimeType(doc.name);

    // 4. Send to Gemini Multimodal
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: "Analyze this document. First, determine if this is an insurance document. If it is not an insurance document, set isInsuranceDocument to false and leave other fields empty. If it is an insurance document, extract all readable text using OCR, and pull out key structured policy information like the insurer, type of policy, policy holder, list of coverage limits, and any exclusions.",
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                isInsuranceDocument: {
                  type: "BOOLEAN",
                  description: "Whether this document is an insurance document.",
                },
                extractedText: {
                  type: "STRING",
                  description: "Full text content extracted from the document using OCR.",
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
              required: ["isInsuranceDocument", "extractedText", "analysis"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error Response:", errorText);
      return NextResponse.json({ error: "Gemini analysis failed. Please try again." }, { status: 500 });
    }

    const result = await response.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return NextResponse.json({ error: "No response from Gemini analyzer." }, { status: 500 });
    }

    const parsedData = JSON.parse(responseText);

    // 5. Save results to the database
    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        isInsuranceDocument: parsedData.isInsuranceDocument,
        extractedText: parsedData.extractedText,
        analysis: parsedData.analysis,
      },
    });

    return NextResponse.json({ document: updatedDoc });
  } catch (err) {
    console.error("[documents/analyze] error:", err);
    return NextResponse.json(
      { error: "An error occurred during analysis. Check server logs." },
      { status: 500 }
    );
  }
}
