import { TopHeader } from "./TopHeader";
import { BottomNav } from "./BottomNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userImage?: string | null;
}

export function DashboardLayout({ children, userImage }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900 pb-28 font-sans selection:bg-yellow-100">
      <div className="max-w-md mx-auto relative min-h-screen">
        <TopHeader userImage={userImage} />

        {/* Content */}
        <main className="px-6">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
