import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Award, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F7F2]">
          Standings
        </h1>
      </div>

      {/* Main Standings Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center text-[#9AA69B]">Loading standings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#303030] bg-[#202020]/60 text-[11px] font-semibold uppercase tracking-wider text-[#9AA69B]">
                  <th className="py-3.5 px-4">Pos</th>
                  <th className="py-3.5 px-4">Club</th>
                  <th className="py-3.5 px-3 text-center">P</th>
                  <th className="py-3.5 px-3 text-center">W</th>
                  <th className="py-3.5 px-3 text-center">D</th>
                  <th className="py-3.5 px-3 text-center">L</th>
                  <th className="py-3.5 px-3 text-center">GF</th>
                  <th className="py-3.5 px-3 text-center">GA</th>
                  <th className="py-3.5 px-3 text-center">GD</th>
                  <th className="py-3.5 px-4 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#303030] tabular-nums">
                {standings.map((row, idx) => (
                  <tr key={row.team_id} className="hover:bg-[#202020]/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#9AA69B]">{idx + 1}</td>
                    <td className="py-4 px-4 font-bold text-[#F4F7F2] flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: row.color_code }}
                      />
                      {row.team_name}
                    </td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.played}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.won}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.drawn}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.lost}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.goals_for}</td>
                    <td className="py-4 px-3 text-center text-[#9AA69B]">{row.goals_against}</td>
                    <td className="py-4 px-3 text-center font-medium text-[#F4F7F2]">
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                    </td>
                    <td className="py-4 px-4 text-right font-extrabold text-base text-[#B8F34A]">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Player Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#303030] pb-3">
            <h2 className="text-base font-bold text-[#F4F7F2] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#B8F34A]" />
              Golden Boot & Player Contributions
            </h2>
            <span className="text-xs text-[#9AA69B]">Click player for card</span>
          </div>

          <div className="space-y-2">
            {playerStats.slice(0, 8).map((st, idx) => {
              const fullPlayer = players.find((p) => p.id === st.player_id);
              return (
                <button
                  key={st.player_id}
                  type="button"
                  onClick={() => fullPlayer && setSelectedPlayer(fullPlayer)}
                  className="w-full p-3 rounded-xl bg-[#202020] hover:border-[#B8F34A] border border-[#303030] flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#9AA69B] w-5 tabular-nums">
                      {idx + 1}.
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#F4F7F2]">
                        #{st.jersey_number} {st.name}
                      </p>
                      <p className="text-xs text-[#9AA69B]">
                        {st.team_name || 'Unallocated'} • {st.position}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 tabular-nums">
                    <Badge variant="accent">{st.goals || 0} Goals</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#303030] pb-3">
            <h2 className="text-base font-bold text-[#F4F7F2] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Disciplinary Record
            </h2>
            <span className="text-xs text-[#9AA69B]">Yellow & Red Cards</span>
          </div>

          <div className="space-y-2">
            {playerStats.slice(0, 8).map((st) => {
              const fullPlayer = players.find((p) => p.id === st.player_id);
              return (
                <button
                  key={st.player_id}
                  type="button"
                  onClick={() => fullPlayer && setSelectedPlayer(fullPlayer)}
                  className="w-full p-3 rounded-xl bg-[#202020] hover:border-[#B8F34A] border border-[#303030] flex items-center justify-between text-left transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-[#F4F7F2]">
                      #{st.jersey_number} {st.name}
                    </p>
                    <p className="text-xs text-[#9AA69B]">
                      {st.team_name || 'Unallocated'} • {st.position}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs tabular-nums">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                      {st.yellow_cards || 0} YC
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-bold">
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
