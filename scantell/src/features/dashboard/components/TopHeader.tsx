import Image from "next/image";

interface TopHeaderProps {
  userImage?: string | null;
}

export function TopHeader({ userImage }: TopHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2.5">
        <Image
          src="/scantell-logo-horizontal.svg"
          alt="ScanTell"
          width={140}
          height={40}
          priority
        />
      </div>
      <div className="w-9 h-9 bg-[#f4f2ea] rounded-full flex items-center justify-center overflow-hidden shrink-0">
        {userImage ? (
          <Image src={userImage} alt="User" width={36} height={36} />
        ) : null}
      </div>
    </header>
  );
}
