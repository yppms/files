"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"

export default function LoginPage() {
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Pass only the single passcode to the login function
    if (login(passcode)) {
      router.push("/dashboard")
    } else {
      setError("Kode akses salah")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Dashboard Admin</CardTitle>
          <CardDescription className="text-center">Masukkan kode akses untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" ref={formRef}>
            <div className="space-y-1">
              <Input
                type="password"
                placeholder="Kode Akses" // Single input field
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="text-center text-lg py-6"
              />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
