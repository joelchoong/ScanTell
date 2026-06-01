import Image from "next/image";
import { colors } from "@/lib/design-system";

export function TopHeader() {
  return (
    <header className="flex items-center justify-center px-6 py-5 sticky top-0 z-20" style={{ background: colors.primary.solid }}>
      <div className="flex items-center gap-2.5">
        <Image
          src="/scantell-logo-horizontal.svg"
          alt="ScanTell"
          width={140}
          height={40}
          priority
        />
      </div>
    </header>
  );
}
