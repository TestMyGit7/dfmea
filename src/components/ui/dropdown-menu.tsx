/**
 * ShadCN DropdownMenu – fully custom, zero @radix-ui dependency.
 * Matches ShadCN DropdownMenu API: Root / Trigger / Content / Item /
 * Separator / Label / CheckboxItem / RadioItem / Sub / SubTrigger / SubContent.
 */
import * as React from 'react'
import { Check, ChevronRight, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ─── Context ─────────────────────────────────────────────────────────── */
interface DropdownContextValue {
  open: boolean
  setOpen: (o: boolean | ((prev: boolean) => boolean)) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}
const DropdownContext = React.createContext<DropdownContextValue | null>(null)
function useDropdown() {
  const ctx = React.useContext(DropdownContext)
  if (!ctx) throw new Error('DropdownMenu compound used outside <DropdownMenu>')
  return ctx
}

/* ─── Root ────────────────────────────────────────────────────────────── */
interface DropdownMenuProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (o: boolean) => void
  children: React.ReactNode
}
const DropdownMenu: React.FC<DropdownMenuProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = React.useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const value = typeof next === 'function' ? next(open) : next
      setInternalOpen(value)
      onOpenChange?.(value)
    },
    [open, onOpenChange]
  )

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  )
}

/* ─── Trigger ─────────────────────────────────────────────────────────── */
interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}
const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ onClick, asChild, children, ...props }, ref) => {
    const { setOpen, triggerRef } = useDropdown()
    const combinedRef = (node: HTMLButtonElement | null) => {
      ;(triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen((o) => !o)
      onClick?.(e)
    }

    // asChild: clone child and inject the trigger props
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          ref: combinedRef as never,
          onClick: handleClick as never,
          'aria-haspopup': 'menu',
          ...props,
        }
      )
    }

    return (
      <button
        ref={combinedRef}
        type="button"
        aria-haspopup="menu"
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

/* ─── Portal / outside-click wrapper ─────────────────────────────────── */
const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: 'start' | 'center' | 'end'
    sideOffset?: number
    side?: 'top' | 'bottom' | 'left' | 'right'
  }
>(({ className, align = 'end', sideOffset = 4, children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = useDropdown()
  const panelRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, setOpen, triggerRef])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, setOpen])

  if (!open) return null

  const alignClass =
    align === 'start' ? 'left-0' : align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'

  return (
    <div
      ref={panelRef}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      className={cn('absolute z-50', alignClass)}
    >
      <div
        ref={ref}
        role="menu"
        className={cn(
          'min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})
DropdownMenuContent.displayName = 'DropdownMenuContent'

/* ─── Item ────────────────────────────────────────────────────────────── */
interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  disabled?: boolean
}
const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, onClick, children, disabled, ...props }, ref) => {
    const { setOpen } = useDropdown()
    return (
      <div
        ref={ref}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={(e) => {
          if (disabled) return
          onClick?.(e)
          setOpen(false)
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>)
            setOpen(false)
          }
        }}
        className={cn(
          'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          disabled && 'pointer-events-none opacity-50',
          inset && 'pl-8',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

/* ─── Separator ───────────────────────────────────────────────────────── */
const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  )
)
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'

/* ─── Label ───────────────────────────────────────────────────────────── */
const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', className)}
    {...props}
  />
))
DropdownMenuLabel.displayName = 'DropdownMenuLabel'

/* ─── CheckboxItem ────────────────────────────────────────────────────── */
interface DropdownMenuCheckboxItemProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}
const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ className, children, checked = false, onCheckedChange, disabled, ...props }, ref) => (
    <div
      ref={ref}
      role="menuitemcheckbox"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
        'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
)
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

/* ─── RadioGroup / RadioItem ──────────────────────────────────────────── */
interface RadioGroupContextValue { value: string; onValueChange: (v: string) => void }
const RadioGroupContext = React.createContext<RadioGroupContextValue>({ value: '', onValueChange: () => {} })

interface DropdownMenuRadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string; onValueChange?: (v: string) => void
}
const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = ({
  value = '', onValueChange = () => {}, children, ...props
}) => (
  <RadioGroupContext.Provider value={{ value, onValueChange }}>
    <div role="group" {...props}>{children}</div>
  </RadioGroupContext.Provider>
)

interface DropdownMenuRadioItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string; disabled?: boolean
}
const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext)
    const checked = groupValue === value
    return (
      <div
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && onValueChange(value)}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
          'focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
          disabled && 'pointer-events-none opacity-50',
          className
        )}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && <Circle className="h-2 w-2 fill-current" />}
        </span>
        {children}
      </div>
    )
  }
)
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

/* ─── Sub ─────────────────────────────────────────────────────────────── */
interface SubContextValue { subOpen: boolean; setSubOpen: (o: boolean) => void }
const SubContext = React.createContext<SubContextValue>({ subOpen: false, setSubOpen: () => {} })

const DropdownMenuSub: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subOpen, setSubOpen] = React.useState(false)
  return (
    <SubContext.Provider value={{ subOpen, setSubOpen }}>
      <div className="relative">{children}</div>
    </SubContext.Provider>
  )
}

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => {
  const { setSubOpen } = React.useContext(SubContext)
  return (
    <div
      ref={ref}
      role="menuitem"
      aria-haspopup="menu"
      tabIndex={0}
      onMouseEnter={() => setSubOpen(true)}
      onMouseLeave={() => setSubOpen(false)}
      className={cn(
        'flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'focus:bg-accent hover:bg-accent',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </div>
  )
})
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { subOpen } = React.useContext(SubContext)
    if (!subOpen) return null
    return (
      <div
        ref={ref}
        role="menu"
        className={cn(
          'absolute left-full top-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

/* ─── Group / Portal (structural stubs) ──────────────────────────────── */
const DropdownMenuGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
  <div role="group" {...props}>{children}</div>
)
const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>

/* ─── Shortcut ────────────────────────────────────────────────────────── */
const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
)
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
