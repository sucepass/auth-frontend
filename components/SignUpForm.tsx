"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useRegisterMutation } from "@/store/authApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function SignUpForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [register, { isLoading, error }] = useRegisterMutation()
  const router = useRouter()

  const isDemoMode = useMemo(() => process.env.NEXT_PUBLIC_DEMO_MODE === "true", [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await register({ name, email, password }).unwrap()
      
      if (result.success) {
        // Redirect to dashboard after successful registration
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Registration failed:", err)
    }
  }

  const getErrorMessage = (error: any): string => {
    if (!error) return "An error occurred"

    if (error.status === "FETCH_ERROR") {
      return `Network error: ${error.error}. ${isDemoMode ? "" : "Make sure your backend is running."}`
    }

    if ("data" in error) {
      if (error.data?.error?.fields) {
        // Handle field-specific errors
        const fieldErrors = Object.entries(error.data.error.fields)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n")
        return fieldErrors
      }
      return error.data?.error?.message || "Registration failed"
    }

    return "An unexpected error occurred"
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
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
                placeholder="Create a password"
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
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
