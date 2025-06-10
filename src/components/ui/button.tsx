import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground shadow-sm hover:bg-primary/80 active:bg-primary/70 hover:shadow-md active:shadow-sm transition-all duration-200",
        destructive:
          "bg-destructive/90 text-destructive-foreground shadow-sm hover:bg-destructive/80 active:bg-destructive/70 hover:shadow-md active:shadow-sm transition-all duration-200",
        outline:
          "border border-input/60 bg-background/80 hover:bg-accent/50 hover:text-accent-foreground hover:border-input/80 backdrop-blur-sm hover:shadow-sm transition-all duration-200",
        secondary:
          "bg-secondary/90 text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70 hover:shadow-md active:shadow-sm transition-all duration-200",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground active:bg-accent/30 hover:shadow-sm transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline transition-colors duration-200",
      },
      size: {
        default: "h-10 px-4 py-2.5 text-sm font-medium",
        sm: "h-8 rounded-lg px-3 text-xs font-medium",
        lg: "h-12 rounded-lg px-6 text-base font-medium",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
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
