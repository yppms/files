"use client"

import { supabase } from "./supabase"

export async function uploadFileToSupabaseClient(
  file: File,
  path: string,
  studentName: string,
): Promise<string | null> {
  try {
    if (!file) return null

    console.log(`Client uploading file: ${file.name}, size: ${file.size / 1024 / 1024}MB, type: ${file.type}`)

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large (max 5MB)`)
    }

    // Create a sanitized folder name from the student's name
    const sanitizedName = studentName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_") // Replace non-alphanumeric chars with underscore
      .replace(/_+/g, "_") // Replace multiple underscores with a single one
      .trim()

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${sanitizedName}/${path}/${fileName}`

    console.log(`Preparing to upload to path: ${filePath}`)

    // Upload the file directly to Supabase Storage from the client
    const { data, error } = await supabase.storage.from("applications").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error(`Error uploading file ${file.name}:`, error)
      throw error
    }

    console.log(`File uploaded successfully, getting public URL...`)

    // Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage.from("applications").getPublicUrl(filePath)

    if (!urlData || !urlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file")
    }

    console.log(`Public URL obtained: ${urlData.publicUrl}`)
    return urlData.publicUrl
  } catch (error) {
    console.error(`Error in uploadFileToSupabaseClient for file ${file.name}:`, error)
    throw error
  }
}
