import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  role: null, // 'super_admin' | 'manager' | 'referee' | null
  session: null,
  isAuthenticated: false,
  isLoading: true,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, session, role } = action.payload
      state.user = user || null
      state.session = session || null
      state.role = role || null
      state.isAuthenticated = !!user
      state.isLoading = false
    },
    setRole: (state, action) => {
      state.role = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    clearCredentials: (state) => {
      state.user = null
      state.role = null
      state.session = null
      state.isAuthenticated = false
      state.isLoading = false
    },
  },
})

export const { setCredentials, setRole, setLoading, clearCredentials } = authSlice.actions
export default authSlice.reducer

