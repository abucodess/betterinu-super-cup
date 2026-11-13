import { supabase } from '../supabase/client';

const DRAFT_CHANNEL_NAME = 'supercup_live_draft_v1';
let broadcastChannel = null;

function getOrCreateBroadcastChannel() {
  if (!supabase) return null;
  if (!broadcastChannel) {
    broadcastChannel = supabase.channel(DRAFT_CHANNEL_NAME, {
      config: {
        broadcast: { self: true },
      },
    });
    broadcastChannel.subscribe();
  }
  return broadcastChannel;
}

function emitLiveDraftEvent(payload) {
  const eventPayload = {
    ...payload,
    timestamp: Date.now(),
  };

  // 1. Broadcast over Supabase Realtime WebSocket channel to all devices
  try {
    const channel = getOrCreateBroadcastChannel();
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'draft_update',
        payload: eventPayload,
      });
    }
  } catch {
    // Ignore broadcast errors
  }

  // 2. Also emit via localStorage for instant (<10ms) multi-window sync on the same machine
  try {
    localStorage.setItem('supercup_draft_event', JSON.stringify(eventPayload));
  } catch {
    // Ignore storage errors
  }
}

export const allocationApi = {
  /**
   * Assigns or moves a player to a target team (or unassigns if teamId is null).
   * Persists directly to Supabase `players` table and broadcasts live to all public screens.
   */
  async assignPlayerToTeam({ playerId, teamId, adminId }) {
    if (!playerId) {
      throw new Error('Player ID is required.');
    }

    const cleanTeamId = teamId || null;

    const { data: updatedPlayer, error: updateErr } = await supabase
      .from('players')
      .update({
        team_id: cleanTeamId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', playerId)
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .single();

    if (updateErr) {
      throw new Error(updateErr.message);
    }

    // Record non-blocking history audit log when assigning to a team
    if (cleanTeamId) {
      try {
        let resolvedAdminId = adminId;
        if (!resolvedAdminId) {
          const { data: sessionData } = await supabase.auth.getSession();
          resolvedAdminId =
            sessionData?.session?.user?.id || 'a0000000-0000-0000-0000-000000000001';
        }
        await supabase.from('allocation_history').insert([
          {
            player_id: playerId,
            team_id: cleanTeamId,
            allocated_by: resolvedAdminId,
            action_type: 'ALLOCATE',
          },
        ]);
      } catch {
        // Non-critical history logging
      }
    }

    emitLiveDraftEvent({
      action: cleanTeamId ? 'ASSIGNED' : 'RELEASED',
      playerId: updatedPlayer.id,
      playerName: updatedPlayer.name,
      playerPhotoUrl: updatedPlayer.photo_url,
      playerPosition: updatedPlayer.position,
      playerJersey: updatedPlayer.jersey_number,
      teamId: cleanTeamId,
      teamName: updatedPlayer.team?.name || null,
      teamShortCode: updatedPlayer.team?.short_code || null,
      teamColor: updatedPlayer.team?.color_code || null,
    });

    return updatedPlayer;
  },

  // Alias for backward compatibility
  async allocatePlayer({ playerId, teamId, adminId }) {
    return this.assignPlayerToTeam({ playerId, teamId, adminId });
  },

  async releasePlayer(playerOrPayload) {
    const playerId =
      typeof playerOrPayload === 'string' ? playerOrPayload : playerOrPayload?.playerId;
    return this.assignPlayerToTeam({ playerId, teamId: null });
  },

  async resetAllocations() {
    const { error: pErr } = await supabase
      .from('players')
      .update({ team_id: null, updated_at: new Date().toISOString() })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (pErr) throw new Error(pErr.message);

    try {
      await supabase
        .from('allocation_history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
    } catch {
      // Ignore history cleanup error
    }

    emitLiveDraftEvent({
      action: 'RESET_ALL',
    });

    return { success: true };
  },

  async getAllocationHistory() {
    const { data, error } = await supabase
      .from('allocation_history')
      .select(`
        *,
        player:players(id, name, position, jersey_number, photo_url),
        team:teams(id, name, short_code, color_code)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => ({
      ...row,
      pool_category:
        row.pool_category ||
        (row.player?.position === 'GK' ? 'GK' : 'OUTFIELD'),
    }));
  },

  /**
   * Subscribes to live player-to-team assignments across:
   * 1. Supabase Realtime Broadcast ('draft_update')
   * 2. Supabase Realtime postgres_changes on `players` and `teams`
   * 3. Cross-window localStorage events ('supercup_draft_event')
   */
  subscribeToLiveDraft(onEvent) {
    const handleStorage = (e) => {
      if (e.key === 'supercup_draft_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (onEvent) onEvent(parsed);
        } catch {
          // Ignore malformed JSON
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage);
    }

    if (!supabase) {
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', handleStorage);
        }
      };
    }

    const subChannel = supabase
      .channel(`live_draft_listener_${Math.random().toString(36).slice(2, 9)}`)
      .on('broadcast', { event: 'draft_update' }, (msg) => {
        if (onEvent && msg?.payload) {
          onEvent(msg.payload);
        }
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        (payload) => {
          if (onEvent) {
            onEvent({
              action: 'DB_CHANGE',
              playerId: payload.new?.id || payload.old?.id,
              teamId: payload.new?.team_id ?? null,
              timestamp: Date.now(),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          if (onEvent) {
            onEvent({ action: 'TEAMS_CHANGE', timestamp: Date.now() });
          }
        }
      )
      .subscribe();

    // Ensure sender channel is warm
    getOrCreateBroadcastChannel();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorage);
      }
      supabase.removeChannel(subChannel);
    };
  },
};

export default allocationApi;
