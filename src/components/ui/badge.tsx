import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-1 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 text-primary-foreground hover:bg-primary/80 shadow-sm hover:shadow-md transition-all duration-200",
        secondary:
          "border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary/70 shadow-sm hover:shadow-md transition-all duration-200",
        destructive:
          "border-transparent bg-destructive/90 text-destructive-foreground hover:bg-destructive/80 shadow-sm hover:shadow-md transition-all duration-200",
        outline: 
          "border-border/50 bg-background/80 text-foreground/90 hover:bg-accent/50 shadow-sm hover:shadow-md transition-all duration-200",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15 hover:shadow-sm transition-all duration-200",
        warning:
          "border-transparent bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15 hover:shadow-sm transition-all duration-200",
        info:
          "border-transparent bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/15 hover:shadow-sm transition-all duration-200",
        muted:
          "border-transparent bg-muted/80 text-muted-foreground hover:bg-muted/60 shadow-inner hover:shadow-sm transition-all duration-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
