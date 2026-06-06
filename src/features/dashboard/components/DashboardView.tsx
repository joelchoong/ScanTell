import { HeroCard } from "./HeroCard";
import { UploadedDocuments } from "./UploadedDocuments";

export function DashboardView() {
  return (
    <div className="space-y-8 pt-1">
      <HeroCard />

      {/* Uploaded Documents Section */}
      <div className="px-6">
        <UploadedDocuments />
      </div>
    </div>
  );
}
