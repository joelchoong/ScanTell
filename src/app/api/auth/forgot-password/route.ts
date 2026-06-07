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
        template: {
          id: "ac3904f4-1556-4512-adab-77b3a16d10ba",
          variables: {
            resetUrl: resetUrl,
          },
        },
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
