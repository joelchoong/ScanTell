export function BottomNav() {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-20">
      <div className="bg-[#faf9f6]/95 backdrop-blur-md border border-gray-200 rounded-[2rem] h-[72px] flex items-center justify-between px-2.5 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] relative">
        <div className="w-[88px] h-[56px] bg-[#141414] rounded-[1.75rem] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#fbc02d] rounded-full"></div>
        </div>
        <div className="w-14 h-14 bg-[#fbc02d] rounded-full shadow-sm absolute left-1/2 -translate-x-1/2"></div>
        <div className="w-[88px]"></div> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
