import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, UserRound } from 'lucide-react';
import { ArenaState, ClubCrest } from '../../components/shared/ArenaUI';
import { isLiveMatch, MatchSummary } from '../../components/shared/MatchSummary';
import { cloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { countAssistsByPlayer } from '../../utils/tournamentRules';
import { getFixtureClubVisuals } from '../matches/fixtureClubVisuals';
import { compareKickoffs, selectUpcomingFixtures } from '../matches/publicFixtures';
import { PlayerCard } from '../players/PlayerCard';
import { TacticalPitchView } from './TacticalPitchView';
import './dark-horse.css';

const areas = [
  ['overview', 'Overview'], ['squad', 'Squad'], ['game-plan', 'Game Plan'],
  ['identity', 'Club Identity'], ['statistics', 'Statistics'],
];
const values = [
  ['Resilience', 'Use setbacks to regroup and come back stronger.'],
  ['Unity', 'Every player works toward the same goal.'],
  ['Determination', 'Keep competing until the final whistle.'],
];
const empty = [];
const sectionId = (area) => `dark-horse-${area}`;

function ClubSectionNav({ active, onSelect }) {
  return (
    <nav className="dh-section-nav" aria-label="Dark Horse FC sections">
      {areas.map(([id, label]) => (
        <a key={id} href={`#${sectionId(id)}`} aria-current={active === id ? 'location' : undefined}
          onClick={() => onSelect(id)}>{label}</a>
      ))}
    </nav>
  );
}

function Hero({ club, portrait }) {
  const stage = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="dh-hero" id={sectionId('overview')} aria-labelledby="dh-title" ref={stage} data-visible={visible}>
      <div className="dh-hero-media" aria-hidden="true">
        <span className="dh-hero-orbit" />
        <div className="dh-dragon-stage">
          <img className="dh-dragon" src="/assets/dark-horse-blue-dragon.webp"
            srcSet="/assets/dark-horse-blue-dragon-mobile.webp 780w, /assets/dark-horse-blue-dragon.webp 1440w"
            sizes="(max-width: 699px) 90vw, 1050px" width="1440" height="960" alt="" fetchPriority="high" />
        </div>
      </div>
      <div className="dh-hero-copy">
        <div className="dh-hero-competition"><ClubCrest club={club} eager /><span>Betterinu Football League <strong>Season 2026/27</strong></span></div>
        <h1 id="dh-title">Dark <span>Horse <small>FC</small></span></h1>
        <p className="dh-slogan">The Art of the Comeback</p>
        <a href={`#${sectionId('squad')}`} className="dh-primary">Explore Squad <ArrowDown size={17} aria-hidden="true" /></a>
      </div>
      {portrait && (
        <div className="dh-hero-portrait">
          <img src={portrait} alt="Dark Horse FC captain in the official blue and white kit" width="800" height="1600" />
        </div>
      )}
    </section>
  );
}

function PlayerPortrait({ player }) {
  const [failed, setFailed] = useState(null);
  const url = cloudinaryService.getOptimizedPortraitUrl(player.photo_url, { width: 400, height: 500 });
  return (
    <span className="dh-player-photo" aria-hidden="true">
      {url && failed !== url ? (
        <img src={url} alt="" loading="lazy" decoding="async" onError={() => setFailed(url)} />
      ) : <UserRound size={33} strokeWidth={1.4} />}
    </span>
  );
}

function ClubSquad({ club, squad, supporters, totals, roster, onSelectPlayer }) {
  return (
    <section className="dh-section" id={sectionId('squad')} aria-labelledby="dh-squad-title">
      <header className="dh-section-heading">
        <h2 id="dh-squad-title">Squad</h2>
        {!roster.isPending && !roster.isError && <span>{squad.length} registered {squad.length === 1 ? 'player' : 'players'}</span>}
      </header>
      {roster.isPending ? <ArenaState>Loading the squad…</ArenaState> : roster.isError ? (
        <ArenaState error onRetry={roster.refetch}>The squad could not be loaded.</ArenaState>
      ) : squad.length ? (
        <ul className="dh-squad-grid" role="list">
          {squad.map((player, index) => {
            const keeper = player.is_goalkeeper || player.position === 'GK';
            const captain = player.is_captain === true || player.id === club.captain_player_id || player.id === club.captain_id;
            const stats = totals?.get(player.id);
            return (
              <li key={player.id} className="dh-reveal" style={{ '--dh-reveal-start': `${(index % 5) * 4 + 2}%` }}>
                <button className="dh-player" type="button" aria-haspopup="dialog" onClick={() => onSelectPlayer(player)}>
                  <span className="dh-player-visual">
                    {player.jersey_number != null && <span className="dh-player-number">#{player.jersey_number}</span>}
                    <PlayerPortrait player={player} />
                  </span>
                  <span className="dh-player-info">
                    <strong>{player.name}</strong>
                    <span>{keeper ? 'Goalkeeper' : player.position}{captain && ' · Captain'}</span>
                    {stats && <span>{stats.goals} {stats.goals === 1 ? 'goal' : 'goals'} · {stats.assists} {stats.assists === 1 ? 'assist' : 'assists'}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : <ArenaState>No players have been assigned to this club.</ArenaState>}
      {supporters.length > 0 && (
        <section className="dh-supporters">
          <h3>Club supporters</h3>
          <div className="arena-player-grid">{supporters.map((player) => (
            <PlayerCard key={player.id} player={player} team={club} variant="row" showTeam={false} onSelect={onSelectPlayer} />
          ))}</div>
        </section>
      )}
    </section>
  );
}

const kitViews = {
  front: { width: 815, height: 810 },
  back: { width: 699, height: 815 },
};

function OfficialKit() {
  const [view, setView] = useState('front');
  return (
    <section className="dh-kit dh-reveal" aria-labelledby="dh-kit-title">
      <div className="dh-kit-copy">
        <span className="dh-eyebrow">Season 2026/27</span>
        <h3 id="dh-kit-title">Official kit</h3>
        <p>Blue dragon artwork and the Dark Horse crest on the club’s blue-and-white shirt.</p>
        <div className="dh-kit-controls" role="group" aria-label="Kit view">
          {Object.keys(kitViews).map((side) => (
            <button key={side} type="button" aria-pressed={view === side} onClick={() => setView(side)}>{side === 'front' ? 'Front' : 'Back'}</button>
          ))}
        </div>
      </div>
      <div className="dh-kit-stage">
        <img key={view} src={`/assets/dark-horse-kit-${view}.webp`} {...kitViews[view]}
          alt={`${view === 'front' ? 'Front' : 'Back'} of the official Dark Horse FC jersey`} loading="lazy" decoding="async" />
      </div>
    </section>
  );
}

function ClubIdentity() {
  return (
    <section className="dh-section" id={sectionId('identity')} aria-labelledby="dh-identity-title">
      <div className="dh-story dh-reveal">
        <header>
          <span className="dh-eyebrow">Club Identity</span>
          <h2 id="dh-identity-title">Underestimated.<br />Never out.</h2>
          <p>Dark Horse takes pride in being underestimated. The squad sees a setback as a chance to respond, and its ambition is to win the Betterinu Football League together.</p>
        </header>
        <dl>{values.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}</dl>
      </div>
      <OfficialKit />
    </section>
  );
}

function leaders(squad, totals, metric) {
  const most = Math.max(0, ...squad.map((player) => totals.get(player.id)?.[metric] || 0));
  if (!most) return '—';
  const names = squad.filter((player) => totals.get(player.id)?.[metric] === most).map((player) => player.name);
  return `${names.join(', ')} (${most})`;
}

function ClubMatchLink({ match }) {
  const home = getFixtureClubVisuals(match.home_team, match.home_team_id).club;
  const away = getFixtureClubVisuals(match.away_team, match.away_team_id).club;
  return (
    <Link to={`/public/fixtures?match=${encodeURIComponent(match.id)}`} className="arena-match-card">
      <MatchSummary match={{ ...match, home_team: home, away_team: away }} compact />
    </Link>
  );
}

function ClubStatistics({ club, squad, totals, standings, matches, roster }) {
  const table = standings.data || empty;
  const index = table.findIndex((row) => row.team_id === club.id);
  const row = table[index];
  const fixtures = (matches.data || empty).filter((match) => match.home_team_id === club.id || match.away_team_id === club.id);
  const next = selectUpcomingFixtures(fixtures, Date.now())[0];
  const results = fixtures.filter((match) => match.status === 'completed' || isLiveMatch(match)).sort((a, b) => compareKickoffs(b, a));
  const milestones = row && [
    ['League position', table.some((entry) => entry.played > 0) ? index + 1 : '—'],
    ['Played', row.played], ['Wins', row.won], ['Draws', row.drawn], ['Losses', row.lost],
    ['Goals for', row.goals_for], ['Goals against', row.goals_against],
    ['Goal difference', row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference], ['Points', row.points],
  ];

  return (
    <section className="dh-section" id={sectionId('statistics')} aria-labelledby="dh-stats-title">
      <header className="dh-section-heading">
        <h2 id="dh-stats-title">Statistics</h2>
        <Link className="dh-link" to="/public/standings">League table <ArrowRight size={15} aria-hidden="true" /></Link>
      </header>
      {standings.isPending ? <ArenaState>Loading league statistics…</ArenaState> : standings.isError ? (
        <ArenaState error onRetry={standings.refetch}>League statistics could not be loaded.</ArenaState>
      ) : milestones ? (
        <dl className="dh-stats-grid">{milestones.map(([label, value]) => (
          <div key={label} className="dh-stat"><dt>{label}</dt><dd key={value}>{value ?? '—'}</dd></div>
        ))}</dl>
      ) : <ArenaState>No league statistics are available for this club.</ArenaState>}
      {totals && roster.data && <dl className="dh-leaders">
        <div><dt>Top goalscorer</dt><dd>{leaders(squad, totals, 'goals')}</dd></div>
        <div><dt>Top assist provider</dt><dd>{leaders(squad, totals, 'assists')}</dd></div>
      </dl>}
      <div className="dh-match-grid">
        <section className="dh-match-panel">
          <h3>Next fixture</h3>
          {next ? <ClubMatchLink match={next} /> :
            <p>{matches.isPending ? 'Loading fixtures…' : matches.isError ? 'Fixtures are temporarily unavailable.' : 'No upcoming fixtures have been published.'}</p>}
        </section>
        <section className="dh-match-panel">
          <h3>Match results</h3>
          {results.length ? results.map((match) => <ClubMatchLink key={match.id} match={match} />) :
            <p>{matches.isPending ? 'Loading results…' : matches.isError ? 'Results are temporarily unavailable.' : 'No results are available for this club.'}</p>}
        </section>
      </div>
    </section>
  );
}

export function DarkHorseClub({ club, roster, standings, matches, events, onSelectPlayer }) {
  const { club: brandedClub, portrait } = getFixtureClubVisuals(club);
  const [active, setActive] = useState('overview');
  const root = useRef(null);
  const members = (roster.data || empty).filter((player) => player.team_id === club.id);
  const squad = members.filter((player) => !player.is_non_player && player.position !== 'SUP' && Number(player.jersey_number) !== 0);
  const supporters = members.filter((player) => !squad.includes(player));
  const totals = useMemo(() => {
    if (!events.data) return null;
    const clubEvents = events.data.filter((event) => event.team_id === club.id);
    const goals = new Map();
    for (const event of clubEvents) {
      if (event.event_type === 'GOAL' && event.player_id) goals.set(event.player_id, (goals.get(event.player_id) || 0) + 1);
    }
    const assists = countAssistsByPlayer(clubEvents);
    return new Map((roster.data || empty).map(({ id }) => [id, { goals: goals.get(id) || 0, assists: assists.get(id.toLowerCase()) || 0 }]));
  }, [club.id, events.data, roster.data]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id.replace('dark-horse-', ''));
      }
    }, { rootMargin: '-22% 0px -55% 0px' });
    const anchor = window.location.hash.slice(1);
    for (const [id] of areas) {
      const section = root.current.querySelector(`#${sectionId(id)}`);
      if (section) observer.observe(section);
      if (anchor === sectionId(id)) section?.scrollIntoView({ block: 'start' });
    }
    return () => observer.disconnect();
  }, []);

  return (
    <article className="dark-horse" ref={root}>
      <Link to="/public#clubs" className="dh-back"><ArrowLeft size={17} aria-hidden="true" /> Back to League</Link>
      <Hero club={brandedClub} portrait={portrait} />
      <ClubSectionNav active={active} onSelect={setActive} />
      <ClubSquad club={brandedClub} squad={squad} supporters={supporters} roster={roster} totals={totals} onSelectPlayer={onSelectPlayer} />
      <section className="dh-section" id={sectionId('game-plan')} aria-labelledby="dh-game-plan-title">
        <header className="dh-section-heading"><h2 id="dh-game-plan-title">Game Plan</h2><span>5-a-side</span></header>
        {roster.isPending ? <ArenaState>Loading the game plan…</ArenaState> : roster.isError ? (
          <ArenaState error onRetry={roster.refetch}>The game plan could not be loaded.</ArenaState>
        ) : (
          <TacticalPitchView key={club.formation || 'default'} team={brandedClub} players={squad}
            initialFormation={club.formation} onSelectPlayer={onSelectPlayer} />
        )}
      </section>
      <ClubIdentity />
      <ClubStatistics club={brandedClub} squad={squad} standings={standings} matches={matches} totals={totals} roster={roster} />
    </article>
  );
}
