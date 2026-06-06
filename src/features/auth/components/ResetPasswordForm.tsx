"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import { colors } from "@/lib/design-system";
import { validatePassword } from "@/lib/validation";
import { Toast, ToastType } from "@/shared/components/Toast";
import { FieldError } from "@/shared/components/FieldError";

interface ToastState { message: string; type: ToastType }
interface FieldErrors { password?: string; confirmPassword?: string }

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setToast({ message: "Invalid reset link. Please request a new one.", type: "error" });
      return;
    }

    // Validate token
    fetch("/api/auth/validate-reset-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setToast({ message: "Invalid or expired reset link. Please request a new one.", type: "error" });
        }
      })
      .catch(() => {
        setIsValidToken(false);
        setToast({ message: "Something went wrong. Please try again.", type: "error" });
      });
  }, [token]);

  const errors: FieldErrors = {
    password: validatePassword(password),
    confirmPassword: password !== confirmPassword ? "Passwords do not match" : "",
  };

  const showError = (field: keyof FieldErrors) =>
    touched[field] ? errors[field] : "";

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    if (hasErrors) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error || "Something went wrong.", type: "error" });
        return;
      }

      setToast({ message: "Password reset successfully. Please sign in.", type: "success" });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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

  if (isValidToken === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-10"
        style={{ background: colors.background.base }}
      >
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-500 rounded-full animate-spin" />
          </div>
          <p className="text-gray-500">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-10"
        style={{ background: colors.background.base }}
      >
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
        
        <div className="w-full max-w-sm text-center">
          <div className="flex justify-center mb-6">
            <Image src="/scantell-logo.svg" alt="ScanTell" width={120} height={120} priority />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-sm text-gray-500 mb-6">This reset link is invalid or has expired.</p>
          <Link
            href="/forgot-password"
            className="inline-block py-4 px-8 rounded-2xl text-black text-sm font-bold transition-opacity hover:opacity-90 shadow-md"
            style={{ background: colors.primary.gradient, boxShadow: colors.shadows.gold }}
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-sm text-gray-500">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="New password (min. 8 characters)"
                aria-describedby="password-error"
                disabled={loading}
                className={`${inputClass("password")} pl-11 pr-11 disabled:opacity-50 disabled:cursor-not-allowed`}
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

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Confirm new password"
                aria-describedby="confirm-password-error"
                disabled={loading}
                className={`${inputClass("confirmPassword")} pl-11 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            <FieldError message={showError("confirmPassword")} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-black text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ background: colors.primary.gradient, boxShadow: colors.shadows.gold }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

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
