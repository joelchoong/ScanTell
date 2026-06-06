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
    });

    // Send email with reset link using Resend
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
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
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB4AAAASICAYAAADJptgYAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjQtMDYtMTVUMTU6MTc6NDgrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjQtMDYtMTVUMTU6MTc6NDgrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI0LTA2LTE1VDE1OjE3OjQ4KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjE1ZjQ2ZjYzLWY2NDYtNGJlOS1hMzY5LWYxZmExNjA2NjE2ZSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRp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"
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
