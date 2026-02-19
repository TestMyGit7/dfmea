/**
 * ShadCN Select – fully custom, zero @radix-ui dependency.
 * Fixed: outside-click uses a single rootRef that wraps both trigger + panel,
 * so clicking items is never treated as an "outside" click.
 */
import * as React from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Context ─────────────────────────────────────────────────────────── */
interface SelectCtx {
  value: string
  onValueChange: (v: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  disabled: boolean
  listboxId: string
  rootRef: React.RefObject<HTMLDivElement>
}
const Ctx = React.createContext<SelectCtx | null>(null)
const useSelectCtx = () => {
  const c = React.useContext(Ctx)
  if (!c) throw new Error('Select compound used outside <Select>')
  return c
}

/* ─── Root ────────────────────────────────────────────────────────────── */
export interface SelectProps {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
}

const Select: React.FC<SelectProps> = ({
  value: controlled,
  defaultValue = '',
  onValueChange,
  disabled = false,
  children,
}) => {
  const [internal, setInternal] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const id = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)

  // sync controlled → internal when controlled changes externally (e.g. reset to '')
  React.useEffect(() => {
    if (controlled !== undefined) setInternal(controlled)
  }, [controlled])

  const value = controlled !== undefined ? controlled : internal

  const handleChange = React.useCallback(
    (v: string) => {
      setInternal(v)
      onValueChange?.(v)
      setOpen(false)
    },
    [onValueChange]
  )

  // Close on outside click — anchored to rootRef which wraps BOTH trigger + panel
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    // Use capture so we get the event before React synthetic handlers
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <Ctx.Provider
      value={{
        value,
        onValueChange: handleChange,
        open,
        setOpen,
        disabled,
        listboxId: `listbox-${id}`,
        rootRef,
      }}
    >
      {/* rootRef wraps everything — trigger + dropdown panel */}
      <div ref={rootRef} className="relative w-full">
        {children}
      </div>
    </Ctx.Provider>
  )
}

/* ─── SelectValue ─────────────────────────────────────────────────────── */
const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { value } = useSelectCtx()
  return (
    <span className={cn('truncate', !value && 'text-muted-foreground')}>
      {value || placeholder}
    </span>
  )
}

/* ─── SelectTrigger ───────────────────────────────────────────────────── */
const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen, disabled, listboxId } = useSelectCtx()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!disabled) setOpen((o) => !o)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <button
      ref={ref}
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-controls={listboxId}
      aria-haspopup="listbox"
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md',
        'border border-input bg-background px-3 py-2 text-xs shadow-sm',
        'focus:outline-none focus:ring-1 focus:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'ml-2 h-3 w-3 shrink-0 opacity-50 transition-transform duration-150',
          open && 'rotate-180'
        )}
      />
    </button>
  )
})
SelectTrigger.displayName = 'SelectTrigger'

/* ─── SelectContent ───────────────────────────────────────────────────── */
const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { position?: string }
>(({ className, children, ...props }, ref) => {
  const { open, listboxId } = useSelectCtx()

  if (!open) return null

  return (
    <div
      ref={ref}
      id={listboxId}
      role="listbox"
      // Stop any clicks inside the panel from bubbling to the document
      onMouseDown={(e) => e.stopPropagation()}
      className={cn(
        'absolute z-[9999] top-full left-0 mt-1 w-full min-w-[8rem]',
        'max-h-60 overflow-y-auto rounded-md border',
        'bg-popover text-popover-foreground shadow-lg',
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
})
SelectContent.displayName = 'SelectContent'

/* ─── SelectItem ──────────────────────────────────────────────────────── */
const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ className, children, value: itemValue, disabled = false, ...props }, ref) => {
  const { value, onValueChange } = useSelectCtx()
  const selected = value === itemValue

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) onValueChange(itemValue)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent the document mousedown listener from closing before click fires
    e.preventDefault()
    e.stopPropagation()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      onValueChange(itemValue)
    }
  }

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center',
        'rounded-sm py-1.5 pl-2 pr-8 text-xs outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        selected && 'bg-accent/60 font-medium',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {selected && <Check className="h-3.5 w-3.5" />}
      </span>
      {children}
    </div>
  )
})
SelectItem.displayName = 'SelectItem'

/* ─── Structural helpers ──────────────────────────────────────────────── */
const SelectGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = (p) => (
  <div role="group" {...p} />
)

const SelectLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => (
  <div className={cn('px-2 py-1.5 text-xs font-semibold text-muted-foreground', className)} {...p} />
)

const SelectSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => (
  <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...p} />
)

const SelectScrollUpButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = () => null
const SelectScrollDownButton: React.FC<React.HTMLAttributes<HTMLDivElement>> = () => null

export {
  Select, SelectGroup, SelectValue, SelectTrigger,
  SelectContent, SelectLabel, SelectItem, SelectSeparator,
  SelectScrollUpButton, SelectScrollDownButton,
}
