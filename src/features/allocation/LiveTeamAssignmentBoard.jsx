import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Shield,
  RotateCcw,
  GripVertical,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { PlayerCard } from '../players/PlayerCard';
import { allocationApi } from '../../services/api/allocation.api';
import { soundEffects } from '../../utils/soundEffects';

/**
 * Compact Admin Live Drag-and-Drop & 1-Tap Team Assignment Board.
 * Designed so all 3 Team Drop Zones AND all 10 Unassigned Player Cards fit on screen
 * simultaneously with compact cards ('xs') for effortless drag-and-drop.
 */
export function LiveTeamAssignmentBoard({
  players = [],
  teams = [],
  onSelectPlayer,
}) {
  const queryClient = useQueryClient();

  const [draggedPlayerId, setDraggedPlayerId] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null); // teamId or 'UNASSIGNED'
  const [recentAssignedId, setRecentAssignedId] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');

  const unassignedPlayers = useMemo(() => {
    return players.filter((p) => {
      if (p.team_id) return false;
      const matchesPos = posFilter === 'ALL' || p.position === posFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.jersey_number).includes(searchQuery.trim());
      return matchesPos && matchesSearch;
    });
  }, [players, posFilter, searchQuery]);

  const totalAssigned = useMemo(
    () => players.filter((p) => Boolean(p.team_id)).length,
    [players]
  );

  // Optimistic mutation for instant drag-and-drop feel + live Supabase broadcast
  const assignMutation = useMutation({
    mutationFn: ({ playerId, teamId }) =>
      allocationApi.assignPlayerToTeam({ playerId, teamId }),
    onMutate: async ({ playerId, teamId }) => {
      setErrorBanner('');
      await queryClient.cancelQueries({ queryKey: ['players'] });
      const previousPlayers = queryClient.getQueryData(['players']);
      const targetTeam = teams.find((t) => t.id === teamId) || null;

      queryClient.setQueryData(['players'], (old = []) =>
        old.map((p) =>
          p.id === playerId
            ? {
                ...p,
                team_id: teamId || null,
                team: targetTeam,
              }
            : p
        )
      );

      return { previousPlayers };
    },
    onSuccess: (updated, variables) => {
      const targetTeam = teams.find((t) => t.id === variables.teamId);
      if (variables.teamId) {
        setRecentAssignedId(variables.playerId);
        soundEffects.playWinnerFanfare();
        setStatusBanner({
          playerName: updated.name,
          teamName: targetTeam?.name || 'Team',
          teamColor: targetTeam?.color_code || '#B8F34A',
        });
        setTimeout(() => {
          setRecentAssignedId((prev) => (prev === variables.playerId ? null : prev));
        }, 3500);
      } else {
        soundEffects.playTick();
        setStatusBanner({
          playerName: updated.name,
          teamName: 'Unassigned Pool',
          teamColor: '#9AA69B',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
    onError: (err, _variables, context) => {
      if (context?.previousPlayers) {
        queryClient.setQueryData(['players'], context.previousPlayers);
      }
      setErrorBanner(err.message || 'Failed to update player team assignment.');
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => allocationApi.resetAllocations(),
    onSuccess: () => {
      setShowResetConfirm(false);
      setStatusBanner({
        playerName: 'All players',
        teamName: 'returned to Unassigned Pool',
        teamColor: '#B8F34A',
      });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
    onError: (err) => {
      setErrorBanner(err.message || 'Failed to reset assignments.');
    },
  });

  const handleAssign = (playerId, teamId) => {
    if (!playerId) return;
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    if ((player.team_id || null) === (teamId || null)) return;
    assignMutation.mutate({ playerId, teamId: teamId || null });
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, player) => {
    setDraggedPlayerId(player.id);
    e.dataTransfer.setData('text/plain', player.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedPlayerId(null);
    setDragOverTarget(null);
  };

  const handleDragOver = (e, targetKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget !== targetKey) {
      setDragOverTarget(targetKey);
    }
  };

  const handleDragLeave = (e, targetKey) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverTarget === targetKey) {
        setDragOverTarget(null);
      }
    }
  };

  const handleDrop = (e, targetTeamId) => {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData('text/plain') || draggedPlayerId;
    setDraggedPlayerId(null);
    setDragOverTarget(null);
    if (droppedId) {
      handleAssign(droppedId, targetTeamId === 'UNASSIGNED' ? null : targetTeamId);
    }
  };

  return (
    <div className="space-y-3">
      {/* Compact Top Control Bar */}
      <div className="px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold text-[#F4F7F2]">
            Live Drag & Drop Team Assignment
          </h2>
          <span className="hidden md:inline text-[11px] text-[#9AA69B]">
            — Drag cards into a team or tap +ALP / +BET / +GAM
          </span>
        </div>

        <div className="flex items-center gap-2">
          {statusBanner && (
            <div
              role="status"
              className="px-2.5 py-1 rounded-lg bg-[#202020] border border-[#B8F34A]/40 flex items-center gap-1.5 text-[11px] animate-fade-in"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#B8F34A] shrink-0" />
              <span className="text-[#F4F7F2]">
                <strong>{statusBanner.playerName}</strong> →{' '}
                <strong style={{ color: statusBanner.teamColor }}>
                  {statusBanner.teamName}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="text-[#9AA69B] hover:text-[#F4F7F2] ml-1"
                aria-label="Dismiss notification"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="px-2.5 py-1 rounded-lg bg-[#202020] border border-[#303030] text-xs font-semibold tabular-nums">
            <span className="text-[#9AA69B]">Assigned: </span>
            <span className="text-[#B8F34A] font-bold">
              {totalAssigned} / {players.length}
            </span>
          </div>

          {totalAssigned > 0 && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-red-500/15 text-[#9AA69B] hover:text-red-400 border border-[#303030] hover:border-red-500/30 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {errorBanner && (
        <div
          role="alert"
          className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* SECTION 1: THE 3 TEAM DROP ZONES (COMPACT SO POOL IS VISIBLE RIGHT BELOW) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {teams.map((team) => {
          const teamRoster = players.filter((p) => p.team_id === team.id);
          const isOver = dragOverTarget === team.id;
          const teamColor = team.color_code || '#B8F34A';

          return (
            <div
              key={team.id}
              onDragOver={(e) => handleDragOver(e, team.id)}
              onDragLeave={(e) => handleDragLeave(e, team.id)}
              onDrop={(e) => handleDrop(e, team.id)}
              data-testid={`team-dropzone-${team.short_code}`}
              className={`rounded-xl bg-[#141414] border-2 transition-all duration-150 p-2.5 flex flex-col gap-2 ${
                isOver
                  ? 'border-[#B8F34A] bg-[#1a2210]/60 scale-[1.01] shadow-lg'
                  : 'border-[#262626]'
              }`}
            >
              {/* Compact Team Header */}
              <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] text-[#090909] shrink-0"
                    style={{ backgroundColor: teamColor }}
                  >
                    {team.short_code}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-[#F4F7F2] truncate leading-tight">
                      {team.name}
                    </h3>
                    <span className="text-[10px] text-[#9AA69B] block leading-none mt-0.5">
                      Drop player card here
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold tabular-nums px-2 py-0.5 rounded-md bg-[#202020] text-[#F4F7F2]">
                  {teamRoster.length} / 5
                </span>
              </div>

              {/* Team Assigned Mini Cards Grid */}
              {teamRoster.length === 0 ? (
                <div
                  className={`min-h-[110px] rounded-lg border border-dashed flex flex-col items-center justify-center p-2 text-center transition-colors ${
                    isOver
                      ? 'border-[#B8F34A] bg-[#B8F34A]/10 text-[#B8F34A]'
                      : 'border-[#303030] bg-[#0E0E0E]/60 text-[#9AA69B]'
                  }`}
                >
                  <Shield className="w-4 h-4 mb-1 opacity-60" />
                  <p className="text-[11px] font-semibold">
                    {isOver ? `Drop into ${team.name}` : 'Empty Roster'}
                  </p>
                  <p className="text-[10px] opacity-70">Drag card here</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 xl:grid-cols-5 gap-1.5 justify-items-center">
                  {teamRoster.map((player) => {
                    const isNewlyAssigned = recentAssignedId === player.id;
                    return (
                      <div
                        key={player.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, player)}
                        onDragEnd={handleDragEnd}
                        className={`w-full cursor-grab active:cursor-grabbing rounded-lg transition-all animate-card-pop ${
                          draggedPlayerId === player.id ? 'opacity-40 scale-95' : ''
                        } ${isNewlyAssigned ? 'ring-2 ring-[#B8F34A]' : ''}`}
                      >
                        <PlayerCard
                          player={player}
                          team={team}
                          size="xs"
                          onSelect={onSelectPlayer}
                          actionSlot={
                            <div className="flex items-center justify-between gap-0.5 text-[9px]">
                              <span className="inline-flex items-center text-[#9AA69B]">
                                <GripVertical className="w-2.5 h-2.5" />
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAssign(player.id, null)}
                                className="inline-flex items-center gap-0.5 font-bold text-red-400 hover:text-red-300"
                                title={`Remove ${player.name} from ${team.name}`}
                              >
                                <X className="w-2.5 h-2.5" />
                                <span>Out</span>
                              </button>
                            </div>
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION 2: UNASSIGNED PLAYER POOL (ULTRA-COMPACT MINI CARDS) */}
      <div
        onDragOver={(e) => handleDragOver(e, 'UNASSIGNED')}
        onDragLeave={(e) => handleDragLeave(e, 'UNASSIGNED')}
        onDrop={(e) => handleDrop(e, 'UNASSIGNED')}
        data-testid="unassigned-pool-dropzone"
        className={`rounded-xl bg-[#141414] border-2 transition-all p-3 space-y-2.5 ${
          dragOverTarget === 'UNASSIGNED'
            ? 'border-[#B8F34A] bg-[#1a2210]/40'
            : 'border-[#262626]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#B8F34A]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F4F7F2]">
              Unassigned Player Pool ({unassignedPlayers.length})
            </h3>
          </div>

          {/* Compact Search & Position Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative w-36 sm:w-44">
              <Search className="w-3 h-3 text-[#9AA69B] absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#202020] border border-[#303030] rounded-lg pl-6 pr-2 py-1 text-[11px] text-[#F4F7F2] placeholder-[#9AA69B]/60 focus:outline-none focus:border-[#B8F34A]"
              />
            </div>

            <div className="flex items-center gap-1">
              {['ALL', 'GK', 'CB', 'MF', 'FW'].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosFilter(pos)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                    posFilter === pos
                      ? 'bg-[#B8F34A] text-[#090909]'
                      : 'bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2]'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {unassignedPlayers.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#9AA69B] border border-dashed border-[#303030] rounded-lg">
            {players.length === 0
              ? 'No players registered yet. Add player cards in the Players tab.'
              : 'All players have been assigned to teams! Drag a player here to unassign.'}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 justify-items-center">
            {unassignedPlayers.map((player) => (
              <div
                key={player.id}
                draggable
                onDragStart={(e) => handleDragStart(e, player)}
                onDragEnd={handleDragEnd}
                className={`w-full cursor-grab active:cursor-grabbing transition-transform ${
                  draggedPlayerId === player.id ? 'opacity-40 scale-95' : ''
                }`}
              >
                <PlayerCard
                  player={player}
                  size="xs"
                  onSelect={onSelectPlayer}
                  actionSlot={
                    <div className="grid grid-cols-3 gap-0.5">
                      {teams.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleAssign(player.id, t.id)}
                          disabled={assignMutation.isPending}
                          className="py-1 px-0.5 rounded bg-[#202020] hover:bg-[#B8F34A] text-[#F4F7F2] hover:text-[#090909] border border-[#303030] text-[8px] font-black leading-none transition-colors text-center"
                          title={`Assign ${player.name} to ${t.name}`}
                        >
                          {t.short_code}
                        </button>
                      ))}
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset All Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#141414] border border-[#262626] p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="font-bold text-sm text-[#F4F7F2]">Reset All Team Assignments</h3>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
                aria-label="Close reset confirmation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#9AA69B] leading-relaxed">
              This will move all assigned players back to the Unassigned Pool so you can start the live presentation draw fresh.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-2 rounded-xl bg-[#202020] text-[#F4F7F2] text-xs font-semibold border border-[#303030]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="px-3.5 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
              >
                {resetMutation.isPending ? 'Resetting...' : 'Reset All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTeamAssignmentBoard;
