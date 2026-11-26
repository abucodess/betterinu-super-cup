import React, { useState } from 'react';
import { ArrowUp, Layers, UserRound } from 'lucide-react';
import { ClubCrest } from '../../components/shared/ArenaUI';
import { TACTICAL_FORMATIONS, mapSquadToFormationSlots } from '../../utils/tournamentRules';
import { cloudinaryService } from '../../services/cloudinary/cloudinary.service';
import '../../arena.css';

function PitchMarks() {
  return (
    <svg viewBox="0 0 520 600" preserveAspectRatio="xMidYMid meet" className="game-plan-lines" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="13" y="20" width="494" height="560" rx="2" />
      <path d="M13 300H507 M216 20V5h88v15 M216 580v15h88v-15" />
      <circle cx="260" cy="300" r="49" />
      <circle cx="260" cy="300" r="3" fill="currentColor" />
      <path d="M143 20v42a83 83 0 0 0 83 83h68a83 83 0 0 0 83-83V20 M143 580v-42a83 83 0 0 1 83-83h68a83 83 0 0 1 83 83v42 M207 20v49h106V20 M207 580v-49h106v49" />
      <circle cx="260" cy="109" r="2.5" fill="currentColor" />
      <circle cx="260" cy="491" r="2.5" fill="currentColor" />
      <path d="M13 37a17 17 0 0 0 17-17 M490 20a17 17 0 0 0 17 17 M13 563a17 17 0 0 1 17 17 M490 580a17 17 0 0 1 17-17" />
    </svg>
  );
}

function PitchPlayer({ player, role, onSelect, active, children }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const photo = cloudinaryService.getOptimizedPortraitUrl(player.photo_url);
  return (
    <button type="button" className="game-plan-player" onClick={onSelect} aria-pressed={active} aria-haspopup="dialog">
      <span className="sr-only">Inspect player </span>
      <span className="game-plan-portrait" aria-hidden="true">
        {photo && photo !== failedUrl ? <img src={photo} alt="" loading="lazy" decoding="async" onError={() => setFailedUrl(photo)} /> : <UserRound size={19} />}
        {player.jersey_number != null && <span className="game-plan-number">#{player.jersey_number}</span>}
      </span>
      <span className="game-plan-player-name">{player.name}</span>
      <span className="game-plan-player-role">{children || role}</span>
      {children && <span className="sr-only">, {role}</span>}
    </button>
  );
}

export function TacticalPitchView({ team, players = [], initialFormation = '1-2-1', onSelectPlayer }) {
  const [formationKey, setFormationKey] = useState(TACTICAL_FORMATIONS[initialFormation] ? initialFormation : '1-2-1');
  const [activeId, setActiveId] = useState(null);
  const { formation, slots } = mapSquadToFormationSlots(players, formationKey);
  const squad = players.filter((player) => !player.is_non_player && player.position !== 'SUP' && Number(player.jersey_number) !== 0);
  const keeperCount = squad.filter((player) => player.is_goalkeeper || player.position === 'GK').length;
  const starters = slots.map((slot) => slot.player).filter(Boolean);
  const reserves = squad.filter((player) => !starters.some((starter) => starter.id === player.id));

  function selectPlayer(player) {
    setActiveId(player.id);
    onSelectPlayer?.(player);
  }

  return (
    <section className="game-plan" aria-label={`${team?.name || 'Assigned squad'} game plan`}
      style={{ '--club-accent': team?.color_code || '#626fff' }}>
      <div className="game-plan-grid">
        <div className="game-plan-controls">
          <div className="game-plan-heading"><ClubCrest club={team} /><div><h3>Game Plan</h3><p>{team?.name || 'Assigned squad'} · 5-a-side</p></div></div>
          <div className="game-plan-control-heading"><Layers size={16} /> Formation</div>
          <div className="game-plan-formations" role="group" aria-label="Formation">
            {Object.values(TACTICAL_FORMATIONS).map((option) => (
              <button type="button" key={option.id} aria-pressed={option.id === formationKey} title={option.name} onClick={() => setFormationKey(option.id)}>{option.id}</button>
            ))}
          </div>
          <div className="game-plan-formation-description" aria-live="polite">
            <strong>{formation.name}</strong>
            <p>{formation.style}. {formation.description}</p>
          </div>
          <dl className="game-plan-counts">
            <div><dt>Players</dt><dd>{squad.length}</dd></div>
            <div><dt>Goalkeepers</dt><dd>{keeperCount}</dd></div>
            <div><dt>Outfield</dt><dd>{squad.length - keeperCount}</dd></div>
          </dl>
        </div>
        <div className="game-plan-board">
          <div className="game-plan-pitch">
            <PitchMarks />
            <div className="game-plan-direction"><ArrowUp size={12} /> Attack</div>
            {slots.map((slot) => <div key={slot.player?.id || slot.id} className="game-plan-slot" style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
              {slot.player ? <PitchPlayer player={slot.player} role={slot.label} active={activeId === slot.player.id}
                onSelect={() => selectPlayer(slot.player)}>{slot.role}</PitchPlayer> :
                <span className="game-plan-vacancy" aria-label={`Unfilled position: ${slot.label}`}><strong>{slot.role}</strong><small>Open</small></span>}
            </div>)}
          </div>
        </div>
        <aside className="game-plan-reserves">
          <h4>Substitutes <span>{reserves.length}</span></h4>
          {reserves.length ? <ul>{reserves.map((player) => <li key={player.id}><PitchPlayer player={player}
            role={player.position} active={activeId === player.id} onSelect={() => selectPlayer(player)} /></li>)}</ul> : <p>No substitutes assigned.</p>}
        </aside>
      </div>
    </section>
  );
}

export default TacticalPitchView;
