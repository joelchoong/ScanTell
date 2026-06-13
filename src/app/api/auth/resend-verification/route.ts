import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import crypto from "crypto";
import { Resend } from "resend";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Rate limiting: 3 requests per minute per IP
    const ip = getClientIp(req);
    const { success, remaining, resetTime } = await rateLimit({
      identifier: `resend-verification:${ip}`,
      limit: 3,
      window: 60 * 1000, // 1 minute
    });

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(resetTime).toISOString(),
          },
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json(
        { success: true, message: "If an account exists with this email, a verification link has been sent." },
        { status: 200 }
      );
    }

    // If email is already verified, no need to send another
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedToken: verificationToken,
        emailVerifiedTokenExpires: verificationTokenExpires,
      },
    } as any);

    // Send verification email
    const baseUrl = req.headers.get('host') ? `https://${req.headers.get('host')}` : 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    const resend = new Resend(env.RESEND_API_KEY);

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL!,
      to: user.email,
      subject: "Verify your ScanTell email",
      template: {
        id: "c1773527-6d39-4a92-9a95-898bb2d0ccc1",
        variables: {
          token: verificationToken,
          verificationUrl: verificationUrl,
        },
      },
    } as any);

    return NextResponse.json(
      { success: true, message: "Verification email sent!" },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": "3",
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
