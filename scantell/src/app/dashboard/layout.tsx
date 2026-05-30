import { auth } from "@/features/auth/server/authConfig";
import { redirect } from "next/navigation";
import { DashboardLayout as DashboardLayoutComponent } from "@/features/dashboard/components/DashboardLayout";

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
    <DashboardLayoutComponent userImage={session.user.image}>
      {children}
    </DashboardLayoutComponent>
  );
}
