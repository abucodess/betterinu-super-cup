import React from 'react';
import { X, Heart } from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { ModalDialog } from '../../components/ui/ModalDialog';
import '../../arena.css';
import { calculatePlayerProfileMetrics } from '../../utils/tournamentRules';

/**
 * Clean, Mobile-First Player & Team Supporter Card Popup Modal.
 * Displays the uploaded eFootball Player Card or Team Supporter Card along with team assignment
 * and either a 4-metric tournament stat strip (for players) or supporter details (for non-players).
 */
export function PlayerProfileModal({
  player,
  team,
  stats = {},
  matchEvents = [],
  teamMatches = [],
  statsLoading = false,
  statsUnavailable = false,
  onClose,
}) {
  if (!player) return null;

  const isNonPlayer = Boolean(
    player.is_non_player || player.position === 'SUP' || player.jersey_number === 0
  );
  const resolvedTeam = team || player.team || null;
  const metrics = calculatePlayerProfileMetrics(player, stats, matchEvents, teamMatches);
  const isGK = metrics?.isGoalkeeper;

  return (
    <ModalDialog className="player-sheet" labelledBy="player-profile-modal-title" onDismiss={onClose}>
      <div>
        {/* Compact Header */}
        <div className="player-sheet-header">
          <div className="min-w-0">
            <h2
              id="player-profile-modal-title"
              className="player-sheet-title"
            >
              {isNonPlayer ? player.name : `${player.jersey_number == null ? "" : `#${player.jersey_number} `}${player.name}`}
            </h2>
            <p className="player-sheet-subtitle">
              {isNonPlayer ? 'Team Supporter' : player.position} •{' '}
              {resolvedTeam?.name || (isNonPlayer ? 'All Teams' : 'Unallocated Pool')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="arena-icon-button player-sheet-close"
            aria-label="Close player profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Card + Stats or Supporter Details */}
        <div className="p-4 space-y-4">
          <div className="player-sheet-card">
            <PlayerCard
              player={player}
              team={resolvedTeam}
              stats={stats}
              matchEvents={matchEvents}
              teamMatches={teamMatches}
              variant="full"
            />
          </div>

          {isNonPlayer ? (
            <div className="player-sheet-supporter">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Non-Player • Team Supporter</span>
                </span>
                <span className="text-[11px] font-semibold">
                  {resolvedTeam?.short_code || 'Club Support'}
                </span>
              </div>
              <p className="text-xs leading-relaxed">
                {player.details || 'Official Team Supporter'}
              </p>
            </div>
          ) : statsLoading || statsUnavailable ? (
            <p className="player-sheet-status" role="status">
              {statsLoading ? 'Loading player statistics…' : 'Player statistics are temporarily unavailable.'}
            </p>
          ) : (
            <dl className="player-sheet-stats">
              {(isGK ? [
                ['Appearances', metrics.appearances], ['Clean sheets', metrics.cleanSheets],
                ['Saves', metrics.saves], ['Cards (Y/R)', `${metrics.yellowCards}/${metrics.redCards}`],
              ] : [
                ['Appearances', metrics.appearances], ['Goals', metrics.goals],
                ['Yellow cards', metrics.yellowCards], ['Red cards', metrics.redCards],
              ]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              {metrics.assists > 0 && <div><dt>Assists</dt><dd>{metrics.assists}</dd></div>}
            </dl>
          )}
        </div>
      </div>
    </ModalDialog>
  );
}

export default PlayerProfileModal;

