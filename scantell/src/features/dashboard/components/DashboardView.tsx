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
          className="w-full transition-colors text-black font-semibold text-[15px] px-8 py-4 rounded-full flex items-center justify-center gap-2.5"
          style={{ 
            backgroundColor: colors.primary.base,
            boxShadow: colors.shadows.gold
          }}
        >
          <div className="w-2 h-2 bg-black rounded-full"></div>
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
