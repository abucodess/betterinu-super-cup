import { supabase } from '@/services/supabase/client'

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const mockTournaments = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Institute Football League 2026',
    description: 'Official annual institute inter-departmental championship.',
    status: 'draft',
    start_date: '2026-11-15',
    end_date: '2026-11-29',
  },
]

export const tournamentsApi = {
  async getActiveTournament() {
    if (isPlaceholder) {
      return { data: mockTournaments[0], error: null }
    }
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return { data: data || mockTournaments[0], error: null }
    } catch (err) {
      return { data: mockTournaments[0], error: null }
    }
  },

  async updateTournament(id, updates) {
    if (isPlaceholder) {
      Object.assign(mockTournaments[0], updates)
      return { data: mockTournaments[0], error: null }
    }
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },
}

