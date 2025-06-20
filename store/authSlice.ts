// authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { authApi } from "./authApi"

interface AuthState {
  accessToken: string | null
  user: {
    id: string
    email: string
    name: string | null
  } | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ 
      accessToken: string; 
      user?: { id: string; email: string; name: string | null } 
    }>) => {
      state.accessToken = action.payload.accessToken
      if (action.payload.user) {
        state.user = action.payload.user
      }
      state.isAuthenticated = true
      state.isLoading = false
    },
    clearCredentials: (state) => {
      state.accessToken = null
      state.user = null
      state.isAuthenticated = false
      state.isLoading = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
  extraReducers: (builder) => {
    // Handle login
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.isLoading = true
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success) {
          state.user = action.payload.data.user
          state.accessToken = action.payload.data.tokens.accessToken
          state.isAuthenticated = true
        }
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state) => {
        state.isLoading = false
        state.accessToken = null
        state.user = null
        state.isAuthenticated = false
      })
      
    // Handle register
    builder
      .addMatcher(authApi.endpoints.register.matchPending, (state) => {
        state.isLoading = true
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.success) {
          state.user = action.payload.data.user
          state.accessToken = action.payload.data.tokens.accessToken
          state.isAuthenticated = true
        }
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state) => {
        state.isLoading = false
      })
      
    // Handle refresh - only update token, keep existing user
    builder
      .addMatcher(authApi.endpoints.refresh.matchFulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        // Don't modify user data or isAuthenticated if we already have a user
        if (state.user) {
          state.isAuthenticated = true
        }
      })
      .addMatcher(authApi.endpoints.refresh.matchRejected, (state) => {
        // Only clear if we don't have valid user data
        state.accessToken = null
        state.isAuthenticated = false
      })
      
    // Handle logout
    builder
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.accessToken = null
        state.user = null
        state.isAuthenticated = false
      })
      .addMatcher(authApi.endpoints.logout.matchRejected, (state) => {
        // Clear credentials even if logout fails on server
        state.accessToken = null
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions
export default authSlice.reducer