import { createListenerMiddleware, isRejectedWithValue } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { authApi } from "./authApi"
import { clearCredentials } from "./authSlice"

// Create the middleware instance
export const authMiddleware = createListenerMiddleware()

// Track refresh attempts to prevent infinite loops
let isRefreshing = false

authMiddleware.startListening({
  matcher: isRejectedWithValue,
  effect: async (action: PayloadAction<any>, listenerApi) => {
    console.log("Auth middleware triggered")

    // Check if this is a 401 error and not already refreshing
    if (action.payload?.status === 401 && !isRefreshing) {
      isRefreshing = true
      
      try {
        // Attempt to refresh the token
        const refreshResult = await listenerApi.dispatch(authApi.endpoints.refresh.initiate())

        if (refreshResult.data) {
          // Refresh successful, the token is already updated via extraReducers
          // The original request will be retried automatically by RTK Query
          console.log("Token refreshed successfully")
        } else {
          // Refresh failed, clear auth state
          listenerApi.dispatch(clearCredentials())
          // Redirect to login page
          window.location.href = "/login"
        }
      } catch (error) {
        // Refresh failed, clear auth state
        listenerApi.dispatch(clearCredentials())
        window.location.href = "/login"
      } finally {
        isRefreshing = false
      }
    }
  },
})
