"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { TopHeader } from "@/features/dashboard/components/TopHeader";
import { colors, typography } from "@/lib/design-system";
import { Upload, FileText, ChevronDown, Eye, Loader2, Cpu, Timeline, ChevronRight, Stethoscope, Heart, Brain, Building2, Plus, AlertCircle, X } from "lucide-react";
import Image from "next/image";

interface DBDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: number;
  isInsuranceDocument?: boolean | null;
  summary?: string | null;
  extractedText?: string | null;
  analysis?: any | null;
  createdAt: string;
}

export default function ExplorePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [documents, setDocuments] = useState<DBDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DBDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangeDropdown, setShowChangeDropdown] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const changeDropdownRef = useRef<HTMLDivElement>(null);

  // Load documents from actual endpoint
  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
        return data.documents || [];
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
    return [];
  };

  useEffect(() => {
    loadDocuments().then((docs) => {
      // Check if id is passed as query parameter
      const docId = searchParams.get('id');
      if (docId && docs.length > 0) {
        const found = docs.find((d: any) => d.id === docId);
        if (found) {
          handleSelectDocument(found);
        }
      } else {
        // Fallback to file/url parameters if present
        const fileParam = searchParams.get('file');
        const urlParam = searchParams.get('url');
        if (fileParam && urlParam) {
          const found = docs.find((d: any) => d.fileUrl === decodeURIComponent(urlParam));
          if (found) {
            handleSelectDocument(found);
          }
        }
      }
    });
  }, [searchParams]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const runAnalysis = async (docId: string) => {
    setIsProcessing(true);
    setProcessingError(null);
    try {
      const res = await fetch(`/api/documents/${docId}/analyze`, {
        method: "POST"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to analyze document.");
      }
      const data = await res.json();
      setSelectedDoc(data.document);
      setDocuments(prev => prev.map(d => d.id === docId ? data.document : d));
    } catch (err: any) {
      console.error(err);
      setProcessingError(err.message || "Analysis failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setProcessingError(null);
      
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const uploadRes = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Upload failed.");
        }
        
        const uploadData = await uploadRes.json();
        const newDoc = uploadData.document;
        
        await loadDocuments();
        setSelectedDoc(newDoc);
        setCustomFileName(newDoc.name);
        
        // Trigger analysis automatically
        await runAnalysis(newDoc.id);
      } catch (err: any) {
        console.error(err);
        setProcessingError(err.message || "Failed to upload and analyze document.");
        setIsProcessing(false);
      }
    }
  };

  const handleClearFile = () => {
    setSelectedDoc(null);
    setIsProcessing(false);
    setShowRenameModal(false);
    setCustomFileName('');
    setProcessingError(null);
  };

  const handleViewDocument = () => {
    if (selectedDoc?.fileUrl) {
      window.open(selectedDoc.fileUrl, '_blank');
    }
  };

  const handleSaveRename = async () => {
    if (!selectedDoc || !customFileName.trim()) return;
    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: customFileName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedDoc(data.document);
        setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? data.document : d));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowRenameModal(false);
    }
  };

  const handleCancelRename = () => {
    setShowRenameModal(false);
  };

  const handleSelectDocument = async (doc: DBDocument) => {
    setSelectedDoc(doc);
    setCustomFileName(doc.name);
    setShowDropdown(false);
    setShowChangeDropdown(false);
    setProcessingError(null);
    
    // If not yet analyzed, analyze now
    if (!doc.extractedText) {
      await runAnalysis(doc.id);
    }
  };

  const handleScenarioClick = (scenarioType: string) => {
    if (!selectedDoc) return;
    router.push(`/chat?documentId=${selectedDoc.id}&scenario=${scenarioType}`);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (changeDropdownRef.current && !changeDropdownRef.current.contains(event.target as Node)) {
        setShowChangeDropdown(false);
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
              {!selectedDoc && (
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
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">Maximum file size: 5MB (PDF only)</p>
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
                          {/* Documents list */}
                          {documents.length > 0 ? (
                            <>
                              {documents.map((doc) => (
                                <button
                                  key={doc.id}
                                  onClick={() => handleSelectDocument(doc)}
                                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary.base}33` }}>
                                    <FileText className="w-4 h-4" style={{ color: colors.primary.base }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                    <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                                  </div>
                                </button>
                              ))}
                              <div className="border-t border-gray-200">
                                <button
                                  onClick={handleUploadClick}
                                  className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-700">Upload new document</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
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
              {selectedDoc && (
                <section
                  className="rounded-[2rem] p-5 relative shadow-sm"
                  style={{ backgroundColor: colors.background.base }}
                >
                  <button
                    onClick={handleClearFile}
                    className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="relative z-10 pr-24">
                    <h1 className="text-[18px] font-bold text-gray-900 leading-tight truncate mb-4 cursor-pointer hover:underline" onClick={() => setShowRenameModal(true)}>
                      {selectedDoc.name}
                    </h1>
                    <div className="relative" ref={changeDropdownRef}>
                      <button
                        onClick={() => setShowChangeDropdown(!showChangeDropdown)}
                        className="transition-colors text-black text-[13px] font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center gap-2 hover:opacity-90"
                        style={{
                          background: colors.primary.gradient,
                          boxShadow: colors.shadows.gold,
                        }}
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showChangeDropdown ? 'rotate-180' : ''}`} />
                        Change Document
                      </button>
                      {showChangeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
                          {documents.filter(doc => doc.id !== selectedDoc.id).map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => handleSelectDocument(doc)}
                              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary.base}33` }}>
                                <FileText className="w-4 h-4" style={{ color: colors.primary.base }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                <p className="text-xs text-gray-500">{formatDate(doc.createdAt)}</p>
                              </div>
                            </button>
                          ))}
                          {documents.filter(doc => doc.id !== selectedDoc.id).length === 0 && (
                            <div className="p-4 text-center">
                              <p className="text-sm text-gray-500">No other documents</p>
                            </div>
                          )}
                          <div className="border-t border-gray-200">
                            <button
                              onClick={handleUploadClick}
                              className="w-full px-4 py-3 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Upload new document</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleViewDocument}
                    className="absolute top-1/2 -translate-y-1/2 right-12 transition-colors text-black text-[13px] font-semibold px-4 py-2 rounded-full inline-flex items-center justify-center gap-2 hover:opacity-90"
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

              {/* Processing State */}
              {selectedDoc && isProcessing && (
                <section className="softui-card p-8 flex flex-col items-center justify-center gap-4 mt-6">
                  <Loader2 className="w-12 h-12 animate-spin" style={{ color: colors.primary.base }} />
                  <div className="text-center">
                    <p className="text-gray-900 font-medium">Analyzing document...</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait while Gemini OCR extracts policy information</p>
                  </div>
                </section>
              )}

              {/* Processing Error State */}
              {selectedDoc && processingError && (
                <section className="softui-card p-6 flex flex-col items-center justify-center gap-4 mt-6 border border-orange-200 bg-orange-50/50">
                  <AlertCircle className="w-10 h-10 text-orange-500" />
                  <div className="text-center">
                    <p className="text-orange-900 font-semibold">Unable to analyze document</p>
                    <p className="text-orange-700 text-xs mt-1">{processingError}</p>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="softui-btn px-4 py-2 text-xs"
                  >
                    Upload Insurance Document
                  </button>
                </section>
              )}

              {/* Not an Insurance Document State */}
              {selectedDoc && !isProcessing && !processingError && selectedDoc.isInsuranceDocument === false && (
                <section className="softui-card p-6 flex flex-col items-center justify-center gap-4 mt-6 border border-orange-200 bg-orange-50/50">
                  <AlertCircle className="w-10 h-10 text-orange-500" />
                  <div className="text-center">
                    <p className="text-orange-900 font-semibold">Not an insurance document</p>
                    <p className="text-orange-700 text-xs mt-1">This document doesn't appear to be an insurance policy. Please upload an insurance document to explore scenarios.</p>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className="softui-btn px-4 py-2 text-xs"
                  >
                    Upload Different Document
                  </button>
                </section>
              )}

              {/* Scenario Cards - Show when document is uploaded, analyzed, and is an insurance document */}
              {selectedDoc && !isProcessing && !processingError && selectedDoc.isInsuranceDocument === true && (
                <section className="space-y-4 pt-4">
                  {/* Document Summary */}
                  {selectedDoc.summary && (
                    <div className="softui-card p-4 bg-blue-50/50 border border-blue-200">
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedDoc.summary}</p>
                    </div>
                  )}
                  <h2 className={`${typography.sectionHeader} text-gray-900 mt-2`}>What happens if...?</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleScenarioClick("cancer")}
                      className="w-full text-left softui-card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#fbeaf0]">
                          <Stethoscope className="w-5 h-5 text-[#993556]" />
                        </div>
                        <span className="text-gray-900 font-medium">I am diagnosed with cancer</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      onClick={() => handleScenarioClick("heart_attack")}
                      className="w-full text-left softui-card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#fcebeb]">
                          <Heart className="w-5 h-5 text-[#a32d2d]" />
                        </div>
                        <span className="text-gray-900 font-medium">I have a heart attack</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      onClick={() => handleScenarioClick("stroke")}
                      className="w-full text-left softui-card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#e6f1fb]">
                          <Brain className="w-5 h-5 text-[#185fa5]" />
                        </div>
                        <span className="text-gray-900 font-medium">I have a stroke</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      onClick={() => handleScenarioClick("hospitalised")}
                      className="w-full text-left softui-card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#e1f5ee]">
                          <Building2 className="w-5 h-5 text-[#0f6e56]" />
                        </div>
                        <span className="text-gray-900 font-medium">I am hospitalised</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>

                    <button
                      onClick={() => handleScenarioClick("custom")}
                      className="w-full text-left softui-card p-4 flex items-center justify-between hover:shadow-md transition-shadow border-1.5 border-dashed border-gray-300 bg-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                          <Plus className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Ask a custom scenario</span>
                          <p className="text-xs text-gray-400 mt-0.5">Type your own what-if</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </section>
              )}

              {/* How It Works Section - Show only when no document */}
              {!selectedDoc && (
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
                        <p className="text-xs text-gray-600 mt-0.5">PDF or image contract — any document</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: colors.primary.rgba[15] }}>
                        <Cpu className="w-3.5 h-3.5" style={{ color: colors.primary.dark }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">AI reads & understands it</p>
                        <p className="text-xs text-gray-600 mt-0.5">Gemini extracts the exact terms and coverage</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: colors.primary.rgba[15] }}>
                        <Timeline className="w-3.5 h-3.5" style={{ color: colors.primary.dark }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Explore what-if scenarios</p>
                        <p className="text-xs text-gray-600 mt-0.5">Click scenarios to query coverage instantly</p>
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
      {showRenameModal && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rename document</h3>
            <p className="text-sm text-gray-600 mb-4">Give your document a custom name.</p>
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
