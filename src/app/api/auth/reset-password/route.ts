import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    } as any);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    } as any);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[reset-password] error:", err);
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
