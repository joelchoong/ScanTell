import { TopHeader } from "./TopHeader";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { colors } from "@/lib/design-system";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
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
        <TopHeader />

        {/* Content */}
        <main className="px-6 overflow-y-auto flex-1">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
