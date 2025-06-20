import { configureStore } from "@reduxjs/toolkit"
import { authApi } from "./authApi"
import authSlice from "./authSlice"
import { authMiddleware } from "./authMiddleware"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware).prepend(authMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
