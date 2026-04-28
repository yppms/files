import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { forwardRef } from "react"

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: boolean
  variant?: "default" | "document"
}

const CustomCard = forwardRef<HTMLDivElement, CustomCardProps>(
  ({ className, gradient, variant = "default", ...props }, ref) => {
    return <Card ref={ref} className={cn("border-primary-100 shadow-md overflow-hidden", className)} {...props} />
  },
)

CustomCard.displayName = "CustomCard"

interface CustomCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "document"
}

const CustomCardHeader = forwardRef<HTMLDivElement, CustomCardHeaderProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <CardHeader
        ref={ref}
        className={cn(
          "p-4 sm:p-6 pt-4 sm:pt-6 pb-3",
          variant === "default"
            ? "bg-gradient-to-r from-primary-50 to-transparent border-b border-primary-100"
            : "bg-gradient-to-r from-primary-400/10 to-primary-300/5 border-b border-primary-100",
          className,
        )}
        {...props}
      />
    )
  },
)

CustomCardHeader.displayName = "CustomCardHeader"

export { CustomCard, CustomCardHeader, CardContent, CardDescription, CardFooter, CardTitle }
