import { DebugFileSizes } from "@/components/debug-file-sizes"

export default function DebugPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Debug Request Size</h1>
      <p className="mb-6 text-gray-700">
        This page helps debug the "Request Entity Too Large" error by testing file uploads and checking their sizes
        against Vercel's 4.5MB limit.
      </p>

      <DebugFileSizes />

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <h2 className="text-lg font-semibold mb-2">About FUNCTION_PAYLOAD_TOO_LARGE</h2>
        <p className="mb-2">
          Vercel serverless functions have a 4.5MB limit for request and response payloads. When uploading multiple
          files or large files, you may hit this limit.
        </p>
        <h3 className="font-medium mt-4 mb-1">Solutions:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Compress images before uploading</li>
          <li>Upload files directly to storage (like Supabase Storage) from the client</li>
          <li>Split large uploads into smaller chunks</li>
          <li>Use client-side validation to prevent oversized uploads</li>
        </ul>
      </div>
    </div>
  )
}
