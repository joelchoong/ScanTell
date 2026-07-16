"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from "@/features/navigation/components/BottomNav";
import { colors, typography } from "@/lib/design-system";
import AnswerRenderer from "@/features/explore/components/AnswerRenderer";
import FeedbackWidget from "@/features/feedback/components/FeedbackWidget";
import { Upload, FileText, ChevronDown, Eye, Loader2, Cpu, Timeline, ChevronRight, Stethoscope, Heart, Brain, Building2, Plus, AlertCircle, X, ChevronUp, Activity, AlertTriangle, Pill, User, Smile, Scissors, Leaf, Globe, Plane, Clock, MapPin, TrendingUp, MoreVertical, Pencil, RefreshCw, ArrowLeft, Shield, Info } from "lucide-react";
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
  scenarioAnswers?: any | null;
  createdAt: string;
}

interface Scenario {
  id: string;
  title: string;
  icon: string;
  query: string;
  description?: string;
  documentTypes: string[];
  usageCount: number;
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
  const [showSummary, setShowSummary] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [scenarioAnswer, setScenarioAnswer] = useState<string | null>(null);
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<{ title: string; description: string } | null>(null);

  const hasDocId = !!searchParams.get('id') || (!!searchParams.get('file') && !!searchParams.get('url'));
  const [initialLoading, setInitialLoading] = useState(hasDocId);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const changeDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  // Icon mapping for scenarios
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      Stethoscope,
      Heart,
      Brain,
      Building2,
      Activity,
      AlertTriangle,
      FileText,
      Pill,
      User,
      Smile,
      Scissors,
      Leaf,
      Globe,
      Plane,
      Clock,
      MapPin,
      TrendingUp,
      AlertCircle,
    };

    return iconMap[iconName] || FileText;
  };

  // Color mapping for scenarios — dark gold
  const getIconColors = (iconName: string) => {
    return { bg: "rgba(245, 179, 1, 0.15)", icon: "#d49800" };
  };

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
    const docId = searchParams.get('id');
    const fileParam = searchParams.get('file');
    const urlParam = searchParams.get('url');
    const hasQuery = !!docId || (!!fileParam && !!urlParam);

    setInitialLoading(hasQuery);

    loadDocuments().then((docs) => {
      if (docId && docs.length > 0) {
        const found = docs.find((d: any) => d.id === docId);
        if (found) {
          handleSelectDocument(found);
        }
      } else {
        // Fallback to file/url parameters if present
        if (fileParam && urlParam) {
          const found = docs.find((d: any) => d.fileUrl === decodeURIComponent(urlParam));
          if (found) {
            handleSelectDocument(found);
          }
        }
      }
      setInitialLoading(false);
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
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errData = await res.json();
          console.error("Analysis error:", errData);
          const errorMsg = errData.error?.message || errData.error || "Failed to analyze document.";
          throw new Error(errorMsg);
        } else {
          const text = await res.text();
          console.error("Analysis error (non-JSON):", text.substring(0, 200));
          throw new Error("Failed to analyze document. Server returned non-JSON response.");
        }
      }
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setSelectedDoc(data.document);
        setScenarios(data.scenarios || []);
        setDocuments(prev => prev.map(d => d.id === docId ? data.document : d));
      } else {
        const text = await res.text();
        console.error("Analysis response (non-JSON):", text.substring(0, 200));
        throw new Error("Failed to analyze document. Server returned non-JSON response.");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
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
    } else {
      // Load scenarios for already analyzed documents
      try {
        const res = await fetch(`/api/documents/${doc.id}/scenarios`);
        if (res.ok) {
          const data = await res.json();
          setScenarios(data.scenarios || []);
        } else {
          console.error("Failed to load scenarios, re-analyzing document");
          // If scenarios endpoint fails, re-analyze the document
          await runAnalysis(doc.id);
        }
      } catch (err) {
        console.error("Failed to load scenarios:", err);
        // If there's an error, try re-analyzing
        await runAnalysis(doc.id);
      }
    }
  };

  const handleScenarioClick = async (scenarioId: string) => {
    if (!selectedDoc) return;

    // Custom scenario goes to chat
    if (scenarioId === "custom") {
      // Log the custom question before redirecting
      try {
        await fetch('/api/user-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: 'Custom question', documentId: selectedDoc.id }),
        });
      } catch (err) {
        console.error('Failed to log custom question:', err);
      }
      router.push(`/chat?documentId=${selectedDoc.id}&scenario=custom`);
      return;
    }

    // Predefined scenarios route to scenario page
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    router.push(`/explore/scenario?id=${scenario.id}&documentId=${selectedDoc.id}`);
  };

  const handleShowDescription = (scenario: Scenario) => {
    if (scenario.description) {
      setSelectedDescription({ title: scenario.title, description: scenario.description });
      setShowDescriptionModal(true);
    }
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
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setShowMenuDropdown(false);
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
        {/* Header - document context aware */}
        {selectedDoc ? (
          <header className="px-6 pt-6 pb-4 sticky top-0 z-20" style={{ background: colors.primary.solid }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={handleClearFile}
                  aria-label="Back to Explore"
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-black/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-700" />
                </button>

                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold text-gray-900 truncate">
                    {selectedDoc.name}
                  </h1>

                  {!isProcessing &&
                    !processingError &&
                    selectedDoc.isInsuranceDocument === true && (
                      <div className="mt-1">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: `${colors.primary.base}20`,
                            color: colors.primary.dark,
                            borderColor: `${colors.primary.base}30`,
                          }}
                        >
                          <Shield className="w-3 h-3" />
                          Insurance document
                        </span>
                      </div>
                    )}
                </div>
              </div>
              {/* 3-dot menu */}
              <div className="relative" ref={menuDropdownRef}>
                <button
                  onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors flex-shrink-0 mt-0.5"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
                {showMenuDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-30">
                    {selectedDoc.summary && !isProcessing && !processingError && selectedDoc.isInsuranceDocument === true && (
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                          Description
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {selectedDoc.summary}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => { handleViewDocument(); setShowMenuDropdown(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">View Document</span>
                    </button>
                    <button
                      onClick={() => { setShowRenameModal(true); setShowMenuDropdown(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Rename</span>
                    </button>
                    <button
                      onClick={() => { setShowChangeDropdown(true); setShowMenuDropdown(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Change Document</span>
                    </button>
                    <button
                      onClick={() => { handleClearFile(); setShowMenuDropdown(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                    >
                      <X className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-500">Deselect Document</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Change document dropdown overlay */}
            {showChangeDropdown && (
              <div className="mt-3" ref={changeDropdownRef}>
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
              </div>
            )}
          </header>
        ) : (
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
        )}

        <main className="px-6 overflow-y-auto flex-1 page-transition">
          <div className="space-y-6 pt-4">
            <div className="space-y-0">
              {/* Upload Section - Hidden when file is selected */}
              {!selectedDoc && !initialLoading && (
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

              {/* Initial Loading State when redirecting back to a document */}
              {!selectedDoc && initialLoading && (
                <section className="softui-card p-8 flex flex-col items-center justify-center gap-4 mt-6 min-h-[300px]">
                  <Loader2 className="w-12 h-12 animate-spin text-yellow-600" />
                  <div className="text-center">
                    <p className="text-gray-900 font-medium">Loading document...</p>
                    <p className="text-gray-500 text-sm mt-1">Retrieving analysis and cached scenarios</p>
                  </div>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => runAnalysis(selectedDoc.id)}
                      className="softui-btn px-4 py-2 text-xs"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleClearFile}
                      className="softui-btn px-4 py-2 text-xs"
                    >
                      Upload Different Document
                    </button>
                  </div>
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
                <section className="space-y-4">
                  <h2 className={`${typography.sectionHeader} text-gray-900 mt-2`}>What happens if...?</h2>
                  <div className="space-y-3">
                    {scenarios.length > 0 ? (
                      scenarios.map((scenario) => {
                        const Icon = getIcon(scenario.icon);
                        const iconColors = getIconColors(scenario.icon);
                        return (
                          <div
                            key={scenario.id}
                            onClick={() => handleScenarioClick(scenario.id)}
                            className="w-full text-left softui-card-interactive p-4 block cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: iconColors.bg }}
                              >
                                <Icon className="w-5 h-5" style={{ color: iconColors.icon }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-gray-900 font-semibold text-sm leading-snug">{scenario.title}</span>
                                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                </div>
                                {scenario.description && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowDescription(scenario);
                                    }}
                                    className="inline-flex items-center gap-1 mt-1 text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium"
                                  >
                                    <Info className="w-3.5 h-3.5 text-gray-400" />
                                    <span>See details</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500">No scenarios available. Please analyze a document first.</p>
                    )}

                    <button
                      onClick={() => handleScenarioClick("custom")}
                      className="w-full text-left softui-card p-4 flex items-center justify-between border-1.5 border-dashed border-gray-300 bg-transparent transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-50 border border-dashed border-[#F5B301]">
                          <Plus className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <span className="text-gray-600 font-semibold text-sm">Ask a custom scenario</span>
                          <p className="text-xs text-gray-400 mt-0.5">Type your own what-if</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Scenario Answer Section */}
                  {selectedScenario && (
                    <div className="softui-card p-4 bg-[#FFF8E7]/50 border border-[#D4AF37]/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = getIcon(selectedScenario.icon);
                            const colors = getIconColors(selectedScenario.icon);
                            return (
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center self-center" style={{ backgroundColor: colors.bg }}>
                                <Icon className="w-4 h-4" style={{ color: colors.icon }} />
                              </div>
                            );
                          })()}
                          <span className="text-sm font-semibold text-gray-900 self-center">{selectedScenario.title}</span>
                        </div>
                        <button
                          onClick={() => setSelectedScenario(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {loadingScenario ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing your policy...</span>
                        </div>
                      ) : (
                        <AnswerRenderer answer={scenarioAnswer || ""} />
                      )}
                    </div>
                  )}
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

      {/* Description Modal */}
      {showDescriptionModal && selectedDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedDescription.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedDescription.description}</p>
            <button
              onClick={() => setShowDescriptionModal(false)}
              className="w-full px-4 py-3 rounded-lg bg-yellow-500 text-white font-medium hover:bg-yellow-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Feedback Widget */}
      <FeedbackWidget page="explore" />
    </div>
  );
}
