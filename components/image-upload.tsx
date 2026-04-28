"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  id: string
  label: string
  value: File | null
  onChange: (file: File | null) => void
  required?: boolean
  helpText?: string
  error?: string
}

export function ImageUpload({ id, label, value, onChange, required = false, helpText, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  // Create object URL when file changes
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value)
      setPreview(objectUrl)

      // Clean up the URL when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl)
    }
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setFileError(null) // Clear previous errors

    if (file) {
      console.log(`Selected file: ${file.name}, size: ${file.size / 1024 / 1024}MB, type: ${file.type}`)

      if (file.size > 5 * 1024 * 1024) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        const errorMsg = `Ukuran file terlalu besar (${sizeMB}MB, maksimal 5MB)`
        console.error(errorMsg)
        setFileError(errorMsg)
        return
      }

      if (!file.type.startsWith("image/")) {
        const errorMsg = `File harus berupa gambar (JPG, JPEG, atau PNG), bukan ${file.type}`
        console.error(errorMsg)
        setFileError(errorMsg)
        return
      }

      // Use the original file directly without compression
      onChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setFileError(null) // Clear previous errors

    const file = e.dataTransfer.files?.[0]
    if (file) {
      console.log(`Dropped file: ${file.name}, size: ${file.size / 1024 / 1024}MB, type: ${file.type}`)

      if (file.size > 5 * 1024 * 1024) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        setFileError(`Ukuran file terlalu besar (${sizeMB}MB, maksimal 5MB)`)
        return
      }

      if (!file.type.startsWith("image/")) {
        setFileError(`File harus berupa gambar (JPG, JPEG, atau PNG), bukan ${file.type}`)
        return
      }

      // Use the original file directly without compression
      onChange(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className="space-y-2" data-error={error ? true : undefined}>
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}

      {!preview ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-all duration-200",
            isDragging ? "border-primary bg-primary-50" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50",
            error && "border-red-500",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="p-3 rounded-full bg-primary-50 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-sm">Klik atau seret file ke sini</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, JPEG, atau PNG (Maks. 5MB)</p>
            </div>
            <Input id={id} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label
              htmlFor={id}
              className={cn(
                "bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
              )}
            >
              Pilih File
            </label>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-[250px]">
          <div className="overflow-hidden rounded-lg border-2 border-primary/20 shadow-sm">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Preview"
              width={250}
              height={250}
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition-transform hover:scale-110 border-2 border-white"
          >
            <X className="h-4 w-4 font-bold" />
            <span className="sr-only">Hapus gambar</span>
          </button>
          {/* Removed the hover overlay with "Ganti Gambar" button */}
        </div>
      )}
      {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
