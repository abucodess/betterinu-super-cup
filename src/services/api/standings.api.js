import { supabase } from '../supabase/client';

export const standingsApi = {
  async getStandings() {
    const [{ data: standingsData, error: stErr }, { data: teamsData }] = await Promise.all([
      supabase.from('standings_view').select('*'),
      supabase.from('teams').select('id, color_code'),
    ]);

    if (stErr) throw new Error(stErr.message);

    const colorMap = {};
    (teamsData || []).forEach((t) => {
      colorMap[t.id] = t.color_code;
    });

    return (standingsData || []).map((row) => ({
      ...row,
      played: row.matches_played ?? row.played ?? 0,
      color_code: row.color_code || colorMap[row.team_id] || '#B8F34A',
    }));
  },

  async getPlayerStats() {
    const [{ data: statsData, error: stErr }, { data: playersData }] = await Promise.all([
      supabase
        .from('player_stats_view')
        .select('*')
        .order('goals', { ascending: false })
        .order('player_name', { ascending: true }),
      supabase.from('players').select('id, jersey_number'),
    ]);

    if (stErr) throw new Error(stErr.message);

    const jerseyMap = {};
    (playersData || []).forEach((p) => {
      jerseyMap[p.id] = p.jersey_number;
    });

    return (statsData || []).map((row) => ({
      ...row,
      name: row.player_name || row.name,
      jersey_number: row.jersey_number ?? jerseyMap[row.player_id] ?? 10,
    }));
  },
};

export default standingsApi;
