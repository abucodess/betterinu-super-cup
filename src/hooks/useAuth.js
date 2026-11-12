import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCredentials, clearCredentials, setLoading } from '@/store/slices/auth.slice'
import { authApi } from '@/services/api/auth.api'
import { supabase } from '@/services/supabase/client'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, role, session, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  )

  // Session initial restore
  useEffect(() => {
    let isMounted = true

    async function initSession() {
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                            import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
      
      if (isPlaceholder) {
        // If developer already logged in via Redux state, keep it; otherwise finish loading
        if (isMounted) dispatch(setLoading(false))
        return
      }

      try {
        const currentSession = await authApi.getSession()
        if (currentSession && isMounted) {
          const profile = await authApi.getUserProfile(currentSession.user.id)
          dispatch(
            setCredentials({
              user: currentSession.user,
              session: currentSession,
              role: profile?.role || currentSession.user.user_metadata?.role || 'manager',
            })
          )
        } else if (isMounted) {
          dispatch(setLoading(false))
        }
      } catch (err) {
        if (isMounted) dispatch(setLoading(false))
      }
    }

    initSession()

    // Listen to Supabase Auth state changes
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
    let authListener = null

    if (!isPlaceholder) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (newSession) {
          const profile = await authApi.getUserProfile(newSession.user.id)
          dispatch(
            setCredentials({
              user: newSession.user,
              session: newSession,
              role: profile?.role || newSession.user.user_metadata?.role || 'manager',
            })
          )
        } else {
          dispatch(clearCredentials())
        }
      })
      authListener = data?.subscription
    }

    return () => {
      isMounted = false
      if (authListener) authListener.unsubscribe()
    }
  }, [dispatch])

  const login = useCallback(
    async (email, password) => {
      dispatch(setLoading(true))
      const result = await authApi.signIn(email, password)
      if (result.error) {
        dispatch(setLoading(false))
        return { success: false, error: result.error }
      }

      dispatch(
        setCredentials({
          user: result.user,
          session: result.session,
          role: result.role,
        })
      )
      return { success: true, role: result.role }
    },
    [dispatch]
  )

  const logout = useCallback(async () => {
    await authApi.signOut()
    dispatch(clearCredentials())
  }, [dispatch])

  return {
    user,
    role,
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}

