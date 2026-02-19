import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface CascadeDropdownsProps {
  programs: string[]
  productCategories: string[]
  subsystems: string[]
  products: string[]
  selectedProgram: string
  selectedProductCategory: string
  selectedSubsystem: string
  selectedProduct: string
  onProgramChange: (v: string) => void
  onProductCategoryChange: (v: string) => void
  onSubsystemChange: (v: string) => void
  onProductChange: (v: string) => void
  isLoading?: boolean
}

function DropdownField({
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
  isLoading,
}: {
  label: string
  placeholder: string
  value: string
  options: string[]
  onChange: (v: string) => void
  disabled: boolean
  isLoading?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger
          className={cn(
            'w-full text-xs',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <SelectValue placeholder={isLoading ? 'Loading...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[10px] text-destructive/80">
        {!disabled && !value ? `Select at least one ${label.toLowerCase()}` : ''}
      </p>
    </div>
  )
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
      <DropdownField
        label="Program"
        placeholder="Program"
        value={selectedProgram}
        options={programs}
        onChange={onProgramChange}
        disabled={false}
        isLoading={isLoading}
      />
      <DropdownField
        label="Product Category"
        placeholder="Product Category"
        value={selectedProductCategory}
        options={productCategories}
        onChange={onProductCategoryChange}
        disabled={!selectedProgram}
        isLoading={isLoading}
      />
      <DropdownField
        label="Subsystem(s)"
        placeholder="Subsystem(s)"
        value={selectedSubsystem}
        options={subsystems}
        onChange={onSubsystemChange}
        disabled={!selectedProductCategory}
        isLoading={isLoading}
      />
      <DropdownField
        label="Products"
        placeholder="Products"
        value={selectedProduct}
        options={products}
        onChange={onProductChange}
        disabled={!selectedSubsystem}
        isLoading={isLoading}
      />
    </div>
  )
}
