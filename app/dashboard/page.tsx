"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { bulkUpdateStudents } from "@/app/actions"
import { CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowDownUp, ArrowUpCircle, CheckSquare, Eye, EyeOff, Loader2, Search, UserX, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { CustomCard, CustomCardHeader } from "@/components/ui/custom-card"
import WhatsappIcon from "@/components/icons/whatsapp"

const CLASS_ORDER = ["KB", "TK A", "TK B"]

type ConfirmAction =
  | { kind: "inactive" }
  | { kind: "activate" }
  | { kind: "move"; targetClass: string }

type Application = {
  id: string
  created_at: string
  updated_at: string
  student_name: string
  student_nickname: string
  guardian_name: string
  guardian_nickname: string
  whatsapp: string
  relation: string
  class: string
  is_active: boolean
}

function AppCard({
  app,
  formatDate,
  getRelationLabel,
  formatWhatsappNumber,
  onClick,
  selectMode,
  selected,
  onToggleSelect,
}: {
  app: Application
  formatDate: (d: string) => string
  getRelationLabel: (r: string) => string
  formatWhatsappNumber: (p: string) => string
  onClick: () => void
  selectMode: boolean
  selected: boolean
  onToggleSelect: () => void
}) {
  return (
    <CustomCard
      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-200 hover:bg-primary-50/30 ${
        selected ? "border-primary ring-2 ring-primary/40 bg-primary-50/40" : ""
      } ${!app.is_active ? "opacity-60" : ""}`}
      onClick={selectMode ? onToggleSelect : onClick}
    >
      <CustomCardHeader>
        <div className="flex items-start gap-3">
          {selectMode && (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
              aria-label={`Pilih ${app.student_name}`}
            />
          )}
          <div className="flex-1">
            <CardTitle className="text-lg flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
              <span>{app.student_name}</span>
              {app.student_nickname && (
                <span className="text-sm text-primary-600">{app.student_nickname}</span>
              )}
              {!app.is_active && (
                <Badge variant="secondary" className="text-xs">
                  Tidak Aktif
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Didaftarkan pada {formatDate(app.created_at)}</CardDescription>
          </div>
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
  )
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortMode, setSortMode] = useState<"class" | "newest" | "oldest">("class")
  const [error, setError] = useState<string | null>(null)

  // New-academic-year management
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showInactive, setShowInactive] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)

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
        updated_at,
        student_name,
        student_nickname,
        guardian_name,
        guardian_nickname,
        whatsapp,
        relation,
        class,
        is_active
      `)
        .order("updated_at", { ascending: false })
        // Tiebreaker so any rows with identical timestamps keep a stable order
        // across refetches (otherwise Postgres returns ties in random order).
        .order("id", { ascending: false })

      console.log("Fetch response:", { data, error })

      if (error) {
        console.error("Error fetching applications:", error)
        setError(error.message)
        return
      }

      setApplications((data || []).map((a) => ({ ...a, is_active: a.is_active ?? true })))
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

  const filteredApplications = applications.filter((app) => {
    if (!showInactive && !app.is_active) return false
    return (
      app.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student_nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.guardian_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.whatsapp?.includes(searchTerm)
    )
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    const diff = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
    if (diff !== 0) return sortMode === "oldest" ? diff : -diff
    // Stable tiebreaker for identical timestamps so the order never reshuffles.
    return a.id < b.id ? 1 : a.id > b.id ? -1 : 0
  })

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

  // ---- Selection helpers ----
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectMany = (ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = ids.every((id) => next.has(id))
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)))
      return next
    })
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  // ---- Bulk mutations ----
  // Writes go through a server action (service-role client) because the anon
  // client used for reads is blocked by RLS on UPDATE and would silently
  // affect 0 rows while still returning 204.
  const applyBulk = async (
    action: Parameters<typeof bulkUpdateStudents>[1],
    localPatch: Partial<Application>,
    successMsg: string,
  ) => {
    const ids = [...selected]
    if (ids.length === 0) return
    setActionLoading(true)
    try {
      const res = await bulkUpdateStudents(ids, action)
      if (!res.success) throw new Error(res.error)
      if (!res.count) {
        throw new Error(
          "0 baris terupdate. Periksa kolom is_active sudah ada dan SUPABASE_SERVICE_ROLE_KEY terpasang.",
        )
      }
      // Mirror the DB's updated_at bump so the "newest" sort matches a refetch.
      const now = new Date().toISOString()
      setApplications((prev) =>
        prev.map((app) =>
          selected.has(app.id) ? { ...app, ...localPatch, updated_at: now } : app,
        ),
      )
      toast({ title: "Berhasil", description: successMsg })
      exitSelectMode()
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Gagal memperbarui",
        description: e instanceof Error ? e.message : "Terjadi kesalahan",
      })
    } finally {
      setActionLoading(false)
      setConfirm(null)
    }
  }

  const runConfirmedAction = () => {
    if (!confirm) return
    const n = selected.size
    if (confirm.kind === "inactive") {
      applyBulk({ type: "setActive", value: false }, { is_active: false }, `${n} siswa ditandai tidak aktif (lulus).`)
    } else if (confirm.kind === "activate") {
      applyBulk({ type: "setActive", value: true }, { is_active: true }, `${n} siswa diaktifkan kembali.`)
    } else {
      applyBulk(
        { type: "moveClass", targetClass: confirm.targetClass },
        { class: confirm.targetClass },
        `${n} siswa dipindahkan ke ${confirm.targetClass}.`,
      )
    }
  }

  // Guard: how many ALREADY-active students sit in the target class but are
  // NOT part of this selection. Moving into a non-empty class merges cohorts.
  const collisionCount = (targetClass: string) =>
    applications.filter(
      (a) => a.is_active && a.class === targetClass && !selected.has(a.id),
    ).length

  const confirmText = (): { title: string; desc: string; warn?: string } => {
    if (!confirm) return { title: "", desc: "" }
    const n = selected.size
    if (confirm.kind === "inactive")
      return {
        title: "Tandai siswa tidak aktif?",
        desc: `${n} siswa akan ditandai sebagai tidak aktif (lulus) dan disembunyikan dari daftar. Anda bisa menampilkannya kembali kapan saja.`,
      }
    if (confirm.kind === "activate")
      return { title: "Aktifkan siswa?", desc: `${n} siswa akan ditandai aktif kembali.` }
    const collision = collisionCount(confirm.targetClass)
    return {
      title: `Pindahkan ke kelas ${confirm.targetClass}?`,
      desc: `Kelas dari ${n} siswa akan diubah menjadi "${confirm.targetClass}". Tindakan ini menimpa kelas mereka saat ini.`,
      warn:
        collision > 0
          ? `⚠️ Kelas "${confirm.targetClass}" sudah berisi ${collision} siswa aktif lain. Memindahkan ke sana akan MENGGABUNGKAN dua angkatan dalam satu kelas. Jika ini kenaikan kelas tahunan, naikkan kelas tertinggi lebih dulu (TK B → lulus, lalu TK A → TK B, terakhir KB → TK A).`
          : undefined,
    }
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
          {selectMode && (
            <div className="sticky top-2 z-20 mb-4 rounded-lg border border-primary-200 bg-primary-50/90 backdrop-blur px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium">
                  {selected.size} siswa dipilih
                </span>
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ArrowUpCircle size={14} />
                    Pindah ke:
                  </span>
                  {CLASS_ORDER.map((c) => (
                    <Button
                      key={c}
                      variant="outline"
                      size="sm"
                      disabled={selected.size === 0 || actionLoading}
                      onClick={() => setConfirm({ kind: "move", targetClass: c })}
                    >
                      {c}
                    </Button>
                  ))}
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={selected.size === 0 || actionLoading}
                    onClick={() => setConfirm({ kind: "inactive" })}
                    className="flex items-center gap-1.5"
                  >
                    <UserX size={14} />
                    Tandai Lulus / Tidak Aktif
                  </Button>
                  {showInactive && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selected.size === 0 || actionLoading}
                      onClick={() => setConfirm({ kind: "activate" })}
                    >
                      Aktifkan
                    </Button>
                  )}
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
              </div>
            </div>
          )}

          <div className="mb-4 flex justify-between items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Menampilkan {filteredApplications.length} dari {applications.length} pendaftar
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortMode(m => m === "class" ? "newest" : m === "newest" ? "oldest" : "class")}
                className="flex items-center gap-1.5"
              >
                <ArrowDownUp size={14} />
                {sortMode === "class" ? "Per Kelas" : sortMode === "newest" ? "Terbaru" : "Terlama"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInactive((v) => !v)}
                className="flex items-center gap-1.5"
              >
                {showInactive ? <EyeOff size={14} /> : <Eye size={14} />}
                {showInactive ? "Sembunyikan Tidak Aktif" : "Tampilkan Tidak Aktif"}
              </Button>
              <Button
                variant={selectMode ? "default" : "outline"}
                size="sm"
                onClick={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
                className="flex items-center gap-1.5"
              >
                {selectMode ? <X size={14} /> : <CheckSquare size={14} />}
                {selectMode ? "Batal Pilih" : "Kelola Siswa"}
              </Button>
              <Button variant="outline" size="sm" onClick={fetchApplications}>
                Refresh Data
              </Button>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-lg text-gray-500">Belum ada data pendaftaran</p>
              <p className="text-sm text-gray-400 mt-2">Data akan muncul setelah ada pendaftaran yang masuk</p>
            </div>
          ) : sortMode !== "class" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedApplications.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  formatDate={formatDate}
                  getRelationLabel={getRelationLabel}
                  formatWhatsappNumber={formatWhatsappNumber}
                  onClick={() => handleCardClick(app.id)}
                  selectMode={selectMode}
                  selected={selected.has(app.id)}
                  onToggleSelect={() => toggleSelect(app.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {sortedClassGroups.map((classType) => {
                const groupIds = groupedApplications[classType].map((a) => a.id)
                const allInGroupSelected = groupIds.every((id) => selected.has(id))
                return (
                  <div key={classType}>
                    <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 flex items-center gap-3">
                      {selectMode && (
                        <Checkbox
                          checked={allInGroupSelected}
                          onCheckedChange={() => toggleSelectMany(groupIds)}
                          aria-label={`Pilih semua di ${classType}`}
                        />
                      )}
                      <span>
                        Kelas: {classType}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          ({groupedApplications[classType].length} pendaftar)
                        </span>
                      </span>
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {groupedApplications[classType].map((app) => (
                        <AppCard
                          key={app.id}
                          app={app}
                          formatDate={formatDate}
                          getRelationLabel={getRelationLabel}
                          formatWhatsappNumber={formatWhatsappNumber}
                          onClick={() => handleCardClick(app.id)}
                          selectMode={selectMode}
                          selected={selected.has(app.id)}
                          onToggleSelect={() => toggleSelect(app.id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
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

      <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmText().title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmText().desc}</AlertDialogDescription>
          </AlertDialogHeader>
          {confirmText().warn && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {confirmText().warn}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                runConfirmedAction()
              }}
              disabled={actionLoading}
            >
              {actionLoading ? "Memproses..." : "Lanjutkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
