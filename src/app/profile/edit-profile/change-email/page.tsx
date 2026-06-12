"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, X } from "lucide-react";
import { colors } from "@/lib/design-system";
import { Toast } from "@/shared/components/Toast";

export default function ChangeEmailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showModal && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showModal, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update email");
      }

      // Show modal instead of redirecting
      setShowModal(true);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResend = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Verification email sent!" });
        setCountdown(60);
        setCanResend(false);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to send email" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    setEmail("");
  };

  return (
    <div className="min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      {/* S-curve pattern at top */}
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-blue-50 to-transparent" />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 relative z-10">
        {/* Header with back arrow and centered title */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile/edit-profile" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "#121417" }}>Change Email</h1>
          <div className="w-6" /> {/* Spacer to center the title */}
        </div>

        <div className="space-y-6">
          <p className="text-sm" style={{ color: "#23262B" }}>
            Enter your new email address. We'll send you a verification link to confirm the change.
          </p>

          <div className="softui-card p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#121417" }}>
                  Current email
                </label>
                <div className="px-4 py-3 rounded-lg bg-gray-100 text-gray-600">
                  {session?.user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#121417" }}>
                  New email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="softui-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || !email}
                className="softui-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Sending..." : "Send verification link"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full relative">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 mb-6">
                We've sent a verification link to <span className="font-medium text-gray-700">{email}</span>. Click the link to confirm the change.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleResend}
                  disabled={!canResend || isSaving}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Sending..." : canResend ? "Resend verification email" : `Resend in ${countdown}s`}
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-sm text-gray-400 mt-6">
                You can close this window and continue using the app. Your email will be updated once you click the verification link.
              </p>
            </div>
          </div>
        </div>
      )}

      {message && (
        <Toast
          message={message.text}
          type={message.type}
          onDismiss={() => setMessage(null)}
        />
      )}
    </div>
  );
}
