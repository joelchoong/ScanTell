import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/server/authConfig";
import { prisma } from "@/shared/server/db";
import { signOut } from "@/features/auth/server/authConfig";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Anonymize user data by removing name and email
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name: null,
        email: `deleted-${session.user.id}@scantell.local`,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[delete-account] error:", err);
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
