/**
 * ShadCN Dialog – fully custom, zero @radix-ui dependency.
 * Renders a modal overlay with backdrop, close button, header, body, footer.
 */
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Context ─────────────────────────────────────────────────────────── */
interface DialogContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
}
const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  setOpen: () => {},
});

/* ─── Root ────────────────────────────────────────────────────────────── */
interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (o: boolean) => void;
  children: React.ReactNode;
}
const Dialog: React.FC<DialogProps> = ({
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  children,
}) => {
  const [internal, setInternal] = React.useState(defaultOpen);
  const open = controlled !== undefined ? controlled : internal;
  const setOpen = (o: boolean) => {
    setInternal(o);
    onOpenChange?.(o);
  };

  // Lock body scroll when open
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

/* ─── Trigger ─────────────────────────────────────────────────────────── */
interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ onClick, asChild, children, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(true);
      onClick?.(e);
    };
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          onClick: handleClick as never,
        },
      );
    }
    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  },
);
DialogTrigger.displayName = "DialogTrigger";

/* ─── Close ───────────────────────────────────────────────────────────── */
interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}
const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ onClick, asChild, children, ...props }, ref) => {
    const { setOpen } = React.useContext(DialogContext);
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(false);
      onClick?.(e);
    };
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          onClick: handleClick as never,
        },
      );
    }
    return (
      <button ref={ref} type="button" onClick={handleClick} {...props}>
        {children}
      </button>
    );
  },
);
DialogClose.displayName = "DialogClose";

/* ─── Portal / Overlay / Content ─────────────────────────────────────── */
const DialogPortal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { open } = React.useContext(DialogContext);
  if (!open) return null;
  return <>{children}</>;
};

const DialogOverlay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <div
      ref={ref}
      onClick={() => setOpen(false)}
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
        "animate-in fade-in-0",
        className,
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={ref}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "relative w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4",
            className,
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = "DialogContent";

/* ─── Header / Footer / Title / Description ──────────────────────────── */
const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div className={cn("flex flex-col gap-1.5 p-6 pb-0", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn("flex justify-center gap-2 p-6 pt-0", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-base font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
