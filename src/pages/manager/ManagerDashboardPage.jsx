import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Users,
  Calendar,
  Search,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { TacticalPitchView } from '../../features/teams/TacticalPitchView';
import { teamsApi } from '../../services/api/teams.api';
import { playersApi } from '../../services/api/players.api';
import { matchesApi } from '../../services/api/matches.api';
import { standingsApi } from '../../services/api/standings.api';
import { allocationApi } from '../../services/api/allocation.api';
import { calculateTeamFormAndStats } from '../../utils/tournamentRules';

export function ManagerDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const unsubscribe = allocationApi.subscribeToLiveDraft(() => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    });
    return () => unsubscribe();
  }, [queryClient]);

  const activeTab = useMemo(() => {
    if (location.pathname.startsWith('/manager/squad')) return 'squad';
    if (location.pathname.startsWith('/manager/fixtures')) return 'fixtures';
    if (location.pathname.startsWith('/manager/statistics')) return 'statistics';
    return 'overview';
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    if (tab === 'overview') navigate('/manager');
    else navigate(`/manager/${tab}`);
  };

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [squadSearch, setSquadSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [squadSubMode, setSquadSubMode] = useState('cards'); // 'cards' | 'pitch'

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  });

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['all_match_events'],
    queryFn: () => matchesApi.getAllMatchEvents(),
  });

  const { data: standings = [] } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
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

  // Strictly match authenticated manager's assigned team
  const myTeam = useMemo(() => {
    if (!user) return null;
    return (
      teams.find(
        (t) =>
          t.manager_id === user.id ||
          (user.email &&
            t.manager?.email?.toLowerCase() === user.email.toLowerCase())
      ) || null
    );
  }, [teams, user]);

  const myRoster = useMemo(() => {
    if (!myTeam) return [];
    return players.filter((p) => p.team_id === myTeam.id);
  }, [players, myTeam]);

  const filteredRoster = useMemo(() => {
    return myRoster.filter((p) => {
      const matchesSearch =
        !squadSearch.trim() ||
        p.name.toLowerCase().includes(squadSearch.toLowerCase()) ||
        String(p.jersey_number).includes(squadSearch.trim());
      const matchesPos = positionFilter === 'ALL' || p.position === positionFilter;
      return matchesSearch && matchesPos;
    });
  }, [myRoster, squadSearch, positionFilter]);

  const myMatches = useMemo(() => {
    if (!myTeam) return [];
    return matches.filter(
      (m) => m.home_team_id === myTeam.id || m.away_team_id === myTeam.id
    );
  }, [matches, myTeam]);

  const myStanding = useMemo(() => {
    if (!myTeam) return null;
    return standings.find((s) => s.team_id === myTeam.id) || null;
  }, [standings, myTeam]);

  const standingRank = useMemo(() => {
    if (!myTeam) return null;
    const idx = standings.findIndex((s) => s.team_id === myTeam.id);
    return idx >= 0 ? idx + 1 : null;
  }, [standings, myTeam]);

  const computedFormStats = useMemo(() => {
    if (!myTeam) return null;
    return calculateTeamFormAndStats(myTeam.id, myMatches);
  }, [myTeam, myMatches]);

  if (loadingTeams || loadingPlayers) {
    return (
      <Card className="p-10 text-center text-sm text-[#9AA69B]">
        Loading assigned club management portal...
      </Card>
    );
  }

  if (!myTeam) {
    return (
      <Card className="p-10 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#202020] border border-[#303030] flex items-center justify-center mx-auto text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-[#F4F7F2]">No Team Assigned Yet</h1>
        <p className="text-xs text-[#9AA69B] leading-relaxed">
          Your manager account (<strong className="text-[#F4F7F2]">{user?.email}</strong>) has not been linked to an active tournament squad yet. Please contact the Tournament Super Admin to assign your team.
        </p>
      </Card>
    );
  }

  const gkPlayers = myRoster.filter((p) => p.is_goalkeeper || p.position === 'GK');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Compact Club Identity Banner + Integrated 4-KPI Telemetry Strip */}
      <div className="rounded-2xl bg-[#141414] border border-[#303030] overflow-hidden">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: myTeam.color_code || '#B8F34A' }}
        />
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black text-sm sm:text-base text-[#090909] shadow-lg shrink-0"
                style={{ backgroundColor: myTeam.color_code || '#B8F34A' }}
              >
                {myTeam.short_code}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={myRoster.length === 5 ? 'success' : 'warning'}>
                    Squad {myRoster.length} / 5
                  </Badge>
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#F4F7F2] truncate mt-0.5">
                  {myTeam.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Compact 4-Column Mobile-Friendly Telemetry Strip */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-[#303030] tabular-nums">
            <div className="p-2.5 rounded-xl bg-[#202020] border border-[#303030]">
              <span className="text-[10px] text-[#9AA69B] block">Squad</span>
              <p className="text-base sm:text-xl font-black text-[#F4F7F2]">
                {myRoster.length}/5
              </p>
              <span className="text-[9px] text-[#9AA69B] hidden sm:block">
                {gkPlayers.length} GK • {myRoster.length - gkPlayers.length} Outfield
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202020] border border-[#303030]">
              <span className="text-[10px] text-[#9AA69B] block">League Rank</span>
              <p className="text-base sm:text-xl font-black text-[#B8F34A]">
                {standingRank ? `#${standingRank}` : '—'}
              </p>
              <span className="text-[9px] text-[#9AA69B] hidden sm:block">
                {myStanding?.points ?? 0} PTS
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202020] border border-[#303030]">
              <span className="text-[10px] text-[#9AA69B] block">Record</span>
              <p className="text-base sm:text-xl font-black text-[#F4F7F2]">
                {myStanding?.won ?? 0}-{myStanding?.drawn ?? 0}-{myStanding?.lost ?? 0}
              </p>
              <span className="text-[9px] text-[#9AA69B] hidden sm:block">
                W - D - L
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#202020] border border-[#303030]">
              <span className="text-[10px] text-[#9AA69B] block">Goals</span>
              <p className="text-base sm:text-xl font-black text-emerald-400">
                {myStanding?.goals_for ?? 0}:{myStanding?.goals_against ?? 0}
              </p>
              <span className="text-[9px] text-[#9AA69B] hidden sm:block">
                GF : GA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW (Tactical Pitch Game Plan + Quick Squad & Fixtures) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <TacticalPitchView
              team={myTeam}
              players={myRoster}
              playerStatsMap={playerStatsMap}
              matchEvents={allEvents}
              teamMatches={myMatches}
              onSelectPlayer={(p) => setSelectedPlayer(p)}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            {/* Assigned Squad Roster List */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#303030] pb-2.5">
                <h2 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#B8F34A]" />
                  Assigned Squad ({myRoster.length}/5)
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('squad')}
                  className="text-xs font-bold text-[#B8F34A] hover:underline"
                >
                  View Player Cards →
                </button>
              </div>

              <div className="space-y-1.5">
                {myRoster.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayer(p)}
                    className="w-full p-2.5 rounded-xl bg-[#202020] hover:border-[#B8F34A] border border-[#303030] flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#141414] border border-[#303030] flex items-center justify-center font-bold text-xs text-[#B8F34A] tabular-nums">
                        #{p.jersey_number}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#F4F7F2]">{p.name}</p>
                        <p className="text-[10px] text-[#9AA69B]">
                          {p.position} • Tap for Dossier
                        </p>
                      </div>
                    </div>
                    <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>
                      {p.position}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>

            {/* Upcoming Fixtures */}
            <Card className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#303030] pb-2.5">
                <h2 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#B8F34A]" />
                  Club Fixtures
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('fixtures')}
                  className="text-xs font-bold text-[#B8F34A] hover:underline"
                >
                  All →
                </button>
              </div>
              {myMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="text-[10px] text-[#9AA69B] block">
                      M#{m.match_number} • {m.venue}
                    </span>
                    <p className="font-bold text-[#F4F7F2]">
                      {m.home_team?.name}{' '}
                      <span className="text-[#B8F34A] px-1 tabular-nums">
                        {m.status === 'scheduled' ? 'vs' : `${m.home_score}-${m.away_score}`}
                      </span>{' '}
                      {m.away_team?.name}
                    </p>
                  </div>
                  <Badge variant="neutral">{m.status.toUpperCase()}</Badge>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 2: GOLD SHIELD COLLECTOR CARDS & PITCH */}
      {activeTab === 'squad' && (
        <div className="space-y-4">
          {/* Sub-bar: Search + Position Filter + Pitch Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-[#141414] p-3 rounded-xl border border-[#303030]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9AA69B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assigned players by name or jersey #..."
                value={squadSearch}
                onChange={(e) => setSquadSearch(e.target.value)}
                className="w-full bg-[#202020] border border-[#303030] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F4F7F2] placeholder-[#9AA69B]/60 focus:outline-none focus:border-[#B8F34A]"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <div className="flex items-center gap-1">
                {['ALL', 'GK', 'CB', 'MF', 'FW'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPositionFilter(pos)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      positionFilter === pos
                        ? 'bg-[#B8F34A] text-[#090909]'
                        : 'bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <div className="flex items-center bg-[#202020] rounded-lg border border-[#303030] p-0.5">
                <button
                  type="button"
                  onClick={() => setSquadSubMode('cards')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    squadSubMode === 'cards' ? 'bg-[#B8F34A] text-[#090909]' : 'text-[#9AA69B]'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setSquadSubMode('pitch')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    squadSubMode === 'pitch' ? 'bg-[#B8F34A] text-[#090909]' : 'text-[#9AA69B]'
                  }`}
                >
                  5v5 Pitch
                </button>
              </div>
            </div>
          </div>

          {squadSubMode === 'pitch' ? (
            <TacticalPitchView
              team={myTeam}
              players={myRoster}
              playerStatsMap={playerStatsMap}
              matchEvents={allEvents}
              teamMatches={myMatches}
              onSelectPlayer={(p) => setSelectedPlayer(p)}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 justify-items-center">
              {filteredRoster.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  team={myTeam}
                  stats={playerStatsMap[player.id] || {}}
                  matchEvents={allEvents.filter((e) => e.player_id === player.id)}
                  teamMatches={myMatches}
                  onSelect={(p) => setSelectedPlayer(p)}
                  className="w-full"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: TEAM FIXTURES & RESULTS */}
      {activeTab === 'fixtures' && (
        <Card className="space-y-3">
          <h2 className="text-base font-bold text-[#F4F7F2] border-b border-[#303030] pb-2.5">
            {myTeam.name} — Match Schedule & Results
          </h2>
          <div className="space-y-2.5">
            {myMatches.map((m) => {
              const isHome = m.home_team_id === myTeam.id;
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#202020] border border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-[#B8F34A]">
                      MATCH #{m.match_number} • {isHome ? 'HOME' : 'AWAY'} • {m.venue}
                    </span>
                    <p className="text-base font-bold text-[#F4F7F2] mt-0.5">
                      {m.home_team?.name}{' '}
                      <span className="text-[#B8F34A] px-2 tabular-nums">
                        {m.status === 'scheduled' ? 'vs' : `${m.home_score} - ${m.away_score}`}
                      </span>{' '}
                      {m.away_team?.name}
                    </p>
                  </div>
                  <Badge variant="neutral">{m.status.toUpperCase()}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* VIEW 4: TEAM & PLAYER ANALYTICS */}
      {activeTab === 'statistics' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-5 space-y-3 h-fit">
            <h2 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2 border-b border-[#303030] pb-2.5">
              <Activity className="w-4 h-4 text-[#B8F34A]" />
              Team Performance Summary
            </h2>
            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              <div className="p-3 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-xs text-[#9AA69B]">Played</span>
                <p className="text-xl font-black text-[#F4F7F2]">{myStanding?.played ?? 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-xs text-[#9AA69B]">Points</span>
                <p className="text-xl font-black text-[#B8F34A]">{myStanding?.points ?? 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-xs text-[#9AA69B]">Goals Scored</span>
                <p className="text-xl font-black text-emerald-400">{myStanding?.goals_for ?? 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#202020] border border-[#303030]">
                <span className="text-xs text-[#9AA69B]">Clean Sheets</span>
                <p className="text-xl font-black text-sky-400">
                  {computedFormStats?.cleanSheets ?? 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-7 space-y-3">
            <h2 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2 border-b border-[#303030] pb-2.5">
              <Activity className="w-4 h-4 text-[#B8F34A]" />
              Individual Squad Output
            </h2>
            <div className="space-y-2">
              {myRoster.map((player) => {
                const st = playerStatsMap[player.id] || {};
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => setSelectedPlayer(player)}
                    className="w-full p-3 rounded-xl bg-[#202020] hover:border-[#B8F34A] border border-[#303030] flex items-center justify-between text-left transition-colors"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#F4F7F2]">
                        #{player.jersey_number} {player.name}
                      </p>
                      <p className="text-xs text-[#9AA69B]">{player.position}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs tabular-nums">
                      <span className="text-[#9AA69B]">
                        Goals: <strong className="text-[#B8F34A]">{st.goals || 0}</strong>
                      </span>
                      <span className="text-[#9AA69B]">
                        YC: <strong className="text-amber-400">{st.yellow_cards || 0}</strong>
                      </span>
                      <span className="text-[#B8F34A] font-bold">Card →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          team={myTeam}
          stats={playerStatsMap[selectedPlayer.id] || {}}
          matchEvents={allEvents.filter((e) => e.player_id === selectedPlayer.id)}
          teamMatches={myMatches}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
export default ManagerDashboardPage;
