import Image from "next/image";
import { colors } from "@/lib/design-system";

export function HeroCard() {
  return (
    <div className="rounded-[2rem] p-7 relative overflow-hidden shadow-sm min-h-[300px]" style={{ backgroundColor: colors.background.dark }}>
      {/* Header at top left */}
      <div className="relative z-10 text-left mb-4">
        <h1 className="text-[24px] font-bold text-white leading-[1.3] tracking-wide">
          Scan any document,<br />
          see its <span style={{ color: colors.primary.base }}>future</span>
        </h1>
      </div>

      {/* GIF in bottom right */}
      <div className="absolute -bottom-20 -right-20 w-[360px] h-[360px]">
        <Image
          src="/d58c8fc0-57db-4f9e-a540-00005f49f693.gif"
          alt="Scanning animation"
          width={360}
          height={360}
          className="w-full h-full object-contain"
          unoptimized
        />
      </div>
    </div>
  );
}
