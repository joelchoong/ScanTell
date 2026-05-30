import { auth } from "@/features/auth/server/authConfig";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your account preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        {/* Profile section */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display name
              </label>
              <input
                type="text"
                defaultValue={session?.user?.name ?? ""}
                placeholder="Your name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue={session?.user?.email ?? ""}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Save changes
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-red-600 mb-2">
            Danger zone
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button
            type="button"
            className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}
