import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const ip = getClientIp(req);
    const { success, remaining, resetTime } = await rateLimit({
      identifier: `verify-email:${ip}`,
      limit: 10,
      window: 60 * 1000, // 1 minute
    });

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(resetTime).toISOString(),
          },
        }
      );
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerifiedToken: token,
        emailVerifiedTokenExpires: {
          gt: new Date(),
        },
      },
    } as any);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerifiedToken: null,
        emailVerifiedTokenExpires: null,
      },
    } as any);

    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": "10",
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(resetTime).toISOString(),
        },
      }
    );
  } catch (err) {
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
