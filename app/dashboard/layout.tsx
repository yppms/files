"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If not authenticated and not on the login page, redirect to login
    if (!isAuthenticated && pathname !== "/dashboard/login") {
      router.push("/dashboard/login")
    }
  }, [isAuthenticated, router, pathname])

  // If on login page or not authenticated, just render children
  if (pathname === "/dashboard/login" || !isAuthenticated) {
    return <>{children}</>
  }

  // If authenticated and not on login page, render dashboard layout
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout()
              router.push("/dashboard/login")
            }}
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}
