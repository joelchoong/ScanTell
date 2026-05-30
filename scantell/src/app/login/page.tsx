import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string };
}) {
  return <LoginForm searchParams={searchParams} />;
}
