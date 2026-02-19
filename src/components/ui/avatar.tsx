/**
 * ShadCN Avatar – fully custom, zero @radix-ui dependency.
 * Matches ShadCN Avatar API: Avatar / AvatarImage / AvatarFallback.
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

/* ─── Root ────────────────────────────────────────────────────────────── */
interface AvatarContextValue {
  imageLoaded: boolean
  imageError: boolean
  setImageLoaded: (v: boolean) => void
  setImageError: (v: boolean) => void
}
const AvatarContext = React.createContext<AvatarContextValue>({
  imageLoaded: false,
  imageError: false,
  setImageLoaded: () => {},
  setImageError: () => {},
})

const Avatar = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, children, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)
    return (
      <AvatarContext.Provider value={{ imageLoaded, imageError, setImageLoaded, setImageError }}>
        <span
          ref={ref}
          className={cn(
            'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
            className
          )}
          {...props}
        >
          {children}
        </span>
      </AvatarContext.Provider>
    )
  }
)
Avatar.displayName = 'Avatar'

/* ─── Image ───────────────────────────────────────────────────────────── */
const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, src, alt = '', onLoad, onError, ...props }, ref) => {
    const { setImageLoaded, setImageError } = React.useContext(AvatarContext)

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn('aspect-square h-full w-full object-cover', className)}
        onLoad={(e) => { setImageLoaded(true); onLoad?.(e) }}
        onError={(e) => { setImageError(true); onError?.(e) }}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

/* ─── Fallback ────────────────────────────────────────────────────────── */
interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  delayMs?: number
}
const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, delayMs = 0, children, ...props }, ref) => {
    const { imageLoaded, imageError } = React.useContext(AvatarContext)
    const [visible, setVisible] = React.useState(delayMs === 0)

    React.useEffect(() => {
      if (delayMs === 0) { setVisible(true); return }
      const t = setTimeout(() => setVisible(true), delayMs)
      return () => clearTimeout(t)
    }, [delayMs])

    // Show fallback when image has not loaded OR errored
    if (!visible || (imageLoaded && !imageError)) return null

    return (
      <span
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-muted',
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)
AvatarFallback.displayName = 'AvatarFallback'

export { Avatar, AvatarImage, AvatarFallback }
