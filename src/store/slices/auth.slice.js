import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  profile: null,
  role: null, // 'super_admin' | 'manager' | 'referee' | null (Strict DB-backed role)
  session: null,
  isAuthenticated: false,
  isLoading: true,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, profile, session, role } = action.payload
      state.user = user || null
      state.profile = profile || null
      state.session = session || null
      state.role = role || null
      state.isAuthenticated = Boolean(user && role)
      state.isLoading = false
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    clearCredentials: (state) => {
      state.user = null
      state.profile = null
      state.role = null
      state.session = null
      state.isAuthenticated = false
      state.isLoading = false
    },
  },
})

export const { setCredentials, setLoading, clearCredentials } = authSlice.actions
export default authSlice.reducer
