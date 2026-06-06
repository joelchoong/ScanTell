"use server";

import { signOut } from "@/features/auth/server/authConfig";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
