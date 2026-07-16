import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function POST(req: NextRequest) {
  try {
    const { message, page, likelihood } = await req.json();

    if (!message || !page) {
      return NextResponse.json(
        { error: "Message and page are required" },
        { status: 400 }
      );
    }

    // Try to get authenticated user, but allow anonymous feedback
    let userId: string | null = null;
    try {
      const authResult = await requireAuthApi();
      if (!(authResult instanceof NextResponse)) {
        userId = authResult.userId;
      }
    } catch {
      // User not authenticated, proceed with anonymous feedback
    }

    await prisma.feedback.create({
      data: {
        userId,
        message,
        page,
        likelihood,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[feedback] error:", err);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
