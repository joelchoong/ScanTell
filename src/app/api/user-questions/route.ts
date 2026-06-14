import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function POST(req: NextRequest) {
  const authResult = await requireAuthApi();
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const { question, documentId } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    await prisma.userQuestion.create({
      data: {
        userId,
        question,
        documentId: documentId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[user-questions] error:", err);
    return NextResponse.json(
      { error: "Failed to log question" },
      { status: 500 }
    );
  }
}
