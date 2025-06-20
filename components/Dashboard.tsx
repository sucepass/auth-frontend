"use client"

import type React from "react"

import { GetProfileResponse, useGetProfileQuery, useLogoutMutation } from "@/store/authApi"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { data: user, isLoading, error } = useGetProfileQuery()
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation()
  const router = useRouter()

  const [userProfile, setUserProfile] = useState<GetProfileResponse | null>(null);

  useEffect(() => {
    console.log("User profile:", user);
    if (user) {
      setUserProfile(user);
    }
  }, [user]);


  const handleLogout = async () => {
    try {
      setUserProfile(null);
      await logout().unwrap()
      console.log("Logout successful")
      router.push("/login")
    } catch (err) {
      console.error("Logout failed:", err)
      // Even if logout fails, redirect to login
      router.push("/login")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load profile data.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Signing out..." : "Sign Out"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="text-lg">{userProfile?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-lg">{userProfile?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">User ID</Label>
              <p className="text-sm font-mono text-gray-600">{user?.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current session information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-green-600">Authenticated</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your session is active and tokens are being managed automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
