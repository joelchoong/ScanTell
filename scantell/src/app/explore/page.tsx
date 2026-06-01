import { auth } from "@/features/auth/server/authConfig";
import { redirect } from "next/navigation";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { ExploreScenariosAnimation } from "@/features/explore/components/ExploreScenariosAnimation";
import { TopHeader } from "@/features/dashboard/components/TopHeader";
import { colors, typography } from "@/lib/design-system";
import { Upload } from "lucide-react";
import Image from "next/image";

export default async function ExplorePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="text-gray-900 pb-28 font-sans selection-bg-yellow-100 min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="S-curve pattern"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="max-w-md mx-auto relative h-screen flex flex-col" style={{ background: "transparent" }}>
        <TopHeader />

        <main className="px-6 overflow-y-auto flex-1">
          <div className="space-y-6 pt-1">
            <div className="space-y-0">
              <section
                className="rounded-[2rem] p-7 relative overflow-hidden shadow-sm"
                style={{ backgroundColor: colors.background.base }}
              >
                <div className="relative z-10 space-y-3">
                  <h1 className={`${typography.heroTitle} text-gray-900`}>
                    Explore Scenarios
                  </h1>
                  <p className={`${typography.bodySecondary} text-[#5a5a6a] max-w-[17rem]`}>
                    Upload a document to unlock interactive future simulations.
                  </p>
                  <button
                    className={`mt-4 transition-colors text-black ${typography.button} px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 hover:opacity-90`}
                    style={{
                      background: colors.primary.gradient,
                      boxShadow: colors.shadows.gold,
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                </div>
                <div
                  className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full"
                  style={{ backgroundColor: colors.primary.rgba[15] }}
                />
              </section>

              <ExploreScenariosAnimation />
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
