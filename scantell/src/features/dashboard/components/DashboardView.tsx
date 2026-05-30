import { HeroCard } from "./HeroCard";
import { InsightCard } from "./InsightCard";
import { ScanItem } from "./ScanItem";

export function DashboardView() {
  return (
    <div className="space-y-8 pt-1">
      <HeroCard />

      {/* Latest Insights Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[11px] font-bold tracking-[0.15em] text-[#737373] uppercase">
            Latest Insights
          </h2>
          <button className="text-[13px] font-bold text-[#b86b25] hover:text-[#9a581e]">
            See all
          </button>
        </div>
        
        <div className="space-y-3.5">
          <InsightCard
            type="prediction"
            title="Prediction"
            description={
              <>Contract expires in <span className="font-bold text-black">47 days</span> — renewal clause activates automatically</>
            }
            tagText="High confidence"
          />
          <InsightCard
            type="opportunity"
            title="Opportunity"
            description={
              <>Policy document shows <span className="font-bold text-black">3 renegotiation windows</span> in Q1 2025</>
            }
            tagText="Review suggested"
          />
        </div>
      </section>

      {/* Recent Scans Section */}
      <section>
        <div className="flex items-center justify-between mb-5 mt-9">
          <h2 className="text-[11px] font-bold tracking-[0.15em] text-[#737373] uppercase">
            Recent Scans
          </h2>
          <button className="text-[13px] font-bold text-[#b86b25] hover:text-[#9a581e]">
            View all
          </button>
        </div>

        <div className="space-y-1">
          <ScanItem
            filename="Service_Agreement_2024.pdf"
            metadata="Scanned 2h ago · 14 pages"
            insightsCount={4}
            insightsText="4 insights"
            tagBgClass="bg-[#fdf6e6]"
            tagColorClass="text-[#b87c3b]"
          />
          <ScanItem
            filename="Lease_Renewal_Notice.pdf"
            metadata="Scanned yesterday · 3 pages"
            insightsCount={2}
            insightsText="2 insights"
            tagBgClass="bg-[#e6f6f1]"
            tagColorClass="text-[#288c73]"
          />
          <ScanItem
            filename="Medical_Report_Nov.pdf"
            metadata="Scanned Dec 10 · 8 pages"
            insightsCount={1}
            insightsText="1 insight"
            tagBgClass="bg-[#fbeef3]"
            tagColorClass="text-[#c44975]"
            showDivider={false}
          />
        </div>
      </section>
    </div>
  );
}
