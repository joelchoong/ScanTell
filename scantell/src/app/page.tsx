import { auth } from "@/features/auth/server/authConfig";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth();
  redirect(session ? "/dashboard" : "/login");
}
