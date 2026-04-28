// Environment variable to control validation
// In a real environment, this would come from process.env
// For Next.js, we'll use NEXT_PUBLIC_ prefix so it's accessible on the client
export const isValidationActive = process.env.NEXT_PUBLIC_IS_VALIDATION !== "false"

// Helper function to check if validation should be performed
export function shouldValidate(): boolean {
  return isValidationActive
}
