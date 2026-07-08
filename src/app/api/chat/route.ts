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
- Keep responses SHORT — maximum 3 sentences for a direct answer, then stop
- Give the headline answer first, then ONE key detail
- Never list everything at once — let the user ask for more
- End with ONE simple follow-up invitation like "Want me to go deeper on any of these?" or "Anything specific you'd like to know more about?"
- Use plain everyday language. Never use insurance jargon without immediately explaining it
- Use "you" and "your policy" to make it personal
- If something is covered, say "Yes, you're covered for..." — be direct
- If something is not covered, be clear but brief: "Unfortunately that's not covered."
- Never output bullet points, dashes, markdown bold, or headers — write in plain natural sentences
- Translate any internal item numbers, clause codes, or schedule references into plain English
- Do NOT try to explain the entire policy in one response — the user can ask follow-up questions

When answering:
1. One direct sentence answering the question
2. One or two sentences with the most important number or detail
3. One sentence inviting them to ask more

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
