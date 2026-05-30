import { User, Mail, LogOut, ChevronRight, HelpCircle, Shield } from "lucide-react";
import { signOut } from "@/features/auth/server/authConfig";

interface ProfileViewProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function ProfileView({ user }: ProfileViewProps) {
  return (
    <div className="max-w-md mx-auto px-6 space-y-6 pt-2">
      {/* Profile Header */}
      <div className="softui-card p-6">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f5b301] to-[#fbc02d] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {user.name || "User"}
            </h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <section>
        <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#737373] uppercase mb-4">
          Profile Settings
        </h3>
        <div className="softui-card divide-y divide-gray-100">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Change Email</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Support */}
      <section>
        <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#737373] uppercase mb-4">
          Support
        </h3>
        <div className="softui-card divide-y divide-gray-100">
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">FAQ</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Privacy Policy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </section>

      {/* Logout */}
      <section>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="w-full softui-btn-danger flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </section>
    </div>
  );
}
