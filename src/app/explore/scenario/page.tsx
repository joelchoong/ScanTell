"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { colors, typography } from "@/lib/design-system";
import AnswerRenderer from "@/features/explore/components/AnswerRenderer";
import {
  ChevronLeft,
  Loader2,
  FileText,
  AlertCircle,
  TrendingUp,
  Clock,
  Scissors,
  Stethoscope,
  Heart,
  Brain,
  Building2,
  Activity,
  AlertTriangle,
  Pill,
  User,
  Smile,
  Leaf,
  Globe,
  Plane,
  MapPin,
} from "lucide-react";
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

function ScenarioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");
  const documentId = searchParams.get("documentId");

  const [selectedDoc, setSelectedDoc] = useState<DBDocument | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [scenarioAnswer, setScenarioAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Color mapping for scenarios
  const getIconColors = (iconName: string) => {
    const colorMap: Record<string, { bg: string; icon: string }> = {
      Stethoscope: { bg: "#fbeaf0", icon: "#993556" },
      Heart: { bg: "#fcebeb", icon: "#a32d2d" },
      Brain: { bg: "#e6f1fb", icon: "#185fa5" },
      Building2: { bg: "#e1f5ee", icon: "#0f6e56" },
      Activity: { bg: "#fef3c7", icon: "#92400e" },
      AlertTriangle: { bg: "#fef2f2", icon: "#dc2626" },
      FileText: { bg: "#f3f4f6", icon: "#4b5563" },
      Pill: { bg: "#ecfdf5", icon: "#059669" },
      User: { bg: "#eff6ff", icon: "#2563eb" },
      Smile: { bg: "#fdf4ff", icon: "#9333ea" },
    };
    return colorMap[iconName] || { bg: "#f3f4f6", icon: "#4b5563" };
  };

  useEffect(() => {
    if (!id || !documentId) {
      setError("Missing scenario or document information.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch documents to find document details
        const docRes = await fetch("/api/documents");
        if (!docRes.ok) throw new Error("Failed to load document information.");
        const docData = await docRes.json();
        const docs: DBDocument[] = docData.documents || [];
        const docMatch = docs.find((d) => d.id === documentId);
        if (!docMatch) throw new Error("Document not found.");
        setSelectedDoc(docMatch);

        // 2. Fetch scenarios for this document
        const scenarioRes = await fetch(`/api/documents/${documentId}/scenarios`);
        if (!scenarioRes.ok) throw new Error("Failed to load scenario details.");
        const scenarioData = await scenarioRes.json();
        const scenarios: Scenario[] = scenarioData.scenarios || [];
        const scenarioMatch = scenarios.find((s) => s.id === id);
        if (!scenarioMatch) throw new Error("Scenario not found.");
        setScenario(scenarioMatch);

        // 3. Fetch scenario answer (which runs our dynamic fallback generator on server if missing)
        const answerRes = await fetch(`/api/documents/${documentId}/scenario-answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: scenarioMatch.query,
            scenarioId: scenarioMatch.id,
          }),
        });
        if (!answerRes.ok) throw new Error("Failed to fetch scenario answer.");
        const answerData = await answerRes.json();
        setScenarioAnswer(answerData.answer);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, documentId]);

  const handleBack = () => {
    router.push(`/explore?id=${documentId}`);
  };

  const IconComponent = scenario ? getIcon(scenario.icon) : FileText;
  const iconColors = scenario ? getIconColors(scenario.icon) : { bg: "#f3f4f6", icon: "#4b5563" };

  return (
    <div
      className="text-gray-900 pb-28 font-sans min-h-screen selection-bg-yellow-100"
      style={{ background: colors.primary.gradientTransparent }}
    >
      {/* Wave background pattern */}
      <div className="absolute top-0 left-0 right-0 w-full h-[40vh] z-0 pointer-events-none">
        <Image
          src="/wave-pattern.svg"
          alt="Wave pattern"
          fill
          className="object-cover opacity-70"
        />
      </div>

      <div className="max-w-md mx-auto relative flex flex-col min-h-screen">
        {/* Dynamic Navigation Header */}
        <header className="px-6 pt-8 pb-4 flex items-center justify-between z-10 relative">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f0f0f3] hover:opacity-90 transition-opacity"
            style={{ boxShadow: colors.shadows.raised }}
            aria-label="Back to document exploration"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 text-center px-4">
            <h1 className="text-base font-bold text-gray-900 line-clamp-1">
              {scenario ? scenario.title : "Scenario Details"}
            </h1>
            {selectedDoc && (
              <p className="text-xs text-gray-500 font-medium truncate max-w-[200px] mx-auto mt-0.5">
                {selectedDoc.name}
              </p>
            )}
          </div>
          <div className="w-10" /> {/* Balanced spacing */}
        </header>

        <main className="px-6 flex-1 z-10 relative page-transition mt-4">
          {loading ? (
            <div className="softui-card p-8 flex flex-col items-center justify-center gap-4 min-h-[300px]">
              <Loader2 className="w-10 h-10 animate-spin text-yellow-600" />
              <div className="text-center">
                <p className="text-gray-900 font-semibold">Generating answer...</p>
                <p className="text-gray-500 text-xs mt-1">
                  Gemini is reading the policy rules to evaluate your scenario
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="softui-card p-6 flex flex-col items-center justify-center text-center gap-4 border border-orange-200 bg-orange-50/50">
              <AlertCircle className="w-10 h-10 text-orange-500" />
              <div>
                <p className="text-orange-950 font-semibold">Error displaying scenario</p>
                <p className="text-orange-800 text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={handleBack}
                className="softui-btn px-4 py-2 text-xs"
              >
                Back to Explore
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Question / Context Card */}
              <div className="softui-card p-5 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: iconColors.bg }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: iconColors.icon }} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Scenario Question
                    </span>
                    <h2 className="text-sm font-semibold text-gray-900 leading-snug">
                      {scenario?.query}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Answer Card */}
              <div className="softui-card p-5 relative overflow-hidden bg-white/70 backdrop-blur-sm border border-white/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600">
                      AI Analysis Answer
                    </span>
                  </div>
                  {scenarioAnswer && (
                    <AnswerRenderer
                      answer={scenarioAnswer}
                      accentColor={iconColors.icon}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ScenarioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f0f0f3]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    }>
      <ScenarioContent />
    </Suspense>
  );
}
