import * as React from "react";
import { X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: Option[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxCount?: number;
  clearButtonLabel?: string;
  selectAllLabel?: string;
  searchPlaceholder?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    {
      options,
      value = [],
      onValueChange,
      placeholder = "Select options...",
      disabled = false,
      maxCount = 3,
      clearButtonLabel = "Clear",
      selectAllLabel = "Select All",
      searchPlaceholder = "Search...",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()),
    );

    const selectedValues = value || [];

    const toggleOption = (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onValueChange?.(newValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        onValueChange?.([]);
      } else {
        onValueChange?.(options.map((opt) => opt.value));
      }
    };

    const clearAll = () => {
      onValueChange?.([]);
    };

    const selectedLabels = selectedValues
      .map((v) => options.find((opt) => opt.value === v)?.label)
      .filter(Boolean);

    const displayedLabels = selectedLabels.slice(0, maxCount);
    const hiddenCount = selectedLabels.length - maxCount;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            disabled={disabled}
            className={cn(
              "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              open && "ring-1 ring-ring",
            )}
          >
            <div className="flex flex-wrap items-center gap-1">
              {displayedLabels.length > 0 ? (
                <>
                  {displayedLabels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  {hiddenCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{hiddenCount} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 opacity-50 transition-transform" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0 ring-0"
            />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="select-all"
                  onSelect={toggleAll}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                      selectedValues.length === options.length
                        ? "bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {selectedValues.length === options.length && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{selectAllLabel}</span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggleOption(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      "cursor-pointer",
                      option.disabled && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded border",
                        selectedValues.includes(option.value)
                          ? "bg-primary text-primary-foreground"
                          : "border-input",
                      )}
                    >
                      {selectedValues.includes(option.value) && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {selectedValues.length > 0 && (
              <div className="border-t p-2">
                <button
                  onClick={clearAll}
                  className="w-full rounded-md px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                >
                  {clearButtonLabel}
                </button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
