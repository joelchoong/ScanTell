import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function POST(req: NextRequest) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { messages, documentId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to your .env file." },
        { status: 400 }
      );
    }

    // 1. If a documentId is provided, retrieve its extracted text
    let systemInstruction = "You are an expert insurance assistant. Help the user understand their policy options in a clear, friendly, and structured manner.";
    let documentName = "";

    if (documentId) {
      const doc = await prisma.document.findFirst({
        where: { id: documentId, userId },
      });

      if (doc && doc.extractedText) {
        documentName = doc.name;
        systemInstruction = `You are an expert insurance assistant. You are helping a user understand their insurance policy named "${doc.name}".
Use the following policy text to answer the user's questions. Be precise, clear, and refer directly to the policy rules, limits, benefits, or exclusions if they are mentioned.
If the information is not in the policy text, explain that you couldn't find it in the uploaded document "${doc.name}", but provide helpful general guidance. Do not make up facts about this specific policy that are not in the text.

--- POLICY TEXT ---
${doc.extractedText}
--- END POLICY TEXT ---`;
      }
    }

    // 2. Format history for Gemini API (user & model roles)
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // 3. Request Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Chat API Error:", errorText);
      return NextResponse.json({ error: "Failed to generate chat response." }, { status: 500 });
    }

    const result = await response.json();
    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json({ error: "No response received from Gemini." }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat] error:", err);
    return NextResponse.json(
      { error: "An error occurred in the chat backend." },
      { status: 500 }
    );
  }
}
