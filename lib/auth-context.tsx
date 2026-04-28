"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

// WARNING: FOR DEVELOPMENT/TEMPORARY ACCESS ONLY.
// SET TO 'false' OR REMOVE BEFORE DEPLOYMENT.
const TEMP_ALLOW_DASHBOARD_ACCESS = false

interface AuthContextType {
  isAuthenticated: boolean
  hasDocumentAccess: boolean
  login: (passcode: string) => boolean // Modified: Single passcode argument
  logout: () => void
  forceTeacherLogin: () => void
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  hasDocumentAccess: false,
  login: () => false,
  logout: () => {},
  forceTeacherLogin: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasDocumentAccess, setHasDocumentAccess] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is authenticated on mount
  useEffect(() => {
    // WARNING: Temporary access logic.
    if (TEMP_ALLOW_DASHBOARD_ACCESS) {
      console.warn(
        "WARNING: Dashboard access is temporarily open due to TEMP_ALLOW_DASHBOARD_ACCESS flag. Revert before deployment.",
      )
      setIsAuthenticated(true)
      setHasDocumentAccess(true) // Grant document access in dev mode too
      return // Skip further checks if temporary access is enabled
    }
    // End of temporary access logic.

    const auth = localStorage.getItem("auth")
    const docAuth = localStorage.getItem("doc_auth")

    if (auth === "true") {
      setIsAuthenticated(true)
    } else if (pathname?.startsWith("/dashboard") && pathname !== "/dashboard/login") {
      router.push("/dashboard/login")
    }

    if (docAuth === "true") {
      setHasDocumentAccess(true)
    }
  }, [pathname, router])

  const login = (passcode: string) => {
    const adminPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "admin123"
    const documentPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE_DOC || "doc123"

    let authSuccess = false
    let docAuthSuccess = false

    // If the passcode matches the document passcode, grant both dashboard and document access
    if (passcode === documentPasscode) {
      setIsAuthenticated(true)
      setHasDocumentAccess(true)
      localStorage.setItem("auth", "true")
      localStorage.setItem("doc_auth", "true")
      authSuccess = true
      docAuthSuccess = true
    }
    // If the passcode matches the general admin passcode, grant only dashboard access
    else if (passcode === adminPasscode) {
      setIsAuthenticated(true)
      setHasDocumentAccess(false) // Explicitly set to false if only admin passcode is used
      localStorage.setItem("auth", "true")
      localStorage.removeItem("doc_auth") // Ensure doc access is cleared
      authSuccess = true
    } else {
      // Invalid passcode for both
      setIsAuthenticated(false)
      setHasDocumentAccess(false)
      localStorage.removeItem("auth")
      localStorage.removeItem("doc_auth")
    }

    return authSuccess
  }

  const logout = () => {
    setIsAuthenticated(false)
    setHasDocumentAccess(false)
    localStorage.removeItem("auth")
    localStorage.removeItem("doc_auth")
    router.push("/dashboard/login")
  }

  const forceTeacherLogin = () => {
    setIsAuthenticated(true)
    setHasDocumentAccess(true) // Teacher access implies document access
    localStorage.setItem("auth", "true")
    localStorage.setItem("doc_auth", "true")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasDocumentAccess, login, logout, forceTeacherLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
