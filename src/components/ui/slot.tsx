/**
 * Slot – ShadCN-style implementation of the render-delegation pattern.
 * Replaces @radix-ui/react-slot with zero external dependency.
 *
 * When `asChild` is true on the Button (or any component), it renders
 * the *child* element instead of the default tag, merging all props/refs.
 */
import * as React from 'react'

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(node)
      } else {
        ;(ref as React.MutableRefObject<T | null>).current = node
      }
    })
  }
}

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return <>{children}</>
    }

    const child = children as React.ReactElement<
      React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
    >

    const childRef: React.Ref<HTMLElement> | undefined =
      'ref' in child ? (child as unknown as { ref: React.Ref<HTMLElement> }).ref : undefined

    return React.cloneElement(child, {
      ...slotProps,
      ...child.props,
      ref: mergeRefs(forwardedRef, childRef),
      className:
        slotProps.className && child.props.className
          ? `${slotProps.className} ${child.props.className}`
          : slotProps.className || child.props.className,
      style: { ...slotProps.style, ...child.props.style },
    })
  }
)
Slot.displayName = 'Slot'

export { Slot }
