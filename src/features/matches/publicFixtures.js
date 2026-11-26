export function compareKickoffs(a, b) {
  const aTime = Date.parse(a.kickoff_time);
  const bTime = Date.parse(b.kickoff_time);
  return (Number.isFinite(aTime) ? aTime : Infinity) -
    (Number.isFinite(bTime) ? bTime : Infinity) || a.match_number - b.match_number;
}

export function selectUpcomingFixtures(matches, cutoff) {
  return matches
    .filter((match) => match.status === 'scheduled' && Date.parse(match.kickoff_time) >= cutoff)
    .sort(compareKickoffs);
}

export function calculateHeadToHead(matches, homeId, awayId) {
  if (!matches || !homeId || !awayId) return null;

  const meetings = matches.filter((match) => match.status === 'completed' && (
    (match.home_team_id === homeId && match.away_team_id === awayId) ||
    (match.home_team_id === awayId && match.away_team_id === homeId)
  ));

  const record = { homeWins: 0, draws: 0, awayWins: 0, played: meetings.length };
  for (const match of meetings) {
    const { home_score: home, away_score: away } = match;
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return null;

    if (home === away) {
      record.draws += 1;
    } else {
      const winnerId = home > away ? match.home_team_id : match.away_team_id;
      if (winnerId === homeId) record.homeWins += 1;
      else record.awayWins += 1;
    }
  }
  return record;
}
