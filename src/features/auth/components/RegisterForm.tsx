"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { colors } from "@/lib/design-system";
import { validateEmail, validateName, validatePassword } from "@/lib/validation";
import { Toast, ToastType } from "@/shared/components/Toast";
import { FieldError } from "@/shared/components/FieldError";

interface ToastState { message: string; type: ToastType }
interface FieldErrors { name?: string; email?: string; password?: string }

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const errors: FieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };

  const showError = (field: keyof FieldErrors) => touched[field] ? errors[field] : "";

  const handleBlur = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields touched to show all errors on submit attempt
    setTouched({ name: true, email: true, password: true });
    if (hasErrors) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error || "Something went wrong.", type: "error" });
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full py-3.5 bg-white border rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition shadow-sm ${
      showError(field)
        ? "border-red-400 focus:ring-red-300 pr-4"
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h1>
          <p className="text-sm text-gray-500">Use proper information to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder="Full name"
                aria-describedby="name-error"
                className={`${inputClass("name")} pl-11`}
              />
            </div>
            <FieldError message={showError("name")} />
          </div>

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="Password (min. 8 characters)"
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

          {/* Terms */}
          <p className="text-xs text-gray-400 text-center px-2">
            By signing up, you agree to our{" "}
            <span className="font-semibold" style={{ color: colors.primary.dark }}>Terms &amp; Conditions</span>
            {" "}and{" "}
            <Link href="/privacy" className="font-semibold hover:underline" style={{ color: colors.primary.dark }}>
              Privacy Policy
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-black text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            style={{ background: colors.primary.gradient, boxShadow: colors.shadows.gold }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: colors.primary.dark }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
