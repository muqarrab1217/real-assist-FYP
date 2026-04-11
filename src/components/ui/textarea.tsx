import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border-2 border-charcoal-200 dark:border-charcoal-700 bg-white/80 dark:bg-charcoal-800/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-charcoal-900 dark:text-white ring-offset-background placeholder:text-charcoal-500 dark:placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:border-gold-300 dark:focus-visible:border-gold-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-gold-200 dark:hover:border-gold-800 resize-y",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
