import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Users,
  Search,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  X,
  Radio,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { CircularRing } from '../../components/ui/CircularRing';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { teamsApi } from '../../services/api/teams.api';
import { playersApi } from '../../services/api/players.api';
import { matchesApi } from '../../services/api/matches.api';
import { standingsApi } from '../../services/api/standings.api';
import { allocationApi } from '../../services/api/allocation.api';
import { soundEffects } from '../../utils/soundEffects';

export function TeamsPage() {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState('live_teams'); // 'live_teams' | 'cards'
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Live Presentation / Big Screen State
  const [isBigScreen, setIsBigScreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spotlightReveal, setSpotlightReveal] = useState(null);
  const [latestAssignment, setLatestAssignment] = useState(null);
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

    const payload = {
      player: playerObj,
      team: teamObj,
      timestamp: Date.now(),
    };

    setLatestAssignment(payload);
    setSpotlightReveal(payload);

    if (spotlightTimerRef.current) {
      clearTimeout(spotlightTimerRef.current);
    }
    spotlightTimerRef.current = setTimeout(() => {
      setSpotlightReveal(null);
    }, 3800);
  };

  // Detect any player team_id change across fetches
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
  const progressPercent =
    players.length > 0 ? Math.round((assignedCount / players.length) * 100) : 0;

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

  const renderLiveTeamsBoard = () => (
    <div className="space-y-5 animate-slide-up">
      {/* Live Pick Ticker Banner */}
      {latestAssignment && (
        <div
          onClick={() => setSpotlightReveal(latestAssignment)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSpotlightReveal(latestAssignment);
            }
          }}
          className="cursor-pointer rounded-[24px] bg-[#161616] border border-[#B8F34A] px-4 py-3 flex items-center justify-between gap-3 shadow-lg animate-card-pop"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-[#B8F34A] text-[#090909] text-[10px] font-black uppercase tracking-wider shrink-0">
              Latest Pick
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#F4F7F2] truncate">
              #{latestAssignment.player.jersey_number} {latestAssignment.player.name}
            </span>
            <span className="text-xs text-[#9AA69B]">→</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#B8F34A] truncate">
              {latestAssignment.team.name}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#B8F34A] shrink-0 hidden sm:inline">
            Replay Reveal
          </span>
        </div>
      )}

      {/* Live Team Rosters (3 Columns on Desktop / Big Screen, Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {teams.map((team, teamIdx) => {
          const teamRoster = players.filter((p) => p.team_id === team.id);
          const openSlotsCount = Math.max(0, 5 - teamRoster.length);

          return (
            <div
              key={team.id}
              data-testid={`public-team-board-${team.short_code}`}
              style={{ animationDelay: `${teamIdx * 80}ms` }}
              className="animate-slide-up rounded-[28px] bg-[#161616] border border-white/[0.08] hover:border-[#B8F34A]/60 transition-all duration-300 overflow-hidden flex flex-col shadow-xl"
            >
              {/* Team Header with SVG CircularRing Progress */}
              <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-[#B8F34A] text-[#090909] flex items-center justify-center font-black text-xs shrink-0 shadow">
                    {team.short_code}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black text-[#F4F7F2] truncate leading-tight">
                      {team.name}
                    </h2>
                    <p className="text-xs text-[#9AA69B] truncate mt-0.5">
                      {teamRoster.length >= 5
                        ? 'Full 5-Player Squad Complete'
                        : `${teamRoster.length} of 5 players assigned`}
                    </p>
                  </div>
                </div>

                <CircularRing
                  value={teamRoster.length}
                  max={5}
                  size={52}
                  strokeWidth={4.5}
                  label={`${teamRoster.length}/5`}
                  invertColors={false}
                />
              </div>

              {/* Assigned Player Cards + Animated Open Slot Placeholders */}
              <div className="p-3 sm:p-4 flex-1 bg-[#121212]">
                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-2 justify-items-center">
                  {teamRoster.map((player, idx) => {
                    const isRecent =
                      newlyAssignedIds[player.id] &&
                      Date.now() - newlyAssignedIds[player.id] < 12000;

                    return (
                      <div
                        key={player.id}
                        style={{ animationDelay: `${idx * 55}ms` }}
                        className={`w-full animate-card-pop rounded-xl transition-all duration-300 ${
                          isRecent
                            ? 'ring-2 ring-[#B8F34A] shadow-[0_0_24px_rgba(184,243,74,0.35)] scale-[1.02]'
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

                  {/* Empty Slot Placeholders */}
                  {Array.from({ length: openSlotsCount }).map((_, idx) => {
                    const slotNum = teamRoster.length + idx + 1;
                    const isNextSlot = idx === 0;
                    return (
                      <div
                        key={`empty-slot-${team.id}-${slotNum}`}
                        className={`w-full aspect-[3/4] max-w-[92px] sm:max-w-[104px] mx-auto rounded-xl border border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
                          isNextSlot
                            ? 'border-[#B8F34A]/60 bg-[#161616] animate-next-slot'
                            : 'border-[#242424] bg-[#090909]/60 opacity-60'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full border border-[#B8F34A]/50 text-[#B8F34A] flex items-center justify-center text-[10px] font-black mb-1 tabular-nums">
                          #{slotNum}
                        </div>
                        <span className="text-[9px] font-bold text-[#9AA69B]">
                          {isNextSlot ? 'Next Pick' : 'Open'}
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
      <div className="rounded-[28px] bg-[#161616] border border-white/[0.08] p-4 sm:p-5 space-y-3.5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#B8F34A]" />
            <h3 className="text-xs sm:text-sm font-black text-[#F4F7F2]">
              Available Draft Pool ({unassignedPlayers.length} Remaining)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#B8F34A] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-pulse" />
            <span>Live Realtime Sync</span>
          </div>
        </div>

        {unassignedPlayers.length === 0 ? (
          <div className="py-5 text-center text-xs sm:text-sm text-[#B8F34A] font-extrabold bg-[#090909] rounded-2xl border border-[#B8F34A]/30 animate-fade-in">
            All {players.length} custom player cards are assigned to their squads!
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 justify-items-center">
            {unassignedPlayers.map((player, idx) => (
              <div
                key={player.id}
                style={{ animationDelay: `${idx * 35}ms` }}
                className="w-full animate-card-pop"
              >
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
          : 'space-y-4 sm:space-y-5 pb-6'
      }
    >
      {/* Solid Bright Lime (#B8F34A) Hero Header Card (Matches Reference Screen 1) */}
      <div className="rounded-[28px] bg-[#B8F34A] text-[#090909] p-5 sm:p-6 shadow-[0_18px_45px_rgba(184,243,74,0.2)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <BrandLogo size="md" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#090909] text-[#B8F34A] text-[10px] font-black uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B8F34A] animate-pulse" />
                Live Presentation Board
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#090909]">
                Teams &amp; Live Draw
              </h1>
              <p className="text-xs font-bold text-[#090909]/75 tabular-nums">
                {assignedCount} of {players.length} players assigned to 3 squads
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* Stacked Circular Player Portraits */}
            <div className="flex items-center -space-x-2.5">
              {players.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="w-9 h-9 rounded-full bg-[#090909] border-2 border-[#B8F34A] overflow-hidden shrink-0"
                >
                  {p.photo_url ? (
                    <img
                      src={p.photo_url}
                      alt={p.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-[10px] font-black text-[#B8F34A]">
                      {p.name?.slice(0, 2)}
                    </span>
                  )}
                </div>
              ))}
              <div className="w-9 h-9 rounded-full bg-[#090909] border-2 border-[#B8F34A] flex items-center justify-center text-[10px] font-black text-[#B8F34A] tabular-nums">
                +{players.length}
              </div>
            </div>

            <CircularRing
              value={assignedCount}
              max={Math.max(players.length, 15)}
              size={56}
              strokeWidth={5}
              label={`${progressPercent}%`}
              invertColors={true}
            />
          </div>
        </div>
      </div>

      {/* Segmented Pill Bar + Big Screen / Sound Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 bg-[#161616] p-1.5 rounded-full border border-white/[0.07]">
          <button
            type="button"
            onClick={() => setViewMode('live_teams')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all whitespace-nowrap ${
              viewMode === 'live_teams'
                ? 'bg-[#F4F7F2] text-[#090909] shadow'
                : 'text-[#9AA69B] hover:text-[#F4F7F2]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Live Teams (3)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all whitespace-nowrap ${
              viewMode === 'cards'
                ? 'bg-[#F4F7F2] text-[#090909] shadow'
                : 'text-[#9AA69B] hover:text-[#F4F7F2]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All Cards ({players.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="w-10 h-10 rounded-full bg-[#161616] text-[#9AA69B] hover:text-[#F4F7F2] border border-white/[0.08] flex items-center justify-center transition-colors"
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#161616] hover:border-[#B8F34A] text-[#F4F7F2] border border-white/[0.08] text-xs font-extrabold transition-colors whitespace-nowrap"
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

      {/* Filter Ribbon for 'cards' mode */}
      {viewMode === 'cards' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedTeamFilter('ALL')}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-extrabold border transition-all ${
                selectedTeamFilter === 'ALL'
                  ? 'bg-[#B8F34A] text-[#090909] border-[#B8F34A]'
                  : 'bg-[#161616] text-[#F4F7F2] border-white/[0.08]'
              }`}
            >
              All Players ({players.length})
            </button>

            {teams.map((team) => {
              const count = players.filter((p) => p.team_id === team.id).length;
              const isSelected = selectedTeamFilter === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamFilter(team.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-xs font-extrabold border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#B8F34A] text-[#090909] border-[#B8F34A]'
                      : 'bg-[#161616] text-[#9AA69B] border-white/[0.08]'
                  }`}
                >
                  <span>{team.name}</span>
                  <span className="text-[10px] tabular-nums">({count}/5)</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#161616] p-3 rounded-[24px] border border-white/[0.07]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9AA69B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player name or jersey #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#090909] border border-white/[0.08] rounded-full pl-9 pr-4 py-2 text-xs text-[#F4F7F2] placeholder-[#9AA69B]/60 focus:outline-none focus:border-[#B8F34A]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['ALL', 'GK', 'CB', 'MF', 'FW'].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-colors ${
                    positionFilter === pos
                      ? 'bg-[#B8F34A] text-[#090909]'
                      : 'bg-[#090909] text-[#9AA69B] hover:text-[#F4F7F2]'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loadingTeams || loadingPlayers ? (
        <Card className="p-8 text-center text-[#9AA69B] rounded-[28px]">
          Loading live teams and player cards...
        </Card>
      ) : viewMode === 'live_teams' ? (
        renderLiveTeamsBoard()
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3 justify-items-center animate-slide-up">
          {filteredPlayers.map((player, idx) => {
            const pTeam = teams.find((t) => t.id === player.team_id) || player.team;
            return (
              <div
                key={player.id}
                style={{ animationDelay: `${idx * 35}ms` }}
                className="w-full animate-card-pop"
              >
                <PlayerCard
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
              </div>
            );
          })}
        </div>
      )}

      {/* LIVE DRAFT PICK REVEAL SPOTLIGHT OVERLAY */}
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
            className="relative w-full max-w-sm rounded-[32px] bg-[#161616] border-2 border-[#B8F34A] shadow-[0_0_70px_rgba(184,243,74,0.3)] p-6 text-center space-y-4 animate-spotlight-enter"
          >
            <button
              type="button"
              onClick={() => setSpotlightReveal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#090909] text-[#9AA69B] hover:text-[#F4F7F2] flex items-center justify-center"
              aria-label="Dismiss reveal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8F34A] text-[#090909] text-xs font-black uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Official Team Assignment
            </div>

            <div className="max-w-[180px] mx-auto">
              <PlayerCard
                player={spotlightReveal.player}
                team={spotlightReveal.team}
                size="md"
              />
            </div>

            <div className="pt-3 border-t border-white/10 space-y-1.5">
              <p className="text-[11px] uppercase tracking-widest text-[#9AA69B] font-semibold">
                Drafted To
              </p>
              <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-full bg-[#090909] border border-[#B8F34A]">
                <span className="w-6 h-6 rounded-full bg-[#B8F34A] flex items-center justify-center text-[10px] font-black text-[#090909]">
                  {spotlightReveal.team?.short_code}
                </span>
                <span className="text-base font-black text-[#F4F7F2]">
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
