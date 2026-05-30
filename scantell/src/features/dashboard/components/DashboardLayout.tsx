import { TopHeader } from "./TopHeader";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { colors } from "@/lib/design-system";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userImage?: string | null;
}

export function DashboardLayout({ children, userImage }: DashboardLayoutProps) {
  return (
    <div className="text-gray-900 pb-28 font-sans selection:bg-yellow-100" style={{ background: colors.primary.gradientTransparent }}>
      <div className="max-w-md mx-auto relative h-screen flex flex-col">
        <TopHeader userImage={userImage} />

        {/* Content */}
        <main className="px-6 overflow-y-auto flex-1">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
