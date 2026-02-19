/**
 * PageFooter – appears at the bottom of EVERY page (all roles).
 * Contains:
 *   1. "Files available Vector Database" button → opens VectorDB popup
 *   2. "?" Help button → opens FAQ popup (from Image 1)
 */
import React, { useState } from "react";
import { Database, HelpCircle, X, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ────────────────────────────────────────────────────────────────────── */
/* FAQ Data                                                                */
/* ────────────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    question: "FAQ",
    answer:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    isIntro: true,
  },
  {
    question: "What is a program?",
    answer:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  {
    question: "How is data uploaded now?",
    answer:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
  },
  {
    question: "What is DFMEA?",
    answer:
      "Design Failure Mode and Effects Analysis (DFMEA) is a structured approach to identify and address potential failures in a design before they reach the customer. It helps prioritize risks by calculating a Risk Priority Number (RPN) from Severity, Occurrence, and Detection ratings.",
  },
  {
    question: "How do I generate a DFMEA report?",
    answer:
      'Select all four dropdown filters (Program → Product Category → Subsystem → Product), optionally choose or enter a custom prompt, then click "Generate DFMEA". The AI model will produce a structured analysis table that you can review, provide feedback on, and save.',
  },
];

/* ────────────────────────────────────────────────────────────────────── */
/* Vector DB File Data (mock)                                             */
/* ────────────────────────────────────────────────────────────────────── */
const VECTOR_DB_FILES = [
  {
    name: "PRD_TC52_v2.pdf",
    size: "1.2 MB",
    type: "PRD",
    status: "indexed",
    date: "2024-01-15",
  },
  {
    name: "KnowledgeBase_Antenna_Q4.docx",
    size: "856 KB",
    type: "KB",
    status: "indexed",
    date: "2024-01-18",
  },
  {
    name: "FieldRepairData_MC93.xlsx",
    size: "2.4 MB",
    type: "Field",
    status: "indexed",
    date: "2024-01-20",
  },
  {
    name: "PRD_ET60_Rev3.pdf",
    size: "980 KB",
    type: "PRD",
    status: "indexed",
    date: "2024-01-22",
  },
  {
    name: "KnowledgeBase_Battery.pdf",
    size: "1.1 MB",
    type: "KB",
    status: "processing",
    date: "2024-01-25",
  },
  {
    name: "FieldRepairData_TC77.csv",
    size: "340 KB",
    type: "Field",
    status: "indexed",
    date: "2024-01-26",
  },
  {
    name: "PRD_L10AX_Windows.pdf",
    size: "3.2 MB",
    type: "PRD",
    status: "indexed",
    date: "2024-01-28",
  },
  {
    name: "KnowledgeBase_Display_v1.docx",
    size: "720 KB",
    type: "KB",
    status: "indexed",
    date: "2024-01-30",
  },
];

const TYPE_COLORS: Record<string, string> = {
  PRD: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  KB: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Field: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
};

/* ────────────────────────────────────────────────────────────────────── */
/* FAQ Dialog                                                              */
/* ────────────────────────────────────────────────────────────────────── */
const FaqDialog: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden">
      {/* Header */}
      <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
        <DialogTitle className="text-base font-bold">Help & FAQ</DialogTitle>
      </DialogHeader>

      {/* Scrollable body */}
      <ScrollArea className="flex-1 overflow-y-auto px-5 py-4 max-h-[60vh]">
        <div className="space-y-5">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              {item.isIntro ? (
                <>
                  <p className="text-sm font-bold mb-1.5">{item.question}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold mb-1.5">
                    {item.question}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

/* ────────────────────────────────────────────────────────────────────── */
/* Vector DB Dialog                                                        */
/* ────────────────────────────────────────────────────────────────────── */
const VectorDbDialog: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
      {/* Header */}
      <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
        <DialogTitle className="flex items-center gap-2 text-base font-bold">
          <Database className="h-4 w-4 text-primary" />
          Files Available in Vector Database
        </DialogTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {VECTOR_DB_FILES.filter((f) => f.status === "indexed").length} of{" "}
          {VECTOR_DB_FILES.length} files indexed and ready for AI retrieval.
        </p>
      </DialogHeader>

      {/* Table */}
      <ScrollArea className="flex-1 overflow-y-auto max-h-[55vh]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                File Name
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                Type
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                Size
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                Date Added
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {VECTOR_DB_FILES.map((file, i) => (
              <tr
                key={i}
                className={cn(
                  "border-t border-border",
                  i % 2 === 0 ? "bg-background" : "bg-muted/20",
                )}
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                      TYPE_COLORS[file.type],
                    )}
                  >
                    {file.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {file.size}
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {file.date}
                </td>
                <td className="px-4 py-2.5">
                  {file.status === "indexed" ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-3 w-3" /> Indexed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                      Processing
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

/* ────────────────────────────────────────────────────────────────────── */
/* PageFooter – exported component used on every page                     */
/* ────────────────────────────────────────────────────────────────────── */
interface PageFooterProps {
  className?: string;
  successNode?: React.ReactNode;
}

export const PageFooter: React.FC<PageFooterProps> = ({
  className,
  successNode,
}) => {
  const [dbOpen, setDbOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2.5",
          className,
        )}
      >
        {/* Left: Vector DB button */}
        <button
          onClick={() => setDbOpen(true)}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card",
            "text-xs font-medium text-foreground",
            "hover:bg-accent hover:border-primary/40 hover:text-primary transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-ring",
          )}
        >
          <Database className="h-3.5 w-3.5" />
          Files available Vector Database
        </button>

        {/* Centre: optional success banner slot */}
        <div className="flex-1 flex justify-center px-4">{successNode}</div>

        {/* Right: Help (?) button */}
        <button
          onClick={() => setFaqOpen(true)}
          className={cn(
            "h-8 w-8 rounded-full border border-border bg-card",
            "flex items-center justify-center",
            "text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-accent transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-ring",
          )}
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* Dialogs */}
      <VectorDbDialog open={dbOpen} onClose={() => setDbOpen(false)} />
      <FaqDialog open={faqOpen} onClose={() => setFaqOpen(false)} />
    </>
  );
};
