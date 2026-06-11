import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { EMAIL_REGEX } from "@/lib/validation";
import { invalidateUserCache } from "@/lib/sessionCache";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuthApi();
    if (result instanceof NextResponse) return result;
    const { userId } = result;

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email (e.g. you@example.com)." },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { email: email.toLowerCase() },
    });

    // Invalidate cache to force refresh on next session callback
    invalidateUserCache(userId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
