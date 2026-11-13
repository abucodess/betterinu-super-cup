import { supabase } from '../supabase/client';

export const matchesApi = {
  async getMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, short_code, logo_url, color_code),
        away_team:teams!matches_away_team_id_fkey(id, name, short_code, logo_url, color_code),
        referee:profiles!matches_referee_id_fkey(id, full_name, email)
      `)
      .order('match_number', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((m) => ({
      ...m,
      kickoff_time: m.kickoff_time || m.scheduled_at,
    }));
  },

  async getMatchById(matchId) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, short_code, logo_url, color_code),
        away_team:teams!matches_away_team_id_fkey(id, name, short_code, logo_url, color_code),
        referee:profiles!matches_referee_id_fkey(id, full_name, email),
        events:match_events(*)
      `)
      .eq('id', matchId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async getMatchEvents(matchId) {
    let query = supabase
      .from('match_events')
      .select(`
        *,
        player:players(id, name, jersey_number, position),
        team:teams(id, name, short_code, color_code)
      `)
      .order('minute', { ascending: false })
      .order('created_at', { ascending: false });

    if (matchId) {
      query = query.eq('match_id', matchId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async getAllMatchEvents() {
    return this.getMatchEvents(null);
  },

  async createMatch(matchData) {
    if (matchData.home_team_id === matchData.away_team_id) {
      throw new Error('Home team and Away team must be different.');
    }

    const payload = {
      tournament_id: matchData.tournament_id || '11111111-1111-1111-1111-111111111111',
      match_number: Number(matchData.match_number) || 1,
      home_team_id: matchData.home_team_id,
      away_team_id: matchData.away_team_id,
      scheduled_at:
        matchData.kickoff_time || matchData.scheduled_at || new Date().toISOString(),
      venue: matchData.venue || 'Main Institute Ground',
      status: matchData.status || 'scheduled',
      referee_id: matchData.referee_id || 'a0000000-0000-0000-0000-000000000005',
    };

    const { data, error } = await supabase
      .from('matches')
      .insert([payload])
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, short_code, logo_url, color_code),
        away_team:teams!matches_away_team_id_fkey(id, name, short_code, logo_url, color_code)
      `)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateMatch(matchId, updates) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    delete cleanUpdates.home_team;
    delete cleanUpdates.away_team;
    delete cleanUpdates.referee;
    delete cleanUpdates.events;
    delete cleanUpdates.kickoff_time;

    const { data, error } = await supabase
      .from('matches')
      .update(cleanUpdates)
      .eq('id', matchId)
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey(id, name, short_code, logo_url, color_code),
        away_team:teams!matches_away_team_id_fkey(id, name, short_code, logo_url, color_code)
      `)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteMatch(matchId) {
    const { error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async recordMatchEvent({
    matchId,
    teamId,
    playerId,
    eventType,
    minute,
    recordedBy,
    extraInfo = null,
  }) {
    let resolvedRefereeId = recordedBy;
    if (!resolvedRefereeId) {
      const { data: sessionData } = await supabase.auth.getSession();
      resolvedRefereeId =
        sessionData?.session?.user?.id || 'a0000000-0000-0000-0000-000000000005';
    }

    const { data, error } = await supabase.rpc('record_match_event', {
      p_match_id: matchId,
      p_team_id: teamId,
      p_player_id: playerId,
      p_event_type: eventType,
      p_minute: Number(minute) || 1,
      p_recorded_by: resolvedRefereeId,
    });

    if (error) throw new Error(error.message);

    if (extraInfo && Object.keys(extraInfo).length > 0) {
      const { data: latestEvents } = await supabase
        .from('match_events')
        .select('id')
        .eq('match_id', matchId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (latestEvents && latestEvents[0]) {
        await supabase
          .from('match_events')
          .update({ extra_info: extraInfo })
          .eq('id', latestEvents[0].id);
      }
    }

    return data;
  },

  async undoLastEvent(matchId, recordedBy) {
    let resolvedRefereeId = recordedBy;
    if (!resolvedRefereeId) {
      const { data: sessionData } = await supabase.auth.getSession();
      resolvedRefereeId =
        sessionData?.session?.user?.id || 'a0000000-0000-0000-0000-000000000005';
    }

    const { data, error } = await supabase.rpc('undo_last_match_event', {
      p_match_id: matchId,
      p_recorded_by: resolvedRefereeId,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async updateMatchStatus(matchId, status, period, timerSeconds) {
    const updates = { status, updated_at: new Date().toISOString() };
    if (timerSeconds !== undefined) {
      updates.current_minute = Math.max(0, Math.floor(Number(timerSeconds) / 60));
    }

    const { error } = await supabase.from('matches').update(updates).eq('id', matchId);
    if (error) throw new Error(error.message);
    return { success: true };
  },
};

export default matchesApi;
