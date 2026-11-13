import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Trophy,
  ArrowRight,
  Megaphone,
  Users,
  Shield,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { matchesApi } from '../../services/api/matches.api';
import { standingsApi } from '../../services/api/standings.api';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { tournamentsApi } from '../../services/api/tournaments.api';
import { allocationApi } from '../../services/api/allocation.api';

export function TournamentHomePage() {
  const queryClient = useQueryClient();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [mobileSection, setMobileSection] = useState('teams'); // 'teams' | 'table' | 'schedule'

  useEffect(() => {
    const unsubscribe = allocationApi.subscribeToLiveDraft(() => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    });
    return () => unsubscribe();
  }, [queryClient]);

  const { data: tournament } = useQuery({
    queryKey: ['tournament'],
    queryFn: () => tournamentsApi.getActiveTournament(),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', tournament?.id],
    queryFn: () => tournamentsApi.getAnnouncements(tournament?.id),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: standings = [] } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
    refetchInterval: 2500,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
    refetchInterval: 4000,
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

  const activeLiveMatch = matches.find(
    (m) => m.status === 'live' || m.status === 'half_time'
  );
  const featuredMatch =
    activeLiveMatch ||
    matches.find((m) => m.status === 'scheduled') ||
    matches[0] ||
    null;

  const isActuallyLive =
    featuredMatch?.status === 'live' || featuredMatch?.status === 'half_time';

  const assignedCount = useMemo(
    () => players.filter((p) => Boolean(p.team_id)).length,
    [players]
  );

  return (
    <div className="space-y-4">
      {/* Live Team Draw Presentation Banner */}
      <Link
        to="/public/teams"
        className="block rounded-2xl bg-[#141414] border border-[#B8F34A]/40 hover:border-[#B8F34A] p-3.5 sm:p-4 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#B8F34A] text-[#090909] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8F34A] animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-extrabold text-[#F4F7F2] truncate">
                  Live Team Draw &amp; Squads
                </span>
              </div>
              <p className="text-[11px] text-[#9AA69B] truncate mt-0.5 tabular-nums">
                {assignedCount} of {players.length} players assigned • Tap for full live view
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#B8F34A] text-[#090909] text-xs font-bold shrink-0">
            <span>Watch Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </Link>

      {/* Featured Match Day Card */}
      {featuredMatch && (
        <Link
          to="/public/live"
          className="block rounded-[24px] bg-[#141414] border border-[#262626] hover:border-[#B8F34A]/50 p-4 sm:p-5 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-[#9AA69B] mb-3">
            <span className="font-semibold">
              Match day {featuredMatch.match_number || 1}
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-[#B8F34A]">
              <span>Match Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-3 items-center text-center gap-2 bg-[#0E0E0E] rounded-2xl p-3.5 sm:p-5 border border-[#262626]">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-black text-xs text-[#090909] shrink-0 shadow-md"
                style={{ backgroundColor: featuredMatch.home_team?.color_code || '#B8F34A' }}
              >
                {featuredMatch.home_team?.short_code || 'HOM'}
              </div>
              <span className="font-bold text-xs text-[#F4F7F2] truncate w-full">
                {featuredMatch.home_team?.name}
              </span>
              <span className="text-2xl sm:text-4xl font-extrabold text-[#F4F7F2] tabular-nums">
                {featuredMatch.home_score ?? 0}
              </span>
            </div>

            {/* Center Match Info */}
            <div className="flex flex-col items-center justify-center gap-1.5 min-w-0">
              <span className="text-xs font-black tracking-widest text-[#9AA69B] uppercase">
                VS
              </span>
              <div className="inline-flex flex-col items-center px-3 py-1.5 rounded-xl bg-[#181818] border border-white/10">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF414D] whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF414D] animate-pulse" />
                  {isActuallyLive
                    ? 'Live'
                    : featuredMatch.status === 'completed'
                    ? 'Full Time'
                    : 'Upcoming'}
                </span>
                <span className="text-[11px] font-bold text-[#F4F7F2] tabular-nums mt-0.5 whitespace-nowrap">
                  {isActuallyLive ? `P${featuredMatch.current_period || 1}` : `Match #${featuredMatch.match_number}`}
                </span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-black text-xs text-[#090909] shrink-0 shadow-md"
                style={{ backgroundColor: featuredMatch.away_team?.color_code || '#3B82F6' }}
              >
                {featuredMatch.away_team?.short_code || 'AWY'}
              </div>
              <span className="font-bold text-xs text-[#F4F7F2] truncate w-full">
                {featuredMatch.away_team?.name}
              </span>
              <span className="text-2xl sm:text-4xl font-extrabold text-[#F4F7F2] tabular-nums">
                {featuredMatch.away_score ?? 0}
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* View Switcher Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#262626]">
        {[
          { id: 'teams', label: 'Live Teams' },
          { id: 'table', label: 'Standings' },
          { id: 'schedule', label: 'Fixtures' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileSection(tab.id)}
            className={`py-2 rounded-lg text-xs font-bold transition-colors ${
              mobileSection === tab.id
                ? 'bg-[#B8F34A] text-[#090909]'
                : 'text-[#9AA69B] hover:text-[#F4F7F2]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: Live Teams & Assigned Player Cards */}
      {mobileSection === 'teams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const roster = players.filter((p) => p.team_id === team.id);
              return (
                <Card key={team.id} className="space-y-3">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-[#090909]"
                        style={{ backgroundColor: team.color_code || '#B8F34A' }}
                      >
                        {team.short_code}
                      </div>
                      <span className="font-bold text-sm text-[#F4F7F2]">{team.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#B8F34A] tabular-nums">
                      {roster.length} / 5
                    </span>
                  </div>

                  {roster.length === 0 ? (
                    <p className="text-xs text-[#9AA69B] py-6 text-center border border-dashed border-[#303030] rounded-xl">
                      No players assigned yet
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5">
                      {roster.map((player) => (
                        <div key={player.id} className="animate-card-pop">
                          <PlayerCard
                            player={player}
                            team={team}
                            stats={playerStatsMap[player.id] || {}}
                            onSelect={(p) => setSelectedPlayer(p)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-sm sm:text-base font-bold text-[#F4F7F2] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#B8F34A]" />
              Player Pool ({players.filter((p) => !p.team_id).length} Unassigned)
            </h2>
            <Link
              to="/public/teams"
              className="text-xs font-bold text-[#B8F34A] hover:underline flex items-center gap-1"
            >
              Open Full Draw Board <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {players
              .filter((p) => !p.team_id)
              .map((player) => (
                <div key={player.id} className="animate-card-pop">
                  <PlayerCard
                    player={player}
                    stats={playerStatsMap[player.id] || {}}
                    onSelect={(p) => setSelectedPlayer(p)}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Section 2: Standings Table */}
      {mobileSection === 'table' && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-[#F4F7F2] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#B8F34A]" />
              League Standings
            </h2>
            <Link to="/public/standings" className="text-xs font-bold text-[#B8F34A] hover:underline">
              Full Table →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#303030] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#9AA69B]">
                  <th className="py-2 px-1.5">#</th>
                  <th className="py-2 px-1.5">Club</th>
                  <th className="py-2 px-1 text-center">P</th>
                  <th className="py-2 px-1 text-center">W</th>
                  <th className="py-2 px-1 text-center">D</th>
                  <th className="py-2 px-1 text-center">L</th>
                  <th className="py-2 px-1 text-center">GD</th>
                  <th className="py-2 px-1.5 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303030] tabular-nums">
                {standings.map((row, idx) => (
                  <tr key={row.team_id} className="hover:bg-[#202020]/50 transition-colors">
                    <td className="py-2.5 px-1.5 font-bold text-[#9AA69B]">{idx + 1}</td>
                    <td className="py-2.5 px-1.5 font-bold text-[#F4F7F2] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: row.color_code }}
                      />
                      <span className="truncate max-w-[120px] sm:max-w-none">{row.team_name}</span>
                    </td>
                    <td className="py-2.5 px-1 text-center text-[#9AA69B]">{row.played}</td>
                    <td className="py-2.5 px-1 text-center text-[#9AA69B]">{row.won}</td>
                    <td className="py-2.5 px-1 text-center text-[#9AA69B]">{row.drawn}</td>
                    <td className="py-2.5 px-1 text-center text-[#9AA69B]">{row.lost}</td>
                    <td className="py-2.5 px-1 text-center text-[#9AA69B]">
                      {row.goal_difference > 0
                        ? `+${row.goal_difference}`
                        : row.goal_difference}
                    </td>
                    <td className="py-2.5 px-1.5 text-right font-black text-[#B8F34A]">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Section 3: Match Schedule & Bulletins */}
      {mobileSection === 'schedule' && (
        <div className="space-y-4">
          <Card className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-[#F4F7F2] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#B8F34A]" />
                Match Schedule
              </h2>
              <Link to="/public/fixtures" className="text-xs font-bold text-[#B8F34A] hover:underline">
                All Fixtures →
              </Link>
            </div>

            <div className="space-y-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-between text-xs sm:text-sm"
                >
                  <div>
                    <span className="text-[10px] text-[#9AA69B] block">
                      M#{m.match_number} • {m.venue}
                    </span>
                    <p className="font-bold text-[#F4F7F2]">
                      {m.home_team?.short_code}{' '}
                      <span className="text-[#B8F34A] tabular-nums px-1">
                        {m.status === 'scheduled' ? 'vs' : `${m.home_score} - ${m.away_score}`}
                      </span>{' '}
                      {m.away_team?.short_code}
                    </p>
                  </div>
                  <Badge
                    variant={
                      m.status === 'live' || m.status === 'half_time'
                        ? 'live'
                        : m.status === 'completed'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {m.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {announcements.length > 0 && (
            <Card className="space-y-2">
              <h2 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#B8F34A]" />
                Official Bulletins
              </h2>
              {announcements.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="p-2.5 rounded-xl bg-[#202020] border border-[#303030]"
                >
                  <p className="text-xs font-bold text-[#F4F7F2]">{a.title}</p>
                  <p className="text-[11px] text-[#9AA69B] mt-0.5 line-clamp-2">{a.body}</p>
                </div>
              ))}
            </Card>
          )}
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

export default TournamentHomePage;
