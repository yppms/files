import { supabase } from "./supabase"

export async function uploadFile(file: File, path: string): Promise<string | null> {
  try {
    console.log(`Starting upload for file: ${file.name}, size: ${file.size}, type: ${file.type}`)

    // Check file size and type
    if (file.size > 5 * 1024 * 1024) {
      console.error("File too large:", file.size)
      throw new Error("File size exceeds 5MB limit")
    }

    if (!file.type.startsWith("image/")) {
      console.error("Invalid file type:", file.type)
      throw new Error("Only image files are allowed")
    }

    // Compress image if it's large (especially helpful for mobile)
    let fileToUpload = file
    if (file.size > 1 * 1024 * 1024) {
      // If larger than 1MB
      try {
        console.log("File is large, attempting to compress...")
        fileToUpload = await compressImage(file)
        console.log(`Compressed file size: ${fileToUpload.size}`)
      } catch (compressionError) {
        console.warn("Image compression failed, using original file:", compressionError)
        // Continue with original file if compression fails
      }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    console.log(`Uploading to path: ${filePath}`)

    // Try upload with retry logic
    const maxRetries = 2
    let retryCount = 0
    let error = null

    while (retryCount <= maxRetries) {
      try {
        const { error: uploadError } = await supabase.storage.from("applications").upload(filePath, fileToUpload)

        if (uploadError) {
          console.error(`Upload attempt ${retryCount + 1} failed:`, uploadError)
          error = uploadError
          retryCount++

          if (retryCount <= maxRetries) {
            console.log(`Retrying upload in ${retryCount * 1000}ms...`)
            await new Promise((resolve) => setTimeout(resolve, retryCount * 1000))
          }
        } else {
          // Upload succeeded
          error = null
          break
        }
      } catch (e) {
        console.error(`Upload attempt ${retryCount + 1} threw exception:`, e)
        error = e
        retryCount++

        if (retryCount <= maxRetries) {
          console.log(`Retrying upload in ${retryCount * 1000}ms...`)
          await new Promise((resolve) => setTimeout(resolve, retryCount * 1000))
        }
      }
    }

    if (error) {
      console.error("All upload attempts failed:", error)
      throw error
    }

    console.log("Upload successful, getting public URL")
    const { data } = supabase.storage.from("applications").getPublicUrl(filePath)

    if (!data || !data.publicUrl) {
      throw new Error("Failed to get public URL")
    }

    console.log("Upload completed successfully")
    return data.publicUrl
  } catch (error) {
    console.error("Error in uploadFile:", error)
    throw error
  }
}

// Helper function to compress images
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")

        // Calculate new dimensions (max 1200px width/height)
        let width = img.width
        let height = img.height
        const maxDimension = 1200

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob with reduced quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"))
              return
            }

            // Create a new file from the blob
            const compressedFile = new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() })

            resolve(compressedFile)
          },
          "image/jpeg",
          0.7, // Quality (0.7 = 70%)
        )
      }
      img.onerror = () => {
        reject(new Error("Image loading failed"))
      }
    }
    reader.onerror = () => {
      reject(new Error("File reading failed"))
    }
  })
}
