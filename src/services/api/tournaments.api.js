import { supabase } from '../supabase/client';

export const tournamentsApi = {
  async getActiveTournament() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data || null;
  },

  async updateTournament(id, updates) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('tournaments')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getAnnouncements(tournamentId) {
    let query = supabase
      .from('announcements')
      .select('*, author:profiles(id, full_name, email)')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (tournamentId) {
      query = query.eq('tournament_id', tournamentId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((a) => ({
      ...a,
      body: a.body || a.content || '',
    }));
  },

  async createAnnouncement(payload) {
    let authorId = payload.author_id;
    if (!authorId) {
      const { data: sessionData } = await supabase.auth.getSession();
      authorId =
        sessionData?.session?.user?.id || 'a0000000-0000-0000-0000-000000000001';
    }

    const { data, error } = await supabase
      .from('announcements')
      .insert([
        {
          tournament_id: payload.tournament_id || '11111111-1111-1111-1111-111111111111',
          title: payload.title.trim(),
          content: (payload.body || payload.content || '').trim(),
          is_pinned: Boolean(payload.is_pinned),
          author_id: authorId,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteAnnouncement(id) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },
};

export default tournamentsApi;
