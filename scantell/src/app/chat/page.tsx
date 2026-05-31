import { auth } from "@/features/auth/server/authConfig";
import { redirect } from "next/navigation";
import { ScanView } from "@/features/scan/components/ScanView";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { colors } from "@/lib/design-system";

export default async function ScanPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="text-gray-900 font-sans selection-bg-yellow-100 min-h-screen" style={{ background: colors.primary.solid }}>
      <div className="max-w-md mx-auto relative h-screen flex flex-col" style={{ background: colors.primary.gradientTransparent }}>
        {/* Header with back button */}
        <div className="flex items-center px-6 py-4 sticky top-0 z-20">
          <Link href="/dashboard" className="w-10 h-10 softui-card flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold text-gray-900">Chat</h1>
          <div className="w-10"></div>
        </div>

        {/* Chat content */}
        <div className="flex-1 overflow-y-auto">
          <ScanView />
        </div>
      </div>
    </div>
  );
}
