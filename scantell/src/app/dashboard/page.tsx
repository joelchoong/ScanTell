import { auth } from "@/features/auth/server/authConfig";
import { DashboardView } from "@/features/dashboard/components/DashboardView";

export default async function DashboardPage() {
  const session = await auth();
  return <DashboardView />;
}
