import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuccessBannerProps {
  message: string
  subMessage?: string
  onClose?: () => void
  className?: string
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  message,
  subMessage,
  onClose,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800 px-3 py-2 text-xs',
        className
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium text-green-800 dark:text-green-300">{message}</p>
        {subMessage && (
          <p className="text-green-700 dark:text-green-400 mt-0.5">{subMessage}</p>
        )}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-green-600 hover:text-green-800">
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
