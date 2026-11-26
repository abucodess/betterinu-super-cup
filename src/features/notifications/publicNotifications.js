import { formatKickoff } from '../../components/shared/MatchSummary';

const publicStatuses = new Set(['scheduled', 'live', 'half_time', 'completed', 'cancelled', 'postponed']);
const statusLabels = {
  scheduled: 'Fixture back on schedule',
  live: 'Match in progress',
  half_time: 'Half-time',
  cancelled: 'Match cancelled',
  postponed: 'Match postponed',
};

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });

export function formatActivityTime(value, now = Date.now()) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '';
  const seconds = Math.max(0, (now - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return relativeTime.format(-Math.floor(seconds / 60), 'minute');
  if (seconds < 86400) return relativeTime.format(-Math.floor(seconds / 3600), 'hour');
  if (seconds < 7 * 86400) return relativeTime.format(-Math.floor(seconds / 86400), 'day');
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata',
  }).format(timestamp);
}

function existingActivity(matches) {
  // Before the activity migration, only current public facts are recoverable.
  return matches.flatMap((match) => {
    if (!publicStatuses.has(match.status) || match.is_published === false) return [];
    const base = {
      ...match,
      match_id: match.id,
      scheduled_at: match.kickoff_time,
      home_team_name: match.home_team?.name,
      away_team_name: match.away_team?.name,
      revision: 1,
    };
    const entries = [{ ...base, kind: 'fixture', published_at: match.created_at }];
    if (match.status === 'completed') {
      entries.push({ ...base, kind: 'result', published_at: match.updated_at });
    } else if (match.status !== 'scheduled') {
      entries.push({ ...base, kind: 'status', published_at: match.updated_at });
      if (['live', 'half_time'].includes(match.status) && (match.home_score > 0 || match.away_score > 0)) {
        entries.push({ ...base, kind: 'score', published_at: match.updated_at });
      }
    }
    return entries;
  });
}

function matchNotice(activity, clubs) {
  const { kind, match_id: matchId, home_team_id, away_team_id, home_score, away_score, published_at } = activity;
  const home = clubs.get(home_team_id);
  const away = clubs.get(away_team_id);
  const homeName = activity.home_team_name || home?.name || 'Home team';
  const awayName = activity.away_team_name || away?.name || 'Away team';
  const matchup = `${homeName} vs ${awayName}`;
  const scoreline = `${homeName} ${home_score} – ${away_score} ${awayName}`;
  const kickoff = [formatKickoff(activity.scheduled_at), activity.venue].filter(Boolean).join(' · ');
  const fixturePath = `/public/fixtures?match=${encodeURIComponent(matchId)}`;
  const id = ['schedule', 'status'].includes(kind)
    ? (activity.id && activity.id !== matchId ? `activity:${activity.id}` : `${kind}:${matchId}:${activity.status}:${published_at}`)
    : `${kind}:${matchId}`;
  const scoreVersion = `:${home_score}:${away_score}:${activity.revision || 1}`;
  const base = { id, readKey: id, kind, publishedAt: published_at, to: fixturePath, home, away };

  switch (kind) {
    case 'fixture':
      return { ...base, category: 'New fixture', title: matchup, description: kickoff || 'A league fixture has been published.' };
    case 'schedule':
      return { ...base, category: 'Fixture updated', title: matchup, description: kickoff || 'The fixture details were updated.' };
    case 'score':
      return {
        ...base, readKey: id + scoreVersion, category: 'Score update', title: scoreline,
        description: 'The official match score has been updated.', to: `/public/live?match=${encodeURIComponent(matchId)}`,
      };
    case 'result':
      return { ...base, readKey: id + scoreVersion, category: 'Full time', title: scoreline, description: 'Official result published.', standings: true };
    case 'status':
      return { ...base, category: statusLabels[activity.status] || 'Match status', title: matchup, description: kickoff };
    default:
      return null;
  }
}

export function buildNotifications({ activity, announcements, matches, tournamentId }) {
  const scopedMatches = tournamentId ? matches.filter((match) => match.tournament_id === tournamentId) : matches;
  const clubs = new Map(scopedMatches.flatMap((match) => [match.home_team, match.away_team])
    .filter(Boolean).map((club) => [club.id, club]));
  const matchUpdates = (activity ?? existingActivity(scopedMatches)).map((entry) => matchNotice(entry, clubs)).filter(Boolean);
  const leagueUpdates = announcements.map((item) => {
    const id = `announcement:${item.id}`;
    const publishedAt = item.updated_at || item.created_at;
    return { id, readKey: `${id}:${publishedAt}`, kind: 'announcement', category: 'League announcement', title: item.title, description: item.content, publishedAt };
  });

  const notices = [...matchUpdates, ...leagueUpdates].filter((item) => Number.isFinite(Date.parse(item.publishedAt)));
  return Array.from(new Map(notices.map((item) => [item.id, item])).values())
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.id.localeCompare(b.id));
}
