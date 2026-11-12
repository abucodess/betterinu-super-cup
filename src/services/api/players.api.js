import { supabase } from '@/services/supabase/client'

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

let mockPlayers = [
  // 3 Goalkeepers
  { id: 'p-1', name: 'David De Gea', jersey_number: 1, position: 'GK', is_goalkeeper: true, team_id: null },
  { id: 'p-2', name: 'Manuel Neuer', jersey_number: 12, position: 'GK', is_goalkeeper: true, team_id: null },
  { id: 'p-3', name: 'Thibaut Courtois', jersey_number: 13, position: 'GK', is_goalkeeper: true, team_id: null },
  // 12 Outfield Players
  { id: 'p-4', name: 'Virgil van Dijk', jersey_number: 4, position: 'CB', is_goalkeeper: false, team_id: null },
  { id: 'p-5', name: 'Sergio Ramos', jersey_number: 5, position: 'CB', is_goalkeeper: false, team_id: null },
  { id: 'p-6', name: 'Ruben Dias', jersey_number: 3, position: 'CB', is_goalkeeper: false, team_id: null },
  { id: 'p-7', name: 'Kevin De Bruyne', jersey_number: 7, position: 'MF', is_goalkeeper: false, team_id: null },
  { id: 'p-8', name: 'Luka Modric', jersey_number: 10, position: 'MF', is_goalkeeper: false, team_id: null },
  { id: 'p-9', name: 'Rodri Hernandez', jersey_number: 16, position: 'MF', is_goalkeeper: false, team_id: null },
  { id: 'p-10', name: 'Jude Bellingham', jersey_number: 8, position: 'MF', is_goalkeeper: false, team_id: null },
  { id: 'p-11', name: 'Erling Haaland', jersey_number: 9, position: 'FW', is_goalkeeper: false, team_id: null },
  { id: 'p-12', name: 'Kylian Mbappe', jersey_number: 11, position: 'FW', is_goalkeeper: false, team_id: null },
  { id: 'p-13', name: 'Vinicius Junior', jersey_number: 77, position: 'FW', is_goalkeeper: false, team_id: null },
  { id: 'p-14', name: 'Bukayo Saka', jersey_number: 20, position: 'FW', is_goalkeeper: false, team_id: null },
  { id: 'p-15', name: 'Phil Foden', jersey_number: 47, position: 'FW', is_goalkeeper: false, team_id: null },
]

export const playersApi = {
  async getPlayers(filter = {}) {
    if (isPlaceholder) {
      let filtered = [...mockPlayers]
      if (filter.unallocated) {
        filtered = filtered.filter((p) => p.team_id === null)
      }
      if (filter.is_goalkeeper !== undefined) {
        filtered = filtered.filter((p) => p.is_goalkeeper === filter.is_goalkeeper)
      }
      if (filter.team_id) {
        filtered = filtered.filter((p) => p.team_id === filter.team_id)
      }
      return { data: filtered, error: null }
    }

    try {
      let query = supabase
        .from('players')
        .select('*, team:teams(id, name, short_code)')
        .order('name', { ascending: true })

      if (filter.unallocated) {
        query = query.is('team_id', null)
      }
      if (filter.is_goalkeeper !== undefined) {
        query = query.eq('is_goalkeeper', filter.is_goalkeeper)
      }
      if (filter.team_id) {
        query = query.eq('team_id', filter.team_id)
      }

      const { data, error } = await query
      if (error) throw error
      return { data: data || mockPlayers, error: null }
    } catch (err) {
      return { data: mockPlayers, error: null }
    }
  },

  async addPlayer(playerData) {
    if (isPlaceholder) {
      const newPlayer = {
        id: `p-${Date.now()}`,
        ...playerData,
        is_goalkeeper: playerData.position === 'GK',
        team_id: null,
      }
      mockPlayers.push(newPlayer)
      return { data: newPlayer, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  },

  async updatePlayer(id, updates) {
    if (isPlaceholder) {
      const index = mockPlayers.findIndex((p) => p.id === id)
      if (index !== -1) {
        Object.assign(mockPlayers[index], updates)
        if (updates.position) {
          mockPlayers[index].is_goalkeeper = updates.position === 'GK'
        }
      }
      return { data: mockPlayers[index], error: null }
    }

    try {
      const { data, error } = await supabase
        .from('players')
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

