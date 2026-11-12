import { supabase } from '@/services/supabase/client'

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const mockStandings = [
  { team_id: 't-1', team_name: 'Team Alpha', short_code: 'ALP', matches_played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
  { team_id: 't-2', team_name: 'Team Beta', short_code: 'BET', matches_played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
  { team_id: 't-3', team_name: 'Team Gamma', short_code: 'GAM', matches_played: 0, won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0, goal_difference: 0, points: 0 },
]

export const standingsApi = {
  async getStandings() {
    if (isPlaceholder) {
      return { data: mockStandings, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('standings_view')
        .select('*')

      if (error) throw error
      return { data: data || mockStandings, error: null }
    } catch (err) {
      return { data: mockStandings, error: null }
    }
  },

  async getPlayerStats() {
    if (isPlaceholder) {
      return { data: [], error: null }
    }

    try {
      const { data, error } = await supabase
        .from('player_stats_view')
        .select('*')
        .order('goals', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return { data: [], error: null }
    }
  },
}

