"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Update the FormData type to use URLs instead of Files
type EmergencyContact = {
  phone: string
  relationship: string
}

type FileMetadata = {
  key: string
  url: string | null
  name: string
  size: number
  type: string
}

type FormData = {
  // Student data
  class: string
  studentName: string
  nickname: string
  birthCertificate: string | null // Now a URL instead of File
  photo: string | null // Now a URL instead of File
  hasKIA: string | null
  kiaCard: string | null // Now a URL instead of File
  bloodType: string
  height: string
  weight: string
  medicalHistory: string
  language: string
  medicalHistoryDetails: string
  hobby: string

  // Guardian data
  relation: string
  guardianName: string
  guardianNickname: string
  whatsapp: string
  emergencyContacts: EmergencyContact[]
  idCard: string | null // Now a URL instead of File
  familyCard: string | null // Now a URL instead of File
  addressDifferent: string | null
  currentAddress: string

  // Survey data
  source: string
  sourceDetail: string
  otherSource: string
  extracurricular: string[]
  expectations: string
  occupation: string
  instagram: string
  email: string

  // File metadata
  fileMetadata: FileMetadata[]
}

// Helper function to properly capitalize names
function capitalizeName(name: string): string {
  if (!name) return name

  // Split the name by spaces and capitalize each part
  return name
    .split(" ")
    .map((part) => {
      // Skip empty parts
      if (!part) return part
      // Capitalize the first letter and keep the rest lowercase
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    })
    .join(" ")
}

// Improved server action with better error handling and smaller chunks
export async function submitAdmissionForm(formData: FormData) {
  console.log("Starting form submission...")

  try {
    console.log("Starting form submission with pre-uploaded files...")
    console.log("File URLs:", {
      birthCertificate: formData.birthCertificate ? "URL provided" : "none",
      photo: formData.photo ? "URL provided" : "none",
      kiaCard: formData.kiaCard ? "URL provided" : "none",
      idCard: formData.idCard ? "URL provided" : "none",
      familyCard: formData.familyCard ? "URL provided" : "none",
    })

    // Debug fileMetadata
    console.log("fileMetadata array:", JSON.stringify(formData.fileMetadata, null, 2))

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Step 1: Insert application data first
    console.log("Step 1: Inserting application data...")
    let applicationId: string

    // Capitalize name fields
    const capitalizedStudentName = capitalizeName(formData.studentName)
    const capitalizedNickname = capitalizeName(formData.nickname)
    const capitalizedGuardianName = capitalizeName(formData.guardianName)
    const capitalizedGuardianNickname = capitalizeName(formData.guardianNickname)

    console.log("Capitalized names:", {
      studentName: `${formData.studentName} -> ${capitalizedStudentName}`,
      nickname: `${formData.nickname} -> ${capitalizedNickname}`,
      guardianName: `${formData.guardianName} -> ${capitalizedGuardianName}`,
      guardianNickname: `${formData.guardianNickname} -> ${capitalizedGuardianNickname}`,
    })

    try {
      const { data: application, error: applicationError } = await supabase
        .from("applications")
        .insert({
          class: formData.class,
          student_name: capitalizedStudentName,
          student_nickname: capitalizedNickname,
          blood_type: formData.bloodType,
          height: formData.height,
          weight: formData.weight,
          has_kia: formData.hasKIA === "yes",
          medical_history: formData.medicalHistory === "yes",
          medical_history_details: formData.medicalHistoryDetails,
          language: formData.language,
          hobby: formData.hobby,

          relation: formData.relation,
          guardian_name: capitalizedGuardianName,
          guardian_nickname: capitalizedGuardianNickname,
          whatsapp: formData.whatsapp,
          address_different: formData.addressDifferent === "different",
          current_address: formData.currentAddress,

          source: formData.source,
          source_detail: formData.sourceDetail,
          other_source: formData.otherSource,
          expectations: formData.expectations,
          occupation: formData.occupation,
          instagram: formData.instagram,
          email: formData.email,
        })
        .select("id")
        .single()

      if (applicationError) {
        throw new Error(`Database error: ${applicationError.message}`)
      }

      if (!application || !application.id) {
        throw new Error("Failed to get application ID after insertion")
      }

      applicationId = application.id
      console.log("Application inserted successfully:", applicationId)
    } catch (error) {
      console.error("Error in Step 1 - Insert application:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error inserting application",
        step: "insert_application",
      }
    }

    // Step 2: Insert emergency contacts
    console.log("Step 2: Inserting emergency contacts...")
    try {
      if (formData.emergencyContacts.length > 0) {
        const emergencyContactsData = formData.emergencyContacts.map((contact) => ({
          application_id: applicationId,
          phone: contact.phone,
          relationship: contact.relationship,
        }))

        const { error: emergencyContactsError } = await supabase
          .from("emergency_contacts")
          .insert(emergencyContactsData)

        if (emergencyContactsError) {
          throw new Error(`Error inserting emergency contacts: ${emergencyContactsError.message}`)
        }
      }
    } catch (error) {
      console.error("Error in Step 2 - Insert emergency contacts:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error inserting emergency contacts",
        step: "insert_emergency_contacts",
      }
    }

    // Step 3: Insert extracurricular preferences
    console.log("Step 3: Inserting extracurricular preferences...")
    try {
      if (formData.extracurricular.length > 0) {
        const extracurricularData = formData.extracurricular.map((activity, index) => ({
          application_id: applicationId,
          activity,
          priority: index + 1,
        }))

        const { error: extracurricularError } = await supabase
          .from("extracurricular_preferences")
          .insert(extracurricularData)

        if (extracurricularError) {
          throw new Error(`Error inserting extracurricular preferences: ${extracurricularError.message}`)
        }
      }
    } catch (error) {
      console.error("Error in Step 3 - Insert extracurricular preferences:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error inserting extracurricular preferences",
        step: "insert_extracurricular",
      }
    }

    // Step 4: Insert document records
    console.log("Step 4: Inserting document records...")
    try {
      const documents = []

      // Check if fileMetadata exists and has items
      if (!formData.fileMetadata || formData.fileMetadata.length === 0) {
        console.log("fileMetadata is empty or undefined - no documents to insert")
      } else {
        console.log(`Processing ${formData.fileMetadata.length} file metadata entries`)

        // Map Indonesian keys to document types
        const keyToDocumentType = {
          // Indonesian keys
          "Akta Kelahiran": "birth_certificate",
          "Pas Foto": "photo",
          "Kartu Identitas Anak": "kia_card",
          KTP: "id_card",
          "Kartu Keluarga": "family_card",
          // English keys (for backward compatibility)
          birthCertificate: "birth_certificate",
          photo: "photo",
          kiaCard: "kia_card",
          idCard: "id_card",
          familyCard: "family_card",
        }

        // Use the fileMetadata to create document records
        for (const metadata of formData.fileMetadata) {
          console.log(`Processing metadata for key: ${metadata.key}, url: ${metadata.url ? "exists" : "missing"}`)

          if (!metadata.url) {
            console.log(`Skipping ${metadata.key} because URL is missing`)
            continue
          }

          // Get document type from the mapping
          const documentType = keyToDocumentType[metadata.key]

          if (documentType) {
            console.log(`Adding document: ${metadata.key} -> ${documentType}`)
            documents.push({
              application_id: applicationId,
              document_type: documentType,
              file_path: metadata.url,
              file_name: metadata.name || `${metadata.key.toLowerCase().replace(/\s+/g, "_")}.jpg`,
              file_size: metadata.size || 0,
              mime_type: metadata.type || "image/jpeg",
            })
          } else {
            console.log(`Unknown document type for key: ${metadata.key}`)
          }
        }
      }

      if (documents.length > 0) {
        console.log(`Inserting ${documents.length} document records:`, JSON.stringify(documents, null, 2))
        const { error: documentsError, data: documentData } = await supabase.from("documents").insert(documents)

        if (documentsError) {
          console.error("Error inserting document records:", documentsError)
          throw new Error(`Error inserting document records: ${documentsError.message}`)
        }

        console.log("Document records inserted successfully:", documentData)
      } else {
        console.log("No document records to insert - this is normal when need_document=false")
      }
    } catch (error) {
      console.error("Error in Step 4 - Insert document records:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error inserting document records",
        step: "insert_documents",
      }
    }

    console.log("Form submission completed successfully!")
    revalidatePath("/")
    return { success: true, applicationId }
  } catch (error) {
    console.error("Unexpected error in submitAdmissionForm:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      step: "unexpected_error",
      details: error instanceof Error ? error.stack : String(error),
    }
  }
}
