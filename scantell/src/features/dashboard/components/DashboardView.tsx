import { HeroCard } from "./HeroCard";
import { UploadedDocuments } from "./UploadedDocuments";
import { colors } from "@/lib/design-system";

export function DashboardView() {
  return (
    <div className="space-y-8 pt-1">
      <HeroCard />

      {/* CTA Button outside card */}
      <div className="px-6">
        <button 
          className="w-full transition-colors text-black font-semibold text-[15px] px-8 py-4 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: colors.primary.base,
            boxShadow: colors.shadows.gold
          }}
        >
          Scan a document
        </button>
      </div>

      {/* Uploaded Documents Section */}
      <div className="px-6">
        <UploadedDocuments />
      </div>
    </div>
  );
}
