import React, { useEffect, useState } from 'react';
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react';
import { ClubCrest } from '../../components/shared/ArenaUI';
import { formatKickoff, MatchStatus } from '../../components/shared/MatchSummary';
import { calculateHeadToHead } from './publicFixtures';
import { getFixtureClubVisuals } from './fixtureClubVisuals';

function CaptainPortrait({ club, portrait }) {
  const [failed, setFailed] = useState(false);

  if (!portrait || failed) return <ClubCrest club={club} className="fixture-captain-fallback" eager />;

  return (
    <img
      className="fixture-captain-image"
      src={portrait}
      width="800"
      height="1600"
      alt={`${club.name || 'Club'} captain`}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

function FaceOffClub({ visual, side, fallbackName }) {
  const { club, portrait, style } = visual;
  return (
    <div className={`fixture-faceoff-side fixture-faceoff-side--${side}`} data-club-style={style}>
      <div className="fixture-faceoff-art">
        <CaptainPortrait key={portrait} club={club} portrait={portrait} />
      </div>
      <div className="fixture-faceoff-club">
        <ClubCrest club={club} eager />
        <strong>{club.name || fallbackName}</strong>
      </div>
    </div>
  );
}

function MatchBanner({ match, onSelect }) {
  const home = getFixtureClubVisuals(match.home_team, match.home_team_id);
  const away = getFixtureClubVisuals(match.away_team, match.away_team_id);
  const kickoff = formatKickoff(match.kickoff_time);
  const matchday = match.matchday || match.match_day;

  return (
    <section className="fixture-faceoff" aria-labelledby="fixture-next-match">
      <div className="fixture-faceoff-stage">
        <FaceOffClub visual={home} side="home" fallbackName="Home team" />
        <div className="fixture-faceoff-center">
          <h2 id="fixture-next-match">Next Match</h2>
          {matchday && <span className="fixture-matchday">{typeof matchday === 'number' ? `Matchday ${matchday}` : matchday}</span>}
          <span className="fixture-faceoff-vs" aria-hidden="true">VS</span><span className="sr-only">versus</span>
          <MatchStatus match={match} />
        </div>
        <FaceOffClub visual={away} side="away" fallbackName="Away team" />
      </div>
      <div className="fixture-faceoff-meta">
        <div>
          {kickoff && <time dateTime={match.kickoff_time}><CalendarDays size={15} aria-hidden="true" />{kickoff}</time>}
          {match.venue && <span><MapPin size={15} aria-hidden="true" />{match.venue}</span>}
        </div>
        <button type="button" aria-haspopup="dialog" onClick={() => onSelect(match.id)}>
          Details <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function HeadToHead({ match, history }) {
  const record = calculateHeadToHead(history, match.home_team_id, match.away_team_id);
  const stats = record && [
    [`${match.home_team?.name || 'Home team'} wins`, record.homeWins],
    ['Draws', record.draws],
    [`${match.away_team?.name || 'Away team'} wins`, record.awayWins],
  ];

  return (
    <section className="fixture-head-to-head" aria-labelledby="fixture-head-to-head">
      <h2 id="fixture-head-to-head">Head to Head</h2>
      {record?.played ? (
        <dl>
          {stats.map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      ) : (
        <p>{record ? 'First Meeting' : 'Head-to-head data unavailable'}</p>
      )}
    </section>
  );
}

function matchupKey(match) {
  return `${match.id}/${match.home_team_id}/${match.away_team_id}`;
}

export function FeaturedMatchBanner({ match, history, onSelect }) {
  const [previous, setPrevious] = useState(match);
  const swapping = matchupKey(previous) !== matchupKey(match);

  useEffect(() => {
    if (!swapping || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPrevious(match);
      return;
    }
    const timer = window.setTimeout(() => setPrevious(match), 120);
    return () => window.clearTimeout(timer);
  }, [match, swapping]);

  const visible = swapping ? previous : match;

  return (
    <div className="fixture-featured" data-swapping={swapping ? 'true' : undefined} key={matchupKey(visible)}>
      <MatchBanner match={visible} onSelect={onSelect} />
      <HeadToHead match={visible} history={history} />
    </div>
  );
}
