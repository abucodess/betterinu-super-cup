import { supabase } from '../supabase/client';

export const notificationsApi = {
  async getMatchActivity(tournamentId) {
    const activity = [];
    const pageSize = 200;

    for (let offset = 0; ; offset += pageSize) {
      let query = supabase.from('public_match_notifications')
        .select('id, match_id, kind, status, home_team_id, away_team_id, home_team_name, away_team_name, scheduled_at, venue, home_score, away_score, published_at, revision')
        .order('published_at', { ascending: false })
        .order('id', { ascending: false })
        .range(offset, offset + pageSize - 1);
      if (tournamentId) query = query.eq('tournament_id', tournamentId);

      const { data, error } = await query;
      if (error?.code === 'PGRST205' || error?.code === '42P01') return null;
      if (error) throw new Error(error.message);
      activity.push(...data);
      if (data.length < pageSize) return activity;
    }
  },

  async getLeagueAnnouncements(tournamentId) {
    let query = supabase.from('announcements')
      .select('id, title, content, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (tournamentId) query = query.eq('tournament_id', tournamentId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },
};
