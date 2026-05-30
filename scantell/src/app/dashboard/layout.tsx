import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              ScanTell
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Settings
              </Link>
            </nav>

            {/* User menu */}
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "User avatar"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold">
                  {session.user.name?.[0]?.toUpperCase() ??
                    session.user.email?.[0]?.toUpperCase() ??
                    "?"}
                </div>
              )}
              <span className="hidden sm:block text-sm text-gray-700">
                {session.user.name ?? session.user.email}
              </span>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors ml-2"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
