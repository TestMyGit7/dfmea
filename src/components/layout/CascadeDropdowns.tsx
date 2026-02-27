import React from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

interface CascadeDropdownsProps {
  programs: string[];
  productCategories: string[];
  subsystems: string[];
  products: string[];
  selectedProgram: string[];
  selectedProductCategory: string[];
  selectedSubsystem: string[];
  selectedProduct: string[];
  onProgramChange: (v: string[]) => void;
  onProductCategoryChange: (v: string[]) => void;
  onSubsystemChange: (v: string[]) => void;
  onProductChange: (v: string[]) => void;
  isLoading?: boolean;
}

function MultiSelectField({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
  isLoading,
}: {
  label: string;
  placeholder: string;
  value: string[];
  options: string[];
  onChange: (v: string[]) => void;
  disabled: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <MultiSelect
        value={value}
        onValueChange={onChange}
        options={options.map((opt) => ({ label: opt, value: opt }))}
        placeholder={isLoading ? "Loading..." : placeholder}
        disabled={disabled || isLoading}
        maxCount={2}
        searchPlaceholder={`Search ${label.toLowerCase()}...`}
      />
      <p className="text-[10px] text-destructive/80">
        {!disabled && value.length === 0
          ? `Select at least one ${label.toLowerCase()}`
          : ""}
      </p>
    </div>
  );
}

export const CascadeDropdowns: React.FC<CascadeDropdownsProps> = ({
  programs,
  productCategories,
  subsystems,
  products,
  selectedProgram,
  selectedProductCategory,
  selectedSubsystem,
  selectedProduct,
  onProgramChange,
  onProductCategoryChange,
  onSubsystemChange,
  onProductChange,
  isLoading,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <MultiSelectField
        label="Program"
        placeholder="Program"
        value={selectedProgram}
        options={programs}
        onChange={onProgramChange}
        disabled={false}
        isLoading={isLoading}
      />
      <MultiSelectField
        label="Product Category"
        placeholder="Product Category"
        value={selectedProductCategory}
        options={productCategories}
        onChange={onProductCategoryChange}
        disabled={selectedProgram.length === 0}
        isLoading={isLoading}
      />
      <MultiSelectField
        label="Subsystem(s)"
        placeholder="Subsystem(s)"
        value={selectedSubsystem}
        options={subsystems}
        onChange={onSubsystemChange}
        disabled={selectedProductCategory.length === 0}
        isLoading={isLoading}
      />
      <MultiSelectField
        label="Products"
        placeholder="Products"
        value={selectedProduct}
        options={products}
        onChange={onProductChange}
        disabled={selectedSubsystem.length === 0}
        isLoading={isLoading}
      />
    </div>
  );
};
