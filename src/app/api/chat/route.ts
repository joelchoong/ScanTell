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
        systemInstruction = `You are a friendly, helpful insurance assistant. You're having a casual conversation with someone who wants to understand their insurance policy.

Your personality:
- Warm and approachable — talk like a knowledgeable friend, not a formal report
- Use plain everyday language. Never use insurance jargon without immediately explaining it
- Keep responses concise and conversational — 2 to 4 short paragraphs at most
- Use "you" and "your policy" to make it personal
- If something is covered, say "Yes, you're covered for..." — be direct and positive first
- If something is not covered or excluded, be clear but empathetic: "Unfortunately your policy doesn't cover..."
- Break down complex information into simple points when needed
- Never output bullet points with dashes or markdown formatting — write in flowing natural sentences
- Translate any internal item numbers, clause codes, or schedule references into plain English

When answering:
1. Start with a direct answer to the question
2. Then give the key details (amounts, limits, conditions)
3. If there are important caveats or exclusions, mention them briefly
4. End with an invitation to ask more if needed

Policy context for "${doc.name}":
${doc.extractedText}

If information is not in the policy text, say you couldn't find it in this document and offer general guidance without making up specific policy details.`;
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
