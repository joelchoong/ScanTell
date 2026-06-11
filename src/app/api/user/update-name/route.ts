import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { invalidateUserCache } from "@/lib/sessionCache";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuthApi();
    if (result instanceof NextResponse) return result;
    const { userId } = result;

    const { name } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
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
