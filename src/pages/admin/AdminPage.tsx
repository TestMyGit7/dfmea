import React, { useState, useRef } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CascadeDropdowns } from "@/components/layout/CascadeDropdowns";
import { DfmeaTable } from "@/components/layout/DfmeaTable";
import { SuccessBanner } from "@/components/layout/SuccessBanner";
import { PageFooter } from "@/components/layout/PageFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter as DialogFoot,
} from "@/components/ui/dialog";
import {
  useDfmeaData,
  usePrograms,
  useProductCategories,
  useSubsystems,
  useProducts,
  useSaveDfmea,
  useUploadFiles,
} from "@/hooks/useDfmea";
import { generateMockFmeaRows } from "@/lib/mockData";
import type { FmeaRow } from "@/types";
import {
  Loader2,
  RefreshCw,
  Upload,
  Plus,
  FileText,
  X,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "Analyze all failure modes",
  "Focus on safety-critical items",
  "High RPN items only",
];

/* ─────────────────────────────── FileDropZone ─────────────────────────── */
function FileDropZone({
  label,
  files,
  onChange,
}: {
  label: string;
  files: File[];
  onChange: (f: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (fl: FileList | null) => {
    if (!fl) return;
    onChange([...files, ...Array.from(fl)]);
  };

  return (
    <div>
      <Label className="text-xs font-semibold mb-1 block">{label} *</Label>
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-3 cursor-pointer transition-colors text-center text-xs",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:bg-muted/40",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
        <p className="text-muted-foreground">Drag and drop files here</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Limit 200MB per file • PDF, DOCX, TXT, CSV, XLSX
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {files.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground"
        >
          <FileText className="h-3 w-3 shrink-0" />
          <span className="truncate flex-1">{f.name}</span>
          <span className="shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange(files.filter((_, j) => j !== i));
            }}
          >
            <X className="h-3 w-3 hover:text-destructive" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────── Add Programme Confirm Dialog ─────────── */
interface AddProgrammeDialogProps {
  open: boolean;
  programmeName: string;
  onCancel: () => void;
  onProceed: () => void;
}
const AddProgrammeDialog: React.FC<AddProgrammeDialogProps> = ({
  open,
  programmeName,
  onCancel,
  onProceed,
}) => (
  <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
    <DialogContent className="max-w-sm">
      <DialogHeader className="pb-4">
        <DialogTitle className="text-sm font-semibold text-center">
          Are you sure to create programme
        </DialogTitle>
        {programmeName && (
          <p className="text-center text-xs text-muted-foreground mt-1 font-medium">
            "{programmeName}"
          </p>
        )}
      </DialogHeader>
      <DialogFoot className="flex flex-row justify-center gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="px-6 text-xs"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button size="sm" className="px-6 text-xs gap-1.5" onClick={onProceed}>
          <ArrowRight className="h-3 w-3" />
          Proceed
        </Button>
      </DialogFoot>
    </DialogContent>
  </Dialog>
);

/* ─────────────────────────────── AnalysisTab ──────────────────────────── */
interface AnalysisTabProps {
  allData: any;
  isLoading: boolean;
  onSuccess: (msg: React.ReactNode) => void;
}

function AnalysisTab({ allData, isLoading, onSuccess }: AnalysisTabProps) {
  const saveMutation = useSaveDfmea();

  const [program, setProgram] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [subsystem, setSubsystem] = useState("");
  const [product, setProduct] = useState("");
  const [suggestedPrompt, setSuggestedPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [tableRows, setTableRows] = useState<FmeaRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const programs = usePrograms(allData);
  const productCategories = useProductCategories(allData, program);
  const subsystems = useSubsystems(allData, program, productCategory);
  const products = useProducts(allData, program, productCategory, subsystem);

  const allSelected = !!(program && productCategory && subsystem && product);

  const handleProgramChange = (v: string) => {
    setProgram(v);
    setProductCategory("");
    setSubsystem("");
    setProduct("");
    setTableRows([]);
  };
  const handleProductCategoryChange = (v: string) => {
    setProductCategory(v);
    setSubsystem("");
    setProduct("");
    setTableRows([]);
  };
  const handleSubsystemChange = (v: string) => {
    setSubsystem(v);
    setProduct("");
    setTableRows([]);
  };
  const handleProductChange = (v: string) => {
    setProduct(v);
  };

  const handleGenerate = async () => {
    if (!allSelected) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 900));
    setTableRows(generateMockFmeaRows(productCategory, product, subsystem));
    setIsGenerating(false);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 700));
    setTableRows(generateMockFmeaRows(productCategory, product, subsystem));
    setIsGenerating(false);
  };

  const handleSave = async () => {
    await saveMutation.mutateAsync({
      program,
      productCategory,
      subsystem,
      product,
      rows: tableRows,
    });
    onSuccess(
      <SuccessBanner
        message="Generated DFMEA successfully."
        subMessage="Upload and indexing completed successfully."
        onClose={() => onSuccess(null)}
        className="max-w-sm"
      />,
    );
  };

  const handleFeedback = (idx: number, type: "up" | "down") => {
    setTableRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, feedback: type } : r)),
    );
  };

  return (
    <div className="space-y-3">
      <div className="bg-card border border-border rounded-md p-3 space-y-3">
        <p className="text-[11px] text-muted-foreground">
          Select at least one product
        </p>
        <CascadeDropdowns
          programs={programs}
          productCategories={productCategories}
          subsystems={subsystems}
          products={products}
          selectedProgram={program}
          selectedProductCategory={productCategory}
          selectedSubsystem={subsystem}
          selectedProduct={product}
          onProgramChange={handleProgramChange}
          onProductCategoryChange={handleProductCategoryChange}
          onSubsystemChange={handleSubsystemChange}
          onProductChange={handleProductChange}
          isLoading={isLoading}
        />
        <div className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-3">
            <p className="text-[11px] text-muted-foreground mb-1">
              Prompt (optional)
            </p>
            <Select
              value={suggestedPrompt}
              onValueChange={setSuggestedPrompt}
              disabled={!allSelected}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Suggested Prompts" />
              </SelectTrigger>
              <SelectContent>
                {SUGGESTED_PROMPTS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-6">
            <p className="text-[11px] text-muted-foreground mb-1">&nbsp;</p>
            <Textarea
              placeholder="Custom Prompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={!allSelected}
              className="text-xs min-h-[60px] resize-none"
            />
          </div>
          <div className="col-span-3 flex flex-col gap-2 pt-4">
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 gap-1.5"
              onClick={handleRegenerate}
              disabled={!tableRows.length || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Re-generate DFMEA
            </Button>
            <Button
              size="sm"
              className="text-xs h-7"
              onClick={handleGenerate}
              disabled={!allSelected || isGenerating}
            >
              {isGenerating && (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              )}
              Generate DFMEA
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-md p-3 space-y-3">
        <DfmeaTable rows={tableRows} showFeedback onFeedback={handleFeedback} />
        {tableRows.length > 0 && (
          <div className="flex justify-end">
            <Button
              size="sm"
              className="text-xs h-7"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              )}
              Save DFMEA
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────── UploadTab ────────────────────────────── */
interface UploadTabProps {
  onSuccess: (msg: React.ReactNode) => void;
}

function UploadTab({ onSuccess }: UploadTabProps) {
  const uploadMutation = useUploadFiles();

  const [programme, setProgramme] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [subsystem, setSubsystem] = useState("");
  const [product, setProduct] = useState("");
  const [prdFiles, setPrdFiles] = useState<File[]>([]);
  const [kbFiles, setKbFiles] = useState<File[]>([]);
  const [fieldFiles, setFieldFiles] = useState<File[]>([]);

  // "Add new Programme" confirm dialog
  const [newProgramme, setNewProgramme] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addedProgrammes, setAddedProgrammes] = useState<string[]>([]);

  const handleAddClick = () => {
    if (newProgramme.trim()) setConfirmOpen(true);
  };

  const handleAddProceed = () => {
    setAddedProgrammes((prev) => [...prev, newProgramme.trim()]);
    setConfirmOpen(false);
    onSuccess(
      <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        New Programme "{newProgramme.trim()}" added successfully.
      </div>,
    );
    setNewProgramme("");
    setTimeout(() => onSuccess(null), 4000);
  };

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("programme", programme);
    fd.append("productCategory", productCategory);
    fd.append("subsystem", subsystem);
    fd.append("product", product);
    prdFiles.forEach((f) => fd.append("prd", f));
    kbFiles.forEach((f) => fd.append("kb", f));
    fieldFiles.forEach((f) => fd.append("field", f));
    await uploadMutation.mutateAsync(fd);
    onSuccess(
      <SuccessBanner
        message="Uploaded successfully."
        subMessage="Upload and indexing completed successfully."
        onClose={() => onSuccess(null)}
        className="max-w-sm"
      />,
    );
  };

  return (
    <>
      <div className="space-y-3">
        <div className="bg-card border border-border rounded-md p-3 space-y-3">
          {/* Add new programme row */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                placeholder="Add a new Programme"
                className="text-xs h-8 max-w-[220px]"
                value={newProgramme}
                onChange={(e) => setNewProgramme(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddClick()}
              />
              <Button
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={handleAddClick}
                disabled={!newProgramme.trim()}
              >
                <Plus className="h-3 w-3" /> Add
              </Button>
              {addedProgrammes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {addedProgrammes.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] font-medium"
                    >
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Note: If not in exist, then create new Programme
            </p>
          </div>

          {/* Four field inputs */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Program *", val: programme, set: setProgramme },
              {
                label: "Product category *",
                val: productCategory,
                set: setProductCategory,
              },
              { label: "Subsystem *", val: subsystem, set: setSubsystem },
              { label: "Product *", val: product, set: setProduct },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <Label className="text-[11px] mb-1 block">{label}</Label>
                <Input
                  className="text-xs h-8"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* File drop zones */}
          <div className="grid grid-cols-3 gap-4">
            <FileDropZone
              label="Product Requirements (PRD)"
              files={prdFiles}
              onChange={setPrdFiles}
            />
            <FileDropZone
              label="Knowledge Base Documents"
              files={kbFiles}
              onChange={setKbFiles}
            />
            <FileDropZone
              label="Field & Repair Data"
              files={fieldFiles}
              onChange={setFieldFiles}
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              className="text-xs h-8"
              onClick={handleSubmit}
              disabled={
                uploadMutation.isPending ||
                !programme ||
                !productCategory ||
                !subsystem ||
                !product
              }
            >
              {uploadMutation.isPending && (
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
              )}
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation dialog for Add Programme (Image 2) */}
      <AddProgrammeDialog
        open={confirmOpen}
        programmeName={newProgramme}
        onCancel={() => setConfirmOpen(false)}
        onProceed={handleAddProceed}
      />
    </>
  );
}

/* ─────────────────────────────── AdminPage ────────────────────────────── */
export const AdminPage: React.FC = () => {
  const { data: allData, isLoading } = useDfmeaData();
  const [footerSuccess, setFooterSuccess] = useState<React.ReactNode>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      {/* <PageHeader title="Admin page" /> */}

      <main className="flex-1 p-4 ">
        <Tabs defaultValue="analysis" className="space-y-3">
          <TabsList className="h-8">
            <TabsTrigger value="analysis" className="text-xs px-4">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs px-4">
              Upload
            </TabsTrigger>
            <TabsTrigger value="existing" className="text-xs px-4">
              Existing Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <AnalysisTab
              allData={allData}
              isLoading={isLoading}
              onSuccess={setFooterSuccess}
            />
          </TabsContent>

          <TabsContent value="upload">
            <UploadTab onSuccess={setFooterSuccess} />
          </TabsContent>

          <TabsContent value="existing">
            <div className="bg-card border border-border rounded-md p-6 text-center text-sm text-muted-foreground">
              Select filters to browse existing DFMEA data.
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer: VectorDB + Help on every page */}
      <PageFooter successNode={footerSuccess} />
    </div>
  );
};
