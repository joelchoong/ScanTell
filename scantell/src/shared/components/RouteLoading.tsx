export function RouteLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0f0f3]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#F5B301] border-t-transparent animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
