"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { CustomCard, CustomCardHeader } from "@/components/ui/custom-card"
import WhatsappIcon from "@/components/icons/whatsapp"

type Application = {
  id: string
  created_at: string
  student_name: string
  student_nickname: string
  guardian_name: string
  guardian_nickname: string
  whatsapp: string
  relation: string
  class: string
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Function to fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching applications...")

      const { data, error } = await supabase
        .from("applications")
        .select(`
        id, 
        created_at, 
        student_name,
        student_nickname,
        guardian_name,
        guardian_nickname,
        whatsapp, 
        relation, 
        class
      `)
        .order("created_at", { ascending: false })

      console.log("Fetch response:", { data, error })

      if (error) {
        console.error("Error fetching applications:", error)
        setError(error.message)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error("Error in fetchApplications:", error)
      setError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch data if authenticated
    if (!isAuthenticated) return

    fetchApplications()
  }, [isAuthenticated])

  // If not authenticated, don't render anything (layout will redirect)
  if (!isAuthenticated) {
    return null
  }

  const filteredApplications = applications.filter(
    (app) =>
      app.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student_nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.guardian_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.whatsapp?.includes(searchTerm),
  )

  // Group applications by class
  const groupedApplications = filteredApplications.reduce(
    (groups, app) => {
      const classType = app.class || "Tidak Ditentukan"
      if (!groups[classType]) {
        groups[classType] = []
      }
      groups[classType].push(app)
      return groups
    },
    {} as Record<string, Application[]>,
  )

  // Sort class groups in a specific order: KB, TK A, TK B, then others alphabetically
  const classOrder = ["KB", "TK A", "TK B"]
  const sortedClassGroups = Object.keys(groupedApplications).sort((a, b) => {
    const indexA = classOrder.indexOf(a)
    const indexB = classOrder.indexOf(b)

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    } else if (indexA !== -1) {
      return -1
    } else if (indexB !== -1) {
      return 1
    } else {
      return a.localeCompare(b)
    }
  })

  const formatDate = (dateString: string) => {
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
    }

    return relations[relation] || relation
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

  const handleCardClick = (applicationId: string) => {
    router.push(`/dashboard/applications/${applicationId}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard Pendaftaran</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama anak, panggilan, wali, atau nomor WhatsApp"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Memuat data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
          <Button variant="outline" className="mt-2 bg-transparent" onClick={fetchApplications}>
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Menampilkan {filteredApplications.length} dari {applications.length} pendaftar
            </p>
            <Button variant="outline" onClick={fetchApplications}>
              Refresh Data
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">Belum ada data pendaftaran</p>
              <p className="text-sm text-gray-400 mt-2">Data akan muncul setelah ada pendaftaran yang masuk</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedClassGroups.map((classType) => (
                <div key={classType}>
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">
                    Kelas: {classType}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({groupedApplications[classType].length} pendaftar)
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupedApplications[classType].map((app) => (
                      <CustomCard
                        key={app.id}
                        className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-200 hover:bg-primary-50/30"
                        onClick={() => handleCardClick(app.id)}
                      >
                        <CustomCardHeader>
                          <div>
                            <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                              <span>{app.student_name}</span>
                              {app.student_nickname && (
                                <span className="text-sm text-primary-600">{app.student_nickname}</span>
                              )}
                            </CardTitle>
                            <CardDescription>Didaftarkan pada {formatDate(app.created_at)}</CardDescription>
                          </div>
                        </CustomCardHeader>
                        <CardContent className="pt-4 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Wali:</div>
                            <div className="font-medium flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                              <span>{app.guardian_name}</span>
                              {app.guardian_nickname && (
                                <span className="text-sm text-primary-600">{app.guardian_nickname}</span>
                              )}
                            </div>

                            <div className="text-muted-foreground">Hubungan:</div>
                            <div className="font-medium">{getRelationLabel(app.relation)}</div>

                            <div className="text-muted-foreground">WhatsApp:</div>
                            <div className="font-medium flex items-center gap-2">
                              <span>{app.whatsapp}</span>
                              {app.whatsapp && (
                                <Button
                                  asChild
                                  size="sm"
                                  variant="default"
                                  className="h-8 w-8 p-0 ml-2 bg-green-100 hover:bg-green-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <a
                                    href={`https://wa.me/${formatWhatsappNumber(app.whatsapp)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Chat on WhatsApp"
                                  >
                                    <WhatsappIcon className="h-5 w-5" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </CustomCard>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {applications.length > 0 && filteredApplications.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">Tidak ada data pendaftaran yang ditemukan</p>
              <p className="text-sm text-gray-400 mt-2">Coba gunakan kata kunci pencarian yang berbeda</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
