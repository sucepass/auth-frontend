"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { useRefreshMutation } from "@/store/authApi"
import type { RootState } from "@/store"

export default function HomePage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [refresh] = useRefreshMutation()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        router.push("/dashboard")
      } else {
        try {
          // Try to refresh token on app start
          await refresh().unwrap()
          router.push("/dashboard")
        } catch (error) {
          // No valid session, go to login
          router.push("/login")
        }
      }
    }

    checkAuth()
  }, [isAuthenticated, refresh, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
