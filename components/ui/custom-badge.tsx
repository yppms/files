import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "required" | "optional" | "submitted" | "approved" | "rejected" | "default"
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant = "default", ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium",
        variant === "required" && "bg-primary-50 text-primary-700 font-bold",
        variant === "optional" && "bg-slate-100 text-slate-700",
        variant === "submitted" && "bg-blue-100 text-blue-800",
        variant === "approved" && "bg-green-100 text-green-800",
        variant === "rejected" && "bg-red-100 text-red-800",
        variant === "default" && "bg-gray-100 text-gray-800",
        className,
      )}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

export { Badge }
