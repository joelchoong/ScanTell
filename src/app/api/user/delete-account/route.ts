import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";
import { signOut } from "@/features/auth/server/authConfig";

export async function POST(req: NextRequest) {
  try {
    const result = await requireAuthApi();
    if (result instanceof NextResponse) return result;
    const { userId } = result;

    // Anonymize user data by removing name and email
    await prisma.user.update({
      where: { id: userId },
      data: { 
        name: null,
        email: `deleted-${userId}@scantell.local`,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
