import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-white shadow-abs hover:shadow-abs-lg hover:shadow-gold",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-abs hover:shadow-abs-lg",
        outline:
          "border-2 border-gold-200 dark:border-gold-800 bg-white/10 dark:bg-charcoal-800/50 backdrop-blur-sm text-charcoal-800 dark:text-charcoal-200 hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:border-gold-300 dark:hover:border-gold-700",
        secondary:
          "bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-900 dark:text-charcoal-100 hover:bg-charcoal-200 dark:hover:bg-charcoal-600 shadow-abs hover:shadow-abs-lg",
        ghost: "hover:bg-gold-50 dark:hover:bg-gold-900/20 hover:text-gold-600 dark:hover:text-gold-400 text-charcoal-700 dark:text-charcoal-300",
        link: "text-gold-600 dark:text-gold-400 underline-offset-4 hover:underline hover:text-gold-700 dark:hover:text-gold-300",
        premium: "bg-gradient-to-r from-[#d4af37] to-[#f4e68c] text-white shadow-abs-lg hover:shadow-abs-xl hover:shadow-gold-lg",
        glass: "abs-glass text-charcoal-800 dark:text-white hover:bg-white/20 dark:hover:bg-charcoal-800/30",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        xl: "h-15 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
