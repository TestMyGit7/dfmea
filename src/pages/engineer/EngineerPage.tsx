import React, { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { CascadeDropdowns } from "@/components/layout/CascadeDropdowns";
import { DfmeaTable } from "@/components/layout/DfmeaTable";
import { SuccessBanner } from "@/components/layout/SuccessBanner";
import { PageFooter } from "@/components/layout/PageFooter";
import { Button } from "@/components/ui/button";
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
  useDfmeaData,
  usePrograms,
  useProductCategories,
  useSubsystems,
  useProducts,
  useSaveDfmea,
} from "@/hooks/useDfmea";
import { generateMockFmeaRows } from "@/lib/mockData";
import type { FmeaRow } from "@/types";
import { Loader2, RefreshCw } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "Analyze all failure modes",
  "Focus on safety-critical items",
  "High RPN items only",
];

export const EngineerPage: React.FC = () => {
  const { data: allData, isLoading } = useDfmeaData();
  const saveMutation = useSaveDfmea();

  const [program, setProgram] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [subsystem, setSubsystem] = useState("");
  const [product, setProduct] = useState("");
  const [suggestedPrompt, setSuggestedPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [tableRows, setTableRows] = useState<FmeaRow[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
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
    setShowSuccess(false);
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
    setShowSuccess(true);
  };

  const handleFeedback = (idx: number, type: "up" | "down") => {
    setTableRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, feedback: type } : r)),
    );
  };

  const successNode = showSuccess ? (
    <SuccessBanner
      message="Generated DFMEA successfully."
      subMessage="Upload and indexing completed successfully."
      onClose={() => setShowSuccess(false)}
      className="max-w-sm"
    />
  ) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      {/* <PageHeader title="Engineer page" /> */}

      <main className="flex-1 p-4">
        <Tabs defaultValue="analysis" className="space-y-3">
          <TabsList className="h-8">
            <TabsTrigger value="analysis" className="text-xs px-4">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="existing" className="text-xs px-4">
              Existing Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-3 mt-2">
            {/* Filters */}
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
                  <p className="text-[11px] text-muted-foreground mb-1">
                    &nbsp;
                  </p>
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

            {/* Table */}
            <div className="bg-card border border-border rounded-md p-3 space-y-3">
              <DfmeaTable
                rows={tableRows}
                showFeedback
                onFeedback={handleFeedback}
              />
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
          </TabsContent>

          <TabsContent value="existing">
            <div className="bg-card border border-border rounded-md p-6 text-center text-sm text-muted-foreground">
              Select filters above to browse existing DFMEA data.
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer: VectorDB + Help on every page */}
      <PageFooter successNode={successNode} />
    </div>
  );
};
