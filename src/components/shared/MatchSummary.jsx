import React from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { ClubCrest } from './ArenaUI';

const matchStatus = {
  scheduled: 'Scheduled',
  live: 'Live',
  half_time: 'Half-time',
  completed: 'Full time',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
};

export function isLiveMatch(match) {
  return match.status === 'live' || match.status === 'half_time';
}

export function formatKickoff(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
    timeZone: 'Asia/Kolkata', timeZoneName: 'short',
  }).format(date);
}

export function MatchStatus({ match }) {
  return <span className="arena-match-status" data-status={match.status}>{matchStatus[match.status] || match.status?.replaceAll('_', ' ')}</span>;
}

export function MatchSummary({ match, compact = false, eventCount }) {
  const showScore = isLiveMatch(match) || match.status === 'completed';
  const kickoff = formatKickoff(match.kickoff_time);
  return (
    <>
      <div className="arena-match-meta">
        <span>{`Match ${match.match_number}`}</span>
        <MatchStatus match={match} />
      </div>
      <div className="arena-match-teams">
        <div><ClubCrest club={match.home_team} /><strong>{match.home_team?.name || 'Home team'}</strong></div>
        <span className="arena-score">{showScore ? `${match.home_score} – ${match.away_score}` : 'VS'}</span>
        <div><ClubCrest club={match.away_team} /><strong>{match.away_team?.name || 'Away team'}</strong></div>
      </div>
      <div className="arena-match-detail">
        {kickoff && <time dateTime={match.kickoff_time}>{kickoff}</time>}
        {match.venue && <span><MapPin size={13} />{match.venue}</span>}
        {eventCount > 0 && <span>{eventCount} {eventCount === 1 ? 'event' : 'events'}</span>}
        {!compact && <ChevronRight className="arena-match-arrow" size={18} aria-hidden="true" />}
      </div>
    </>
  );
}

