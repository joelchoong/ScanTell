import { auth } from "@/features/auth/server/authConfig";
import { redirect } from "next/navigation";
import { ProfileView } from "@/features/profile/components/ProfileView";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { TopHeader } from "@/features/dashboard/components/TopHeader";
import { colors } from "@/lib/design-system";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="text-gray-900 pb-28 font-sans selection:bg-yellow-100" style={{ background: colors.primary.gradientTransparent }}>
      <div className="max-w-md mx-auto relative h-screen flex flex-col">
        <TopHeader userImage={session.user.image} />
        <div className="px-6 overflow-y-auto flex-1">
          <ProfileView user={session.user} />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
