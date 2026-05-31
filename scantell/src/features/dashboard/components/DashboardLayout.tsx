import { TopHeader } from "./TopHeader";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { colors } from "@/lib/design-system";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userImage?: string | null;
}

export function DashboardLayout({ children, userImage }: DashboardLayoutProps) {
  return (
    <div className="text-gray-900 pb-28 font-sans selection-bg-yellow-100 min-h-screen" style={{ background: colors.primary.solid }}>
      <div className="max-w-md mx-auto relative h-screen flex flex-col" style={{ background: colors.primary.gradientTransparent }}>
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
