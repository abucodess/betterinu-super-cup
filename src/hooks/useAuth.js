import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { setCredentials, clearCredentials, setLoading } from '@/store/slices/auth.slice'
import { authApi } from '@/services/api/auth.api'
import { supabase } from '@/services/supabase/client'

export function useAuth() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { user, profile, role, session, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    let isMounted = true

    async function initSession() {
      try {
        const currentSession = await authApi.getSession()
        if (currentSession?.user && isMounted) {
          const userProfile = await authApi.getUserProfile(currentSession.user.id)
          const verifiedRole = userProfile?.role || currentSession.user.user_metadata?.role || null
          if (verifiedRole) {
            dispatch(
              setCredentials({
                user: currentSession.user,
                profile: userProfile,
                session: currentSession,
                role: verifiedRole,
              })
            )
          } else {
            dispatch(clearCredentials())
          }
        } else if (isMounted) {
          dispatch(setLoading(false))
        }
      } catch (err) {
        if (isMounted) dispatch(setLoading(false))
      }
    }

    initSession()

    const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return
      if (newSession?.user) {
        const userProfile = await authApi.getUserProfile(newSession.user.id)
        const verifiedRole = userProfile?.role || newSession.user.user_metadata?.role || null
        if (verifiedRole) {
          dispatch(
            setCredentials({
              user: newSession.user,
              profile: userProfile,
              session: newSession,
              role: verifiedRole,
            })
          )
        } else {
          dispatch(clearCredentials())
        }
      } else {
        dispatch(clearCredentials())
      }
    })

    return () => {
      isMounted = false
      data?.subscription?.unsubscribe()
    }
  }, [dispatch])

  const login = useCallback(
    async (email, password) => {
      dispatch(setLoading(true))
      const result = await authApi.signIn(email, password)
      if (result.error || !result.role) {
        dispatch(setLoading(false))
        return {
          success: false,
          error: result.error || 'Account does not have an authorized tournament management role.',
        }
      }

      dispatch(
        setCredentials({
          user: result.user,
          profile: result.profile,
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
    queryClient.clear()
  }, [dispatch, queryClient])

  return {
    user,
    profile,
    role,
    session,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}
