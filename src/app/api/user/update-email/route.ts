import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/features/auth/server/authConfig";
import { prisma } from "@/shared/server/db";
import { EMAIL_REGEX } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    console.log("[update-email] session:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { email } = await req.json();
    console.log("[update-email] received email:", email);

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

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 400 }
      );
    }

    console.log("[update-email] updating user:", session.user.id, "to email:", email.toLowerCase());
    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: email.toLowerCase() },
    });
    console.log("[update-email] update successful");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[update-email] error:", err);
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
