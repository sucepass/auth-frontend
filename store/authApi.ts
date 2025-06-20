// authApi.ts
import { createApi, fetchBaseQuery, BaseQueryFn } from "@reduxjs/toolkit/query/react"
import type { RootState } from "./index"
import { setCredentials, clearCredentials, setLoading } from "./authSlice"

// Types (same as your original)
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: {
      id: string
      email: string
      name: string | null
      createdAt?: Date
      updatedAt?: Date
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
  error?: {
    code: string
    message: string
    fields?: Record<string, string | undefined>
    requirements?: {
      minLength?: number
      requireUppercase?: boolean
      requireNumber?: boolean
      requireSpecialChar?: boolean
    }
  }
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}
export interface GetProfileResponse {
  id: string
  email: string
  name: string
}
export interface AccessTokenResponse {
  accessToken: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5222"

// Improved base query
const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set("authorization", `Bearer ${token}`)
    }
    headers.set("Content-Type", "application/json")
    return headers
  },
})

// Improved reauth logic with better error handling
const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  // Set loading state for auth operations
  const requestUrl = typeof args === 'string' ? args : args.url
  const isAuthRequest = requestUrl?.includes('/auth/')
  
  if (isAuthRequest) {
    api.dispatch(setLoading(true))
  }

  let result = await baseQuery(args, api, extraOptions)

  // Handle 401 errors with token refresh
  if (result.error?.status === 401) {
    const state = api.getState() as RootState
    
    // Skip refresh for these endpoints to avoid infinite loops
    if (requestUrl === '/auth/refresh' || 
        requestUrl === '/auth/logout' || 
        requestUrl === '/auth/login' || 
        requestUrl === '/auth/register') {
      if (isAuthRequest) {
        api.dispatch(setLoading(false))
      }
      return result
    }

    // Only attempt refresh if we have an access token (user was authenticated)
    if (state.auth.accessToken) {
      console.log('[Auth] Access token expired, attempting refresh...')
      
      const refreshResult = await baseQuery(
        { url: "/auth/refresh", method: "POST" }, 
        api, 
        extraOptions
      )

      if (refreshResult.data) {
        const { accessToken } = refreshResult.data as AccessTokenResponse
        api.dispatch(setCredentials({ accessToken }))
        
        console.log('[Auth] Token refreshed successfully, retrying original request')
        // Retry the original request with the new token
        result = await baseQuery(args, api, extraOptions)
      } else {
        console.log('[Auth] Token refresh failed, clearing credentials')
        api.dispatch(clearCredentials())
      }
    } else {
      // No token to refresh, just clear credentials
      api.dispatch(clearCredentials())
    }
  }

  if (isAuthRequest) {
    api.dispatch(setLoading(false))
  }

  return result
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    
    refresh: builder.mutation<AccessTokenResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      // Remove onQueryStarted to avoid double state updates
      invalidatesTags: ["User"],
    }),
    
    getProfile: builder.query<GetProfileResponse, void>({
      query: () => "/api/profile",
      providesTags: ["User"],
      // Add error handling for profile fetch
      transformErrorResponse: (response: any) => {
        if (response.status === 401) {
          // Profile fetch failed due to auth, this will trigger token refresh
          return response
        }
        return response
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetProfileQuery
} = authApi

// Utility hook for better auth state management
export const useAuth = () => {
  const { data: profile, error: profileError, isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: false, // Always try to fetch profile if we have a token
  })
  
  return {
    profile,
    profileError,
    profileLoading,
  }
}