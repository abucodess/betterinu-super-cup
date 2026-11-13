import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Activity, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CircularRing } from '../../components/ui/CircularRing';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { standingsApi } from '../../services/api/standings.api';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { matchesApi } from '../../services/api/matches.api';

export function StandingsPage() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: standings = [], isLoading } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
  });

  const { data: playerStats = [] } = useQuery({
    queryKey: ['player_stats'],
    queryFn: () => standingsApi.getPlayerStats(),
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['all_match_events'],
    queryFn: () => matchesApi.getAllMatchEvents(),
  });

  const playerStatsMap = useMemo(() => {
    const map = {};
    playerStats.forEach((s) => {
      map[s.player_id] = s;
    });
    return map;
  }, [playerStats]);

  const leader = standings[0] || null;

  return (
    <div className="space-y-5 animate-slide-up pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <Link
            to="/public"
            aria-label="Back to Overview"
            className="w-11 h-11 rounded-full bg-[#161616] border border-white/[0.08] flex items-center justify-center text-[#F4F7F2] hover:bg-[#B8F34A] hover:text-[#090909] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[#F4F7F2]">
              League Table &amp; Stats
            </h1>
            <p className="text-[11px] sm:text-xs text-[#9AA69B]">
              Top 2 clubs advance to the Super Cup Grand Final
            </p>
          </div>
        </div>
        <BrandLogo size="sm" />
      </div>

      {/* Solid Bright Lime (#B8F34A) Current #1 Seed Highlight Card */}
      {leader && (
        <div className="rounded-[28px] bg-[#B8F34A] text-[#090909] p-5 sm:p-6 flex items-center justify-between gap-4 shadow-[0_16px_40px_rgba(184,243,74,0.18)]">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#090909] text-[#B8F34A] text-[10px] font-black uppercase tracking-wider inline-block">
              #1 League Seed
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {leader.team_name}
            </h2>
            <p className="text-xs font-bold text-[#090909]/75 tabular-nums">
              {leader.played} Played • {leader.won}W {leader.drawn}D {leader.lost}L • GD{' '}
              {leader.goal_difference >= 0 ? `+${leader.goal_difference}` : leader.goal_difference}
            </p>
          </div>

          <CircularRing
            value={Math.max(leader.points, 1)}
            max={6}
            size={60}
            strokeWidth={5}
            label={`${leader.points}P`}
            invertColors={true}
          />
        </div>
      )}

      {/* Main Standings Table */}
      <div className="rounded-[28px] bg-[#161616] border border-white/[0.08] overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-[#9AA69B]">Loading standings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-[#090909] text-[11px] font-extrabold uppercase tracking-wider text-[#9AA69B]">
                  <th className="py-4 px-4">Pos</th>
                  <th className="py-4 px-4">Club</th>
                  <th className="py-4 px-3 text-center">P</th>
                  <th className="py-4 px-3 text-center">W</th>
                  <th className="py-4 px-3 text-center">D</th>
                  <th className="py-4 px-3 text-center">L</th>
                  <th className="py-4 px-3 text-center">GF</th>
                  <th className="py-4 px-3 text-center">GA</th>
                  <th className="py-4 px-3 text-center">GD</th>
                  <th className="py-4 px-4 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] tabular-nums">
                {standings.map((row, idx) => (
                  <tr key={row.team_id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-4 font-black text-[#B8F34A]">#{idx + 1}</td>
                    <td className="py-4 px-4 font-extrabold text-[#F4F7F2] flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#B8F34A] text-[#090909] text-[10px] font-black flex items-center justify-center shrink-0">
                        {row.short_code || row.team_name?.slice(0, 3).toUpperCase()}
                      </span>
                      <span>{row.team_name}</span>
                    </td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.played}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.won}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.drawn}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.lost}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.goals_for}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.goals_against}</td>
                    <td className="py-4 px-3 text-center font-bold text-[#F4F7F2]">
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-base text-[#B8F34A]">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Player Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="space-y-4 rounded-[28px] bg-[#161616] border-white/[0.08] p-5">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <h2 className="text-sm sm:text-base font-black text-[#F4F7F2] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#B8F34A]" />
              Top Scorers &amp; Player Contributions
            </h2>
            <span className="text-xs text-[#9AA69B]">Tap player for card</span>
          </div>

          <div className="space-y-2">
            {playerStats.slice(0, 8).map((st, idx) => {
              const fullPlayer = players.find((p) => p.id === st.player_id);
              return (
                <button
                  key={st.player_id}
                  type="button"
                  onClick={() => fullPlayer && setSelectedPlayer(fullPlayer)}
                  className="w-full p-3 rounded-2xl bg-[#090909] hover:border-[#B8F34A] border border-white/[0.07] flex items-center justify-between text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#161616] text-[#B8F34A] text-xs font-black flex items-center justify-center tabular-nums">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-[#F4F7F2]">
                        #{st.jersey_number} {st.name}
                      </p>
                      <p className="text-xs text-[#9AA69B]">
                        {st.team_name || 'Unallocated'} • {st.position}
                      </p>
                    </div>
                  </div>
                  <Badge variant="accent">{st.goals || 0} Goals</Badge>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4 rounded-[28px] bg-[#161616] border-white/[0.08] p-5">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <h2 className="text-sm sm:text-base font-black text-[#F4F7F2] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#B8F34A]" />
              Disciplinary Record
            </h2>
            <span className="text-xs text-[#9AA69B]">Yellow &amp; Red Cards</span>
          </div>

          <div className="space-y-2">
            {playerStats.slice(0, 8).map((st) => {
              const fullPlayer = players.find((p) => p.id === st.player_id);
              return (
                <button
                  key={st.player_id}
                  type="button"
                  onClick={() => fullPlayer && setSelectedPlayer(fullPlayer)}
                  className="w-full p-3 rounded-2xl bg-[#090909] hover:border-[#B8F34A] border border-white/[0.07] flex items-center justify-between text-left transition-all"
                >
                  <div>
                    <p className="text-sm font-extrabold text-[#F4F7F2]">
                      #{st.jersey_number} {st.name}
                    </p>
                    <p className="text-xs text-[#9AA69B]">
                      {st.team_name || 'Unallocated'} • {st.position}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs tabular-nums">
                    <span className="px-2.5 py-1 rounded-full bg-[#161616] text-[#B8F34A] border border-white/10 font-bold">
                      {st.yellow_cards || 0} YC
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#161616] text-[#F4F7F2] border border-white/10 font-bold">
                      {st.red_cards || 0} RC
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

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

export default StandingsPage;
