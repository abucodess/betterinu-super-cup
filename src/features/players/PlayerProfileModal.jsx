import React from 'react';
import { X } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { calculatePlayerProfileMetrics } from '../../utils/tournamentRules';

/**
 * Clean, Mobile-First Player Card Popup Modal.
 * Displays the uploaded eFootball Player Card prominently along with team assignment
 * and a concise 4-metric tournament stat strip that fits on a 390px phone screen.
 */
export function PlayerProfileModal({
  player,
  team,
  stats = {},
  matchEvents = [],
  teamMatches = [],
  onClose,
}) {
  if (!player) return null;

  const resolvedTeam = team || player.team || null;
  const metrics = calculatePlayerProfileMetrics(player, stats, matchEvents, teamMatches);
  const isGK = metrics.isGoalkeeper;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-profile-modal-title"
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#141414] border border-[#262626] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626] bg-[#090909]">
          <div className="min-w-0">
            <h2
              id="player-profile-modal-title"
              className="text-sm font-bold text-[#F4F7F2] truncate"
            >
              #{player.jersey_number} {player.name}
            </h2>
            <p className="text-[11px] text-[#9AA69B] truncate">
              {player.position} • {resolvedTeam?.name || 'Unallocated Pool'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030] flex items-center justify-center shrink-0"
            aria-label="Close player profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Pre-Made eFootball Card + Compact 4-Stat Strip */}
        <div className="p-4 space-y-4">
          <div className="max-w-[210px] mx-auto">
            <PlayerCard
              player={player}
              team={resolvedTeam}
              stats={stats}
              matchEvents={matchEvents}
              teamMatches={teamMatches}
              variant="full"
            />
          </div>

          {isGK ? (
            <div className="grid grid-cols-4 gap-2 text-center tabular-nums">
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Apps</span>
                <span className="text-sm font-black text-[#F4F7F2]">{metrics.appearances}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Clean</span>
                <span className="text-sm font-black text-[#22C55E]">{metrics.cleanSheets}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Saves</span>
                <span className="text-sm font-black text-[#B8F34A]">{metrics.saves}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Cards</span>
                <span className="text-sm font-black text-amber-400">
                  {metrics.yellowCards}/{metrics.redCards}
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center tabular-nums">
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Apps</span>
                <span className="text-sm font-black text-[#F4F7F2]">{metrics.appearances}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Goals</span>
                <span className="text-sm font-black text-[#B8F34A]">{metrics.goals}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Yellow</span>
                <span className="text-sm font-black text-amber-400">{metrics.yellowCards}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-[10px] text-[#9AA69B] block">Red</span>
                <span className="text-sm font-black text-red-500">{metrics.redCards}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerProfileModal;
