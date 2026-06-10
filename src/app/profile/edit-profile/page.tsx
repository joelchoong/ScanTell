"use client";

import { ProfileSettingsForm } from "@/features/profile/components/ProfileSettingsForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { colors } from "@/lib/design-system";

export default function EditProfilePage() {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out and redirect to home
      await signOut({ redirect: false });
      router.push("/");
    } catch (err) {
      console.error("Delete account error:", err);
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      {/* S-curve pattern at top */}
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="S-curve pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 relative z-10">
        {/* Header with back arrow and centered title */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "#121417" }}>Edit Profile</h1>
          <div className="w-6" /> {/* Spacer to center the title */}
        </div>

        <div className="space-y-6">
          <p className="text-sm" style={{ color: "#23262B" }}>Manage your account preferences.</p>

          {/* Profile section */}
          <div>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#121417" }}>Profile</h2>
            <ProfileSettingsForm />
          </div>

          {/* Change password section */}
          <div className="softui-card p-6">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "#121417" }}>
              Change password
            </h2>
            <p className="text-sm mb-4" style={{ color: "#23262B" }}>
              Update your password to keep your account secure.
            </p>
            <Link
              href="/profile/edit-profile/change-password"
              className="softui-btn inline-block"
            >
              Change password
            </Link>
          </div>

          {/* Danger zone */}
          <div className="softui-card p-6">
            <h2 className="text-sm font-semibold mb-2" style={{ color: "#f43f5e" }}>
              Danger zone
            </h2>
            <p className="text-sm mb-4" style={{ color: "#23262B" }}>
              Permanently delete your account and all associated data.
            </p>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="softui-btn-danger"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete account confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="softui-card p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4" style={{ color: "#121417" }}>
              Delete Account
            </h2>
            <p className="text-sm mb-6" style={{ color: "#23262B" }}>
              Are you sure you want to delete your account? This action will remove your name and email from your profile. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
