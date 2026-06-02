"use client";

import { useRef, useState, useEffect } from "react";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { TopHeader } from "@/features/dashboard/components/TopHeader";
import { colors, typography } from "@/lib/design-system";
import { Upload, FileText, ChevronDown, Eye, Loader2, Cpu, Timeline, ChevronRight, Stethoscope, Heart, Brain, Building2, Plus } from "lucide-react";
import Image from "next/image";

export default function ExplorePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDisplayName(file.name);
      setCustomFileName(file.name);
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      // Start processing
      setIsProcessing(true);
      // Show rename modal
      setShowRenameModal(true);
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
    setShowRenameModal(false);
    setCustomFileName('');
    setDisplayName('');
  };

  const handleViewDocument = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const handleSaveRename = () => {
    setDisplayName(customFileName);
    setShowRenameModal(false);
  };

  const handleCancelRename = () => {
    setShowRenameModal(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                  className="rounded-[2rem] p-7 relative shadow-sm"
                  style={{ backgroundColor: colors.background.base }}
                >
                  <div className="relative z-10 space-y-2">
                    <h1 className={`${typography.heroTitle} text-gray-900`}>
                      Explore Scenarios
                    </h1>
                    <p className={`${typography.bodySecondary} text-[#5a5a6a] max-w-[17rem]`}>
                      Select a document from your vault to start exploring scenarios
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      capture="environment"
                    />
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`transition-colors text-black ${typography.button} px-6 py-3 rounded-full inline-flex items-center justify-between gap-2 hover:opacity-90`}
                        style={{
                          background: colors.primary.gradient,
                          boxShadow: colors.shadows.gold,
                        }}
                      >
                        <span>Select a document</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
                          {/* Empty state dropdown */}
                          <div className="p-4 text-center">
                            <p className="text-sm font-medium text-gray-900">No documents yet</p>
                            <p className="text-xs text-gray-500 mt-1">Upload one to get started</p>
                          </div>
                          <div className="border-t border-gray-200">
                            <button
                              onClick={handleUploadClick}
                              className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Upload a document</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
                      {displayName || selectedFile.name}
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

              {/* Processing State - Show when document is processing */}
              {selectedFile && isProcessing && (
                <section className="softui-card p-8 flex flex-col items-center justify-center gap-4 mt-6">
                  <Loader2 className="w-12 h-12 animate-spin" style={{ color: colors.primary.base }} />
                  <div className="text-center">
                    <p className="text-gray-900 font-medium">Processing document...</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait while we analyze your document</p>
                  </div>
                </section>
              )}

              {/* Scenario Cards - Only show when document is uploaded and not processing */}
              {selectedFile && !isProcessing && (
                <section className="space-y-4">
                  <h2 className={`${typography.sectionHeader} text-gray-900 mt-2`}>What happens if...?</h2>
                  <div className="space-y-3">
                    <div className="softui-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fbeaf0' }}>
                            <Stethoscope className="w-5 h-5" style={{ color: '#993556' }} />
                          </div>
                          <span className="text-gray-900 font-medium">I am diagnosed with cancer</span>
                        </div>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="softui-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fcebeb' }}>
                            <Heart className="w-5 h-5" style={{ color: '#a32d2d' }} />
                          </div>
                          <span className="text-gray-900 font-medium">I have a heart attack</span>
                        </div>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="softui-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e6f1fb' }}>
                            <Brain className="w-5 h-5" style={{ color: '#185fa5' }} />
                          </div>
                          <span className="text-gray-900 font-medium">I have a stroke</span>
                        </div>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="softui-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e1f5ee' }}>
                            <Building2 className="w-5 h-5" style={{ color: '#0f6e56' }} />
                          </div>
                          <span className="text-gray-900 font-medium">I am hospitalised</span>
                        </div>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>

                    <div className="softui-card p-4" style={{ border: '1.5px dashed #e5e7eb', background: 'transparent' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                            <Plus className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <span className="text-gray-600 font-medium">Ask a custom scenario</span>
                            <p className="text-xs text-gray-400 mt-0.5">Type your own what-if</p>
                          </div>
                        </div>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:shadow-[inset_2px_2px_4px_#c8c8d0,inset_-2px_-2px_4px_#ffffff] transition-shadow"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* How It Works Section - Show only when no document */}
              {!selectedFile && (
                <>
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      how it works
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: colors.primary.rgba[15] }}>
                        <Upload className="w-3.5 h-3.5" style={{ color: colors.primary.dark }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Upload your document</p>
                        <p className="text-xs text-gray-600 mt-0.5">PDF, contracts, reports — any file</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: colors.primary.rgba[15] }}>
                        <Cpu className="w-3.5 h-3.5" style={{ color: colors.primary.dark }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">AI reads & understands it</p>
                        <p className="text-xs text-gray-600 mt-0.5">We extract meaning and context</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: colors.primary.rgba[15] }}>
                        <Timeline className="w-3.5 h-3.5" style={{ color: colors.primary.dark }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Explore what-if scenarios</p>
                        <p className="text-xs text-gray-600 mt-0.5">See future outcomes that matter to you</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <BottomNav />
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rename document</h3>
            <p className="text-sm text-gray-600 mb-4">Give your document a custom name while it processes.</p>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="Enter document name"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancelRename}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRename}
                className="flex-1 px-4 py-3 rounded-lg text-black font-medium transition-colors"
                style={{
                  background: colors.primary.gradient,
                  boxShadow: colors.shadows.gold,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
