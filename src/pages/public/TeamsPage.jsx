import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { TacticalPitchView } from '../../features/teams/TacticalPitchView';
import { teamsApi } from '../../services/api/teams.api';
import { playersApi } from '../../services/api/players.api';
import { matchesApi } from '../../services/api/matches.api';
import { standingsApi } from '../../services/api/standings.api';
import { allocationApi } from '../../services/api/allocation.api';
import { soundEffects } from '../../utils/soundEffects';

export function TeamsPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState('live_teams'); // 'live_teams' | 'cards' | 'pitch'
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Live Presentation / Big Screen State
  const [isBigScreen, setIsBigScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spotlightReveal, setSpotlightReveal] = useState(null);
  const [newlyAssignedIds, setNewlyAssignedIds] = useState({});

  const prevTeamMapRef = useRef(null);
  const spotlightTimerRef = useRef(null);

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
    refetchInterval: 4000,
  });

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
    refetchInterval: 2000,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['all_match_events'],
    queryFn: () => matchesApi.getAllMatchEvents(),
  });

  const { data: playerStatsList = [] } = useQuery({
    queryKey: ['player_stats'],
    queryFn: () => standingsApi.getPlayerStats(),
  });

  const playerStatsMap = useMemo(() => {
    const map = {};
    playerStatsList.forEach((s) => {
      map[s.player_id] = s;
    });
    return map;
  }, [playerStatsList]);

  // Trigger animated spotlight reveal when a player is assigned to a team
  const triggerPlayerAssignmentReveal = (playerObj, teamObj) => {
    if (!playerObj || !teamObj) return;

    if (soundEnabled) {
      soundEffects.playWinnerFanfare();
    }

    setNewlyAssignedIds((prev) => ({
      ...prev,
      [playerObj.id]: Date.now(),
    }));

    setSpotlightReveal({
      player: playerObj,
      team: teamObj,
      timestamp: Date.now(),
    });

    if (spotlightTimerRef.current) {
      clearTimeout(spotlightTimerRef.current);
    }
    spotlightTimerRef.current = setTimeout(() => {
      setSpotlightReveal(null);
    }, 3800);
  };

  // Detect any player team_id change across fetches (even if WebSocket broadcast was missed)
  useEffect(() => {
    if (!players || players.length === 0 || teams.length === 0) return;

    const currentMap = {};
    players.forEach((p) => {
      currentMap[p.id] = p.team_id || null;
    });

    if (prevTeamMapRef.current !== null) {
      for (const player of players) {
        const prevTeamId = prevTeamMapRef.current[player.id] ?? null;
        const newTeamId = player.team_id || null;
        if (newTeamId && newTeamId !== prevTeamId) {
          const targetTeam =
            teams.find((t) => t.id === newTeamId) || player.team || null;
          if (targetTeam) {
            triggerPlayerAssignmentReveal(player, targetTeam);
          }
        }
      }
    }

    prevTeamMapRef.current = currentMap;
  }, [players, teams]);

  // Subscribe to instant Supabase Realtime Broadcast & postgres_changes
  useEffect(() => {
    const unsubscribe = allocationApi.subscribeToLiveDraft((event) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });

      if (event?.action === 'ASSIGNED' && event.playerId && event.teamId) {
        const playerObj = players.find((p) => p.id === event.playerId) || {
          id: event.playerId,
          name: event.playerName || 'Player',
          photo_url: event.playerPhotoUrl || null,
          position: event.playerPosition || 'FW',
          jersey_number: event.playerJersey || 10,
          team_id: event.teamId,
        };
        const teamObj = teams.find((t) => t.id === event.teamId) || {
          id: event.teamId,
          name: event.teamName || 'Assigned Team',
          short_code: event.teamShortCode || 'TM',
          color_code: event.teamColor || '#B8F34A',
        };

        // Update prevTeamMapRef immediately so the query diff doesn't double-fire
        if (prevTeamMapRef.current) {
          prevTeamMapRef.current[event.playerId] = event.teamId;
        }

        triggerPlayerAssignmentReveal(playerObj, teamObj);
      }
    });

    return () => {
      unsubscribe();
      if (spotlightTimerRef.current) {
        clearTimeout(spotlightTimerRef.current);
      }
    };
  }, [queryClient, players, teams, soundEnabled]);

  const unassignedPlayers = useMemo(
    () => players.filter((p) => !p.team_id),
    [players]
  );

  const assignedCount = players.length - unassignedPlayers.length;

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesTeam =
        selectedTeamFilter === 'ALL'
          ? true
          : selectedTeamFilter === 'UNALLOCATED'
          ? !p.team_id
          : p.team_id === selectedTeamFilter;
      const matchesPos = positionFilter === 'ALL' || p.position === positionFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(p.jersey_number).includes(searchQuery.trim());
      return matchesTeam && matchesPos && matchesSearch;
    });
  }, [players, selectedTeamFilter, positionFilter, searchQuery]);

  const activeSingleTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamFilter) || teams[0] || null,
    [teams, selectedTeamFilter]
  );

  const renderLiveTeamsBoard = () => (
    <div className="space-y-6">
      {/* Live Team Rosters (3 Columns on Desktop / Big Screen, Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {teams.map((team) => {
          const teamRoster = players.filter((p) => p.team_id === team.id);
          const teamColor = team.color_code || '#B8F34A';
          const openSlotsCount = Math.max(0, 5 - teamRoster.length);

          return (
            <div
              key={team.id}
              data-testid={`public-team-board-${team.short_code}`}
              className="rounded-2xl bg-[#141414] border border-[#262626] overflow-hidden flex flex-col"
            >
              {/* Team Color Top Accent Strip */}
              <div className="h-1.5 w-full" style={{ backgroundColor: teamColor }} />

              {/* Team Header */}
              <div className="p-4 border-b border-[#262626] flex items-center justify-between gap-2 bg-[#0E0E0E]/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-[#090909] shrink-0 shadow"
                    style={{ backgroundColor: teamColor }}
                  >
                    {team.short_code}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-[#F4F7F2] truncate">
                      {team.name}
                    </h2>
                    <p className="text-[11px] text-[#9AA69B] truncate">
                      {teamRoster.length === 0
                        ? 'Awaiting draft picks'
                        : `${teamRoster.length} assigned`}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-[#202020] border border-[#303030] text-xs font-black tabular-nums text-[#F4F7F2] shrink-0">
                  {teamRoster.length} / 5
                </div>
              </div>

              {/* Assigned Player Cards + Open Slot Placeholders */}
              <div className="p-2.5 sm:p-3 flex-1">
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-2 justify-items-center">
                  {teamRoster.map((player) => {
                    const isRecent =
                      newlyAssignedIds[player.id] &&
                      Date.now() - newlyAssignedIds[player.id] < 10000;

                    return (
                      <div
                        key={player.id}
                        className={`w-full animate-card-pop rounded-xl transition-all ${
                          isRecent
                            ? 'ring-2 ring-[#B8F34A] shadow-[0_0_24px_rgba(184,243,74,0.28)]'
                            : ''
                        }`}
                      >
                        <PlayerCard
                          player={player}
                          team={team}
                          size="xs"
                          stats={playerStatsMap[player.id] || {}}
                          matchEvents={allEvents.filter((e) => e.player_id === player.id)}
                          teamMatches={matches.filter(
                            (m) =>
                              m.home_team_id === player.team_id ||
                              m.away_team_id === player.team_id
                          )}
                          onSelect={(p) => setSelectedPlayer(p)}
                        />
                      </div>
                    );
                  })}

                  {/* Empty Slot Placeholders for Visual Presentation Clarity */}
                  {Array.from({ length: openSlotsCount }).map((_, idx) => {
                    const slotNum = teamRoster.length + idx + 1;
                    return (
                      <div
                        key={`empty-slot-${team.id}-${slotNum}`}
                        className="w-full aspect-[3/4] max-w-[92px] sm:max-w-[104px] mx-auto rounded-xl border border-dashed border-[#262626] bg-[#0B0B0B]/60 flex flex-col items-center justify-center p-2 text-center"
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-[#303030] flex items-center justify-center text-[10px] font-bold text-[#9AA69B]/60 mb-1"
                        >
                          #{slotNum}
                        </div>
                        <span className="text-[9px] font-semibold text-[#9AA69B]/60">
                          Open
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Draft Pool Section */}
      <div className="rounded-2xl bg-[#141414] border border-[#262626] p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#B8F34A]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F4F7F2]">
              Available Draft Pool ({unassignedPlayers.length} Remaining)
            </h3>
          </div>
          <span className="text-[11px] text-[#9AA69B]">
            Updates live as players are assigned to teams
          </span>
        </div>

        {unassignedPlayers.length === 0 ? (
          <div className="py-6 text-center text-xs sm:text-sm text-[#B8F34A] font-semibold bg-[#0E0E0E] rounded-xl border border-[#262626]">
            All {players.length} players have been assigned to their teams!
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 justify-items-center">
            {unassignedPlayers.map((player) => (
              <div key={player.id} className="w-full animate-card-pop">
                <PlayerCard
                  player={player}
                  size="xs"
                  stats={playerStatsMap[player.id] || {}}
                  onSelect={(p) => setSelectedPlayer(p)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={
        isBigScreen
          ? 'fixed inset-0 z-50 bg-[#090909] text-[#F4F7F2] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5'
          : 'space-y-4 sm:space-y-5'
      }
    >
      {/* Top Bar: Title, Live Progress, View Switcher & Big Screen Presentation Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141414] p-3.5 sm:p-4 rounded-2xl border border-[#262626]">
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-pulse" />
              <h1 className="text-base sm:text-xl font-black tracking-tight text-[#F4F7F2]">
                Teams &amp; Live Draw
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9AA69B] tabular-nums">
              {assignedCount} of {players.length} players assigned to teams
            </p>
          </div>

          {/* Mobile Big Screen & Sound Controls */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
              className="p-2 rounded-xl bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030]"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#B8F34A]" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsBigScreen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#202020] text-[#F4F7F2] border border-[#303030] text-xs font-bold"
            >
              {isBigScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-[#B8F34A]" />}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {/* View Mode Segmented Switcher */}
          <div className="flex items-center gap-1 bg-[#090909] p-1 rounded-xl border border-[#303030]">
            <button
              type="button"
              onClick={() => setViewMode('live_teams')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                viewMode === 'live_teams'
                  ? 'bg-[#B8F34A] text-[#090909]'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Live Teams
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                viewMode === 'cards'
                  ? 'bg-[#B8F34A] text-[#090909]'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Cards ({players.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('pitch');
                if (selectedTeamFilter === 'ALL' || selectedTeamFilter === 'UNALLOCATED') {
                  if (teams[0]?.id) setSelectedTeamFilter(teams[0].id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                viewMode === 'pitch'
                  ? 'bg-[#B8F34A] text-[#090909]'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              5v5 Pitch
            </button>
          </div>

          {/* Desktop Big Screen & Sound Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
              title={soundEnabled ? 'Sound effects ON' : 'Sound effects OFF'}
              className="p-2 rounded-xl bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030] transition-colors"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#B8F34A]" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsBigScreen((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#202020] hover:border-[#B8F34A] text-[#F4F7F2] border border-[#303030] text-xs font-bold transition-colors whitespace-nowrap"
            >
              {isBigScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#B8F34A]" />
                  <span>Exit Big Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#B8F34A]" />
                  <span>Big Screen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Ribbon for 'cards' or 'pitch' mode */}
      {viewMode !== 'live_teams' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {viewMode === 'cards' && (
              <button
                type="button"
                onClick={() => setSelectedTeamFilter('ALL')}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                  selectedTeamFilter === 'ALL'
                    ? 'bg-[#B8F34A] text-[#090909] border-[#B8F34A]'
                    : 'bg-[#141414] text-[#F4F7F2] border-[#303030]'
                }`}
              >
                <span>All Players ({players.length})</span>
              </button>
            )}

            {teams.map((team) => {
              const count = players.filter((p) => p.team_id === team.id).length;
              const isSelected = selectedTeamFilter === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamFilter(team.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#202020] text-[#F4F7F2] border-[#B8F34A]'
                      : 'bg-[#141414] text-[#9AA69B] border-[#303030]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: team.color_code }}
                  />
                  <span>{team.name}</span>
                  <span className="text-[10px] text-[#9AA69B] tabular-nums">({count}/5)</span>
                </button>
              );
            })}

            {viewMode === 'cards' && (
              <button
                type="button"
                onClick={() => setSelectedTeamFilter('UNALLOCATED')}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  selectedTeamFilter === 'UNALLOCATED'
                    ? 'bg-[#202020] text-[#B8F34A] border-[#B8F34A]'
                    : 'bg-[#141414] text-[#9AA69B] border-[#303030]'
                }`}
              >
                Unassigned ({unassignedPlayers.length})
              </button>
            )}
          </div>

          {viewMode === 'cards' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#141414] p-3 rounded-xl border border-[#262626]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#9AA69B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player name or jersey #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F4F7F2] placeholder-[#9AA69B]/60 focus:outline-none focus:border-[#B8F34A]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'GK', 'CB', 'MF', 'FW'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPositionFilter(pos)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      positionFilter === pos
                        ? 'bg-[#B8F34A] text-[#090909]'
                        : 'bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {loadingTeams || loadingPlayers ? (
        <Card className="p-8 text-center text-[#9AA69B]">
          Loading live teams and player cards...
        </Card>
      ) : viewMode === 'live_teams' ? (
        renderLiveTeamsBoard()
      ) : viewMode === 'pitch' && activeSingleTeam ? (
        <TacticalPitchView
          team={activeSingleTeam}
          players={players.filter((p) => p.team_id === activeSingleTeam.id)}
          playerStatsMap={playerStatsMap}
          matchEvents={allEvents}
          teamMatches={matches.filter(
            (m) =>
              m.home_team_id === activeSingleTeam.id ||
              m.away_team_id === activeSingleTeam.id
          )}
          onSelectPlayer={(p) => setSelectedPlayer(p)}
        />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3 justify-items-center">
          {filteredPlayers.map((player) => {
            const pTeam = teams.find((t) => t.id === player.team_id) || player.team;
            return (
              <PlayerCard
                key={player.id}
                player={player}
                team={pTeam}
                size="xs"
                stats={playerStatsMap[player.id] || {}}
                matchEvents={allEvents.filter((e) => e.player_id === player.id)}
                teamMatches={matches.filter(
                  (m) =>
                    m.home_team_id === player.team_id ||
                    m.away_team_id === player.team_id
                )}
                onSelect={(p) => setSelectedPlayer(p)}
                className="w-full"
              />
            );
          })}
        </div>
      )}

      {/* LIVE DRAFT PICK REVEAL SPOTLIGHT OVERLAY (Appears automatically on Public Screens when Admin assigns a player) */}
      {spotlightReveal && (
        <div
          onClick={() => setSpotlightReveal(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Live player assignment reveal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-[#141414] border-2 border-[#B8F34A] p-5 text-center space-y-4 shadow-[0_0_60px_rgba(184,243,74,0.3)] animate-spotlight-enter"
          >
            <button
              type="button"
              onClick={() => setSpotlightReveal(null)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] flex items-center justify-center"
              aria-label="Dismiss reveal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8F34A]/15 border border-[#B8F34A]/40 text-[#B8F34A] text-xs font-extrabold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Official Team Assignment
            </div>

            <div className="max-w-[180px] mx-auto">
              <PlayerCard
                player={spotlightReveal.player}
                team={spotlightReveal.team}
                size="md"
              />
            </div>

            <div className="pt-2 border-t border-[#262626] space-y-1">
              <p className="text-xs uppercase tracking-widest text-[#9AA69B] font-semibold">
                Assigned To
              </p>
              <div className="flex items-center justify-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: spotlightReveal.team?.color_code || '#B8F34A',
                  }}
                />
                <span className="text-xl font-black text-[#F4F7F2]">
                  {spotlightReveal.team?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          team={teams.find((t) => t.id === selectedPlayer.team_id)}
          stats={playerStatsMap[selectedPlayer.id] || {}}
          matchEvents={allEvents.filter((e) => e.player_id === selectedPlayer.id)}
          teamMatches={matches.filter(
            (m) =>
              m.home_team_id === selectedPlayer.team_id ||
              m.away_team_id === selectedPlayer.team_id
          )}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}

export default TeamsPage;
