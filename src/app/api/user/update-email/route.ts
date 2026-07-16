import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { EMAIL_REGEX } from "@/lib/validation";
import { invalidateUserCache } from "@/lib/sessionCache";
import { requireAuthApi } from "@/features/auth/server/getAuthenticatedUser";
import crypto from "crypto";
import { Resend } from "resend";
import { env } from "@/lib/env";

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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store new email in pendingEmail field (don't change actual email yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: email.toLowerCase(),
        emailVerifiedToken: verificationToken,
        emailVerifiedTokenExpires: verificationTokenExpires,
      },
    });

    // Invalidate cache to force refresh on next session callback
    invalidateUserCache(userId);

    // Send verification email
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = req.headers.get('host') ? `${proto}://${req.headers.get('host')}` : 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
      console.log(`\n[DEV ONLY] Resend not configured. Update Email Verification URL: ${verificationUrl}\n`);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const resend = new Resend(env.RESEND_API_KEY);

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email.toLowerCase(),
      subject: "Verify your new ScanTell email",
      template: {
        id: "c1773527-6d39-4a92-9a95-898bb2d0ccc1",
        variables: {
          token: verificationToken,
          verificationUrl: verificationUrl,
        },
      },
    } as any);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
