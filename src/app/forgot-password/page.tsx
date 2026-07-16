"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { colors } from "@/lib/design-system";
import { validateEmail } from "@/lib/validation";
import { Toast, ToastType } from "@/shared/components/Toast";
import { FieldError } from "@/shared/components/FieldError";

interface ToastState {
  message: string;
  type: ToastType;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);
  const emailError = touched ? validateEmail(email) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    if (err) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send reset link.");
      }

      setToast({
        message: "If an account exists, a reset link has been sent.",
        type: "success",
      });
      setEmail("");
      setTouched(false);
    } catch (err: any) {
      setToast({
        message: err.message || "An error occurred. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = touched && emailError
    ? "border-red-400 focus:ring-red-300"
    : "border-gray-200 focus:ring-yellow-400";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 py-10"
      style={{ background: colors.background.base }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}

      <div className="w-full max-w-sm">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/scantell-logo.svg"
            alt="ScanTell"
            width={120}
            height={120}
            priority
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-sm text-gray-500">
            Enter your email and we'll send you a password reset link.
          </p>
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
                onBlur={() => setTouched(true)}
                placeholder="Email address"
                aria-describedby="email-error"
                className={`w-full py-3.5 bg-white border rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition shadow-sm pl-11 ${inputClass}`}
              />
            </div>
            <FieldError message={emailError} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-black text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            style={{
              background: colors.primary.gradient,
              boxShadow: colors.shadows.gold,
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
