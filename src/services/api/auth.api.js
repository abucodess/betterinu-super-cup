import { supabase } from '../supabase/client';
import { getStaffDashboard } from '../../utils/staffRoles';

/**
 * Production Authentication & Management Profile Service
 * Enforces strict Supabase Auth and database-backed role verification.
 */
export const authApi = {
  async signIn(email, password) {
    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw error;
    }

    const profile = await this.getUserProfile(data.user.id);
    const verifiedRole = profile?.role;

    if (!getStaffDashboard(verifiedRole)) {
      await supabase.auth.signOut({ scope: 'local' });
      throw Object.assign(new Error('Staff access is unavailable for this account.'), { code: 'staff_access_unavailable' });
    }

    return {
      user: data.user,
      profile,
      session: data.session,
      role: verifiedRole,
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async resetPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data?.session || null;
  },

  async getUserProfile(userId) {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('role', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async updateProfile(profileId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export default authApi;
