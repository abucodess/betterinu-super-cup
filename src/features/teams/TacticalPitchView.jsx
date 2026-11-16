import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { TACTICAL_FORMATIONS, mapSquadToFormationSlots } from '../../utils/tournamentRules';
import { PlayerCard } from '../players/PlayerCard';

/**
 * Interactive 5-a-side Football Pitch Tactical View (eFootball Game Plan aesthetic).
 * Maps a team's 5-player squad (1 GK + 4 Outfield) onto selectable tactical formations.
 */
export function TacticalPitchView({
  team,
  players = [],
  playerStatsMap = {},
  matchEvents = [],
  teamMatches = [],
  initialFormation = '1-2-1',
  onSelectPlayer,
}) {
  const [formationKey, setFormationKey] = useState(
    TACTICAL_FORMATIONS[initialFormation] ? initialFormation : '1-2-1'
  );

  const { formation, slots } = mapSquadToFormationSlots(players, formationKey);
  const teamColor = team?.color_code || '#072AC8';

  const squadCount = players.length;
  const gkCount = players.filter((p) => p.position === 'GK' || p.is_goalkeeper).length;
  const outfieldCount = squadCount - gkCount;

  return (
    <div className="rounded-2xl bg-[#141414] border border-[#262626] shadow-sm overflow-hidden">
      {/* Top Tactical Control Bar */}
      <div className="p-4 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1C1C1C]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-[#FFFFFF] shrink-0 shadow-xs"
            style={{ backgroundColor: teamColor }}
          >
            {team?.short_code || 'TM'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#F4F7F2]">
                {team?.name || 'Assigned Squad'} — Game Plan
              </h3>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-[#FFC600]/15 text-[#FFC600] border border-[#FFC600]/45">
                {formation.name}
              </span>
            </div>
            <p className="text-xs font-medium text-[#9AA69B]">
              {formation.description} • Click any player on the pitch to open full dossier
            </p>
          </div>
        </div>

        {/* Formation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#9AA69B] mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#FFC600]" /> Formation:
          </span>
          {Object.keys(TACTICAL_FORMATIONS).map((key) => {
            const active = key === formationKey;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFormationKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[#001AFF] text-[#FFFFFF] shadow-xs border border-[#3B82F6]/40'
                    : 'bg-[#141414] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030]'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 5-a-side Football Pitch Canvas */}
      <div className="relative w-full h-[460px] sm:h-[520px] bg-[#0F5132] overflow-hidden select-none">
        {/* Alternating Turf Stripes */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #146C43 0px, #146C43 52px, #0F5132 52px, #0F5132 104px)',
          }}
        />

        {/* Subtle Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 pointer-events-none" />

        {/* Pitch Boundary & Markings SVG */}
        <svg
          viewBox="0 0 600 700"
          preserveAspectRatio="none"
          className="absolute inset-3 sm:inset-5 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2.5rem)] h-[calc(100%-1.5rem)] sm:h-[calc(100%-2.5rem)] text-white/45 pointer-events-none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <rect x="10" y="10" width="580" height="680" rx="6" />
          <line x1="10" y1="350" x2="590" y2="350" />
          <circle cx="300" cy="350" r="65" />
          <circle cx="300" cy="350" r="4" fill="currentColor" />

          {/* Top Penalty Area */}
          <rect x="145" y="10" width="310" height="105" />
          <rect x="220" y="10" width="160" height="42" />
          <path d="M 240 115 A 60 60 0 0 0 360 115" />

          {/* Bottom Penalty Area */}
          <rect x="145" y="585" width="310" height="105" />
          <rect x="220" y="648" width="160" height="42" />
          <path d="M 240 585 A 60 60 0 0 1 360 585" />

          {/* Corner Arcs */}
          <path d="M 10 28 A 18 18 0 0 0 28 10" />
          <path d="M 572 10 A 18 18 0 0 0 590 28" />
          <path d="M 10 672 A 18 18 0 0 1 28 690" />
          <path d="M 572 690 A 18 18 0 0 1 590 672" />
        </svg>

        {/* Direction Watermark */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white/60 pointer-events-none">
          ▲ Attacking Direction ▲
        </div>

        {/* Positioned Formation Slots */}
        {slots.map((slot) => {
          const player = slot.player;
          const playerStats = player ? playerStatsMap[player.id] || {} : {};
          const playerEvents = player
            ? matchEvents.filter((e) => e.player_id === player.id)
            : [];

          return (
            <div
              key={slot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              {player ? (
                <PlayerCard
                  player={player}
                  team={team}
                  stats={playerStats}
                  matchEvents={playerEvents}
                  teamMatches={teamMatches}
                  variant="compact"
                  onSelect={onSelectPlayer}
                />
              ) : (
                <div className="w-24 sm:w-28 rounded-xl bg-[#141414]/95 border border-[#303030] p-2.5 text-center shadow-md">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#001AFF]/20 border border-[#3B82F6]/45 flex items-center justify-center text-[10px] font-extrabold text-[#FFC600]">
                    {slot.role}
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-[#F4F7F2] truncate">
                    {slot.label}
                  </p>
                  <p className="text-[9px] text-[#FFC600] uppercase font-bold">
                    Unfilled Slot
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pitch Footer Bar */}
      <div className="px-4 py-3 border-t border-[#262626] bg-[#1C1C1C] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 tabular-nums">
          <span className="text-[#9AA69B] font-medium">
            Squad Size: <strong className="text-[#F4F7F2]">{squadCount} / 5</strong>
          </span>
          <span className="text-[#9AA69B] font-medium">
            Goalkeeper:{' '}
            <strong className={gkCount === 1 ? 'text-[#4ADE80]' : 'text-[#FFC600]'}>
              {gkCount} / 1
            </strong>
          </span>
          <span className="text-[#9AA69B] font-medium">
            Outfield:{' '}
            <strong className={outfieldCount === 4 ? 'text-[#4ADE80]' : 'text-[#FFC600]'}>
              {outfieldCount} / 4
            </strong>
          </span>
        </div>
        <span className="text-[#9AA69B] font-medium">
          5-a-Side Official Tournament Format (1 GK + 4 Outfield)
        </span>
      </div>
    </div>
  );
}

export default TacticalPitchView;
