"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function ProfileSettingsForm() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasChanges = name !== session?.user?.name || email !== session?.user?.email;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      // Update name
      if (name !== session?.user?.name) {
        const res = await fetch("/api/user/update-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update name");
        }
      }

      // Update email
      if (email !== session?.user?.email) {
        const res = await fetch("/api/user/update-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update email");
        }
      }

      // Update session
      await update();

      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-4">
        {/* Name section */}
        <div className="softui-card p-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "#23262B" }}>
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="softui-input"
          />
        </div>

        {/* Email section */}
        <div className="softui-card p-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "#23262B" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="softui-input"
          />
        </div>

        {hasChanges && (
          <div className="mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="softui-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
