import { supabase } from '../supabase/client';

const SUPPORTER_DELIMITER = ' || ';

/**
 * Normalizes a database row from `public.players`.
 * Non-players (team supporters) are persisted with `jersey_number = 0` and
 * `name = "Full Name || Support Details"` so no schema migration or CHECK constraint
 * change is required in PostgreSQL.
 */
export function normalizePlayerRecord(row) {
  if (!row) return row;

  const rawName = String(row.name || '');
  const hasDelimiter = rawName.includes(SUPPORTER_DELIMITER);
  const isNonPlayer =
    Boolean(row.is_non_player) ||
    row.position === 'SUP' ||
    row.jersey_number === 0 ||
    hasDelimiter;

  if (isNonPlayer) {
    const parts = rawName.split(SUPPORTER_DELIMITER);
    const cleanName = parts[0].trim();
    const cleanDetails =
      parts.slice(1).join(SUPPORTER_DELIMITER).trim() ||
      row.details ||
      'Team Supporter';

    return {
      ...row,
      name: cleanName,
      details: cleanDetails,
      is_non_player: true,
      member_type: 'SUPPORTER',
      position: 'SUP',
      is_goalkeeper: false,
      jersey_number: 0,
    };
  }

  return {
    ...row,
    name: rawName.trim(),
    details: row.details || '',
    is_non_player: false,
    member_type: 'PLAYER',
  };
}

export const playersApi = {
  async getPlayers(filter = {}) {
    let query = supabase
      .from('players')
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .order('position', { ascending: true })
      .order('name', { ascending: true });

    if (filter.unallocated) {
      query = query.is('team_id', null);
    }
    if (filter.is_goalkeeper !== undefined) {
      query = query.eq('is_goalkeeper', filter.is_goalkeeper);
    }
    if (filter.team_id) {
      query = query.eq('team_id', filter.team_id);
    }
    if (filter.position && filter.position !== 'ALL' && filter.position !== 'SUP') {
      query = query.eq('position', filter.position);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const normalized = (data || []).map(normalizePlayerRecord);
    if (filter.position === 'SUP') {
      return normalized.filter((p) => p.is_non_player);
    }
    return normalized;
  },

  async getPlayerById(playerId) {
    const { data, error } = await supabase
      .from('players')
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .eq('id', playerId)
      .single();

    if (error) throw new Error(error.message);
    return normalizePlayerRecord(data);
  },

  async addPlayer(playerData) {
    const isNonPlayer =
      Boolean(playerData.is_non_player) ||
      playerData.position === 'SUP' ||
      playerData.member_type === 'SUPPORTER';

    const cleanName = String(playerData.name || '')
      .split(SUPPORTER_DELIMITER)[0]
      .trim();

    if (!cleanName) {
      throw new Error(isNonPlayer ? 'Supporter name is required.' : 'Player name is required.');
    }

    const { data: existingRows } = await supabase
      .from('players')
      .select('id, name');

    const duplicate = (existingRows || []).find((r) => {
      const existingBaseName = String(r.name || '')
        .split(SUPPORTER_DELIMITER)[0]
        .trim()
        .toLowerCase();
      return existingBaseName === cleanName.toLowerCase();
    });

    if (duplicate) {
      throw new Error(`"${cleanName}" is already registered.`);
    }

    const cleanDetails = String(playerData.details || '').trim() || 'Team Supporter';
    const storedName = isNonPlayer
      ? `${cleanName}${SUPPORTER_DELIMITER}${cleanDetails}`
      : cleanName;

    const validDbPosition =
      !isNonPlayer && ['GK', 'CB', 'MF', 'FW'].includes(playerData.position)
        ? playerData.position
        : 'MF';

    const payload = {
      name: storedName,
      jersey_number: isNonPlayer ? 0 : Number(playerData.jersey_number) || 1,
      position: validDbPosition,
      photo_url: playerData.photo_url ? String(playerData.photo_url).trim() : null,
      team_id: playerData.team_id || null,
      tournament_id: playerData.tournament_id || '11111111-1111-1111-1111-111111111111',
    };

    const { data, error } = await supabase
      .from('players')
      .insert([payload])
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .single();

    if (error) throw new Error(error.message);
    return normalizePlayerRecord(data);
  },

  async bulkAddPlayers(playersArray = [], tournamentId = '11111111-1111-1111-1111-111111111111') {
    if (!Array.isArray(playersArray) || playersArray.length === 0) {
      throw new Error('No valid player entries provided.');
    }

    const rows = playersArray.map((p) => {
      const isNonPlayer =
        Boolean(p.is_non_player) || p.position === 'SUP' || p.jersey_number === 0;
      const cleanName = String(p.name || '')
        .split(SUPPORTER_DELIMITER)[0]
        .trim();
      const cleanDetails = String(p.details || '').trim() || 'Team Supporter';

      return {
        name: isNonPlayer ? `${cleanName}${SUPPORTER_DELIMITER}${cleanDetails}` : cleanName,
        jersey_number: isNonPlayer ? 0 : Number(p.jersey_number) || 1,
        position:
          !isNonPlayer && ['GK', 'CB', 'MF', 'FW'].includes(p.position) ? p.position : 'MF',
        photo_url: p.photo_url || null,
        tournament_id: p.tournament_id || tournamentId,
      };
    });

    const { data, error } = await supabase
      .from('players')
      .insert(rows)
      .select('*, team:teams(id, name, short_code, color_code, logo_url)');

    if (error) throw new Error(error.message);
    return (data || []).map(normalizePlayerRecord);
  },

  async updatePlayer(id, updates) {
    if (!id) throw new Error('Player ID is required.');

    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    const isNonPlayer =
      Boolean(cleanUpdates.is_non_player) ||
      cleanUpdates.position === 'SUP' ||
      cleanUpdates.member_type === 'SUPPORTER' ||
      cleanUpdates.jersey_number === 0;

    delete cleanUpdates.is_goalkeeper;
    delete cleanUpdates.team;
    delete cleanUpdates.is_non_player;
    delete cleanUpdates.member_type;

    const detailsText = String(cleanUpdates.details || '').trim() || 'Team Supporter';
    delete cleanUpdates.details;

    if (cleanUpdates.name !== undefined) {
      const cleanName = String(cleanUpdates.name)
        .split(SUPPORTER_DELIMITER)[0]
        .trim();
      if (!cleanName) {
        throw new Error('Name cannot be empty.');
      }

      const { data: existingRows } = await supabase
        .from('players')
        .select('id, name')
        .neq('id', id);

      const duplicate = (existingRows || []).find((r) => {
        const existingBaseName = String(r.name || '')
          .split(SUPPORTER_DELIMITER)[0]
          .trim()
          .toLowerCase();
        return existingBaseName === cleanName.toLowerCase();
      });

      if (duplicate) {
        throw new Error(`Another member named "${cleanName}" already exists.`);
      }

      cleanUpdates.name = isNonPlayer
        ? `${cleanName}${SUPPORTER_DELIMITER}${detailsText}`
        : cleanName;
    }

    if (cleanUpdates.position !== undefined || isNonPlayer) {
      if (isNonPlayer) {
        cleanUpdates.position = 'MF';
        cleanUpdates.jersey_number = 0;
      } else if (!['GK', 'CB', 'MF', 'FW'].includes(cleanUpdates.position)) {
        cleanUpdates.position = 'MF';
      }
    }

    const { data, error } = await supabase
      .from('players')
      .update(cleanUpdates)
      .eq('id', id)
      .select('*, team:teams(id, name, short_code, color_code, logo_url)')
      .single();

    if (error) throw new Error(error.message);
    return normalizePlayerRecord(data);
  },

  async deletePlayer(id) {
    if (!id) throw new Error('Player ID is required for deletion.');

    const { error } = await supabase.from('players').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true, deletedId: id };
  },

  async deleteAllPlayers() {
    const { error } = await supabase
      .from('players')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw new Error(error.message);
    return { success: true };
  },
};

export default playersApi;

