"use server";

import { signIn } from "@/features/auth/server/authConfig";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signInWithGoogle(callbackUrl: string) {
  await signIn("google", { redirectTo: callbackUrl });
}

export async function signInWithMagicLink(email: string, callbackUrl: string) {
  try {
    await signIn("nodemailer", { email, redirectTo: callbackUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=${error.type}`);
    }
    throw error;
  }
}
