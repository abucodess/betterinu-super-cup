import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ClubCrest, FormIndicator } from '../../components/shared/ArenaUI';
import { isLiveMatch, MatchSummary } from '../../components/shared/MatchSummary';
import { PlayerCard } from '../players/PlayerCard';
import { TacticalPitchView } from './TacticalPitchView';
import { calculateTeamFormAndStats } from '../../utils/tournamentRules';

const sections = ['Overview', 'Squad', 'Game Plan', 'Results', 'Statistics'];

export function ClubProfile({ club, players, standings, matches, matchState, onSelectPlayer, dedicated = false }) {
  const [section, setSection] = useState(dedicated ? 'Squad' : 'Overview');
  const contentRef = useRef(null);
  const ClubHeading = dedicated ? 'h1' : 'h2';
  const DetailHeading = dedicated ? 'h2' : 'h3';

  function viewSquad() {
    if (section === 'Squad') contentRef.current?.scrollIntoView({ block: 'start' });
    else setSection('Squad');
  }

  const roster = players.filter((player) => player.team_id === club.id);
  const squad = roster.filter((player) => !player.is_non_player && player.position !== 'SUP' && Number(player.jersey_number) !== 0);
  const teamMatches = matches.filter((match) => match.home_team_id === club.id || match.away_team_id === club.id);
  const standingIndex = standings.findIndex((row) => row.team_id === club.id);
  const standing = standings[standingIndex];
  const metrics = calculateTeamFormAndStats(club.id, teamMatches);
  const recentMatches = teamMatches.filter((match) => match.status === 'completed' || isLiveMatch(match));
  const upcoming = teamMatches.find((match) => match.status === 'scheduled');
  const matchNotice = matchState === 'loading' ? 'Loading matches…' : matchState === 'error' ? 'Match data is temporarily unavailable.' : null;
  const featured = squad.find((player) => player.photo_url) || squad[0];
  const hasRank = standingIndex >= 0 && standings.some((row) => row.played > 0);

  return (
    <article className="arena-club-detail" style={{ '--club-accent': club.color_code || '#2025f5' }}>
      <section className="arena-club-preview" key={club.id} aria-labelledby="arena-club-name">
        <div className="arena-club-preview-geometry" aria-hidden="true" />
        <div className="arena-club-preview-copy">
          <ClubCrest club={club} eager />
          <ClubHeading id="arena-club-name">{club.name}</ClubHeading>
          <dl className="arena-club-metrics">
            {hasRank && <div><dt>Position</dt><dd>{standingIndex + 1}</dd></div>}
            {standing && <div><dt>Points</dt><dd>{standing.points}</dd></div>}
            <div><dt>Players</dt><dd>{squad.length}</dd></div>
            <div><dt>Form</dt><dd><FormIndicator form={metrics.form} /></dd></div>
          </dl>
          <button type="button" onClick={viewSquad} className="arena-button arena-button-primary" aria-controls="arena-club-content">View squad <ArrowRight size={17} /></button>
        </div>
        {featured && <div className="arena-club-preview-player">
          {dedicated && <span className="arena-featured-label">Featured player</span>}
          <PlayerCard player={featured} team={club} variant="portrait" imageLoading="eager" showTeam={!dedicated} onSelect={onSelectPlayer} />
        </div>}
      </section>

      <div className="arena-tabs" role="group" aria-label="Club profile views">
        {sections.map((item) => <button key={item} type="button" aria-pressed={section === item} aria-controls="arena-club-content" onClick={() => setSection(item)}>{item}</button>)}
      </div>

      <div id="arena-club-content" ref={contentRef}>
        {section === 'Overview' && (
          <div className="arena-club-overview">
            <section className="arena-panel">
              <div className="arena-panel-head"><DetailHeading className="arena-section-title">Squad</DetailHeading><button type="button" className="arena-text-link" onClick={() => setSection('Game Plan')}>Open Game Plan <ArrowRight size={15} /></button></div>
              <p className="arena-club-overview-text">{squad.length} registered players · {squad.filter((player) => player.position === 'GK' || player.is_goalkeeper).length} goalkeepers</p>
            </section>
            <section className="arena-panel">
              <div className="arena-panel-head"><DetailHeading className="arena-section-title">Next fixture</DetailHeading></div>
              {upcoming ? <Link className="arena-match-card" to={`/public/live?match=${upcoming.id}`}><MatchSummary match={upcoming} compact /></Link> : <p className="arena-club-overview-text">{matchNotice || 'No upcoming fixtures have been published.'}</p>}
            </section>
          </div>
        )}
        {section === 'Squad' && <section className="arena-panel">
          <div className="arena-panel-head"><DetailHeading className="arena-section-title">Club roster</DetailHeading></div>
          {roster.length ? <div className="arena-player-grid arena-squad-grid arena-pool">{roster.map((player) => <PlayerCard key={player.id} player={player} team={club} variant="row" showTeam={!dedicated} onSelect={onSelectPlayer} />)}</div> : <p className="arena-club-overview-text">No players have been assigned to this club.</p>}
        </section>}
        {section === 'Game Plan' && <TacticalPitchView team={club} players={squad} onSelectPlayer={onSelectPlayer} />}
        {section === 'Results' && (recentMatches.length ? (
          <div className="arena-match-grid">{recentMatches.map((match) => <Link key={match.id} className="arena-panel arena-match-card" to={`/public/live?match=${match.id}`}><MatchSummary match={match} /></Link>)}</div>
        ) : <div className="arena-state">{matchNotice || 'No match results are available for this club.'}</div>)}
        {section === 'Statistics' && (
          <section className="arena-panel">
            <div className="arena-panel-head"><DetailHeading className="arena-section-title">League statistics</DetailHeading></div>
            {standing ? <dl className="arena-club-stat-grid">
              {[
                ['Played', standing.played], ['Wins', standing.won], ['Draws', standing.drawn], ['Losses', standing.lost],
                ['Goals for', standing.goals_for], ['Goals against', standing.goals_against], ['Goal difference', standing.goal_difference], ['Points', standing.points],
              ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
            </dl> : <p className="arena-club-overview-text">League statistics are unavailable for this club.</p>}
          </section>
        )}
      </div>
    </article>
  );
}
