/**
 * ShadCN Tabs – fully custom, zero @radix-ui dependency.
 * Matches the ShadCN Tabs API: Root / List / Trigger / Content.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── Context ─────────────────────────────────────────────────────────── */
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (v: string) => void;
  orientation: "horizontal" | "vertical";
}
const TabsContext = React.createContext<TabsContextValue | null>(null);
function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs compound used outside <Tabs>");
  return ctx;
}

/* ─── Root ────────────────────────────────────────────────────────────── */
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (v: string) => void;
  orientation?: "horizontal" | "vertical";
}
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue = "",
      value: controlledValue,
      onValueChange,
      orientation = "horizontal",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const active =
      controlledValue !== undefined ? controlledValue : internalValue;
    const setActiveTab = (v: string) => {
      setInternalValue(v);
      onValueChange?.(v);
    };
    return (
      <TabsContext.Provider
        value={{ activeTab: active, setActiveTab, orientation }}
      >
        <div
          ref={ref}
          data-orientation={orientation}
          className={cn("flex flex-col", className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = "Tabs";

/* ─── List ────────────────────────────────────────────────────────────── */
const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

/* ─── Trigger ─────────────────────────────────────────────────────────── */
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabsContext();
    const isActive = activeTab === value;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        onClick={() => setActiveTab(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setActiveTab(value);
          }
        }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium",
          "ring-offset-background transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-background text-foreground shadow"
            : "hover:bg-background/50 hover:text-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

/* ─── Content ─────────────────────────────────────────────────────────── */
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab } = useTabsContext();
    if (activeTab !== value) return null;
    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state="active"
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
