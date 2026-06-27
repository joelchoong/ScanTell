"use client";

import { useMemo } from "react";
import {
  DollarSign,
  Shield,
  Clock,
  AlertTriangle,
  Infinity,
  CalendarCheck,
  FileText,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

interface ParsedLine {
  label: string;
  value: string;
  pageRef: string | null;
  type: "currency" | "limit" | "duration" | "warning" | "general";
}

// Accent color palette for alternating row tints
const ROW_ACCENTS = [
  { dot: "#F5B301", bg: "rgba(245,179,1,0.07)" },
  { dot: "#3b82f6", bg: "rgba(59,130,246,0.06)" },
  { dot: "#10b981", bg: "rgba(16,185,129,0.06)" },
  { dot: "#8b5cf6", bg: "rgba(139,92,246,0.06)" },
  { dot: "#f97316", bg: "rgba(249,115,22,0.06)" },
  { dot: "#ec4899", bg: "rgba(236,72,153,0.06)" },
];

function classifyLine(label: string, value: string): ParsedLine["type"] {
  const combined = `${label} ${value}`.toLowerCase();
  if (/rm[\d,]+|usd|myr|\$/.test(combined)) return "currency";
  if (/no limit|unlimited|no cap/i.test(combined)) return "limit";
  if (/age|year|month|day|duration|period|birthday/i.test(combined)) return "duration";
  if (/warning|caution|exclude|not covered|not specified/i.test(combined)) return "warning";
  return "general";
}

function getTypeIcon(type: ParsedLine["type"]) {
  switch (type) {
    case "currency":
      return DollarSign;
    case "limit":
      return Infinity;
    case "duration":
      return CalendarCheck;
    case "warning":
      return AlertTriangle;
    default:
      return CheckCircle2;
  }
}

function parseLine(raw: string): ParsedLine | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length < 3) return null;

  // Extract page/section references at the end: (Page 11), (Section 4.2), (Page 11, Page 12)
  let pageRef: string | null = null;
  let cleaned = trimmed;

  // Match trailing parenthesized page/section refs
  const pageMatch = cleaned.match(/\s*\((?:Page|Section|Pg|p\.|Sec\.?)\s*[\d.,\s]+(?:(?:Page|Section|Pg|p\.|Sec\.?)\s*[\d.,\s]*)*\)\.?\s*$/i);
  if (pageMatch) {
    pageRef = pageMatch[0].trim().replace(/^\(/, "").replace(/\)\.?\s*$/, "").trim();
    cleaned = cleaned.slice(0, pageMatch.index).trim();
  }

  // Remove trailing period
  cleaned = cleaned.replace(/\.\s*$/, "");

  // Split on first colon
  const colonIndex = cleaned.indexOf(":");
  if (colonIndex === -1) {
    // No colon — treat the whole thing as a value with no label
    return {
      label: "",
      value: cleaned,
      pageRef,
      type: classifyLine("", cleaned),
    };
  }

  const label = cleaned.slice(0, colonIndex).trim();
  const value = cleaned.slice(colonIndex + 1).trim();

  return {
    label,
    value,
    pageRef,
    type: classifyLine(label, value),
  };
}

function parseAnswer(answer: string): ParsedLine[] {
  // Split on newlines, filter empties
  return answer
    .split(/\n/)
    .map(parseLine)
    .filter((line): line is ParsedLine => line !== null);
}

interface AnswerRendererProps {
  answer: string;
  accentColor?: string;
}

export default function AnswerRenderer({ answer, accentColor }: AnswerRendererProps) {
  const lines = useMemo(() => parseAnswer(answer), [answer]);

  // If parsing produces no structured lines, fall back to raw display
  if (lines.length === 0) {
    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {answer}
      </p>
    );
  }

  // If only 1 line with no label, also fall back
  if (lines.length === 1 && !lines[0].label) {
    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {answer}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const accent = ROW_ACCENTS[i % ROW_ACCENTS.length];
        const TypeIcon = getTypeIcon(line.type);

        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl px-3.5 py-3 transition-all duration-200"
            style={{ backgroundColor: accent.bg }}
          >
            {/* Accent icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${accent.dot}20` }}
            >
              <TypeIcon
                className="w-3.5 h-3.5"
                style={{ color: accent.dot }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {line.label ? (
                <>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide leading-tight">
                    {line.label}
                  </p>
                  <p className="text-[13px] font-semibold text-gray-900 mt-0.5 leading-snug">
                    {line.value || "—"}
                  </p>
                </>
              ) : (
                <p className="text-[13px] text-gray-800 leading-snug">
                  {line.value}
                </p>
              )}
            </div>

            {/* Page reference badge */}
            {line.pageRef && (
              <span
                className="flex-shrink-0 inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-md mt-0.5"
                style={{
                  backgroundColor: "rgba(0,0,0,0.04)",
                  color: "#888",
                }}
              >
                <FileText className="w-2.5 h-2.5" />
                {line.pageRef}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
