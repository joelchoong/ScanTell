"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function ProfileSettingsForm() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync state when session finishes loading or updates using render-phase check
  const [prevSessionName, setPrevSessionName] = useState("");
  if (session?.user?.name && session.user.name !== prevSessionName) {
    setPrevSessionName(session.user.name);
    setName(session.user.name);
  }

  const hasChanges = name !== session?.user?.name;

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

      // Update session
      await update();

      setMessage({ type: "success", text: "Profile updated successfully" });

      // Reset form to current session data
      setName(session?.user?.name || "");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" });
      // Reset local state on error
      setName(session?.user?.name || "");
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
        {/* Profile section */}
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
