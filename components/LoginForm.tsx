"use client"

import type React from "react"

import { useMemo, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLoginMutation, useRefreshMutation } from "@/store/authApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("") // Pre-fill for demo
  const [password, setPassword] = useState("") // Pre-fill for demo
  const [login, { isLoading, error }] = useLoginMutation()
  const [refresh] = useRefreshMutation()
  const router = useRouter()

  const isDemoMode = useMemo(() => process.env.NEXT_PUBLIC_DEMO_MODE === "true", [])

  useEffect(() => {
    if (isDemoMode) {
      setEmail("demo@example.com")
      setPassword("password123")
    }
  }, [isDemoMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // First, attempt login
      const loginResult = await login({ email, password }).unwrap()
      console.log("Login successful:", loginResult)

      // After successful login, get the access token via refresh
      const refreshResult = await refresh().unwrap()
      console.log("Token refresh successful:", refreshResult)

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Login failed:", err)
    }
  }

  const getErrorMessage = (error: any): string => {
    if (!error) return "An error occurred"

    if (error.status === "FETCH_ERROR") {
      return `Network error: ${error.error}. ${isDemoMode ? "" : "Make sure your backend is running."}`
    }

    if ("data" in error) {
      return error.data?.error?.message || "Login failed"
    }

    return "An unexpected error occurred"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            {isDemoMode ? (
              <>Demo Mode - Use any credentials to test</>
            ) : (
              <>Enter your credentials to access your account</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDemoMode && (
            <Alert className="mb-4">
              <AlertDescription>🚀 Demo Mode Active - Backend simulation enabled</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {!!error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {getErrorMessage(error as any)}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="underline">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
