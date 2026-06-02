"use client";

import { memo } from "react";
import { Home, Split, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { colors } from "@/lib/design-system";

function BottomNavComponent() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-20">
      <div className="softui-card h-[72px] flex items-center justify-around px-8">
        {/* Home */}
        <Link href="/dashboard" className="flex flex-col items-center gap-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isActive("/dashboard") ? "shadow-[inset_3px_3px_8px_#c8c8d0,inset_-3px_-3px_8px_#ffffff]" : "shadow-[3px_3px_8px_#c8c8d0,-3px_-3px_8px_#ffffff]"
          }`}>
            <Home className={`w-5 h-5 ${isActive("/dashboard") ? "" : "text-[#5a5a6a]"}`} strokeWidth={2} style={{ color: isActive("/dashboard") ? colors.primary.base : undefined }} />
          </div>
          <span className={`text-[10px] font-medium ${isActive("/dashboard") ? "" : "text-[#5a5a6a]"}`} style={{ color: isActive("/dashboard") ? colors.primary.base : undefined }}>Home</span>
        </Link>

        {/* Explore - Center button */}
        <Link href="/explore" className="flex flex-col items-center gap-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center -mt-6 border-4 transition-all ${
            isActive("/explore") ? "ring-2 ring-yellow-400 ring-offset-2" : ""
          }`} style={{ backgroundColor: colors.primary.base, boxShadow: colors.shadows.gold, borderColor: colors.background.base }}>
            <Split className="w-6 h-6" strokeWidth={2} style={{ color: colors.text.primary }} />
          </div>
          <span className={`text-[10px] font-medium ${isActive("/explore") ? "" : "text-[#5a5a6a]"}`} style={{ color: isActive("/explore") ? colors.primary.base : undefined }}>Explore</span>
        </Link>

        {/* Profile */}
        <Link href="/profile" className="flex flex-col items-center gap-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isActive("/profile") ? "shadow-[inset_3px_3px_8px_#c8c8d0,inset_-3px_-3px_8px_#ffffff]" : "shadow-[3px_3px_8px_#c8c8d0,-3px_-3px_8px_#ffffff]"
          }`}>
            <User className={`w-5 h-5 ${isActive("/profile") ? "" : "text-[#5a5a6a]"}`} strokeWidth={2} style={{ color: isActive("/profile") ? colors.primary.base : undefined }} />
          </div>
          <span className={`text-[10px] font-medium ${isActive("/profile") ? "" : "text-[#5a5a6a]"}`} style={{ color: isActive("/profile") ? colors.primary.base : undefined }}>Profile</span>
        </Link>
      </div>
    </div>
  );
}

export const BottomNav = memo(BottomNavComponent);
