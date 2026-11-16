import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Crosshair,
  ChevronRight,
  Radio,
  Shield,
  Users,
  Calendar,
  Trophy,
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
  const [activePill, setActivePill] = useState('all'); // 'all' | 'fixtures' | 'standings' | 'pool'

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

  const liveMatchesCount = useMemo(
    () => matches.filter((m) => m.status === 'live' || m.status === 'half_time').length,
    [matches]
  );

  const previewAvatars = useMemo(() => players.slice(0, 3), [players]);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Page Title & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" />
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FFC600] block">
              Official Competition Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F4F7F2]">
              BetterInU Football League
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/public/live"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#FF1E27]/20 text-[#F4F7F2] hover:text-[#FFFFFF] border border-[#FF1E27]/45 text-xs font-bold transition-colors shadow-xs"
          >
            <Radio className="w-3.5 h-3.5 text-[#FF1E27] animate-pulse" />
            <span>Live Match Center</span>
          </Link>
          <Link
            to="/public/teams"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFC600] hover:bg-[#FFD233] text-[#090909] text-xs font-extrabold transition-colors shadow-[0_6px_20px_rgba(255,198,0,0.3)]"
          >
            <span>Open Draft Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Varied KPI Statistics Cards on Sleek Black Surface (Blue • Yellow • Red • Championship) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Electric Blue Accent Dark Card */}
        <div className="relative rounded-2xl bg-[#141414] border border-[#001AFF]/50 p-4 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-[#001AFF] absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-xs font-bold text-[#60A5FA]">Competing Clubs</span>
            <span className="w-8 h-8 rounded-lg bg-[#001AFF] text-[#FFFFFF] flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4 text-[#FFC600]" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#F4F7F2] tabular-nums">{teams.length || 3}</p>
          <p className="text-[11px] font-semibold text-[#9AA69B] mt-0.5">
            5-a-Side Official Squads
          </p>
        </div>

        {/* Card 2: Golden Yellow Accent Dark Card */}
        <div className="relative rounded-2xl bg-[#141414] border border-[#FFC600]/45 p-4 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-[#FFC600] absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-xs font-bold text-[#FFC600]">Drafted Players</span>
            <span className="w-8 h-8 rounded-lg bg-[#FFC600] text-[#090909] flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#F4F7F2] tabular-nums">
            {assignedCount} / {players.length}
          </p>
          <p className="text-[11px] font-semibold text-[#9AA69B] mt-0.5">
            {players.length - assignedCount} in Unassigned Pool
          </p>
        </div>

        {/* Card 3: Crimson Red Accent Dark Card */}
        <div className="relative rounded-2xl bg-[#141414] border border-[#FF1E27]/50 p-4 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-[#FF1E27] absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-xs font-bold text-[#FF6B72]">League Fixtures</span>
            <span className="w-8 h-8 rounded-lg bg-[#FF1E27] text-[#FFFFFF] flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-[#F4F7F2] tabular-nums">{matches.length}</p>
          <p className="text-[11px] font-semibold text-[#9AA69B] mt-0.5">
            {liveMatchesCount > 0 ? `${liveMatchesCount} Live Now` : 'Round-Robin + Final'}
          </p>
        </div>

        {/* Card 4: Championship Leader Dark Card */}
        <div className="relative rounded-2xl bg-[#141414] border border-[#262626] hover:border-[#FFC600]/45 p-4 shadow-sm overflow-hidden transition-colors">
          <div className="h-1 w-full flex absolute top-0 left-0 right-0">
            <span className="flex-1 bg-[#001AFF]" />
            <span className="flex-1 bg-[#FFC600]" />
            <span className="flex-1 bg-[#FF1E27]" />
          </div>
          <div className="flex items-center justify-between mb-2 pt-0.5">
            <span className="text-xs font-bold text-[#9AA69B]">Current Leader</span>
            <span className="w-8 h-8 rounded-lg bg-[#FFC600]/20 border border-[#FFC600]/45 text-[#FFC600] flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </span>
          </div>
          <p className="text-lg font-black text-[#F4F7F2] truncate">
            {standings[0]?.team_name || 'Season Kickoff'}
          </p>
          <p className="text-[11px] font-semibold text-[#FFC600] mt-0.5 tabular-nums">
            {standings[0] ? `${standings[0].points} Points · #1 Seed` : 'Top 2 Reach Final'}
          </p>
        </div>
      </div>

      {/* Primary Electric Blue, Golden Yellow & Crimson Red Hero Banner Card */}
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
        className="group relative rounded-2xl bg-gradient-to-r from-[#001AFF] via-[#0624C4] to-[#081970] border border-[#3B82F6]/40 text-[#FFFFFF] p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:border-[#FFC600]/70 shadow-[0_14px_38px_rgba(0,26,255,0.28)] overflow-hidden"
      >
        {/* Top Tri-Color Championship Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 flex">
          <span className="flex-1 bg-[#FFC600]" />
          <span className="flex-1 bg-[#FF1E27]" />
          <span className="flex-1 bg-[#001AFF]" />
        </div>

        <div className="flex items-start justify-between gap-4 pt-1">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF1E27] text-[#FFFFFF] text-[10px] font-black uppercase tracking-wider shadow-xs">
              <Radio className="w-3 h-3 text-[#FFC600] animate-pulse" />
              Live Presentation Board
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#FFFFFF]">
              Live Team Draw &amp; Official Squads
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#DBEAFE] leading-relaxed">
              Watch every custom player card get drafted into Team Alpha, Team Beta, and Team Gamma in real time.
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-[#FFC600] text-[#090909] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-12 shadow-md">
            <Crosshair className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold text-[#DBEAFE] leading-snug">
            <strong className="text-[#FFC600]">
              {assignedCount} of {players.length}
            </strong>{' '}
            players currently assigned to clubs.
          </p>

          {/* Stacked Player Avatars */}
          <div className="flex items-center -space-x-2.5 shrink-0">
            {previewAvatars.map((p) => {
              const imgUrl = cloudinaryService.getOptimizedPortraitUrl(p.photo_url);
              return (
                <div
                  key={p.id}
                  className="w-9 h-9 rounded-full bg-[#141414] border-2 border-[#FFC600] overflow-hidden flex items-center justify-center text-[10px] font-black text-[#FFC600]"
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
            <div className="w-9 h-9 rounded-full bg-[#FFC600] border-2 border-[#090909] flex items-center justify-center text-[11px] font-black text-[#090909] tabular-nums">
              +{players.length}
            </div>
          </div>
        </div>
      </div>

      {/* Section Header + Dark Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#F4F7F2] tracking-tight">
            Competition Explorer
          </h2>
          <Link
            to="/public/teams"
            className="text-xs font-bold text-[#FFC600] hover:underline inline-flex items-center gap-1"
          >
            <span>Full Screen Draw</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 bg-[#141414] p-1.5 rounded-xl overflow-x-auto no-scrollbar border border-[#262626]">
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
                className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                  active
                    ? 'bg-[#001AFF] text-[#FFFFFF] shadow-xs border border-[#3B82F6]/40'
                    : 'text-[#9AA69B] hover:text-[#F4F7F2] hover:bg-[#1C1C1C]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: ALL SQUADS */}
      {activePill === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {teams.map((team, idx) => {
            const roster = players.filter((p) => p.team_id === team.id);
            const activeCount = roster.filter(
              (p) => !p.is_non_player && p.position !== 'SUP' && Number(p.jersey_number) !== 0
            ).length;
            const clubTheme = [
              {
                topStrip: 'bg-[#001AFF]',
                border: 'border-[#001AFF]/40 hover:border-[#001AFF]',
                badge: 'bg-[#001AFF] text-[#FFFFFF]',
                btn: 'bg-[#001AFF] hover:bg-[#1B3BFF] text-[#FFFFFF]',
              },
              {
                topStrip: 'bg-[#FFC600]',
                border: 'border-[#FFC600]/40 hover:border-[#FFC600]',
                badge: 'bg-[#FFC600] text-[#090909]',
                btn: 'bg-[#FFC600] hover:bg-[#FFD233] text-[#090909]',
              },
              {
                topStrip: 'bg-[#FF1E27]',
                border: 'border-[#FF1E27]/40 hover:border-[#FF1E27]',
                badge: 'bg-[#FF1E27] text-[#FFFFFF]',
                btn: 'bg-[#FF1E27] hover:bg-[#E0151E] text-[#FFFFFF]',
              },
            ][idx % 3];

            return (
              <div
                key={team.id}
                style={{ animationDelay: `${idx * 80}ms` }}
                className={`animate-card-pop rounded-2xl bg-[#141414] border ${clubTheme.border} overflow-hidden flex flex-col justify-between shadow-sm transition-all`}
              >
                <div className={`h-1.5 w-full ${clubTheme.topStrip}`} />
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${clubTheme.badge}`}>
                          {team.short_code}
                        </span>
                        <span className="text-[11px] font-semibold text-[#9AA69B]">
                          5-a-side Club
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[#F4F7F2] leading-tight">
                        {team.name}
                      </h3>
                      <p className="text-xs font-medium text-[#9AA69B]">
                        {activeCount} of 5 players assigned · GK / CB / MF / FW
                      </p>
                    </div>

                    <CircularRing
                      value={activeCount}
                      max={5}
                      label={`${activeCount}/5`}
                      size={50}
                    />
                  </div>

                  {/* Live Assigned Custom eFootball Cards */}
                  {roster.length === 0 ? (
                    <div className="py-6 text-center text-xs font-medium text-[#9AA69B] rounded-xl bg-[#1C1C1C] border border-dashed border-[#303030]">
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

                  <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#9AA69B]">
                      Tap any card to inspect player
                    </span>
                    <Link
                      to="/public/teams"
                      aria-label={`View ${team.name}`}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shadow-xs ${clubTheme.btn}`}
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MATCH FIXTURES */}
      {activePill === 'fixtures' && (
        <div className="space-y-3 animate-slide-up">
          {matches.map((m, idx) => {
            const isLive = m.status === 'live' || m.status === 'half_time';
            const borderAccent = [
              'border-[#001AFF]/45 hover:border-[#001AFF]',
              'border-[#FFC600]/45 hover:border-[#FFC600]',
              'border-[#FF1E27]/45 hover:border-[#FF1E27]',
            ][idx % 3];
            return (
              <div
                key={m.id}
                onClick={() => navigate('/public/live')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/public/live');
                  }
                }}
                className={`rounded-2xl bg-[#141414] border ${borderAccent} p-5 flex items-center justify-between gap-4 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#001AFF] text-[#FFFFFF] text-[10px] font-black uppercase tracking-wider">
                      Match #{m.match_number}
                    </span>
                    <span className="text-xs font-semibold text-[#9AA69B]">
                      {m.venue}
                    </span>
                    {isLive && (
                      <span className="px-2 py-0.5 rounded-md bg-[#FF1E27] text-[#FFFFFF] text-[10px] font-black uppercase animate-pulse">
                        LIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#F4F7F2] leading-tight">
                    {m.home_team?.name} vs {m.away_team?.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#9AA69B]">
                    {m.status === 'scheduled'
                      ? 'Upcoming Round-Robin Fixture'
                      : `Score: ${m.home_score} - ${m.away_score} (${m.status.toUpperCase()})`}
                  </p>
                </div>

                <CircularRing
                  value={idx + 1}
                  max={matches.length || 3}
                  label={`M${m.match_number}`}
                  size={52}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: LEAGUE STANDINGS */}
      {activePill === 'standings' && (
        <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5 space-y-4 animate-slide-up shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#F4F7F2]">
              Official League Table
            </h3>
            <Link
              to="/public/standings"
              className="text-xs font-bold text-[#FFC600] hover:underline"
            >
              Full Stats →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#262626] bg-[#1C1C1C] text-[10px] font-bold uppercase tracking-wider text-[#9AA69B]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Club</th>
                  <th className="py-2.5 px-2 text-center">P</th>
                  <th className="py-2.5 px-2 text-center">W</th>
                  <th className="py-2.5 px-2 text-center">D</th>
                  <th className="py-2.5 px-2 text-center">L</th>
                  <th className="py-2.5 px-2 text-center">GD</th>
                  <th className="py-2.5 px-3 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] tabular-nums">
                {standings.map((row, idx) => (
                  <tr key={row.team_id} className="hover:bg-[#1C1C1C]">
                    <td className="py-3 px-3 font-black text-[#FFC600]">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-[#F4F7F2]">{row.team_name}</td>
                    <td className="py-3 px-2 text-center text-[#9AA69B]">{row.played}</td>
                    <td className="py-3 px-2 text-center text-[#9AA69B]">{row.won}</td>
                    <td className="py-3 px-2 text-center text-[#9AA69B]">{row.drawn}</td>
                    <td className="py-3 px-2 text-center text-[#9AA69B]">{row.lost}</td>
                    <td className="py-3 px-2 text-center font-semibold text-[#F4F7F2]">
                      {row.goal_difference > 0
                        ? `+${row.goal_difference}`
                        : row.goal_difference}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[#FFC600]">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: UNASSIGNED DRAFT POOL */}
      {activePill === 'pool' && (
        <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5 space-y-4 animate-slide-up shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#F4F7F2]">
              Available Draft Pool ({players.filter((p) => !p.team_id).length})
            </h3>
            <Link
              to="/public/teams"
              className="text-xs font-bold text-[#FFC600] hover:underline"
            >
              Open Live Draw →
            </Link>
          </div>

          {players.filter((p) => !p.team_id).length === 0 ? (
            <div className="py-6 text-center text-xs font-bold text-[#FFC600] bg-[#1C1C1C] rounded-xl border border-[#FFC600]/35">
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

      {/* Bottom Action Bar */}
      <Link
        to="/public/fixtures"
        className="group w-full rounded-2xl bg-[#141414] border border-[#001AFF]/50 hover:border-[#FFC600] p-2 flex items-center justify-between transition-all hover:bg-[#1C1C1C] shadow-sm"
      >
        <span className="w-10 h-10 rounded-xl bg-[#001AFF] text-[#FFFFFF] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
          <ArrowRight className="w-5 h-5 stroke-[2.5] text-[#FFC600]" />
        </span>

        <span className="text-xs sm:text-sm font-extrabold text-[#F4F7F2] group-hover:text-[#FFC600]">
          View Official Match Fixtures &amp; Schedule
        </span>

        <span className="pr-3 flex items-center text-[#FFC600]">
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
