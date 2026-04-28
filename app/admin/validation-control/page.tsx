"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { isValidationActive } from "@/lib/validation-config"
import { useRouter } from "next/navigation"

export default function ValidationControl() {
  const [isValidation, setIsValidation] = useState(isValidationActive)
  const router = useRouter()

  // Function to update the validation state
  const toggleValidation = () => {
    const newValue = !isValidation
    setIsValidation(newValue)

    // In a real app, this would update an environment variable
    // For demo purposes, we'll use localStorage
    localStorage.setItem("NEXT_PUBLIC_IS_VALIDATION", newValue.toString())

    // Force a page reload to apply the new setting
    window.location.reload()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Validation Control Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="validation-toggle" className="text-base">
              Form Validation
            </Label>
            <input
              type="checkbox"
              id="validation-toggle"
              checked={isValidation}
              onChange={toggleValidation}
              className="w-5 h-5 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-md bg-primary-50 border border-primary-100">
            <p className="text-sm">
              Current status: <span className="font-bold">{isValidation ? "Active" : "Inactive"}</span>
            </p>
            <p className="text-xs mt-2 text-muted-foreground">
              {isValidation
                ? "All form validations are currently active. Users must fill in all required fields."
                : "Validation is disabled. The form can be submitted with empty fields for testing purposes."}
            </p>
          </div>

          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            Go to Form
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
