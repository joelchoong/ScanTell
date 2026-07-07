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
  isStructuredData?: boolean;
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
  if (!trimmed || trimmed.length < 1) return null;

  // Skip standalone page reference lines
  if (/^(?:Page|Section|Pg|p\.|Sec\.?)\s*[\d.,\s]+$/i.test(trimmed)) return null;

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
      .trim()
      .replace(/\s+/g, " ");
    cleaned = cleaned.slice(0, pageMatch.index).trim();
  }

  cleaned = cleaned.replace(/\.\s*$/, "");

  const colonIndex = cleaned.indexOf(":");
  if (colonIndex === -1) {
    return { label: "", value: cleaned, pageRef, type: classifyLine("", cleaned) };
  }

  const label = cleaned.slice(0, colonIndex).trim();
  const value = cleaned.slice(colonIndex + 1).trim();

  return { label, value, pageRef, type: classifyLine(label, value) };
}

function detectStructuredData(value: string): boolean {
  // Check if value looks like structured data (e.g., "Up to 80: RM250; 81-85: RM1,340")
  if (!value.includes(":") || !value.includes(";")) return false;
  
  // Try to parse as semicolon-separated key-value pairs
  const parts = value.split(";").filter(part => part.trim().includes(":"));
  return parts.length >= 2;
}

function parseStructuredData(value: string): { label: string; value: string }[] | null {
  if (!detectStructuredData(value)) return null;
  
  const parsed = value.split(";").map(part => {
    const colonIndex = part.indexOf(":");
    if (colonIndex === -1) return null;
    const label = part.slice(0, colonIndex).trim();
    const value = part.slice(colonIndex + 1).trim();
    return { label, value };
  }).filter(item => item !== null) as { label: string; value: string }[];
  
  return parsed.length >= 2 ? parsed : null;
}

function shouldRemoveAsRedundant(label: string, hasStructuredData: boolean): boolean {
  if (!hasStructuredData || !label) return false;
  
  const redundantPatterns = [
    /premiums?.*increase/i,
    /charges?.*increase/i,
    /increase.*with age/i,
    /increase.*age/i,
    /premiums?.*vary/i,
    /charges?.*vary/i,
  ];
  
  return redundantPatterns.some(pattern => pattern.test(label));
}

function simplifyWaitingPeriodLabel(label: string): string {
  // Remove common prefixes to make labels concise
  const prefixesToRemove = [
    /waiting periods?/gi,
    /medical rider/gi,
    /il pwe rider/gi,
    /rider/gi,
    /\(.*?\)/g, // Remove content in parentheses
  ];
  
  let simplified = label;
  prefixesToRemove.forEach(prefix => {
    simplified = simplified.replace(prefix, '').trim();
  });
  
  // Clean up extra spaces and colons
  simplified = simplified.replace(/\s+/g, ' ').replace(/^:\s*/, '').replace(/\s*:\s*$/, '');
  
  return simplified;
}

function shouldGroupTogether(label1: string, label2: string): boolean {
  if (!label1 || !label2) return false;
  
  const l1 = label1.toLowerCase();
  const l2 = label2.toLowerCase();
  
  // Check if both are exclusions
  const exclusionKeywords = ['excluded', 'exclusion', 'not covered', 'exclude', 'not covered'];
  const hasExclusion1 = exclusionKeywords.some(kw => l1.includes(kw));
  const hasExclusion2 = exclusionKeywords.some(kw => l2.includes(kw));
  
  if (hasExclusion1 && hasExclusion2) return true;
  
  // Check if both are waiting periods
  const waitingPeriodKeywords = ['waiting period', 'waiting', 'period', 'waiting time'];
  const hasWaiting1 = waitingPeriodKeywords.some(kw => l1.includes(kw));
  const hasWaiting2 = waitingPeriodKeywords.some(kw => l2.includes(kw));
  
  if (hasWaiting1 && hasWaiting2) return true;
  
  // Check if labels contain similar keywords
  if (l1.includes(l2) || l2.includes(l1)) return true;
  
  return false;
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

    // If line has no label, merge with previous group or create a new group
    if (!line.label) {
      const lastGroup = grouped[grouped.length - 1];
      if (lastGroup && lastGroup.type !== "header") {
        lastGroup.items.push({
          value: line.value,
          pageRef: line.pageRef,
        });
        if (line.type === "warning" && lastGroup.type !== "warning") {
          lastGroup.type = "warning";
        }
      } else {
        // Create a new group with the value as the item
        grouped.push({
          label: "",
          type: line.type,
          items: [
            {
              value: line.value,
              pageRef: line.pageRef,
            },
          ],
        });
      }
      continue;
    }

    const lastGroup = grouped[grouped.length - 1];
    const isStructured = detectStructuredData(line.value);
    
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
      if (isStructured) {
        lastGroup.isStructuredData = true;
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
        isStructuredData: isStructured,
      });
    }
  }

  // Group similar content (e.g., all exclusions together)
  const finalGrouped: GroupedLine[] = [];
  for (const group of grouped) {
    if (group.type === "header") {
      finalGrouped.push(group);
      continue;
    }
    
    const lastGroup = finalGrouped[finalGrouped.length - 1];
    
    // Handle groups without labels - merge with previous group if it exists
    if (!group.label && lastGroup && lastGroup.type !== "header") {
      lastGroup.items.push(...group.items);
      if (group.type === "warning" && lastGroup.type !== "warning") {
        lastGroup.type = "warning";
      }
      continue;
    }
    
    if (lastGroup && lastGroup.type !== "header" && shouldGroupTogether(lastGroup.label, group.label)) {
      // For waiting periods, preserve context by prefixing items with simplified label
      if (lastGroup.label.toLowerCase().includes("waiting") && group.label.toLowerCase().includes("waiting")) {
        // Add the simplified label context to each item
        const simplifiedLabel = simplifyWaitingPeriodLabel(group.label);
        const contextualizedItems = group.items.map(item => ({
          ...item,
          value: simplifiedLabel ? `${simplifiedLabel}: ${item.value}` : item.value
        }));
        lastGroup.items.push(...contextualizedItems);
        lastGroup.label = "Waiting Periods";
      } else {
        // For exclusions, just merge items
        lastGroup.items.push(...group.items);
        // Update label to be more generic if needed
        if (lastGroup.label.toLowerCase().includes("excluded") && group.label.toLowerCase().includes("excluded")) {
          lastGroup.label = "Exclusions";
        }
      }
      // Update type if the new group is a warning
      if (group.type === "warning" && lastGroup.type !== "warning") {
        lastGroup.type = "warning";
      }
      // Update structured data flag
      if (group.isStructuredData) {
        lastGroup.isStructuredData = true;
      }
    } else {
      finalGrouped.push(group);
    }
  }

  // Remove redundant statements when structured data is present
  const hasStructuredData = finalGrouped.some(g => g.isStructuredData);
  return finalGrouped.filter(g => {
    if (g.type === "header") return true;
    return !shouldRemoveAsRedundant(g.label, hasStructuredData);
  });
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

        const iconBg = "rgba(245, 179, 1, 0.15)";
        const iconColor = "#d49800";
        const TypeIcon = getTypeIcon(group.type);
        const isSingle = group.items.length === 1;

        const uniquePageRefs = Array.from(
          new Set(group.items.map((item) => item.pageRef).filter((ref): ref is string => !!ref))
        );

        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl px-3.5 py-3 transition-all duration-200"
            style={{ backgroundColor: "#f2ece0" }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: iconBg }}
            >
              <TypeIcon className="w-3.5 h-3.5" style={{ color: iconColor }} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                {group.label && (
                  <p className="text-[11px] font-bold text-[#6b6050] uppercase tracking-wide leading-tight">
                    {group.label}
                  </p>
                )}
                {uniquePageRefs.length > 0 && (
                  <div className="flex flex-nowrap gap-1 ml-auto">
                    {uniquePageRefs.map((ref, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded-md text-[#6b6050] bg-[#e8e3d9] whitespace-nowrap"
                      >
                        <FileText className="w-2 h-2 flex-shrink-0 text-[#6b6050]" />
                        {ref}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {(() => {
                // Check if this group has structured data (age bracket tables)
                if (group.isStructuredData && group.items.length > 0) {
                  const structuredData = parseStructuredData(group.items[0].value);
                  if (structuredData) {
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <tbody>
                            {structuredData.map((row, idx) => (
                              <tr key={idx} className="border-b border-[#e8e3d9] last:border-0">
                                <td className="py-1.5 pr-4 text-[#6b6050] font-medium whitespace-nowrap">{row.label}</td>
                                <td className="py-1.5 text-[#121417] font-semibold">{row.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                }

                // Flatten all items and split by semicolon for sub-bullets
                const allValues = group.items.flatMap(item => {
                  // Split semicolon-separated sub-items into individual bullets
                  const parts = item.value.split(/\s*;\s*/).filter(Boolean);
                  return parts.length > 1 ? parts : [item.value];
                });

                if (allValues.length === 1) {
                  return (
                    <p className="text-[13px] font-semibold text-[#121417] leading-snug">
                      {allValues[0] || "—"}
                    </p>
                  );
                }

                return (
                  <div className="space-y-0.5">
                    {allValues.map((val, idx) => (
                      <div key={idx} className="flex items-start text-[13px] leading-relaxed text-[#121417] font-semibold">
                        <span className="text-gray-400 mr-1.5 select-none">•</span>
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
