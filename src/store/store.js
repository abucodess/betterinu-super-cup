import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth.slice'
import uiReducer from './slices/ui.slice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Allows Supabase session objects if needed
    }),
})

