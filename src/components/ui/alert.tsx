import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 pl-12 [&>svg~*]:pl-0 [&>svg+div]:translate-y-0 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:text-foreground/90",
  {
    variants: {
      variant: {
        default: "bg-background/90 text-foreground border-border/50 backdrop-blur-sm",
        destructive:
          "border-destructive/30 bg-destructive/5 text-destructive [&>svg]:text-destructive/90",
        success:
          "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 [&>svg]:text-emerald-500/90",
        warning:
          "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 [&>svg]:text-amber-500/90",
        info:
          "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 [&>svg]:text-blue-500/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1.5 text-base font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground/90 [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
