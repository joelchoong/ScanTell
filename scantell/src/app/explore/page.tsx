"use client";

import { useRef, useState } from "react";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { ExploreScenariosAnimation } from "@/features/explore/components/ExploreScenariosAnimation";
import { TopHeader } from "@/features/dashboard/components/TopHeader";
import { colors, typography } from "@/lib/design-system";
import { Upload, FileText, ChevronDown, X, Eye, Loader2 } from "lucide-react";
import Image from "next/image";

export default function ExplorePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      // Start processing
      setIsProcessing(true);
      // Simulate processing (replace with actual upload/processing logic)
      setTimeout(() => {
        setIsProcessing(false);
      }, 3000);
      console.log("File selected:", file.name);
      // TODO: Implement actual upload logic
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    setIsProcessing(false);
  };

  const handleViewDocument = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div className="text-gray-900 pb-28 font-sans selection-bg-yellow-100 min-h-screen" style={{ background: colors.primary.gradientTransparent }}>
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="S-curve pattern"
          fill
          className="object-cover"
        />
      </div>

      <div className="max-w-md mx-auto relative h-screen flex flex-col" style={{ background: "transparent" }}>
        <TopHeader />

        <main className="px-6 overflow-y-auto flex-1 page-transition">
          <div className="space-y-6 pt-1">
            <div className="space-y-0">
              {/* Upload Section - Hidden when file is selected */}
              {!selectedFile && (
                <section
                  className="rounded-[2rem] p-7 relative overflow-hidden shadow-sm"
                  style={{ backgroundColor: colors.background.base }}
                >
                  <div className="relative z-10 space-y-3">
                    <h1 className={`${typography.heroTitle} text-gray-900`}>
                      Explore Scenarios
                    </h1>
                    <p className={`${typography.bodySecondary} text-[#5a5a6a] max-w-[17rem]`}>
                      Upload a document to unlock interactive future simulations.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      capture="environment"
                    />
                    <button
                      onClick={handleUploadClick}
                      className={`mt-4 transition-colors text-black ${typography.button} px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 hover:opacity-90`}
                      style={{
                        background: colors.primary.gradient,
                        boxShadow: colors.shadows.gold,
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </button>
                  </div>
                  <div
                    className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full"
                    style={{ backgroundColor: colors.primary.rgba[15] }}
                  />
                </section>
              )}

              {/* Selected Document Display */}
              {selectedFile && (
                <section
                  className="rounded-[2rem] p-5 relative overflow-hidden shadow-sm"
                  style={{ backgroundColor: colors.background.base }}
                >
                  <div className="relative z-10 pr-24">
                    <h1 className="text-[18px] font-bold text-gray-900 leading-tight truncate mb-4">
                      {selectedFile.name}
                    </h1>
                    <button
                      disabled
                      className="transition-colors text-black text-[13px] font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                      style={{
                        background: colors.primary.gradient,
                        boxShadow: colors.shadows.gold,
                      }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                      Change Document
                    </button>
                  </div>
                  <button
                    onClick={handleViewDocument}
                    className="absolute top-1/2 -translate-y-1/2 right-5 transition-colors text-black text-[13px] font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center gap-2 hover:opacity-90"
                    style={{
                      background: colors.primary.gradient,
                      boxShadow: colors.shadows.gold,
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  <div
                    className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full"
                    style={{ backgroundColor: colors.primary.rgba[15] }}
                  />
                </section>
              )}

              <ExploreScenariosAnimation />

              {/* Scenario Cards - Always visible */}
              <section className="space-y-4">
                <h2 className={`${typography.sectionHeader} text-gray-900`}>What happens if...?</h2>
                {isProcessing && (
                  <div className="softui-card p-4 flex items-center justify-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: colors.primary.base }} />
                    <span className="text-gray-600">Processing document...</span>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="softui-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🩺</span>
                        <span className="text-gray-900 font-medium">I Am Diagnosed With Cancer</span>
                      </div>
                      <button
                        disabled={isProcessing || !selectedFile}
                        className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: colors.primary.gradient,
                          boxShadow: colors.shadows.gold,
                        }}
                      >
                        View Scenario
                      </button>
                    </div>
                  </div>

                  <div className="softui-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">❤️</span>
                        <span className="text-gray-900 font-medium">I Have A Heart Attack</span>
                      </div>
                      <button
                        disabled={isProcessing || !selectedFile}
                        className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: colors.primary.gradient,
                          boxShadow: colors.shadows.gold,
                        }}
                      >
                        View Scenario
                      </button>
                    </div>
                  </div>

                  <div className="softui-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧠</span>
                        <span className="text-gray-900 font-medium">I Have A Stroke</span>
                      </div>
                      <button
                        disabled={isProcessing || !selectedFile}
                        className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: colors.primary.gradient,
                          boxShadow: colors.shadows.gold,
                        }}
                      >
                        View Scenario
                      </button>
                    </div>
                  </div>

                  <div className="softui-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏥</span>
                        <span className="text-gray-900 font-medium">I Am Hospitalised</span>
                      </div>
                      <button
                        disabled={isProcessing || !selectedFile}
                        className="text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: colors.primary.gradient,
                          boxShadow: colors.shadows.gold,
                        }}
                      >
                        View Scenario
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
