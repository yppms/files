import { cn } from "@/lib/utils"
import { Button as ShadcnButton } from "@/components/ui/button"
import { forwardRef } from "react"
import type { ButtonProps } from "@/components/ui/button"

interface CustomButtonProps extends ButtonProps {
  gradient?: boolean
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, gradient, variant, children, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        variant={variant}
        className={cn(
          gradient && "bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700",
          className,
        )}
        {...props}
      >
        {children}
      </ShadcnButton>
    )
  },
)

CustomButton.displayName = "CustomButton"

export { CustomButton }
