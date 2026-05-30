import Image from "next/image";

interface TopHeaderProps {
  userImage?: string | null;
}

export function TopHeader({ userImage }: TopHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg flex items-center justify-center gap-[3px]">
          <div className="w-[5px] h-4 bg-white rounded-full"></div>
          <div className="w-[5px] h-4 bg-[#fbc02d] rounded-full"></div>
        </div>
        <span className="text-[22px] font-bold tracking-tight">scantell</span>
      </div>
      <div className="w-9 h-9 bg-[#f4f2ea] rounded-full flex items-center justify-center overflow-hidden shrink-0">
        {userImage ? (
          <Image src={userImage} alt="User" width={36} height={36} />
        ) : null}
      </div>
    </header>
  );
}
