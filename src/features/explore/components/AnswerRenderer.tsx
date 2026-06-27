"use client";

import { useMemo, useState } from "react";
import {
  DollarSign,
  Shield,
  Clock,
  AlertTriangle,
  Infinity,
  CalendarCheck,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ParsedLine {
  label: string;
  value: string;
  pageRef: string | null;
  type: "currency" | "limit" | "duration" | "warning" | "general" | "header";
}

interface GroupedLine {
  label: string;
  type: ParsedLine["type"];
  items: {
    value: string;
    pageRef: string | null;
  }[];
}

const INITIAL_VISIBLE = 5;

function classifyLine(label: string, value: string): ParsedLine["type"] {
  if (!value || value === "—" || value === "-" || value === "–") return "header";

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
    case "header":
      return Shield;
    default:
      return CheckCircle2;
  }
}

function parseLine(raw: string): ParsedLine | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length < 2) return null;

  let pageRef: string | null = null;
  let cleaned = trimmed;

  const pageMatch = cleaned.match(
    /\s*\((?:Page|Section|Pg|p\.|Sec\.?)\s*[\d.,\s]+(?:(?:Page|Section|Pg|p\.|Sec\.?)\s*[\d.,\s]*)*\)\.?\s*$/i
  );
  if (pageMatch) {
    pageRef = pageMatch[0]
      .trim()
      .replace(/^\(/, "")
      .replace(/\)\.?\s*$/, "")
      .trim();
    cleaned = cleaned.slice(0, pageMatch.index).trim();
  }

  cleaned = cleaned.replace(/\.\s*$/, "");

  const colonIndex = cleaned.indexOf(":");
  if (colonIndex === -1) {
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

function parseAnswer(answer: string): GroupedLine[] {
  const lines = answer
    .split(/\n/)
    .map(parseLine)
    .filter((line): line is ParsedLine => line !== null);

  const grouped: GroupedLine[] = [];

  for (const line of lines) {
    if (line.type === "header") {
      grouped.push({
        label: line.label || line.value,
        type: "header",
        items: [],
      });
      continue;
    }

    const lastGroup = grouped[grouped.length - 1];
    if (
      lastGroup &&
      lastGroup.type !== "header" &&
      line.label &&
      lastGroup.label.toLowerCase() === line.label.toLowerCase()
    ) {
      lastGroup.items.push({
        value: line.value,
        pageRef: line.pageRef,
      });
      if (line.type === "warning" && lastGroup.type !== "warning") {
        lastGroup.type = "warning";
      }
    } else {
      grouped.push({
        label: line.label,
        type: line.type,
        items: [
          {
            value: line.value,
            pageRef: line.pageRef,
          },
        ],
      });
    }
  }

  return grouped;
}

interface AnswerRendererProps {
  answer: string;
  accentColor?: string;
}

export default function AnswerRenderer({ answer, accentColor }: AnswerRendererProps) {
  const groups = useMemo(() => parseAnswer(answer), [answer]);
  const [expanded, setExpanded] = useState(false);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {answer}
      </p>
    );
  }

  if (groups.length === 1 && groups[0].items.length === 1 && !groups[0].label) {
    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {answer}
      </p>
    );
  }

  const needsCollapse = groups.length > INITIAL_VISIBLE;
  const visibleGroups = needsCollapse && !expanded ? groups.slice(0, INITIAL_VISIBLE) : groups;
  const hiddenCount = groups.length - INITIAL_VISIBLE;

  return (
    <div className="space-y-2.5">
      {visibleGroups.map((group, i) => {
        if (group.type === "header") {
          return (
            <div key={i} className="flex items-center gap-2 pt-3 pb-1 first:pt-0">
              <div
                className="w-1.5 h-4 rounded-full"
                style={{ backgroundColor: accentColor || "#F5B301" }}
              />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#6b6050]">
                {group.label}
              </span>
            </div>
          );
        }

        const isGoldAccent = ["currency", "limit", "duration", "header"].includes(group.type);
        const iconBg = isGoldAccent ? "rgba(245, 179, 1, 0.15)" : "rgba(90, 90, 106, 0.12)";
        const iconColor = isGoldAccent ? "#d49800" : "#5a5a6a";
        const TypeIcon = getTypeIcon(group.type);
        const isSingle = group.items.length === 1;

        // Deduplicate page references
        const uniquePageRefs = Array.from(
          new Set(group.items.map((item) => item.pageRef).filter((ref): ref is string => !!ref))
        );

        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl px-3.5 py-3 transition-all duration-200"
            style={{ backgroundColor: "#f2ece0" }}
          >
            {/* Group Icon */}
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: iconBg }}
            >
              <TypeIcon className="w-3.5 h-3.5" style={{ color: iconColor }} />
            </div>

            {/* Group Content */}
            <div className="flex-1 min-w-0">
              {/* Header area with label and consolidated page badge */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                {group.label && (
                  <p className="text-[11px] font-bold text-[#6b6050] uppercase tracking-wide leading-tight">
                    {group.label}
                  </p>
                )}
                {uniquePageRefs.length > 0 && (
                  <div className="flex flex-wrap gap-1 ml-auto">
                    {uniquePageRefs.map((ref, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-md text-[#6b6050] bg-[#e8e3d9]"
                      >
                        <FileText className="w-2.5 h-2.5 flex-shrink-0 text-[#6b6050]" />
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isSingle ? (
                <p className="text-[13px] font-semibold text-[#121417] leading-snug">
                  {group.items[0].value || "—"}
                </p>
              ) : (
                <div className="space-y-0.5">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start text-[13px] leading-relaxed text-[#121417] font-semibold"
                    >
                      <span className="text-gray-400 mr-1.5 select-none">•</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Show more/less toggle */}
      {needsCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors hover:bg-gray-200/50"
          style={{ color: accentColor || "#F5B301" }}
        >
          {expanded ? (
            <>
              Show less <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Show {hiddenCount} more <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
