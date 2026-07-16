import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  // Rate limiting: 10 requests per minute per IP
  const ip = getClientIp(req);
  const { success } = await rateLimit({
    identifier: `validate-reset-token:${ip}`,
    limit: 10,
    window: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json(
      { valid: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required." },
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
        { valid: false, error: "Invalid or expired token." },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true }, { status: 200 });
  } catch (err) {
    console.error("[validate-reset-token] error:", err);
    return NextResponse.json(
      { valid: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
