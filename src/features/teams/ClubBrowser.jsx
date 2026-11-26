import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ClubCrest } from '../../components/shared/ArenaUI';
import { ClubProfile } from './ClubProfile';
import { darkHorseClubId, officialCrests } from './officialCrests';

export function ClubBrowser({ teams, club, players, standings, matches, matchState, onSelectClub, onSelectPlayer }) {
  const optionsRef = useRef(null);
  const selectedIndex = teams.findIndex((team) => team.id === club.id);

  useEffect(() => {
    const options = optionsRef.current;
    const selected = options?.querySelector('[aria-pressed="true"]');
    if (!selected || options.scrollWidth <= options.clientWidth) return;
    const item = selected.getBoundingClientRect();
    const view = options.getBoundingClientRect();
    if (item.left < view.left) options.scrollLeft += item.left - view.left - 8;
    if (item.right > view.right) options.scrollLeft += item.right - view.right + 8;
  }, [club.id]);

  function stepClub(direction) {
    const nextIndex = (selectedIndex + direction + teams.length) % teams.length;
    onSelectClub(teams[nextIndex].id);
  }
  return (
    <div className="arena-club-browser" style={{ '--club-accent': club.color_code || '#626fff' }}>
      <aside className="arena-panel arena-info arena-club-selector">
        <div className="arena-panel-head">
          <h2 className="arena-section-title">Select a club</h2>
          {teams.length > 1 && <div className="arena-club-step">
            <button type="button" className="arena-icon-button" aria-label="Previous club" onClick={() => stepClub(-1)}><ChevronLeft size={17} /></button>
            <button type="button" className="arena-icon-button" aria-label="Next club" onClick={() => stepClub(1)}><ChevronRight size={17} /></button>
          </div>}
        </div>
        <div ref={optionsRef} className="arena-club-options" role="group" aria-label="Select a club">
          {teams.map((team) => <button type="button" key={team.id} aria-pressed={team.id === club.id} onClick={() => onSelectClub(team.id)}>
            <ClubCrest club={team} /><span>{team.name}</span><ArrowRight size={15} aria-hidden="true" />
          </button>)}
        </div>
      </aside>

      {club.id === darkHorseClubId ? (
        <section className="arena-panel arena-panel-head flex-wrap">
          <div className="flex items-center gap-2">
            <ClubCrest club={{ ...club, logo_url: officialCrests.FCC }} />
            <h2 className="arena-section-title">Dark Horse FC</h2>
          </div>
          <Link className="arena-button arena-button-primary" to={`/public/teams/${club.id}`}>
            Explore the club <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : <ClubProfile club={club} players={players} standings={standings} matches={matches}
        matchState={matchState} onSelectPlayer={onSelectPlayer} />}
    </div>
  );
}
