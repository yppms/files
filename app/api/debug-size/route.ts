import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Clone the request to avoid consuming it
    const clonedRequest = request.clone()

    // Get the content length from headers
    const contentLength = request.headers.get("content-length")
    const contentLengthMB = contentLength ? (Number.parseInt(contentLength) / (1024 * 1024)).toFixed(2) : "unknown"

    // Try to get the actual body size
    let bodySize = "unknown"
    let bodySizeMB = "unknown"

    try {
      const buffer = await clonedRequest.arrayBuffer()
      bodySize = buffer.byteLength.toString()
      bodySizeMB = (buffer.byteLength / (1024 * 1024)).toFixed(2)
    } catch (error) {
      console.error("Error getting body size:", error)
    }

    // Get all headers for debugging
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })

    return NextResponse.json({
      message: "Request size debug information",
      contentLength,
      contentLengthMB: `${contentLengthMB} MB`,
      bodySize,
      bodySizeMB: `${bodySizeMB} MB`,
      vercelLimit: "4.5 MB",
      isOverLimit: contentLength ? Number.parseInt(contentLength) > 4.5 * 1024 * 1024 : "unknown",
      headers,
    })
  } catch (error) {
    console.error("Error in debug-size route:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze request size",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
