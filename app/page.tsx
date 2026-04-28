import { Suspense } from "react"
import { AdmissionForm } from "@/components/admission-form"

export default function Page() {
  return (
    <main>
      {/* Client component that uses router hooks must be inside Suspense */}
      <Suspense fallback={null}>
        <AdmissionForm />
      </Suspense>
    </main>
  )
}
