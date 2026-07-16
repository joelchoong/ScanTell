"use client";

import { useEffect } from "react";
import { colors, typography } from "@/lib/design-system";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans"
      style={{ background: colors.primary.gradientTransparent }}
    >
      <div className="max-w-md mx-auto px-6 text-center">
        <div className="softui-card p-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-orange-100">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
          
          <h1 className={`${typography.heroTitle} text-gray-900 mb-3`}>
            Something went wrong
          </h1>
          
          <p className={`${typography.bodySecondary} text-gray-600 mb-8`}>
            We encountered an unexpected error. Please try again or contact support if the problem persists.
          </p>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="softui-btn px-6 py-3"
            >
              Try again
            </button>
            
            <Link
              href="/"
              className="softui-btn px-6 py-3 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
