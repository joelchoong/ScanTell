import { HeroCard } from "./HeroCard";
import { UploadedDocuments } from "./UploadedDocuments";
import { colors, typography } from "@/lib/design-system";
import { Plus } from "lucide-react";

export function DashboardView() {
  return (
    <div className="space-y-8 pt-1">
      <HeroCard />

      {/* CTA Button outside card */}
      <div className="px-6">
        <button
          className={`w-full transition-colors text-black ${typography.button} px-8 py-4 rounded-full flex items-center justify-center hover:opacity-90`}
          style={{
            background: colors.primary.gradient,
            boxShadow: colors.shadows.gold
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Simulate what happens
        </button>
      </div>

      {/* Uploaded Documents Section */}
      <div className="px-6">
        <UploadedDocuments />
      </div>
    </div>
  );
}
