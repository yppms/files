"use client"

import { isValidationActive } from "@/lib/validation-config"
import { AlertCircle } from "lucide-react"

export function ValidationStatus() {
  // Only render something if validation is inactive
  if (isValidationActive) {
    return null
  }

  // Show warning only when validation is inactive
  return (
    <div className="flex items-center gap-2 text-xs p-2 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
      <AlertCircle className="h-4 w-4" />
      <span>Mode testing: validasi dinonaktifkan</span>
    </div>
  )
}
