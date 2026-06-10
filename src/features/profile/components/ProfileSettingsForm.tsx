"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ProfileSettingsForm() {
  const { data: session, update } = useSession();
  const router = useRouter();
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
      console.log("Saving profile changes...", { name, email, sessionName: session?.user?.name, sessionEmail: session?.user?.email });

      // Update name
      if (name !== session?.user?.name) {
        console.log("Updating name to:", name);
        const res = await fetch("/api/user/update-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        console.log("Name update response status:", res.status);
        if (!res.ok) {
          const data = await res.json();
          console.error("Name update error:", data);
          throw new Error(data.error || "Failed to update name");
        }
        console.log("Name updated successfully");
      }

      // Update email
      if (email !== session?.user?.email) {
        console.log("Updating email to:", email);
        const res = await fetch("/api/user/update-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        console.log("Email update response status:", res.status);
        if (!res.ok) {
          const data = await res.json();
          console.error("Email update error:", data);
          throw new Error(data.error || "Failed to update email");
        }
        console.log("Email updated successfully");
      }

      // Update session and refresh page
      console.log("Updating session...");
      await update();
      console.log("Session updated successfully");

      setMessage({ type: "success", text: "Profile updated successfully" });

      // Force page refresh to get updated session data
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err) {
      console.error("Profile save error:", err);
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
        {/* Profile section - single card with both fields */}
        <div className="softui-card p-6 space-y-4">
          <div>
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

          <div>
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
