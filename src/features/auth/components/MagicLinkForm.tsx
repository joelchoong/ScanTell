"use client";

import { useState } from "react";
import { signInWithMagicLink } from "@/features/auth/server/authActions";

interface MagicLinkFormProps {
  callbackUrl: string;
}

export function MagicLinkForm({ callbackUrl }: MagicLinkFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    await signInWithMagicLink(email, callbackUrl);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send magic link"}
      </button>
    </form>
  );
}
