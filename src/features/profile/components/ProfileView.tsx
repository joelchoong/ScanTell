"use client";

import { useSession } from "next-auth/react";
import { User, LogOut, ChevronRight, HelpCircle, Shield, Settings } from "lucide-react";
import { signOutAction } from "./signOutAction";
import Image from "next/image";
import Link from "next/link";

export function ProfileView() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto px-6 space-y-6 pt-2">
        <div className="softui-card p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 space-y-6 pt-2">
      {/* Profile Header */}
      <div className="softui-card p-6">
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              width={64}
              height={64}
              unoptimized
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f5b301] to-[#fbc02d] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {session?.user?.name || "User"}
            </h2>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <section>
        <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#737373] uppercase mb-4">
          Profile Settings
        </h3>
        <div className="softui-card divide-y divide-gray-100">
          <Link href="/profile/edit-profile" className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </section>

      {/* Support */}
      <section>
        <h3 className="text-[11px] font-bold tracking-[0.15em] text-[#737373] uppercase mb-4">
          Support
        </h3>
        <div className="softui-card divide-y divide-gray-100">
          <Link href="/faq" className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">FAQ</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link href="/privacy" className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Privacy Policy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
          <Link href="/terms" className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">Terms & Conditions</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>
        </div>
      </section>

      {/* Logout */}
      <section>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full softui-btn-danger flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </section>
    </div>
  );
}
