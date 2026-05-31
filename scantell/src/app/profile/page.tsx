import { auth } from "@/features/auth/server/authConfig";
import { redirect } from "next/navigation";
import { ProfileView } from "@/features/profile/components/ProfileView";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { TopHeader } from "@/features/dashboard/components/TopHeader";
import { colors } from "@/lib/design-system";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="text-gray-900 pb-28 font-sans selection-bg-yellow-100 min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      {/* S-curve pattern at top */}
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="S-curve pattern"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="max-w-md mx-auto relative h-screen flex flex-col" style={{ background: 'transparent' }}>
        <TopHeader userImage={session.user.image} />
        <div className="px-6 overflow-y-auto flex-1">
          <ProfileView user={session.user} />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
