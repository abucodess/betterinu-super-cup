import React, { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowRight, CalendarDays, ChevronRight, X } from 'lucide-react';
import { ArenaState, ClubCrest } from '../../components/shared/ArenaUI';
import { formatKickoff, isLiveMatch, MatchStatus, MatchSummary } from '../../components/shared/MatchSummary';
import { ModalDialog } from '../../components/ui/ModalDialog';
import { FeaturedMatchBanner } from '../../features/matches/FeaturedMatchBanner';
import { getFixtureClubVisuals } from '../../features/matches/fixtureClubVisuals';
import { compareKickoffs, selectUpcomingFixtures } from '../../features/matches/publicFixtures';
import { matchesApi } from '../../services/api/matches.api';
import './fixtures.css';

const tabs = [['upcoming', 'Upcoming'], ['results', 'Results']];

function FixtureTabs({ active, onChange }) {
  const tabRefs = useRef({});

  function handleTabKeys(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    let next = active === 'upcoming' ? 'results' : 'upcoming';
    if (event.key === 'Home') next = 'upcoming';
    if (event.key === 'End') next = 'results';
    onChange(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="fixture-tabs" role="tablist" aria-label="Fixture views" onKeyDown={handleTabKeys}>
      {tabs.map(([id, label]) => (
        <button
          key={id} ref={(element) => { tabRefs.current[id] = element; }} type="button" role="tab"
          id={`fixture-tab-${id}`} aria-controls={`fixture-panel-${id}`}
          aria-selected={active === id} tabIndex={active === id ? 0 : -1}
          onClick={() => onChange(id)}
        >{label}</button>
      ))}
    </div>
  );
}

function FixtureRow({ match, onSelect }) {
  const home = getFixtureClubVisuals(match.home_team, match.home_team_id).club;
  const away = getFixtureClubVisuals(match.away_team, match.away_team_id).club;
  const kickoff = formatKickoff(match.kickoff_time);
  const showScore = match.status === 'completed' || isLiveMatch(match);
  const hasScore = Number.isInteger(match.home_score) && Number.isInteger(match.away_score);
  const score = hasScore ? `${match.home_score} – ${match.away_score}` : '—';

  return (
    <li>
      <button className="fixture-row" type="button" aria-haspopup="dialog" onClick={() => onSelect(match.id)}>
        <span className="fixture-row-teams">
          <span className="fixture-row-club"><ClubCrest club={home} /><strong>{home.name || 'Home team'}</strong></span>
          <span className={showScore ? 'fixture-row-score' : 'fixture-row-vs'}>
            {showScore ? score : 'VS'}
          </span>
          <span className="fixture-row-club"><ClubCrest club={away} /><strong>{away.name || 'Away team'}</strong></span>
        </span>
        <span className="fixture-row-meta">
          {kickoff && <time dateTime={match.kickoff_time}><CalendarDays size={14} aria-hidden="true" />{kickoff}</time>}
          {match.status !== 'scheduled' && <MatchStatus match={match} />}
        </span>
        <ChevronRight className="fixture-row-arrow" size={17} aria-hidden="true" />
      </button>
    </li>
  );
}

function FixtureList({ matches, onSelect }) {
  return (
    <ul className="fixture-list" role="list">
      {matches.map((match) => <FixtureRow key={match.id} match={match} onSelect={onSelect} />)}
    </ul>
  );
}

function MatchDetails({ match, onDismiss }) {
  const eventsQuery = useQuery({ queryKey: ['all_match_events'], queryFn: () => matchesApi.getAllMatchEvents() });
  const events = (eventsQuery.data || []).filter((event) => event.match_id === match.id);
  const matchWithCrests = {
    ...match,
    home_team: getFixtureClubVisuals(match.home_team, match.home_team_id).club,
    away_team: getFixtureClubVisuals(match.away_team, match.away_team_id).club,
  };

  return (
    <ModalDialog className="arena-dialog fixture-dialog" labelledBy="fixture-dialog-title" onDismiss={onDismiss}>
      <div className="arena-dialog-body">
        <div className="fixture-dialog-heading">
          <h2 id="fixture-dialog-title" className="arena-section-title">Match details</h2>
          <button type="button" className="arena-icon-button" aria-label="Close match details" onClick={onDismiss}><X size={19} /></button>
        </div>
        <div className="arena-panel arena-match-card"><MatchSummary match={matchWithCrests} compact /></div>
        <section>
          <h3 className="flex items-center gap-2 mb-2 font-bold text-sm"><Activity size={16} aria-hidden="true" /> Match events</h3>
          {events.length ? (
            <ul className="arena-fixture-events">{events.map((event) => (
              <li key={event.id}>
                <strong>{event.minute}′</strong>
                <span>{event.event_type.replaceAll('_', ' ').toLowerCase()}{event.player?.name ? ` · ${event.player.name}` : ''}</span>
                <span>{event.team?.name}</span>
              </li>
            ))}</ul>
          ) : (
            <p className="arena-muted text-sm" role="status">
              {eventsQuery.isPending ? 'Loading events…' : eventsQuery.isError ? 'Events are temporarily unavailable.' : 'No events have been recorded.'}
            </p>
          )}
        </section>
        <Link to={`/public/live?match=${encodeURIComponent(match.id)}`} className="fixture-action">
          View score and lineups <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </ModalDialog>
  );
}

export function FixturesPage() {
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useSearchParams();
  const selectedMatchId = search.get('match');
  const [showOtherMatches, setShowOtherMatches] = useState(false);
  const matchQuery = useQuery({ queryKey: ['matches'], queryFn: matchesApi.getMatches, refetchInterval: 3000 });
  const { data: matches = [], dataUpdatedAt } = matchQuery;
  const scheduled = selectUpcomingFixtures(matches, Math.max(dataUpdatedAt, Date.now()));
  const [featured, ...upcoming] = scheduled;
  const results = matches.filter((match) => match.status === 'completed').sort((a, b) => compareKickoffs(b, a));
  const upcomingIds = new Set(scheduled.map((match) => match.id));
  const otherMatches = matches.filter((match) => match.status !== 'completed' && !upcomingIds.has(match.id)).sort(compareKickoffs);
  const selectedMatch = matches.find((match) => match.id === selectedMatchId);
  const initialError = matchQuery.isError && !matchQuery.data;
  const ready = !matchQuery.isPending && !initialError;

  function setSelectedMatchId(id) {
    setSearch((params) => {
      const next = new URLSearchParams(params);
      if (id) next.set('match', id);
      else next.delete('match');
      return next;
    }, { replace: !id, preventScrollReset: true });
  }

  return (
    <div className="fixtures-page">
      <header className="fixtures-title">
        <h1>Fixtures</h1>
      </header>

      {matchQuery.isPending && (
        <div className="fixture-loading" role="status">
          <span className="sr-only">Loading fixtures…</span>
          <div className="fixture-loading-banner" /><div className="fixture-loading-stats" />
        </div>
      )}
      {initialError && <ArenaState error onRetry={matchQuery.refetch}>Fixtures could not be loaded.</ArenaState>}
      {ready && (
        featured ? <FeaturedMatchBanner match={featured} history={matchQuery.data} onSelect={setSelectedMatchId} /> :
          <ArenaState>No Upcoming Matches</ArenaState>
      )}

      {ready && (
        <section aria-label="Schedule and results">
          <div className="fixture-tabs-header">
            <FixtureTabs active={tab} onChange={setTab} />
            {otherMatches.length > 0 && (
              <button type="button" className="fixture-action" aria-haspopup="dialog" onClick={() => setShowOtherMatches(true)}>
                Other matches <ChevronRight size={15} aria-hidden="true" />
              </button>
            )}
          </div>
          <div id="fixture-panel-upcoming" role="tabpanel" aria-labelledby="fixture-tab-upcoming" hidden={tab !== 'upcoming'}>
            {tab === 'upcoming' && featured && (
              upcoming.length ? <FixtureList matches={upcoming} onSelect={setSelectedMatchId} /> :
                <ArenaState>No additional matches scheduled.</ArenaState>
            )}
          </div>
          <div id="fixture-panel-results" role="tabpanel" aria-labelledby="fixture-tab-results" hidden={tab !== 'results'}>
            {tab === 'results' && (
              results.length ? <FixtureList matches={results} onSelect={setSelectedMatchId} /> :
                <ArenaState>No Results Yet</ArenaState>
            )}
          </div>
        </section>
      )}

      {showOtherMatches && (
        <ModalDialog className="arena-dialog fixture-dialog" labelledBy="fixture-other-title" onDismiss={() => setShowOtherMatches(false)}>
          <div className="arena-dialog-body">
            <div className="fixture-dialog-heading">
              <h2 className="arena-section-title" id="fixture-other-title">Other matches</h2>
              <button className="arena-icon-button" type="button" onClick={() => setShowOtherMatches(false)} aria-label="Close other matches"><X size={19} /></button>
            </div>
            {otherMatches.length ? <FixtureList matches={otherMatches} onSelect={(id) => {
              setShowOtherMatches(false);
              setSelectedMatchId(id);
            }} /> : <ArenaState>No other matches.</ArenaState>}
          </div>
        </ModalDialog>
      )}
      {selectedMatch && <MatchDetails match={selectedMatch} onDismiss={() => setSelectedMatchId(null)} />}
      {selectedMatchId && ready && !selectedMatch && (
        <ModalDialog className="arena-dialog fixture-dialog" labelledBy="fixture-unavailable-title" onDismiss={() => setSelectedMatchId(null)}>
          <div className="arena-dialog-body">
            <h2 id="fixture-unavailable-title" className="arena-section-title">Match unavailable</h2>
            <p>This match is no longer listed.</p>
            <button type="button" className="fixture-action justify-self-start" onClick={() => setSelectedMatchId(null)}>Back to fixtures</button>
          </div>
        </ModalDialog>
      )}
    </div>
  );
}

export default FixturesPage;
