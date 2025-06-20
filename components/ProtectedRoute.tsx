"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useRefreshMutation } from "@/store/authApi"
import type { RootState } from "@/store"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken } = useSelector((state: RootState) => state.auth)
  const [refresh] = useRefreshMutation()
  const router = useRouter()

  useEffect(() => {
    const initializeAuth = async () => {
      // If no access token, try to refresh
      if (!accessToken) {
        try {
          await refresh().unwrap()
        } catch (error) {
          // Refresh failed, redirect to login
          router.push("/login")
        }
      }
    }

    initializeAuth()
  }, [accessToken, refresh, router])

  // Show loading or redirect logic
  if (!isAuthenticated && !accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
