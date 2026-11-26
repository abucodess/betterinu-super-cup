import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Maximize2,
  Minimize2,
  X,
  Radio,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ModalDialog } from '../../components/ui/ModalDialog';
import { CircularRing } from '../../components/ui/CircularRing';
import { ArenaHeading, ArenaState, ClubCrest } from '../../components/shared/ArenaUI';
import { ClubBrowser } from '../../features/teams/ClubBrowser';
import { darkHorseClubId } from '../../features/teams/officialCrests';
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
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isBigScreen, setIsBigScreen] = useState(false);
  const requestedView = searchParams.get('view');
  const viewMode = isBigScreen || requestedView === 'draft' ? 'draft' : requestedView === 'players' ? 'players' : 'clubs';

  function setViewMode(view) {
    setIsBigScreen(false);
    const params = new URLSearchParams(searchParams);
    if (view === 'clubs') params.delete('view');
    else params.set('view', view);
    setSearchParams(params, { preventScrollReset: true });
  }

  function selectClub(id) {
    if (id === darkHorseClubId) {
      navigate(`/public/teams/${id}`);
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set('club', id);
    setSearchParams(params, { replace: true, preventScrollReset: true });
  }
  const selectedTeamFilter = searchParams.get('team') || 'ALL';

  function setSelectedTeamFilter(team) {
    const params = new URLSearchParams(searchParams);
    if (team === 'ALL') params.delete('team');
    else params.set('team', team);
    setSearchParams(params, { replace: true, preventScrollReset: true });
  }

  const [positionFilter, setPositionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Live presentation state
  const [soundEnabled] = useState(true);
  const [spotlightReveal, setSpotlightReveal] = useState(null);
  const [latestAssignment, setLatestAssignment] = useState(null);
  const [newlyAssignedIds, setNewlyAssignedIds] = useState({});

  const prevTeamMapRef = useRef(null);
  const spotlightTimerRef = useRef(null);

  const { data: teams = [], isLoading: loadingTeams, isError: teamsError, refetch: retryTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
    refetchInterval: 4000,
  });

  const { data: players = [], isLoading: loadingPlayers, isError: playersError, refetch: retryPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
    refetchInterval: 2000,
  });

  const { data: matches = [], isPending: loadingMatches, isError: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: standings = [] } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
  });

  const selectedClub = teams.find((team) => team.id === searchParams.get('club')) || teams[0];

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

    return unsubscribe;
  }, [queryClient, players, teams, soundEnabled]);

  useEffect(() => () => {
    clearTimeout(spotlightTimerRef.current);
  }, []);

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
          className="cursor-pointer rounded-2xl bg-[#181818] border-2 border-[#FFC600] px-4 py-3 flex items-center justify-between gap-3 shadow-md animate-card-pop"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2.5 py-0.5 rounded-md bg-[#FF1E27] text-[#FFFFFF] text-[10px] font-black uppercase tracking-wider shrink-0">
              Latest Pick
            </span>
            <span className="text-xs sm:text-sm font-black text-[#F4F7F2] truncate">
              {latestAssignment.player.is_non_player ||
              Number(latestAssignment.player.jersey_number) === 0
                ? latestAssignment.player.name
                : `#${latestAssignment.player.jersey_number} ${latestAssignment.player.name}`}
            </span>
            <span className="text-xs font-bold text-[#9AA69B]">→</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#FFC600] truncate">
              {latestAssignment.team.name}
            </span>
          </div>
          <span className="text-[11px] font-extrabold text-[#FFC600] shrink-0 hidden sm:inline">
            Replay Reveal →
          </span>
        </div>
      )}

      {/* Live Team Rosters (3 Columns on Desktop / Big Screen, Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {teams.map((team) => {
          const teamRoster = players.filter((p) => p.team_id === team.id);
          const activeRoster = teamRoster.filter(
            (p) => !p.is_non_player && p.position !== 'SUP' && Number(p.jersey_number) !== 0
          );
          const supporterRoster = teamRoster.filter(
            (p) => p.is_non_player || p.position === 'SUP' || Number(p.jersey_number) === 0
          );
          const openSlotsCount = Math.max(0, 5 - activeRoster.length);

          return (
            <div
              key={team.id}
              data-testid={`public-team-board-${team.short_code}`}
              style={{ '--club-accent': team.color_code || '#626fff' }}
              className="arena-panel arena-draft-club overflow-hidden flex flex-col"
            >
              {/* Team Header with SVG CircularRing Progress */}
              <div
                className="arena-draft-club-head p-4 sm:p-5 border-b border-[#262626] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ClubCrest club={team} />
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-black text-[#F4F7F2] truncate leading-tight">
                      {team.name}
                    </h2>
                    <p className="text-xs font-semibold text-[#9AA69B] truncate mt-0.5">
                      {activeRoster.length >= 5
                        ? 'Full 5-Player Squad Complete'
                        : `${activeRoster.length} of 5 players assigned`}
                      {supporterRoster.length > 0
                        ? ` · ${supporterRoster.length} supporter${supporterRoster.length > 1 ? 's' : ''}`
                        : ''}
                    </p>
                  </div>
                </div>

                <CircularRing
                  value={activeRoster.length}
                  max={5}
                  size={52}
                  strokeWidth={4.5}
                  label={`${activeRoster.length}/5`}
                />
              </div>

              {/* Assigned Player Cards + Animated Open Slot Placeholders */}
              <div className="p-3.5 sm:p-4 flex-1 bg-[#141414]">
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
                            ? 'ring-2 ring-[#FFC600] shadow-[0_0_20px_rgba(255,198,0,0.45)] scale-[1.02]'
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
                    const slotNum = activeRoster.length + idx + 1;
                    const isNextSlot = idx === 0;
                    return (
                      <div
                        key={`empty-slot-${team.id}-${slotNum}`}
                        className={`w-full aspect-[3/4] max-w-[92px] sm:max-w-[104px] mx-auto rounded-xl border border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
                          isNextSlot
                            ? 'border-[#FFC600]/60 bg-[#1C1C1C] animate-next-slot'
                            : 'border-[#303030] bg-[#181818]'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mb-1 tabular-nums ${
                            isNextSlot
                              ? 'bg-[#FFC600] text-[#090909]'
                              : 'bg-[#262626] text-[#9AA69B]'
                          }`}
                        >
                          #{slotNum}
                        </div>
                        <span
                          className={`text-[9px] font-bold ${
                            isNextSlot ? 'text-[#FFC600]' : 'text-[#9AA69B]'
                          }`}
                        >
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
      <div className="rounded-2xl bg-[#141414] border border-[#262626] p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#FFC600]/15 border border-[#FFC600]/40 text-[#FFC600] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-xs sm:text-sm font-black text-[#F4F7F2]">
              Available Draft Pool ({unassignedPlayers.length} Remaining)
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#FFC600] font-bold">
            <Radio className="w-3.5 h-3.5 text-[#FF1E27] animate-pulse" />
            <span>Live Realtime Sync</span>
          </div>
        </div>

        {unassignedPlayers.length === 0 ? (
          <div className="py-5 text-center text-xs sm:text-sm text-[#FFC600] font-extrabold bg-[#1C1C1C] rounded-xl border border-[#FFC600]/40 animate-fade-in">
            {players.length ? 'All cards have been assigned to clubs.' : 'No players have been published.'}
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

  if (viewMode === 'clubs' && searchParams.get('club') === darkHorseClubId) {
    return <Navigate to={`/public/teams/${darkHorseClubId}`} replace />;
  }

  return (
    <div
      onKeyDown={(event) => {
        if (isBigScreen && event.key === 'Escape' && !event.target.closest('dialog')) setIsBigScreen(false);
      }}
      className={
        isBigScreen
          ? 'arena-draft-big fixed inset-0 z-50 bg-[#090909] text-[#F4F7F2] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5'
          : 'space-y-4 sm:space-y-5 pb-6'
      }
    >
      <ArenaHeading title="Teams & Draft" description={viewMode === 'draft' ? `${assignedCount} of ${players.length} members assigned across ${teams.length} clubs` : 'Browse the clubs, squads and 5-a-side formations.'}>
        <button type="button" className="arena-button" onClick={() => setIsBigScreen(!isBigScreen)}
          aria-pressed={isBigScreen}>
          {isBigScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          {isBigScreen ? 'Exit Big Screen' : 'Big Screen'}
        </button>
      </ArenaHeading>

      {!isBigScreen && <div className="arena-tabs" role="group" aria-label="Teams views">
        {[
          ['clubs', 'Club browser'],
          ['draft', 'Live draft board'],
          ['players', `All cards (${players.length})`],
        ].map(([view, label]) => (
          <button type="button" key={view} aria-pressed={viewMode === view} onClick={() => setViewMode(view)}>{label}</button>
        ))}
      </div>}

      {/* Filter Ribbon for 'cards' mode */}
      {viewMode === 'players' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              aria-pressed={selectedTeamFilter === 'ALL'}
              onClick={() => setSelectedTeamFilter('ALL')}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all whitespace-nowrap ${
                selectedTeamFilter === 'ALL'
                  ? 'bg-[#001AFF] text-[#FFFFFF] border-[#3B82F6]'
                  : 'bg-[#141414] text-[#F4F7F2] border-[#262626] hover:border-[#001AFF]'
              }`}
            >
              All Players ({players.length})
            </button>

            <button type="button" aria-pressed={selectedTeamFilter === 'UNALLOCATED'}
              onClick={() => setSelectedTeamFilter('UNALLOCATED')}
              className="arena-button shrink-0">Unassigned</button>
            {teams.map((team) => {
              const count = players.filter((p) => p.team_id === team.id).length;
              const isSelected = selectedTeamFilter === team.id;
              return (
                <button
                  key={team.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedTeamFilter(team.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#FFC600] text-[#090909] border-[#FFC600]'
                      : 'bg-[#141414] text-[#9AA69B] border-[#262626] hover:text-[#F4F7F2]'
                  }`}
                >
                  <span>{team.name}</span>
                  <span className="text-[10px] tabular-nums">({count}/5)</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#141414] p-3 rounded-2xl border border-[#262626]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9AA69B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search by player name or jersey number"
                placeholder="Search player name or jersey #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#202020] border border-[#303030] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F7F2] placeholder-[#9AA69B]/70 focus:outline-none focus:border-[#FFC600]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['ALL', 'GK', 'CB', 'MF', 'FW', 'SUP'].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  aria-pressed={positionFilter === pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-colors whitespace-nowrap ${
                    positionFilter === pos
                      ? pos === 'SUP'
                        ? 'bg-[#FF1E27] text-[#FFFFFF]'
                        : 'bg-[#001AFF] text-[#FFFFFF]'
                      : 'bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2]'
                  }`}
                >
                  {pos === 'SUP' ? 'Supporters' : pos}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loadingTeams || loadingPlayers ? (
        <Card className="p-8 text-center text-[#9AA69B] rounded-2xl">
          Loading live teams and player cards...
        </Card>
      ) : teamsError || playersError ? (
        <ArenaState error onRetry={() => Promise.all([retryTeams(), retryPlayers()])}>Teams and player cards could not be loaded.</ArenaState>
      ) : viewMode === 'clubs' ? (
        selectedClub ? <ClubBrowser teams={teams} club={selectedClub} players={players} standings={standings}
          matches={matches} matchState={loadingMatches ? 'loading' : matchesError ? 'error' : 'ready'} onSelectClub={selectClub} onSelectPlayer={setSelectedPlayer} /> : <ArenaState>No clubs have been published.</ArenaState>
      ) : viewMode === 'draft' ? (
        renderLiveTeamsBoard()
      ) : filteredPlayers.length === 0 ? (
        <ArenaState>No players match the current filters.</ArenaState>
      ) : (
        <div className="arena-player-grid animate-slide-up">
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
                  variant="row"
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
      {spotlightReveal && viewMode === 'draft' && (
        <ModalDialog label="Live player assignment reveal" onDismiss={() => setSpotlightReveal(null)}>
          <div className="relative p-6 text-center space-y-4 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 flex">
              <span className="flex-1 bg-[#001AFF]" />
              <span className="flex-1 bg-[#FFC600]" />
              <span className="flex-1 bg-[#FF1E27]" />
            </div>

            <button
              type="button"
              onClick={() => setSpotlightReveal(null)}
              className="absolute top-3 right-3 arena-icon-button"
              aria-label="Dismiss reveal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#FF1E27] text-[#FFFFFF] text-xs font-black uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-[#FFC600] animate-pulse" />
              Official Team Assignment
            </div>

            <div className="max-w-[180px] mx-auto">
              <PlayerCard
                player={spotlightReveal.player}
                team={spotlightReveal.team}
                size="md"
              />
            </div>

            <div className="pt-3 border-t border-[#262626] space-y-1.5">
              <p className="text-[11px] uppercase tracking-widest text-[#9AA69B] font-semibold">
                Drafted To
              </p>
              <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-xl bg-[#001AFF] border border-[#FFC600]">
                <span className="w-6 h-6 rounded-lg bg-[#FFC600] flex items-center justify-center text-[10px] font-black text-[#090909]">
                  {spotlightReveal.team?.short_code}
                </span>
                <span className="text-base font-black text-[#FFFFFF]">
                  {spotlightReveal.team?.name}
                </span>
              </div>
            </div>
          </div>
        </ModalDialog>
      )}

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          team={teams.find((t) => t.id === selectedPlayer.team_id)}
          stats={playerStatsMap[selectedPlayer.id] || {}}
          matchEvents={allEvents}
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
