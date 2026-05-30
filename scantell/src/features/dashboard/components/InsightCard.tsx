import React from "react";

interface InsightCardProps {
  type: "prediction" | "opportunity";
  title: string;
  description: React.ReactNode;
  tagText: string;
}

export function InsightCard({ type, title, description, tagText }: InsightCardProps) {
  const isPrediction = type === "prediction";

  const iconBg = isPrediction ? "bg-[#f8f2e6]" : "bg-[#ebf7f5]";
  const titleColor = isPrediction ? "text-[#b86b25]" : "text-[#1e7c6b]";
  const tagBg = isPrediction ? "bg-[#fcf2df]" : "bg-[#ebf7f5]";
  const tagTextColor = isPrediction ? "text-[#b87629]" : "text-[#1c7e6b]";

  return (
    <div className="bg-[#fcfcfa] border border-[#f0ede6] rounded-3xl p-5 flex gap-4 shadow-sm">
      <div className={`w-[46px] h-[46px] ${iconBg} rounded-xl shrink-0`}></div>
      <div className="flex-1 pt-0.5">
        <h3 className={`text-[11px] font-bold tracking-widest ${titleColor} uppercase mb-1.5`}>
          {title}
        </h3>
        <p className="text-[15px] leading-snug text-gray-800 mb-3.5">
          {description}
        </p>
        <span className={`inline-block ${tagBg} ${tagTextColor} text-[11px] font-bold px-3 py-1 rounded-full`}>
          {tagText}
        </span>
      </div>
    </div>
  );
}
