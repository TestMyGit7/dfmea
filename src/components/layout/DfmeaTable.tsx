import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FmeaRow } from "@/types";

interface DfmeaTableProps {
  rows: FmeaRow[];
  showFeedback?: boolean;
  onFeedback?: (idx: number, type: "up" | "down" | null) => void;
}

const COLS = [
  { key: "productCategory", label: "Product\nCategory", width: "8%" },
  { key: "product", label: "Product", width: "10%" },
  { key: "subsystem", label: "Subsystem", width: "9%" },
  { key: "component", label: "Component", width: "9%" },
  { key: "function", label: "Function", width: "12%" },
  { key: "failureMode", label: "Failure Mode", width: "10%" },
  { key: "effect", label: "Effect", width: "9%" },
  { key: "severity", label: "Severity", width: "7%" },
  { key: "occurrence", label: "Occurrence", width: "8%" },
  { key: "detection", label: "Detection", width: "8%" },
];

export const DfmeaTable: React.FC<DfmeaTableProps> = ({
  rows,
  showFeedback,
  onFeedback,
}) => {
  return (
    <div className="overflow-auto rounded-md border border-border">
      <table className="dfmea-table w-full text-[11px] border-collapse">
        <thead>
          <tr className="bg-muted/60">
            {COLS.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className="px-2 py-1.5 text-left font-semibold text-muted-foreground border-b border-border whitespace-pre-line leading-tight"
              >
                {col.label}
              </th>
            ))}
            {showFeedback && (
              <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground border-b border-border w-16">
                Feedback
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={COLS.length + (showFeedback ? 1 : 0)}
                className="text-center py-8 text-muted-foreground"
              >
                No data. Please select all dropdowns to generate DFMEA.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-2 py-1.5 border-b border-border">
                  {row.productCategory}
                </td>
                <td className="px-2 py-1.5 border-b border-border">
                  {row.product}
                </td>
                <td className="px-2 py-1.5 border-b border-border">
                  {row.subsystem}
                </td>
                <td className="px-2 py-1.5 border-b border-border">
                  {row.component}
                </td>
                <td className="px-2 py-1.5 border-b border-border">
                  {row.function}
                </td>
                <td className="px-2 py-1.5 border-b border-border">
                  {row.failureMode}
                </td>
                <td className="px-2 py-1.5 border-b border-border">
                  {row.effect}
                </td>
                <td className="px-2 py-1.5 border-b border-border text-center">
                  {row.severity}
                </td>
                <td className="px-2 py-1.5 border-b border-border text-center">
                  {row.occurrence}
                </td>
                <td className="px-2 py-1.5 border-b border-border text-center">
                  {row.detection}
                </td>
                {showFeedback && (
                  <td className="px-2 py-1.5 border-b border-border">
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          onFeedback?.(idx, row.feedback === "up" ? null : "up")
                        }
                        className={cn(
                          "p-0.5 rounded transition-colors",
                          row.feedback === "up"
                            ? "bg-green-600 text-white"
                            : "text-foreground hover:bg-green-100 dark:hover:bg-green-900/30",
                        )}
                        title={
                          row.feedback === "up"
                            ? "Clear feedback"
                            : "Positive feedback"
                        }
                      >
                        <ThumbsUp
                          className="h-3 w-3"
                          fill={row.feedback === "up" ? "currentColor" : "none"}
                        />
                      </button>
                      <button
                        onClick={() =>
                          onFeedback?.(
                            idx,
                            row.feedback === "down" ? null : "down",
                          )
                        }
                        className={cn(
                          "p-0.5 rounded transition-colors",
                          row.feedback === "down"
                            ? "bg-red-600 text-white"
                            : "text-foreground hover:bg-red-100 dark:hover:bg-red-900/30",
                        )}
                        title={
                          row.feedback === "down"
                            ? "Clear feedback"
                            : "Negative feedback"
                        }
                      >
                        <ThumbsDown
                          className="h-3 w-3"
                          fill={
                            row.feedback === "down" ? "currentColor" : "none"
                          }
                        />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
