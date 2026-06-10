import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      {/* Back button as header */}
      <Link href="/profile/edit-profile" className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to Edit Profile</span>
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#121417" }}>Change Password</h1>
          <p className="mt-1" style={{ color: "#23262B" }}>Update your password to keep your account secure.</p>
        </div>

        <ChangePasswordForm />
      </div>
    </div>
  );
}
