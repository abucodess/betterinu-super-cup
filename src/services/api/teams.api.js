import { supabase } from '../supabase/client';

export const teamsApi = {
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        manager:profiles!teams_manager_id_fkey(id, email, full_name, role, avatar_url)
      `)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async getTeamById(teamId) {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        manager:profiles!teams_manager_id_fkey(id, email, full_name, role, avatar_url),
        players(*)
      `)
      .eq('id', teamId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async createTeam(teamData) {
    const payload = {
      name: teamData.name.trim(),
      short_code: teamData.short_code.trim().toUpperCase().slice(0, 4),
      color_code: teamData.color_code || '#B8F34A',
      logo_url: teamData.logo_url || null,
      manager_id: teamData.manager_id || null,
      tournament_id: teamData.tournament_id || '11111111-1111-1111-1111-111111111111',
    };

    const { data, error } = await supabase
      .from('teams')
      .insert([payload])
      .select(`
        *,
        manager:profiles!teams_manager_id_fkey(id, email, full_name, role, avatar_url)
      `)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateTeam(teamId, updates) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    delete cleanUpdates.manager;
    delete cleanUpdates.players;

    const { data, error } = await supabase
      .from('teams')
      .update(cleanUpdates)
      .eq('id', teamId)
      .select(`
        *,
        manager:profiles!teams_manager_id_fkey(id, email, full_name, role, avatar_url)
      `)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export default teamsApi;
