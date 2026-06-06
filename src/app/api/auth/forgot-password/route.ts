import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/server/db";
import { EMAIL_REGEX } from "@/lib/validation";
import crypto from "crypto";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email (e.g. you@example.com)." },
        { status: 400 }
      );
    }

    console.log("[forgot-password] Looking up user:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[forgot-password] User found:", !!user);
    
    // Always return success to prevent email enumeration
    // Even if user doesn't exist, we don't want to reveal that
    if (!user) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    console.log("[forgot-password] Updating user with reset token");
    // Store reset token in database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpires,
      },
    } as any);

    // Send email with reset link using Resend
    const baseUrl = req.headers.get('host') ? `https://${req.headers.get('host')}` : 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log("[forgot-password] Reset URL:", resetUrl);
    
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "ScanTell <onboarding@resend.dev>",
    to: email,
    subject: "Reset your ScanTell password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background-color: #f2ece0;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <img 
            src="${baseUrl}/scantell-logo.png"
            alt="ScanTell"
            width="160"
            style="display: inline-block; margin-bottom: 8px;"
          />
          <p style="color: #6b6050; font-size: 12px; margin: 0; letter-spacing: 0.5px;">Understand today. Anticipate tomorrow.</p>
        </div>

        <!-- Main card -->
        <div style="background: #f2ece0; border-radius: 24px; padding: 36px 32px; box-shadow: 7px 7px 16px #ccc4b0, -7px -7px 16px #fffef8; margin-bottom: 20px;">

          <h1 style="color: #121417; font-size: 22px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: -0.4px;">Password reset</h1>
          <p style="color: #6b6050; font-size: 14px; margin: 0 0 24px 0; line-height: 1.6;">We received a request to reset your ScanTell password.</p>

          <p style="color: #121417; font-size: 15px; line-height: 1.7; margin: 0 0 10px 0;">Hi there,</p>
          <p style="color: #6b6050; font-size: 14px; line-height: 1.7; margin: 0 0 28px 0;">
            Click the button below to create a new password. This link expires in <strong style="color: #121417;">1 hour</strong>.
          </p>

          <!-- CTA -->
          <a href="${resetUrl}" style="display: block; padding: 16px 24px; background: #F5B301; color: #121417; text-decoration: none; border-radius: 50px; font-weight: 800; font-size: 15px; text-align: center; box-shadow: 5px 5px 14px rgba(160,110,0,0.4), -3px -3px 8px rgba(255,230,120,0.35); margin-bottom: 28px;">
            Reset my password →
          </a>

          <!-- Copy link -->
          <div style="border-top: 1px solid #ccc4b0; padding-top: 20px;">
            <p style="color: #6b6050; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 8px 0;">Or copy this link</p>
            <p style="color: #8a7060; font-size: 12px; word-break: break-all; margin: 0; background: #f2ece0; padding: 10px 14px; border-radius: 10px; box-shadow: inset 3px 3px 7px #ccc4b0, inset -3px -3px 7px #fffef8;">${resetUrl}</p>
          </div>
        </div>

        <!-- Security note -->
        <div style="background: #f2ece0; border-radius: 16px; padding: 16px 20px; box-shadow: inset 3px 3px 7px #ccc4b0, inset -3px -3px 7px #fffef8; margin-bottom: 28px;">
          <p style="color: #6b6050; font-size: 13px; margin: 0; line-height: 1.6;">
            🔒 If you didn't request this reset, you can safely ignore this email. Your password won't change unless you click the link above.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center;">
          <p style="color: #9a8878; font-size: 12px; margin: 0;">© 2026 ScanTell. All rights reserved.</p>
        </div>

      </div>
    `,
  });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[forgot-password] error:", err);
    console.error("[forgot-password] error stack:", err instanceof Error ? err.stack : 'No stack');
    const message = process.env.NODE_ENV === "development" && err instanceof Error
      ? err.message
      : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
