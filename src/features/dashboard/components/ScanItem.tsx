interface ScanItemProps {
  filename: string;
  metadata: string;
  insightsCount: number;
  insightsText: string;
  tagColorClass: string;
  tagBgClass: string;
  showDivider?: boolean;
}

export function ScanItem({
  filename,
  metadata,
  insightsText,
  tagColorClass,
  tagBgClass,
  showDivider = true,
}: ScanItemProps) {
  return (
    <>
      <div className="flex items-center gap-4 py-3">
        <div className="w-12 h-12 bg-[#f4f2ea] rounded-[14px] shrink-0"></div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-[15px] text-gray-900 mb-0.5 truncate">{filename}</h4>
          <p className="text-[13px] text-gray-500">{metadata}</p>
        </div>
        <div className={`${tagBgClass} ${tagColorClass} text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap`}>
          {insightsText}
        </div>
      </div>
      {showDivider && <div className="h-[1px] bg-gray-100 ml-[64px]"></div>}
    </>
  );
}
