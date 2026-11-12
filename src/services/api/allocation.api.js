import { supabase } from '@/services/supabase/client'
import { playersApi } from './players.api'

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || 
                      import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const mockHistory = []

export const allocationApi = {
  /**
   * Transactional player allocation to team
   */
  async allocatePlayer({ playerId, teamId, adminId }) {
    if (isPlaceholder) {
      // Mock validation in dev
      const { data: players } = await playersApi.getPlayers()
      const player = players.find((p) => p.id === playerId)
      if (!player) return { success: false, error: 'Player not found.' }

      const assignedToTeam = players.filter((p) => p.team_id === teamId)
      if (assignedToTeam.length >= 5) {
        return { success: false, error: 'Team already has the maximum of 5 players.' }
      }

      if (player.is_goalkeeper && assignedToTeam.some((p) => p.is_goalkeeper)) {
        return { success: false, error: 'Team already has an assigned goalkeeper (max 1 GK).' }
      }

      if (!player.is_goalkeeper && assignedToTeam.filter((p) => !p.is_goalkeeper).length >= 4) {
        return { success: false, error: 'Team already has 4 outfield players assigned (max 4).' }
      }

      await playersApi.updatePlayer(playerId, { team_id: teamId })
      mockHistory.unshift({
        id: `alloc-${Date.now()}`,
        player_id: playerId,
        team_id: teamId,
        created_at: new Date().toISOString(),
      })

      return { success: true, message: 'Player successfully allocated.' }
    }

    try {
      const { data, error } = await supabase.rpc('allocate_player_transaction', {
        p_player_id: playerId,
        p_team_id: teamId,
        p_admin_id: adminId,
      })

      if (error) throw error
      return { success: true, data }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  /**
   * Resets all player allocations back to unassigned (Super Admin only)
   */
  async resetAllocations() {
    if (isPlaceholder) {
      mockHistory.length = 0
      return { success: true }
    }
    try {
      const { error: pErr } = await supabase
        .from('players')
        .update({ team_id: null })
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (pErr) throw pErr

      const { error: hErr } = await supabase
        .from('allocation_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (hErr) throw hErr

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  },

  async getAllocationHistory() {
    if (isPlaceholder) {
      return { data: mockHistory, error: null }
    }

    try {
      const { data, error } = await supabase
        .from('allocation_history')
        .select(`
          *,
          player:players(id, name, position),
          team:teams(id, name, short_code)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data: data || [], error: null }
    } catch (err) {
      return { data: [], error: null }
    }
  },
}

