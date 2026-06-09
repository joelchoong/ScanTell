"use client";

import { useState } from "react";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const hasChanges = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setIsSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "New password must be at least 8 characters" });
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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

      <form onSubmit={handleChangePassword} className="space-y-4">
        {/* Current password section */}
        <div className="softui-card p-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "#23262B" }}>
            Current password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="softui-input"
            required
          />
        </div>

        {/* New password section */}
        <div className="softui-card p-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "#23262B" }}>
            New password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 8 characters)"
            className="softui-input"
            required
            minLength={8}
          />
        </div>

        {/* Confirm password section */}
        <div className="softui-card p-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "#23262B" }}>
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="softui-input"
            required
            minLength={8}
          />
        </div>

        {hasChanges && (
          <div className="mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="softui-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Changing..." : "Change password"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
