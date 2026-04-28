"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function DebugFileSizes() {
  const [files, setFiles] = useState<File[]>([])
  const [totalSize, setTotalSize] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files)
      setFiles(fileArray)

      const size = fileArray.reduce((acc, file) => acc + file.size, 0)
      setTotalSize(size)
    }
  }

  const testUpload = async () => {
    if (files.length === 0) return

    setIsLoading(true)
    setResponse(null)

    try {
      // Create a FormData object to simulate the actual form submission
      const formData = new FormData()

      // Add each file to the FormData
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

      // Add some dummy text fields to simulate the form data
      formData.append("studentName", "Test Student")
      formData.append("guardianName", "Test Guardian")

      // Send the request to our debug endpoint
      const res = await fetch("/api/debug-size", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      setResponse(data)
    } catch (error) {
      setResponse({
        error: true,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Debug File Sizes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select files to test upload size</Label>
          <Input id="file-upload" type="file" multiple onChange={handleFileChange} />
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm">
              <p>
                <strong>Total files:</strong> {files.length}
              </p>
              <p>
                <strong>Total size:</strong> {formatSize(totalSize)}
              </p>
              <p className={totalSize > 4.5 * 1024 * 1024 ? "text-red-500 font-bold" : "text-green-500"}>
                {totalSize > 4.5 * 1024 * 1024
                  ? `⚠️ Exceeds Vercel's 4.5MB limit by ${formatSize(totalSize - 4.5 * 1024 * 1024)}`
                  : "✅ Within Vercel's 4.5MB limit"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">File details:</h3>
              <ul className="text-sm space-y-1">
                {files.map((file, index) => (
                  <li key={index} className="flex justify-between">
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <span>{formatSize(file.size)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={testUpload} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Upload to Debug Endpoint"
              )}
            </Button>

            {response && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-medium mb-2">Response:</h3>
                <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-white rounded border">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
