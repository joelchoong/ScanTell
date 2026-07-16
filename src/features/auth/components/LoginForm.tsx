"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleSignIn } from "./GoogleSignIn";
import { colors } from "@/lib/design-system";
import { validateEmail, validatePassword } from "@/lib/validation";
import { Toast, ToastType } from "@/shared/components/Toast";
import { FieldError } from "@/shared/components/FieldError";

interface ToastState { message: string; type: ToastType }
interface FieldErrors { email?: string; password?: string }

export function LoginForm({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string; registered?: string };
}) {
  const callbackUrl = searchParams.callbackUrl ?? "/dashboard";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(
    searchParams.registered
      ? { message: "Account created — sign in below.", type: "success" }
      : searchParams.error
      ? {
          message:
            searchParams.error === "OAuthAccountNotLinked"
              ? "This email is already linked to another sign-in method."
              : "Something went wrong. Please try again.",
          type: "error",
        }
      : null
  );
  const dismissToast = useCallback(() => setToast(null), []);

  const errors: FieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  const showError = (field: keyof FieldErrors) =>
    touched[field] ? errors[field] : "";

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (hasErrors) return;

    setLoading(true);
    const result = await signIn("email-password", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setToast({ message: "Incorrect email or password.", type: "error" });
      return;
    }

    // Check if user is verified
    const session = await fetch("/api/auth/session").then(res => res.json());
    if (!session?.user?.emailVerified) {
      // Immediately send verification email
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      router.push(`/verification-sent?email=${encodeURIComponent(email)}`);
      return;
    }

    router.push(callbackUrl);
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full py-3.5 bg-white border rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition shadow-sm ${
      showError(field)
        ? "border-red-400 focus:ring-red-300"
        : "border-gray-200 focus:ring-yellow-400"
    }`;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: colors.background.base }}
    >
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/scantell-logo.svg" alt="ScanTell" width={120} height={120} priority />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-sm text-gray-500">Enter your email &amp; password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="Email address"
                aria-describedby="email-error"
                className={`${inputClass("email")} pl-11`}
              />
            </div>
            <FieldError message={showError("email")} />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="Password"
                aria-describedby="password-error"
                className={`${inputClass("password")} pl-11 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <FieldError message={showError("password")} />
          </div>

          {/* Forgot password */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-500 hover:text-gray-700 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-black text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ background: colors.primary.gradient, boxShadow: colors.shadows.gold }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">Or Continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <GoogleSignIn callbackUrl={callbackUrl} />

        <p className="text-center text-sm text-gray-500 mt-6">
          Haven&apos;t any account?{" "}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: colors.primary.dark }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
