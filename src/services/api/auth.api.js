import { supabase } from '@/services/supabase/client'

/**
 * Authentication API Service adhering to ARCHITECTURE.md §7 & §10.2
 */

export const authApi = {
  /**
   * Signs in user with email and password via Supabase Auth
   */
  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase()
    
    // Check if using placeholder credentials in development
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

    if (isPlaceholder) {
      // Development mock fallback when live Supabase is not yet connected
      let mockRole = 'super_admin'
      if (cleanEmail.includes('manager')) mockRole = 'manager'
      if (cleanEmail.includes('referee')) mockRole = 'referee'

      return {
        user: {
          id: `dev-${mockRole}-id`,
          email: cleanEmail,
          user_metadata: { full_name: cleanEmail.split('@')[0], role: mockRole },
        },
        session: { access_token: 'dev-token', expires_at: Date.now() + 3600000 },
        role: mockRole,
        error: null,
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        return { user: null, session: null, role: null, error: error.message }
      }

      // Fetch user role from profiles table
      const profile = await this.getUserProfile(data.user.id)

      return {
        user: data.user,
        session: data.session,
        role: profile?.role || data.user.user_metadata?.role || 'manager',
        error: null,
      }
    } catch (err) {
      return { user: null, session: null, role: null, error: err.message || 'Authentication failed' }
    }
  },

  /**
   * Signs out current user
   */
  async signOut() {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
    if (!isPlaceholder) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('[Auth] Signout warning:', err.message)
      }
    }
    return { success: true }
  },

  /**
   * Retrieves active session
   */
  async getSession() {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
    if (isPlaceholder) return null

    try {
      const { data } = await supabase.auth.getSession()
      return data?.session || null
    } catch (err) {
      return null
    }
  },

  /**
   * Retrieves user profile and role from PostgreSQL public.profiles
   */
  async getUserProfile(userId) {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                          import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
    if (isPlaceholder) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('[Auth] Could not fetch profile:', error.message)
        return null
      }
      return data
    } catch (err) {
      return null
    }
  },
}

