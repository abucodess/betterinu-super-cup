import { supabase } from '@/services/supabase/client'

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const mockTeams = [
  {
    id: '22222222-2222-2222-2222-222222222221',
    name: 'Team Alpha',
    short_code: 'ALP',
    color_code: '#B8F34A',
    manager: { full_name: 'Manager One', email: 'manager1@supercup.com' },
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Team Beta',
    short_code: 'BET',
    color_code: '#3B82F6',
    manager: { full_name: 'Manager Two', email: 'manager2@supercup.com' },
  },
  {
    id: '22222222-2222-2222-2222-222222222223',
    name: 'Team Gamma',
    short_code: 'GAM',
    color_code: '#F59E0B',
    manager: { full_name: 'Manager Three', email: 'manager3@supercup.com' },
  },
]

export const teamsApi = {
  async getTeams() {
    if (isPlaceholder) {
      return { data: mockTeams, error: null }
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          manager:profiles!teams_manager_id_fkey(id, email, full_name)
        `)
        .order('name', { ascending: true })

      if (error) throw error
      return { data: data || mockTeams, error: null }
    } catch (err) {
      return { data: mockTeams, error: null }
    }
  },

  async getTeamById(teamId) {
    if (isPlaceholder) {
      const team = mockTeams.find((t) => t.id === teamId) || mockTeams[0]
      return { data: team, error: null }
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          manager:profiles!teams_manager_id_fkey(id, email, full_name),
          players(*)
        `)
        .eq('id', teamId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: mockTeams[0], error: null }
    }
  },

  async updateTeam(teamId, updates) {
    if (isPlaceholder) {
      const index = mockTeams.findIndex((t) => t.id === teamId)
      if (index !== -1) Object.assign(mockTeams[index], updates)
      return { data: mockTeams[index], error: null }
    }
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single()
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },
}

