import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Crosshair,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { CircularRing } from '../../components/ui/CircularRing';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { matchesApi } from '../../services/api/matches.api';
import { standingsApi } from '../../services/api/standings.api';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { allocationApi } from '../../services/api/allocation.api';
import { cloudinaryService } from '../../services/cloudinary/cloudinary.service';

export function TournamentHomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activePill, setActivePill] = useState('all'); // 'all' | 'draw' | 'fixtures' | 'standings'

  useEffect(() => {
    const unsubscribe = allocationApi.subscribeToLiveDraft(() => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    });
    return () => unsubscribe();
  }, [queryClient]);

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

  const assignedCount = useMemo(
    () => players.filter((p) => Boolean(p.team_id)).length,
    [players]
  );

  const previewAvatars = useMemo(() => players.slice(0, 3), [players]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* TOP BAR: Oversized Display Title */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#F4F7F2]">
            Super Cup
          </h1>
        </div>
      </div>

      {/* SOLID BRIGHT LIME HERO CARD (Matches "Daily challenge" Card in Reference Screen 1) */}
      <div
        onClick={() => navigate('/public/teams')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/public/teams');
          }
        }}
        className="group relative rounded-[28px] bg-[#B8F34A] text-[#090909] p-5 sm:p-6 cursor-pointer transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#090909] text-[#B8F34A] text-[10px] font-black uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" />
              Live Broadcast
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#090909]">
              Live Team Draw &amp; Squads
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#090909]/80 leading-relaxed">
              Watch every custom player card get assigned to Team Alpha, Team Beta, and Team Gamma live.
            </p>
          </div>

          <div className="w-11 h-11 rounded-full bg-[#090909]/12 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-12">
            <Crosshair className="w-5 h-5 text-[#090909]" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[#090909]/85 max-w-[180px] sm:max-w-none leading-snug">
            <strong>{assignedCount} of {players.length}</strong> players already drafted into squads.
          </p>

          {/* Stacked Player Avatars + Pitch Black Count Pill */}
          <div className="flex items-center -space-x-2.5 shrink-0">
            {previewAvatars.map((p) => {
              const imgUrl = cloudinaryService.getOptimizedPortraitUrl(p.photo_url);
              return (
                <div
                  key={p.id}
                  className="w-9 h-9 rounded-full bg-[#090909] border-2 border-[#B8F34A] overflow-hidden flex items-center justify-center text-[10px] font-black text-[#B8F34A]"
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    p.name.slice(0, 2)
                  )}
                </div>
              );
            })}
            <div className="w-9 h-9 rounded-full bg-[#090909] border-2 border-[#B8F34A] flex items-center justify-center text-[11px] font-black text-[#F4F7F2] tabular-nums">
              +{players.length}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION HEADER + SEGMENTED PILL BAR (Matches "Your plan" in Reference Screen 1) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#F4F7F2] tracking-tight">
            Tournament Hub
          </h2>
          <Link
            to="/public/teams"
            className="text-xs font-bold text-[#B8F34A] hover:underline inline-flex items-center gap-1"
          >
            <span>Full Screen Draw</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 bg-[#161616] p-1.5 rounded-full overflow-x-auto no-scrollbar border border-white/[0.05]">
          {[
            { id: 'all', label: 'All Squads' },
            { id: 'fixtures', label: 'Match Fixtures' },
            { id: 'standings', label: 'League Table' },
            { id: 'pool', label: `Draft Pool (${players.filter((p) => !p.team_id).length})` },
          ].map((tab) => {
            const active = activePill === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePill(tab.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  active
                    ? 'bg-[#F4F7F2] text-[#090909] shadow'
                    : 'text-[#9AA69B] hover:text-[#F4F7F2]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PILL VIEW 1: ALL SQUADS (Tactile [28px] Cards with Circular Lime Button / Ring + Live Roster Cards) */}
      {activePill === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {teams.map((team, idx) => {
            const roster = players.filter((p) => p.team_id === team.id);
            return (
              <div
                key={team.id}
                style={{ animationDelay: `${idx * 80}ms` }}
                className="animate-card-pop rounded-[28px] bg-[#161616] border border-white/[0.06] p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#090909] border border-[#B8F34A] text-[10px] font-black text-[#B8F34A]">
                        {team.short_code}
                      </span>
                      <span className="text-[11px] font-semibold text-[#9AA69B]">
                        5-a-side Club
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-[#F4F7F2] leading-tight">
                      {team.name}
                    </h3>
                    <p className="text-xs text-[#9AA69B]">
                      {roster.length} players assigned •GK / CB / MF / FW
                    </p>
                  </div>

                  {/* Animated SVG Circular Progress Ring */}
                  <CircularRing
                    value={roster.length}
                    max={5}
                    label={`${roster.length}/5`}
                    size={50}
                  />
                </div>

                {/* Live Assigned Custom eFootball Cards */}
                {roster.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#9AA69B] rounded-2xl bg-[#090909] border border-dashed border-[#262626]">
                    Awaiting draft picks
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-2 justify-items-center pt-1">
                    {roster.map((player) => (
                      <div key={player.id} className="w-full animate-card-pop">
                        <PlayerCard
                          player={player}
                          team={team}
                          size="xs"
                          stats={playerStatsMap[player.id] || {}}
                          onSelect={(p) => setSelectedPlayer(p)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#9AA69B]">
                    Tap any card to inspect player
                  </span>
                  <Link
                    to="/public/teams"
                    aria-label={`View ${team.name}`}
                    className="w-10 h-10 rounded-full bg-[#B8F34A] text-[#090909] flex items-center justify-center transition-transform hover:scale-105"
                  >
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PILL VIEW 2: MATCH FIXTURES (Alternating Lime & Dark [28px] Cards like Reference Screen 3) */}
      {activePill === 'fixtures' && (
        <div className="space-y-3 animate-slide-up">
          {matches.map((m, idx) => {
            const isLime = idx % 2 === 0;
            return (
              <React.Fragment key={m.id}>
                {idx > 0 && (
                  <div className="w-7 h-1 rounded-full bg-white/30 mx-auto" />
                )}
                <div
                  onClick={() => navigate('/public/live')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate('/public/live');
                    }
                  }}
                  className={`rounded-[28px] p-5 flex items-center justify-between gap-4 cursor-pointer transition-transform hover:scale-[1.01] ${
                    isLime
                      ? 'bg-[#B8F34A] text-[#090909]'
                      : 'bg-[#161616] text-[#F4F7F2] border border-white/[0.06]'
                  }`}
                >
                  <div className="space-y-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest block ${
                        isLime ? 'text-[#090909]/70' : 'text-[#B8F34A]'
                      }`}
                    >
                      Match #{m.match_number} • {m.venue}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black leading-tight">
                      {m.home_team?.name} vs {m.away_team?.name}
                    </h3>
                    <p
                      className={`text-xs font-semibold ${
                        isLime ? 'text-[#090909]/75' : 'text-[#9AA69B]'
                      }`}
                    >
                      {m.status === 'scheduled'
                        ? 'Upcoming Round-Robin Fixture'
                        : `Score: ${m.home_score} - ${m.away_score} (${m.status.toUpperCase()})`}
                    </p>
                  </div>

                  <CircularRing
                    value={idx + 1}
                    max={matches.length || 3}
                    label={`M${m.match_number}`}
                    invertColors={isLime}
                    size={54}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* PILL VIEW 3: LEAGUE STANDINGS */}
      {activePill === 'standings' && (
        <div className="rounded-[28px] bg-[#161616] border border-white/[0.06] p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#F4F7F2]">
              Official League Table
            </h3>
            <Link
              to="/public/standings"
              className="text-xs font-bold text-[#B8F34A] hover:underline"
            >
              Full Stats →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#262626] text-[10px] font-bold uppercase tracking-wider text-[#9AA69B]">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Club</th>
                  <th className="py-2.5 px-1 text-center">P</th>
                  <th className="py-2.5 px-1 text-center">W</th>
                  <th className="py-2.5 px-1 text-center">D</th>
                  <th className="py-2.5 px-1 text-center">L</th>
                  <th className="py-2.5 px-1 text-center">GD</th>
                  <th className="py-2.5 px-2 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] tabular-nums">
                {standings.map((row, idx) => (
                  <tr key={row.team_id} className="hover:bg-[#202020]/50">
                    <td className="py-3 px-2 font-black text-[#B8F34A]">{idx + 1}</td>
                    <td className="py-3 px-2 font-bold text-[#F4F7F2]">{row.team_name}</td>
                    <td className="py-3 px-1 text-center text-[#9AA69B]">{row.played}</td>
                    <td className="py-3 px-1 text-center text-[#9AA69B]">{row.won}</td>
                    <td className="py-3 px-1 text-center text-[#9AA69B]">{row.drawn}</td>
                    <td className="py-3 px-1 text-center text-[#9AA69B]">{row.lost}</td>
                    <td className="py-3 px-1 text-center text-[#9AA69B]">
                      {row.goal_difference > 0
                        ? `+${row.goal_difference}`
                        : row.goal_difference}
                    </td>
                    <td className="py-3 px-2 text-right font-black text-[#B8F34A]">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PILL VIEW 4: UNASSIGNED DRAFT POOL */}
      {activePill === 'pool' && (
        <div className="rounded-[28px] bg-[#161616] border border-white/[0.06] p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#F4F7F2]">
              Available Draft Pool ({players.filter((p) => !p.team_id).length})
            </h3>
            <Link
              to="/public/teams"
              className="text-xs font-bold text-[#B8F34A] hover:underline"
            >
              Open Live Draw →
            </Link>
          </div>

          {players.filter((p) => !p.team_id).length === 0 ? (
            <div className="py-6 text-center text-xs font-bold text-[#B8F34A] bg-[#090909] rounded-2xl border border-[#262626]">
              All {players.length} players have been drafted into teams!
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2.5 justify-items-center">
              {players
                .filter((p) => !p.team_id)
                .map((player) => (
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
      )}

      {/* BOTTOM TRACK-STYLE ACTION BAR (Matches Reference Screen 3 Bottom Track) */}
      <Link
        to="/public/fixtures"
        className="group w-full rounded-full bg-[#090909] border border-[#B8F34A] p-1.5 flex items-center justify-between transition-all hover:bg-[#141414]"
      >
        <span className="w-11 h-11 rounded-full bg-[#B8F34A] text-[#090909] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </span>

        <span className="text-xs sm:text-sm font-bold text-[#F4F7F2]">
          View Official Match Fixtures
        </span>

        <span className="pr-4 flex items-center text-[#B8F34A]">
          <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-1" />
          <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-2" />
          <ChevronRight className="w-4 h-4 animate-chevron-3" />
        </span>
      </Link>

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
