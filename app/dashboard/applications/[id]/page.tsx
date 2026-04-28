"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, CheckCircle, XCircle, Clock, Check, Eye, Lock } from "lucide-react" // Added Lock icon
import { useAuth } from "@/lib/auth-context"
import { Badge } from "@/components/ui/custom-badge"
import { CustomCard, CustomCardHeader } from "@/components/ui/custom-card"

type Application = {
  id: string
  created_at: string
  updated_at: string

  // Student information
  class: string
  student_name: string
  student_nickname: string
  blood_type: string
  height: string
  weight: string
  has_kia: boolean
  medical_history: boolean
  medical_history_details: string
  language: string
  hobby: string

  // Guardian information
  relation: string
  guardian_name: string
  guardian_nickname: string
  whatsapp: string
  address_different: boolean
  current_address: string

  // Survey information
  source: string
  source_detail: string
  other_source: string
  expectations: string
  occupation: string
  instagram: string
  email: string

  // Status
  status: string
}

type EmergencyContact = {
  id: string
  application_id: string
  phone: string
  relationship: string
}

type ExtracurricularPreference = {
  id: string
  application_id: string
  activity: string
  priority: number
}

type Document = {
  id: string
  application_id: string
  document_type: string
  file_path: string
  file_name: string
}

export default function ApplicationDetail() {
  const { isAuthenticated, hasDocumentAccess } = useAuth() // Get hasDocumentAccess
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [extracurricularPreferences, setExtracurricularPreferences] = useState<ExtracurricularPreference[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch data if authenticated
    if (!isAuthenticated) return

    async function fetchApplicationData() {
      try {
        setLoading(true)
        const applicationId = params.id as string

        // Fetch the main application data
        const { data: appData, error: appError } = await supabase
          .from("applications")
          .select("*")
          .eq("id", applicationId)
          .single()

        if (appError) {
          console.error("Error fetching application:", appError)
          return
        }

        setApplication(appData)

        // Fetch emergency contacts
        const { data: contactsData, error: contactsError } = await supabase
          .from("emergency_contacts")
          .select("*")
          .eq("application_id", applicationId)

        if (contactsError) {
          console.error("Error fetching emergency contacts:", contactsError)
        } else {
          setEmergencyContacts(contactsData || [])
        }

        // Fetch extracurricular preferences
        const { data: extracurricularData, error: extracurricularError } = await supabase
          .from("extracurricular_preferences")
          .select("*")
          .eq("application_id", applicationId)

        if (extracurricularError) {
          console.error("Error fetching extracurricular preferences:", extracurricularError)
        } else {
          setExtracurricularPreferences(extracurricularData || [])
        }

        // Fetch documents only if hasDocumentAccess is true
        if (hasDocumentAccess) {
          const { data: documentsData, error: documentsError } = await supabase
            .from("documents")
            .select("*")
            .eq("application_id", applicationId)

          if (documentsError) {
            console.error("Error fetching documents:", documentsError)
          } else {
            setDocuments(documentsData || [])
          }
        }
      } catch (error) {
        console.error("Error in fetchApplicationData:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchApplicationData()
    }
  }, [isAuthenticated, params.id, hasDocumentAccess]) // Add hasDocumentAccess to dependencies

  // If not authenticated, don't render anything (layout will redirect)
  if (!isAuthenticated) {
    return null
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getRelationLabel = (relation: string) => {
    const relations: Record<string, string> = {
      mother: "Ibu",
      father: "Ayah",
      grandmother: "Nenek",
      grandfather: "Kakek",
      aunt: "Bibi",
      uncle: "Paman",
      sibling: "Kakak",
      neighbor: "Tetangga",
      friend: "Teman",
      other: "Lainnya",
    }

    return relations[relation] || relation
  }

  const getSourceLabel = (source: string) => {
    const sources: Record<string, string> = {
      recommendation: "Rekomendasi saudara / kerabat",
      self: "Saya cari dan riset sendiri",
      location: "Sering atau pernah lewat lokasi",
      other: "Lainnya",
    }

    return sources[source] || source
  }

  const getSourceDetailLabel = (sourceDetail: string) => {
    const sourceDetails: Record<string, string> = {
      google: "Google",
      "google-review": "Google Review",
      instagram: "Instagram",
      tiktok: "Tiktok",
      whatsapp: "WhatsApp",
      website: "Website",
      facebook: "Facebook",
    }

    return sourceDetails[sourceDetail] || sourceDetail
  }

  const getLanguageLabel = (language: string) => {
    const languages: Record<string, string> = {
      indonesia: "Bahasa Indonesia",
      english: "Bahasa Inggris",
      javanese: "Bahasa Jawa",
      other: "Bahasa Daerah Lainnya",
    }

    return languages[language] || language
  }

  const formatWhatsappNumber = (phone: string) => {
    if (!phone) return ""
    // Remove non-digit characters
    let cleaned = phone.replace(/\D/g, "")
    // If it starts with 0, replace with 62
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1)
    }
    // If it doesn't start with 62, prepend it (basic assumption for Indonesian numbers)
    else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned
    }
    return cleaned
  }

  // Function to get public URL for a document using Supabase SDK
  const getDocumentPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("applications").getPublicUrl(filePath)
    return data.publicUrl
  }

  // Function to handle document viewing
  const handleViewDocument = (filePath: string) => {
    const publicUrl = getDocumentPublicUrl(filePath)
    window.open(publicUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Memuat data...</span>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-500">Data pendaftaran tidak ditemukan</p>
          <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/dashboard")}>
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold">Detail Pendaftaran</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Student Information */}
          <CustomCard>
            <CustomCardHeader>
              <CardTitle>Data Anak</CardTitle>
              <CardDescription>Informasi mengenai anak yang didaftarkan</CardDescription>
            </CustomCardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Kelas</h3>
                  <p className="font-medium">{application.class || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nama Lengkap</h3>
                  <p className="font-medium">{application.student_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nama Panggilan</h3>
                  <p className="font-medium">{application.student_nickname || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Golongan Darah</h3>
                  <p className="font-medium">
                    {application.blood_type === "unknown" ? "Belum Tahu" : application.blood_type || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tinggi Badan</h3>
                  <p className="font-medium">
                    {application.height === "unknown" ? "Belum Tahu" : `${application.height} cm` || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Berat Badan</h3>
                  <p className="font-medium">
                    {application.weight === "unknown" ? "Belum Tahu" : `${application.weight} kg` || "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Memiliki KIA</h3>
                  <p className="font-medium">{application.has_kia ? "Ya" : "Tidak"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Bahasa Komunikasi</h3>
                  <p className="font-medium">{application.language ? getLanguageLabel(application.language) : "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Hobi</h3>
                  <p className="font-medium">{application.hobby || "-"}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Riwayat Penyakit</h3>
                  <p className="font-medium">
                    {application.medical_history ? "Ya" : "Tidak"}
                    {application.medical_history && application.medical_history_details && (
                      <span className="block mt-1 text-sm text-muted-foreground">
                        {application.medical_history_details}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </CustomCard>

          {/* Guardian Information */}
          <CustomCard>
            <CustomCardHeader>
              <CardTitle>Data Wali</CardTitle>
              <CardDescription>Informasi mengenai wali yang mendaftarkan</CardDescription>
            </CustomCardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nama Lengkap</h3>
                  <p className="font-medium">{application.guardian_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Nama Panggilan</h3>
                  <p className="font-medium">{application.guardian_nickname || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Hubungan</h3>
                  <p className="font-medium">{getRelationLabel(application.relation)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">WhatsApp</h3>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{application.whatsapp}</p>
                    {application.whatsapp && (
                      <Button
                        asChild
                        size="sm" // Changed from "icon" to "sm"
                        variant="default" // Changed from "outline" to "default"
                        className="h-8 w-8 p-0 ml-2 bg-green-100 hover:bg-green-200" // Increased size and added background
                      >
                        <a
                          href={`https://wa.me/${formatWhatsappNumber(application.whatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Chat on WhatsApp"
                        >
                          {/* Using the WhatsappIcon component */}
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 360 362"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M307.546 52.5655C273.709 18.685 228.706 0.0171895 180.756 0C81.951 0 1.53846 80.404 1.50408 179.235C1.48689 210.829 9.74646 241.667 25.4319 268.844L0 361.736L95.0236 336.811C121.203 351.096 150.683 358.616 180.679 358.625H180.756C279.544 358.625 359.966 278.212 360 179.381C360.017 131.483 341.392 86.4547 307.546 52.5741V52.5655ZM180.756 328.354H180.696C153.966 328.346 127.744 321.16 104.865 307.589L99.4242 304.358L43.034 319.149L58.0834 264.168L54.5423 258.53C39.6304 234.809 31.749 207.391 31.7662 179.244C31.8006 97.1036 98.6334 30.2707 180.817 30.2707C220.61 30.2879 258.015 45.8015 286.145 73.9665C314.276 102.123 329.755 139.562 329.738 179.364C329.703 261.513 262.871 328.346 180.756 328.346V328.354ZM262.475 216.777C257.997 214.534 235.978 203.704 231.869 202.209C227.761 200.713 224.779 199.966 221.796 204.452C218.814 208.939 210.228 219.029 207.615 222.011C205.002 225.002 202.389 225.372 197.911 223.128C193.434 220.885 179.003 216.158 161.891 200.902C148.578 189.024 139.587 174.362 136.975 169.875C134.362 165.389 136.7 162.965 138.934 160.739C140.945 158.728 143.412 155.505 145.655 152.892C147.899 150.279 148.638 148.406 150.133 145.423C151.629 142.432 150.881 139.82 149.764 137.576C148.646 135.333 139.691 113.287 135.952 104.323C132.316 95.5909 128.621 96.777 125.879 96.6309C123.266 96.5019 120.284 96.4762 117.293 96.4762C114.302 96.4762 109.454 97.5935 105.346 102.08C101.238 106.566 89.6691 117.404 89.6691 139.441C89.6691 161.478 105.716 182.785 107.959 185.776C110.202 188.767 139.544 234.001 184.469 253.408C195.153 258.023 203.498 260.782 210.004 262.845C220.731 266.257 230.494 265.776 238.212 264.624C246.816 263.335 264.71 253.786 268.44 243.326C272.17 232.866 272.17 223.893 271.053 222.028C269.936 220.163 266.945 219.037 262.467 216.794L262.475 216.777Z"
                              fill="#25D366"
                            />
                          </svg>
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Instagram</h3>
                  <p className="font-medium">{application.instagram || "-"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="font-medium">{application.email || "-"}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Alamat Domisili</h3>
                  <p className="font-medium">
                    {application.address_different
                      ? application.current_address
                      : "Sama dengan alamat di Kartu Keluarga"}
                  </p>
                </div>
              </div>

              {/* Emergency Contacts */}
              {emergencyContacts.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Kontak Darurat</h3>
                  <div className="space-y-3">
                    {emergencyContacts.map((contact, index) => (
                      <div key={contact.id} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium flex items-center gap-2">
                            <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            Kontak Darurat {index + 1}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Nomor Telepon:</div>
                          <div>{contact.phone}</div>

                          <div className="text-muted-foreground">Hubungan:</div>
                          <div>{getRelationLabel(contact.relationship)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CustomCard>

          {/* Survey Information */}
          <CustomCard>
            <CustomCardHeader>
              <CardTitle>Data Survei</CardTitle>
              <CardDescription>Informasi tambahan dari survei</CardDescription>
            </CustomCardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Sumber Informasi</h3>
                  <p className="font-medium">
                    {application.source ? getSourceLabel(application.source) : "-"}
                    {application.source === "self" && application.source_detail && (
                      <span className="block text-sm text-muted-foreground">
                        Dari: {getSourceDetailLabel(application.source_detail)}
                      </span>
                    )}
                    {application.source === "other" && application.other_source && (
                      <span className="block text-sm text-muted-foreground">{application.other_source}</span>
                    )}
                  </p>
                </div>

                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Detail Pekerjaan</h3>
                  <p className="font-medium">{application.occupation || "-"}</p>
                </div>

                <div className="col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Harapan / Permintaan</h3>
                  <p className="font-medium">{application.expectations || "-"}</p>
                </div>
              </div>

              {/* Extracurricular Preferences */}
              {extracurricularPreferences.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Preferensi Ekstrakurikuler</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[...extracurricularPreferences]
                      .sort((a, b) => a.priority - b.priority)
                      .map((pref) => (
                        <div
                          key={pref.id}
                          className="p-3 bg-primary-50 border border-primary-100 rounded-md flex items-center gap-3"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                            {pref.priority}
                          </div>
                          <span className="font-medium">{pref.activity}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </CustomCard>
        </div>

        <div className="space-y-6">
          {/* Status Card */}
          <CustomCard>
            <CustomCardHeader>
              <CardTitle>Status Pendaftaran</CardTitle>
            </CustomCardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                {application.status === "submitted" ? (
                  <Clock className="h-5 w-5 text-blue-500" />
                ) : application.status === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <Badge
                  variant={
                    application.status === "submitted"
                      ? "submitted"
                      : application.status === "approved"
                        ? "approved"
                        : "rejected"
                  }
                >
                  {application.status === "submitted"
                    ? "Terkirim"
                    : application.status === "approved"
                      ? "Disetujui"
                      : application.status === "rejected"
                        ? "Ditolak"
                        : "Dalam Proses"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Pendaftaran:</span>
                  <span className="font-medium">{formatDate(application.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </CustomCard>

          {/* Documents Card - Conditional rendering based on hasDocumentAccess */}
          {hasDocumentAccess ? (
            <CustomCard>
              <CustomCardHeader>
                <CardTitle>Dokumen</CardTitle>
              </CustomCardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {[
                    { type: "birth_certificate", label: "Akta Kelahiran" },
                    { type: "photo", label: "Pas Foto" },
                    { type: "kia_card", label: "Kartu Identitas Anak" },
                    { type: "id_card", label: "KTP" },
                    { type: "family_card", label: "Kartu Keluarga" },
                  ].map((docType) => {
                    const uploadedDoc = documents.find((doc) => doc.document_type === docType.type)
                    const isUploaded = !!uploadedDoc

                    return (
                      <div
                        key={docType.type}
                        className={`flex items-center justify-between p-3 rounded-md border ${
                          isUploaded ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isUploaded ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                          <div>
                            <span className={`font-medium ${isUploaded ? "text-green-800" : "text-gray-500"}`}>
                              {docType.label}
                            </span>
                          </div>
                        </div>

                        {isUploaded && uploadedDoc && (
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline" className="h-8 px-2 text-xs bg-transparent">
                              <a
                                href={uploadedDoc.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Lihat
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {documents.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">Tidak ada dokumen yang diunggah</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </CustomCard>
          ) : (
            // Display a message if document access is not granted
            <CustomCard>
              <CustomCardHeader>
                <CardTitle>Dokumen</CardTitle>
              </CustomCardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <Lock className="h-10 w-10 mb-3" />
                  <p className="text-lg font-medium mb-2">Akses Dokumen Dibatasi</p>
                  <p className="text-sm">
                    Anda tidak memiliki izin untuk melihat dokumen. Silakan hubungi administrator untuk akses.
                  </p>
                </div>
              </CardContent>
            </CustomCard>
          )}
        </div>
      </div>
    </div>
  )
}
