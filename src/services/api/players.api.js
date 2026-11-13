import { supabase } from '../supabase/client';

export const playersApi = {
  async getPlayers(filter = {}) {
    let query = supabase
      .from('players')
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .order('position', { ascending: true })
      .order('name', { ascending: true });

    if (filter.unallocated) {
      query = query.is('team_id', null);
    }
    if (filter.is_goalkeeper !== undefined) {
      query = query.eq('is_goalkeeper', filter.is_goalkeeper);
    }
    if (filter.team_id) {
      query = query.eq('team_id', filter.team_id);
    }
    if (filter.position && filter.position !== 'ALL') {
      query = query.eq('position', filter.position);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getPlayerById(playerId) {
    const { data, error } = await supabase
      .from('players')
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .eq('id', playerId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async addPlayer(playerData) {
    const cleanName = (playerData.name || '').trim();
    if (!cleanName) {
      throw new Error('Player name is required.');
    }

    const { data: existing } = await supabase
      .from('players')
      .select('id, name')
      .ilike('name', cleanName);

    if (existing && existing.length > 0) {
      throw new Error(`Player "${cleanName}" is already registered.`);
    }

    const payload = {
      name: cleanName,
      jersey_number: Number(playerData.jersey_number) || 1,
      position: playerData.position || 'MF',
      photo_url: playerData.photo_url || null,
      team_id: playerData.team_id || null,
      tournament_id: playerData.tournament_id || '11111111-1111-1111-1111-111111111111',
    };

    const { data, error } = await supabase
      .from('players')
      .insert([payload])
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async bulkAddPlayers(playersArray = [], tournamentId = '11111111-1111-1111-1111-111111111111') {
    if (!Array.isArray(playersArray) || playersArray.length === 0) {
      throw new Error('No valid player entries provided.');
    }

    const rows = playersArray.map((p) => ({
      name: String(p.name || '').trim(),
      jersey_number: Number(p.jersey_number) || 1,
      position: ['GK', 'CB', 'MF', 'FW'].includes(p.position) ? p.position : 'MF',
      photo_url: p.photo_url || null,
      tournament_id: p.tournament_id || tournamentId,
    }));

    const { data, error } = await supabase
      .from('players')
      .insert(rows)
      .select('*, team:teams(id, name, short_code, color_code, logo_url)');

    if (error) throw new Error(error.message);
    return data || [];
  },

  async updatePlayer(id, updates) {
    if (!id) throw new Error('Player ID is required.');

    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    delete cleanUpdates.is_goalkeeper;
    delete cleanUpdates.team;

    if (cleanUpdates.name !== undefined) {
      const cleanName = String(cleanUpdates.name).trim();
      if (!cleanName) {
        throw new Error('Player name cannot be empty.');
      }
      cleanUpdates.name = cleanName;

      const { data: existing } = await supabase
        .from('players')
        .select('id, name')
        .ilike('name', cleanName)
        .neq('id', id);

      if (existing && existing.length > 0) {
        throw new Error(`Another player named "${cleanName}" already exists.`);
      }
    }

    const { data, error } = await supabase
      .from('players')
      .update(cleanUpdates)
      .eq('id', id)
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deletePlayer(id) {
    if (!id) throw new Error('Player ID is required for deletion.');

    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, deletedId: id };
  },

  async deleteAllPlayers() {
    const { error } = await supabase
      .from('players')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw new Error(error.message);
    return { success: true };
  },
};

export default playersApi;
