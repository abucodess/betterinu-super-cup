/**
 * Pure Tournament Business Logic, Transparent Player Rating Formula,
 * and eFootball / EA FC Tactical Pitch Formation Mapping.
 */

export const TACTICAL_FORMATIONS = {
  '1-2-1': {
    id: '1-2-1',
    name: '1-2-1 Diamond',
    style: 'Balanced Possession',
    description:
      'Classic 5-a-side diamond with two wide defenders, a central pivot playmaker, and a lone striker.',
    slots: [
      { id: 'gk', slotId: 'gk', role: 'GK', label: 'Goalkeeper', preferred: ['GK'], x: 50, y: 84 },
      { id: 'lcb', slotId: 'lcb', role: 'LCB', label: 'Left Back', preferred: ['CB', 'MF', 'FW'], x: 23, y: 62 },
      { id: 'rcb', slotId: 'rcb', role: 'RCB', label: 'Right Back', preferred: ['CB', 'MF', 'FW'], x: 77, y: 62 },
      { id: 'cm', slotId: 'cm', role: 'CAM', label: 'Central Playmaker', preferred: ['MF', 'FW', 'CB'], x: 50, y: 42 },
      { id: 'st', slotId: 'st', role: 'ST', label: 'Center Forward', preferred: ['FW', 'MF', 'CB'], x: 50, y: 17 },
    ],
  },
  '2-1-1': {
    id: '2-1-1',
    name: '2-1-1 Counter',
    style: 'Defensive Block & Transition',
    description:
      'Compact defensive pair protecting the box with a deep holding midfielder feeding the target forward.',
    slots: [
      { id: 'gk', slotId: 'gk', role: 'GK', label: 'Goalkeeper', preferred: ['GK'], x: 50, y: 84 },
      { id: 'cb1', slotId: 'cb1', role: 'CB', label: 'Left Stopper', preferred: ['CB', 'MF', 'FW'], x: 28, y: 65 },
      { id: 'cb2', slotId: 'cb2', role: 'CB', label: 'Right Stopper', preferred: ['CB', 'MF', 'FW'], x: 72, y: 65 },
      { id: 'cdm', slotId: 'cdm', role: 'CM', label: 'Box-to-Box Midfielder', preferred: ['MF', 'CB', 'FW'], x: 50, y: 44 },
      { id: 'cf', slotId: 'cf', role: 'CF', label: 'Striker', preferred: ['FW', 'MF', 'CB'], x: 50, y: 18 },
    ],
  },
  '1-1-2': {
    id: '1-1-2',
    name: '1-1-2 High Press',
    style: 'Front-Foot Attacking',
    description:
      'Single sweeper defender behind an orchestrating midfielder and dual front-line strikers.',
    slots: [
      { id: 'gk', slotId: 'gk', role: 'GK', label: 'Goalkeeper', preferred: ['GK'], x: 50, y: 84 },
      { id: 'sw', slotId: 'sw', role: 'CB', label: 'Sweeper Back', preferred: ['CB', 'MF', 'FW'], x: 50, y: 64 },
      { id: 'cm', slotId: 'cm', role: 'CM', label: 'Central Engine', preferred: ['MF', 'CB', 'FW'], x: 50, y: 43 },
      { id: 'lf', slotId: 'lf', label: 'Left Forward', role: 'LF', preferred: ['FW', 'MF', 'CB'], x: 27, y: 20 },
      { id: 'rf', slotId: 'rf', label: 'Right Forward', role: 'RF', preferred: ['FW', 'MF', 'CB'], x: 73, y: 20 },
    ],
  },
  '2-2': {
    id: '2-2',
    name: '2-2 Box Overload',
    style: 'Fluid Total Football',
    description:
      'Two-line tactical box structure offering wide passing lanes and rapid overload transitions.',
    slots: [
      { id: 'gk', slotId: 'gk', role: 'GK', label: 'Goalkeeper', preferred: ['GK'], x: 50, y: 84 },
      { id: 'ld', slotId: 'ld', role: 'CB', label: 'Left Defender', preferred: ['CB', 'MF', 'FW'], x: 27, y: 61 },
      { id: 'rd', slotId: 'rd', role: 'CB', label: 'Right Defender', preferred: ['CB', 'MF', 'FW'], x: 73, y: 61 },
      { id: 'la', slotId: 'la', role: 'FW', label: 'Left Attacker', preferred: ['FW', 'MF', 'CB'], x: 28, y: 22 },
      { id: 'ra', slotId: 'ra', role: 'FW', label: 'Right Attacker', preferred: ['FW', 'MF', 'CB'], x: 72, y: 22 },
    ],
  },
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

const ROLE_LABELS = {
  GK: 'Shot-Stopping Goalkeeper',
  CB: 'Ball-Playing Center Back',
  MF: 'Box-to-Box Playmaker',
  FW: 'Clinical Center Forward',
};

/**
 * Calculates transparent, verified player statistics and performance-derived rating
 * strictly from actual recorded match events and team match participation.
 * Supports both object parameter `{ player, playerStatsRow, teamMatches, matchEvents }`
 * and positional parameters `(player, stats, matchEvents, teamMatches)`.
 */
export function calculatePlayerProfileMetrics(
  arg1,
  arg2 = {},
  arg3 = [],
  arg4 = []
) {
  let player = null;
  let playerStatsRow = null;
  let matchEvents = [];
  let teamMatches = [];

  if (arg1 && typeof arg1 === 'object' && 'player' in arg1) {
    player = arg1.player;
    playerStatsRow = arg1.playerStatsRow || arg1.stats || null;
    teamMatches = Array.isArray(arg1.teamMatches) ? arg1.teamMatches : [];
    matchEvents = Array.isArray(arg1.matchEvents) ? arg1.matchEvents : [];
  } else {
    player = arg1;
    playerStatsRow = arg2 || null;
    matchEvents = Array.isArray(arg3) ? arg3 : [];
    teamMatches = Array.isArray(arg4) ? arg4 : [];
  }

  if (!player) return null;

  const isGK = Boolean(player.is_goalkeeper || player.position === 'GK');
  const playerTeamId = player.team_id;

  const activeOrCompletedTeamMatches = playerTeamId
    ? teamMatches.filter(
        (m) =>
          (m.status === 'completed' || m.status === 'live' || m.status === 'half_time') &&
          (m.home_team_id === playerTeamId || m.away_team_id === playerTeamId)
      )
    : [];

  const completedTeamMatches = activeOrCompletedTeamMatches.filter(
    (m) => m.status === 'completed'
  );

  const matchesPlayed = activeOrCompletedTeamMatches.length;

  const minutesPlayed = activeOrCompletedTeamMatches.reduce((acc, m) => {
    if (m.status === 'completed') {
      return acc + (m.current_minute > 0 ? m.current_minute : 50);
    }
    return acc + (m.current_minute || 0);
  }, 0);

  let teamWins = 0;
  let cleanSheets = 0;
  let goalsConceded = 0;

  activeOrCompletedTeamMatches.forEach((m) => {
    const isHome = m.home_team_id === playerTeamId;
    const gf = isHome ? Number(m.home_score || 0) : Number(m.away_score || 0);
    const ga = isHome ? Number(m.away_score || 0) : Number(m.home_score || 0);

    goalsConceded += ga;
    if (m.status === 'completed') {
      if (gf > ga) teamWins += 1;
      if (ga === 0) cleanSheets += 1;
    }
  });

  const playerEvents = matchEvents.filter((ev) => ev.player_id === player.id);
  const goalsFromEvents = playerEvents.filter((ev) => ev.event_type === 'GOAL').length;
  const yellowFromEvents = playerEvents.filter((ev) => ev.event_type === 'YELLOW_CARD').length;
  const redFromEvents = playerEvents.filter((ev) => ev.event_type === 'RED_CARD').length;

  const goals =
    playerStatsRow?.goals !== undefined && playerStatsRow?.goals !== null
      ? Math.max(Number(playerStatsRow.goals), goalsFromEvents)
      : goalsFromEvents;

  const yellowCards =
    playerStatsRow?.yellow_cards !== undefined && playerStatsRow?.yellow_cards !== null
      ? Math.max(Number(playerStatsRow.yellow_cards), yellowFromEvents)
      : yellowFromEvents;

  const redCards =
    playerStatsRow?.red_cards !== undefined && playerStatsRow?.red_cards !== null
      ? Math.max(Number(playerStatsRow.red_cards), redFromEvents)
      : redFromEvents;

  const assists = matchEvents.filter((ev) => {
    if (ev.event_type !== 'GOAL' || !ev.extra_info) return false;
    if (typeof ev.extra_info === 'string') {
      return ev.extra_info.toLowerCase().includes(`assist:${player.id}`.toLowerCase());
    }
    if (typeof ev.extra_info === 'object') {
      return ev.extra_info.assist_player_id === player.id;
    }
    return false;
  }).length;

  const saves = playerEvents.filter((ev) => {
    if (!ev.extra_info) return false;
    const str = typeof ev.extra_info === 'string' ? ev.extra_info : JSON.stringify(ev.extra_info);
    return str.toUpperCase().includes('SAVE');
  }).length;

  const penaltiesSaved = playerEvents.filter((ev) => {
    if (!ev.extra_info) return false;
    const str = typeof ev.extra_info === 'string' ? ev.extra_info : JSON.stringify(ev.extra_info);
    return str.toUpperCase().includes('PENALTY_SAVE');
  }).length;

  // Transparent Performance Rating Formula (Base 75 OVR)
  const baseRating = 75;
  const appearanceBonus = Math.min(10, matchesPlayed * 2);
  const goalBonus = goals * 3;
  const assistBonus = assists * 2;
  const cleanSheetBonus =
    isGK || player.position === 'CB' ? cleanSheets * 3 : cleanSheets * 1;
  const winBonus = teamWins * 1;
  const disciplinePenalty = yellowCards * 1 + redCards * 3;

  const overallRating = clamp(
    baseRating +
      appearanceBonus +
      goalBonus +
      assistBonus +
      cleanSheetBonus +
      winBonus -
      disciplinePenalty,
    65,
    99
  );

  // Position-specific 6-attribute breakdown (PAC, SHO, PAS, DRI, DEF, PHY for Outfield; DIV, HAN, KIC, REF, SPD, POS for GK)
  const attributes = isGK
    ? [
        {
          key: 'DIVING',
          code: 'DIV',
          shortLabel: 'DIV',
          label: 'GK Diving',
          value: clamp(77 + cleanSheets * 3 + saves * 2, 60, 99),
        },
        {
          key: 'HANDLING',
          code: 'HAN',
          shortLabel: 'HAN',
          label: 'GK Handling',
          value: clamp(76 + cleanSheets * 2 + matchesPlayed * 2, 60, 99),
        },
        {
          key: 'KICKING',
          code: 'KIC',
          shortLabel: 'KIC',
          label: 'GK Kicking',
          value: clamp(74 + assists * 3 + teamWins * 2, 60, 99),
        },
        {
          key: 'REFLEXES',
          code: 'REF',
          shortLabel: 'REF',
          label: 'GK Reflexes',
          value: clamp(79 + saves * 2 + cleanSheets * 2, 60, 99),
        },
        {
          key: 'SPEED',
          code: 'SPD',
          shortLabel: 'SPD',
          label: 'Sweeper Speed',
          value: clamp(64 + matchesPlayed * 2, 50, 99),
        },
        {
          key: 'POSITIONING',
          code: 'POS',
          shortLabel: 'POS',
          label: 'GK Positioning',
          value: clamp(77 + cleanSheets * 3 - yellowCards, 60, 99),
        },
      ]
    : [
        {
          key: 'PACE',
          code: 'PAC',
          shortLabel: 'PAC',
          label: 'Pace & Acceleration',
          value: clamp(
            (player.position === 'FW' ? 84 : player.position === 'MF' ? 78 : 77) +
              goals * 2 +
              matchesPlayed,
            55,
            99
          ),
        },
        {
          key: 'SHOOTING',
          code: 'SHO',
          shortLabel: 'SHO',
          label: 'Shooting Power',
          value: clamp(
            (player.position === 'FW' ? 82 : player.position === 'MF' ? 76 : 62) +
              goals * 4 +
              assists,
            55,
            99
          ),
        },
        {
          key: 'PASSING',
          code: 'PAS',
          shortLabel: 'PAS',
          label: 'Passing Vision',
          value: clamp(
            (player.position === 'MF' ? 83 : player.position === 'CB' ? 72 : 75) +
              assists * 4 +
              teamWins * 2,
            55,
            99
          ),
        },
        {
          key: 'DRIBBLING',
          code: 'DRI',
          shortLabel: 'DRI',
          label: 'Dribbling Control',
          value: clamp(
            (player.position === 'MF' ? 82 : player.position === 'FW' ? 80 : 72) +
              assists * 3 +
              goals * 2,
            55,
            99
          ),
        },
        {
          key: 'DEFENDING',
          code: 'DEF',
          shortLabel: 'DEF',
          label: 'Defensive Awareness',
          value: clamp(
            (player.position === 'CB' ? 86 : player.position === 'MF' ? 72 : 52) +
              cleanSheets * 3 +
              matchesPlayed,
            45,
            99
          ),
        },
        {
          key: 'PHYSICALITY',
          code: 'PHY',
          shortLabel: 'PHY',
          label: 'Physical Strength',
          value: clamp(
            (player.position === 'CB' ? 84 : player.position === 'FW' ? 79 : 75) +
              matchesPlayed * 2 -
              redCards * 2,
            55,
            99
          ),
        },
      ];

  const breakdownObj = {
    base: baseRating,
    baseRating,
    appearanceBonus,
    goalBonus,
    assistBonus,
    cleanSheetBonus,
    winBonus,
    disciplinePenalty: -disciplinePenalty,
  };

  return {
    playerId: player.id,
    isGoalkeeper: isGK,
    position: player.position,
    roleLabel: ROLE_LABELS[player.position] || 'Squad Player',
    appearances: matchesPlayed,
    matchesPlayed,
    completedMatches: completedTeamMatches.length,
    minutesPlayed,
    goals,
    assists,
    yellowCards,
    redCards,
    cleanSheets,
    goalsConceded,
    saves,
    penaltiesSaved,
    teamWins,
    overallRating,
    ratingBreakdown: breakdownObj,
    formulaBreakdown: {
      baseRating,
      appearanceBonus,
      goalBonus,
      assistBonus,
      cleanSheetBonus,
      winBonus,
      disciplinePenalty,
    },
    attributes,
  };
}

/**
 * Maps a team's allocated squad players into the 5 pitch coordinates of a selected formation.
 */
export function mapSquadToFormationSlots(squad = [], formationKey = '1-2-1') {
  const formation = TACTICAL_FORMATIONS[formationKey] || TACTICAL_FORMATIONS['1-2-1'];
  const usedPlayerIds = new Set();

  const gkPlayer = squad.find((p) => p.is_goalkeeper || p.position === 'GK') || null;
  if (gkPlayer) {
    usedPlayerIds.add(gkPlayer.id);
  }

  const outfieldPlayers = squad.filter((p) => !p.is_goalkeeper && p.position !== 'GK');

  const mappedSlots = formation.slots.map((slot, index) => {
    if (index === 0) {
      return {
        ...slot,
        player: gkPlayer,
        isEmpty: !gkPlayer,
      };
    }

    let chosen = null;
    for (const prefPos of slot.preferred) {
      const candidate = outfieldPlayers.find(
        (p) => !usedPlayerIds.has(p.id) && p.position === prefPos
      );
      if (candidate) {
        chosen = candidate;
        break;
      }
    }

    if (!chosen) {
      chosen = outfieldPlayers.find((p) => !usedPlayerIds.has(p.id)) || null;
    }

    if (chosen) {
      usedPlayerIds.add(chosen.id);
    }

    return {
      ...slot,
      player: chosen,
      isEmpty: !chosen,
    };
  });

  mappedSlots.formation = formation;
  mappedSlots.slots = mappedSlots;
  return mappedSlots;
}

export function validatePlayerAllocation({ player, targetTeamId, allPlayers = [] }) {
  if (!player) {
    return { valid: false, reason: 'No player selected for allocation.' };
  }
  if (player.team_id) {
    return { valid: false, reason: 'Player is already allocated to a team.' };
  }
  if (!targetTeamId) {
    return { valid: false, reason: 'Please select a receiving team.' };
  }

  const teamSquad = allPlayers.filter((p) => p.team_id === targetTeamId);
  if (teamSquad.length >= 5) {
    return { valid: false, reason: 'Team already has the maximum of 5 players.' };
  }

  const isGK = Boolean(player.is_goalkeeper || player.position === 'GK');
  const gkCount = teamSquad.filter((p) => p.is_goalkeeper || p.position === 'GK').length;
  const outfieldCount = teamSquad.filter(
    (p) => !p.is_goalkeeper && p.position !== 'GK'
  ).length;

  if (isGK && gkCount >= 1) {
    return { valid: false, reason: 'Team already has 1 Goalkeeper assigned.' };
  }
  if (!isGK && outfieldCount >= 4) {
    return { valid: false, reason: 'Team already has 4 Outfield players assigned.' };
  }

  return { valid: true, reason: null };
}

export function calculateTeamFormAndStats(teamId, matches = []) {
  if (!teamId) {
    return {
      matchesPlayed: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      cleanSheets: 0,
      form: [],
    };
  }

  const completed = matches
    .filter(
      (m) =>
        m.status === 'completed' &&
        (m.home_team_id === teamId || m.away_team_id === teamId)
    )
    .sort((a, b) => (a.match_number || 0) - (b.match_number || 0));

  let won = 0;
  let drawn = 0;
  let lost = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;
  const form = [];

  completed.forEach((m) => {
    const isHome = m.home_team_id === teamId;
    const gf = isHome ? Number(m.home_score || 0) : Number(m.away_score || 0);
    const ga = isHome ? Number(m.away_score || 0) : Number(m.home_score || 0);

    goalsFor += gf;
    goalsAgainst += ga;
    if (ga === 0) cleanSheets += 1;

    if (gf > ga) {
      won += 1;
      form.push('W');
    } else if (gf === ga) {
      drawn += 1;
      form.push('D');
    } else {
      lost += 1;
      form.push('L');
    }
  });

  return {
    matchesPlayed: completed.length,
    won,
    drawn,
    lost,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: won * 3 + drawn,
    cleanSheets,
    form: form.slice(-5),
  };
}
