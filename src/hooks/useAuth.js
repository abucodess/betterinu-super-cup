import { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { setCredentials, clearCredentials } from '@/store/slices/auth.slice'
import { authApi } from '@/services/api/auth.api'
import { supabase } from '@/services/supabase/client'
import { getStaffDashboard } from '@/utils/staffRoles'

export function useAuth() {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const { user, profile, role, session, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    let active = true
    let revision = 0
    let profileTimer

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return
      const current = ++revision
      window.clearTimeout(profileTimer)
      if (!newSession?.user) {
        dispatch(clearCredentials())
        return
      }

      // Supabase requests must run after the auth callback releases its lock.
      profileTimer = window.setTimeout(async () => {
        let verifiedProfile
        try {
          verifiedProfile = await authApi.getUserProfile(newSession.user.id)
        } catch {
          // A failed profile lookup cannot authorize a staff session.
        }

        if (current !== revision) return
        if (!getStaffDashboard(verifiedProfile?.role)) {
          dispatch(clearCredentials())
          return
        }

        dispatch(setCredentials({
          user: newSession.user,
          profile: verifiedProfile,
          session: newSession,
          role: verifiedProfile.role,
        }))
      }, 0)
    })

    return () => {
      active = false
      revision++
      window.clearTimeout(profileTimer)
      data?.subscription?.unsubscribe()
    }
  }, [dispatch])

  const login = useCallback(
    async (email, password) => {
      const result = await authApi.signIn(email, password)
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
