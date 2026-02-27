import React, { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { PageHeader } from "@/components/layout/PageHeader";
import { CascadeDropdowns } from "@/components/layout/CascadeDropdowns";
import { DfmeaTable } from "@/components/layout/DfmeaTable";
import { PageFooter } from "@/components/layout/PageFooter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDfmeaData,
  usePrograms,
  useProductCategories,
  useSubsystems,
  useProducts,
} from "@/hooks/useDfmea";
import { generateMockFmeaRows } from "@/lib/mockData";
import type { FmeaRow } from "@/types";
import { Download } from "lucide-react";

const PROMPT_OPTIONS = [
  "All Failure Modes",
  "Critical Failures",
  "High Severity",
];
const GENERATED_BY_OPTIONS = ["AI Model v1", "AI Model v2", "Manual"];

export const ViewerPage: React.FC = () => {
  const { data: allData, isLoading } = useDfmeaData();

  const [program, setProgram] = useState<string[]>([]);
  const [productCategory, setProductCategory] = useState<string[]>([]);
  const [subsystem, setSubsystem] = useState<string[]>([]);
  const [product, setProduct] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generatedBy, setGeneratedBy] = useState("");
  const [tableRows, setTableRows] = useState<FmeaRow[]>([]);

  const programs = usePrograms(allData);
  const productCategories = useProductCategories(allData, program);
  const subsystems = useSubsystems(allData, program, productCategory);
  const products = useProducts(allData, program, productCategory, subsystem);

  const handleProgramChange = (v: string[]) => {
    setProgram(v);
    setProductCategory([]);
    setSubsystem([]);
    setProduct([]);
    setTableRows([]);
  };
  const handleProductCategoryChange = (v: string[]) => {
    setProductCategory(v);
    setSubsystem([]);
    setProduct([]);
    setTableRows([]);
  };
  const handleSubsystemChange = (v: string[]) => {
    setSubsystem(v);
    setProduct([]);
    setTableRows([]);
  };
  const handleProductChange = (v: string[]) => {
    setProduct(v);
    if (v.length > 0) {
      setTableRows(
        generateMockFmeaRows(
          productCategory[0] || "",
          v[0] || "",
          subsystem[0] || "",
        ),
      );
    } else {
      setTableRows([]);
    }
  };

  const allSelected =
    program.length > 0 &&
    productCategory.length > 0 &&
    subsystem.length > 0 &&
    product.length > 0;

  const handleDownload = () => {
    const header =
      "Product Category,Product,Subsystem,Component,Function,Failure Mode,Effect,Severity,Occurrence,Detection\n";
    const rows = tableRows
      .map((r) =>
        [
          r.productCategory,
          r.product,
          r.subsystem,
          r.component,
          r.function,
          r.failureMode,
          r.effect,
          r.severity,
          r.occurrence,
          r.detection,
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dfmea_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <PageHeader title="viewer page" />

      <main className="flex-1 p-4">
        <div className="md:container md:mx-auto space-y-3">
          {/* Filters */}
          <div className="bg-card border border-border rounded-md p-3 space-y-3">
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
            <div className="grid grid-cols-4 gap-3">
              <Select
                value={prompt}
                onValueChange={setPrompt}
                disabled={!allSelected}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Prompts" />
                </SelectTrigger>
                <SelectContent>
                  {PROMPT_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={generatedBy}
                onValueChange={setGeneratedBy}
                disabled={!allSelected}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Generated by" />
                </SelectTrigger>
                <SelectContent>
                  {GENERATED_BY_OPTIONS.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-md p-3 space-y-3">
            <DfmeaTable rows={tableRows} showFeedback={false} />
            {tableRows.length > 0 && (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="text-xs h-7 gap-1.5"
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3" />
                  Download Excel
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer: VectorDB + Help on every page */}
      <PageFooter />
    </div>
  );
};
