export function HeroCard() {
  return (
    <div className="bg-[#1a1917] rounded-[2rem] p-7 relative overflow-hidden shadow-sm">
      {/* Decorative circle */}
      <div className="absolute -bottom-16 -right-16 w-[280px] h-[280px] bg-[#3a3528] rounded-full opacity-60"></div>
      
      <div className="relative z-10">
        <p className="text-[11px] font-bold tracking-[0.15em] text-[#8a867c] uppercase mb-4">
          AI Document Intelligence
        </p>
        <h1 className="text-[32px] font-bold text-white leading-[1.1] mb-6 tracking-tight">
          Scan any doc,<br />
          see its <span className="text-[#fbc02d]">future</span>
        </h1>
        
        <button className="bg-[#fbc02d] hover:bg-[#f9b000] transition-colors text-black font-semibold text-[15px] px-5 py-3 rounded-full flex items-center gap-2.5">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          Scan a document
        </button>
      </div>
    </div>
  );
}
