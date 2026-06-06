import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string; registered?: string }>;
}) {
  return <LoginForm searchParams={await searchParams} />;
}
