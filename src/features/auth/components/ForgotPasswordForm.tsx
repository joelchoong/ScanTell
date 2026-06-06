"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Mail } from "lucide-react";
import { colors } from "@/lib/design-system";
import { validateEmail } from "@/lib/validation";
import { Toast, ToastType } from "@/shared/components/Toast";
import { FieldError } from "@/shared/components/FieldError";

interface ToastState { message: string; type: ToastType }
interface FieldErrors { email?: string }

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [success, setSuccess] = useState(false);
  const dismissToast = useCallback(() => setToast(null), []);

  const errors: FieldErrors = {
    email: validateEmail(email),
  };

  const showError = (field: keyof FieldErrors) =>
    touched[field] ? errors[field] : "";

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true });
    if (hasErrors) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error || "Something went wrong.", type: "error" });
        return;
      }

      setSuccess(true);
      setToast({ message: "Password reset link sent to your email.", type: "success" });
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-sm text-gray-500">
            {success 
              ? "Check your email for the reset link"
              : "Enter your email to receive a reset link"
            }
          </p>
        </div>

        {!success ? (
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
                  disabled={loading}
                  className={`${inputClass("email")} pl-11 disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              <FieldError message={showError("email")} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-black text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              style={{ background: colors.primary.gradient, boxShadow: colors.shadows.gold }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: colors.primary.dark }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
