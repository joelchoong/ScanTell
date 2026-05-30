import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-gray-500">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Scans" value="0" description="All time" />
        <StatCard title="This Month" value="0" description="May 2026" />
        <StatCard title="Account Status" value="Active" description="Free plan" />
      </div>

      {/* Session info card (useful during dev) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Session info
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="text-gray-400 w-16 shrink-0">Name</dt>
            <dd className="text-gray-700">{session?.user?.name ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-400 w-16 shrink-0">Email</dt>
            <dd className="text-gray-700">{session?.user?.email ?? "—"}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-gray-400 w-16 shrink-0">User ID</dt>
            <dd className="text-gray-700 font-mono text-xs">
              {session?.user?.id ?? "—"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}
