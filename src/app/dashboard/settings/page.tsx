import { ProfileSettingsForm } from "@/features/profile/components/ProfileSettingsForm";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      {/* Back button as header */}
      <Link href="/profile" className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Profile</span>
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#121417" }}>Settings</h1>
          <p className="mt-1" style={{ color: "#23262B" }}>Manage your account preferences.</p>
        </div>

        {/* Profile section */}
        <div>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#121417" }}>Profile</h2>
          <ProfileSettingsForm />
        </div>

        {/* Change password section */}
        <div>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "#121417" }}>Change password</h2>
          <ChangePasswordForm />
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
            className="softui-btn-danger"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}