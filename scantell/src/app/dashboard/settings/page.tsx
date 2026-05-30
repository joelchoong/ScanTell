import { auth } from "@/features/auth/server/authConfig";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="softui-bg min-h-screen flex items-center justify-center py-12">
      <div className="space-y-6 max-w-2xl w-full">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#121417" }}>Settings</h1>
          <p className="mt-1" style={{ color: "#23262B" }}>Manage your account preferences.</p>
        </div>

        <div className="softui-card divide-y" style={{ border: "none" }}>
          {/* Profile section */}
          <div className="p-8">
            <h2 className="text-sm font-semibold mb-4" style={{ color: "#121417" }}>Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#23262B" }}>
                  Display name
                </label>
                <input
                  type="text"
                  defaultValue={session?.user?.name ?? ""}
                  placeholder="Your name"
                  className="softui-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#23262B" }}>
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={session?.user?.email ?? ""}
                  disabled
                  className="softui-input bg-[#F7F7FA] text-[#B0B3B8] cursor-not-allowed"
                />
                <p className="mt-1 text-xs" style={{ color: "#B0B3B8" }}>
                  Email cannot be changed.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="button"
                className="softui-btn"
              >
                Save changes
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="p-8">
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
    </div>
  );
}