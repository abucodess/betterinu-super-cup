import { supabase } from '@/services/supabase/client'

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

let mockMatches = [
  {
    id: 'm-1',
    match_number: 1,
    home_team_id: '22222222-2222-2222-2222-222222222221',
    away_team_id: '22222222-2222-2222-2222-222222222222',
    home_team: { name: 'Team Alpha', short_code: 'ALP' },
    away_team: { name: 'Team Beta', short_code: 'BET' },
    scheduled_at: new Date().toISOString(),
    venue: 'Main Institute Ground',
    status: 'live',
    current_minute: 14,
    home_score: 0,
    away_score: 0,
  },
  {
    id: 'm-2',
    match_number: 2,
    home_team_id: '22222222-2222-2222-2222-222222222222',
    away_team_id: '22222222-2222-2222-2222-222222222223',
    home_team: { name: 'Team Beta', short_code: 'BET' },
    away_team: { name: 'Team Gamma', short_code: 'GAM' },
    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
    venue: 'Main Institute Ground',
    status: 'scheduled',
    current_minute: 0,
    home_score: 0,
    away_score: 0,
  },
  {
    id: 'm-3',
    match_number: 3,
    home_team_id: '22222222-2222-2222-2222-222222222223',
    away_team_id: '22222222-2222-2222-2222-222222222221',
    home_team: { name: 'Team Gamma', short_code: 'GAM' },
    away_team: { name: 'Team Alpha', short_code: 'ALP' },
    scheduled_at: new Date(Date.now() + 172800000).toISOString(),
    venue: 'Main Institute Ground',
    status: 'scheduled',
    current_minute: 0,
    home_score: 0,
    away_score: 0,
  },
]

let mockEvents = [
  { id: 'ev-1', match_id: 'm-1', event_type: 'PERIOD_START', minute: 0, desc: 'Match Commenced' },
]

export const matchesApi = {
  async getMatches() {
    if (isPlaceholder) {
      return { data: mockMatches, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, short_code, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_code, logo_url)
        `)
        .order('match_number', { ascending: true })

      if (error) throw error
      return { data: data || mockMatches, error: null }
    } catch (err) {
      return { data: mockMatches, error: null }
    }
  },

  async getMatchById(matchId) {
    if (isPlaceholder) {
      const match = mockMatches.find((m) => m.id === matchId) || mockMatches[0]
      return { data: match, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, short_code, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, short_code, logo_url),
          events:match_events(*)
        `)
        .eq('id', matchId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: mockMatches[0], error: null }
    }
  },

  async getMatchEvents(matchId) {
    if (isPlaceholder) {
      return { data: mockEvents.filter((e) => e.match_id === matchId), error: null }
    }
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          *,
          player:players(name, jersey_number),
          team:teams(name, short_code)
        `)
        .eq('match_id', matchId)
        .order('minute', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return { data: [], error: err.message }
    }
  },

  async recordMatchEvent({ matchId, teamId, playerId, eventType, minute, recordedBy }) {
    if (isPlaceholder) {
      const match = mockMatches.find((m) => m.id === matchId) || mockMatches[0]
      if (eventType === 'GOAL') {
        if (teamId === match.home_team_id) match.home_score += 1
        else match.away_score += 1
      }
      const newEvent = {
        id: `ev-${Date.now()}`,
        match_id: matchId,
        team_id: teamId,
        player_id: playerId,
        event_type: eventType,
        minute,
        recorded_by: recordedBy,
        created_at: new Date().toISOString(),
      }
      mockEvents.unshift(newEvent)
      return { success: true, home_score: match.home_score, away_score: match.away_score }
    }

    try {
      const { data, error } = await supabase.rpc('record_match_event', {
        p_match_id: matchId,
        p_team_id: teamId,
        p_player_id: playerId,
        p_event_type: eventType,
        p_minute: minute,
        p_recorded_by: recordedBy,
      })

      if (error) throw error
      return { success: true, ...data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  async undoLastEvent(matchId, recordedBy) {
    if (isPlaceholder) {
      const match = mockMatches.find((m) => m.id === matchId) || mockMatches[0]
      const last = mockEvents.shift()
      if (last && last.event_type === 'GOAL') {
        if (last.team_id === match.home_team_id && match.home_score > 0) match.home_score -= 1
        else if (match.away_score > 0) match.away_score -= 1
      }
      return { success: true, undone: last?.event_type }
    }

    try {
      const { data, error } = await supabase.rpc('undo_last_match_event', {
        p_match_id: matchId,
        p_recorded_by: recordedBy,
      })

      if (error) throw error
      return { success: true, ...data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  async updateMatchStatus(matchId, status, currentMinute) {
    if (isPlaceholder) {
      const match = mockMatches.find((m) => m.id === matchId)
      if (match) {
        match.status = status
        if (currentMinute !== undefined) match.current_minute = currentMinute
      }
      return { success: true }
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .update({ status, current_minute: currentMinute, updated_at: new Date().toISOString() })
        .eq('id', matchId)

      if (error) throw error
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },
}

