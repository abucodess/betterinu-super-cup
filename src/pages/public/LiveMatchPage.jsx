import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Users,
  Radio,
  MapPin,
  Lock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { matchesApi } from '../../services/api/matches.api';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { standingsApi } from '../../services/api/standings.api';
import { supabase } from '../../services/supabase/client';

export function LiveMatchPage() {
  const queryClient = useQueryClient();
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
    refetchInterval: 3000,
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
    refetchInterval: 3000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
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

  const activeMatch = useMemo(() => {
    if (selectedMatchId) {
      const found = matches.find((m) => m.id === selectedMatchId);
      if (found) return found;
    }
    return (
      matches.find((m) => m.status === 'live' || m.status === 'half_time') ||
      matches[0] ||
      null
    );
  }, [matches, selectedMatchId]);

  const { data: events = [] } = useQuery({
    queryKey: ['match_events', activeMatch?.id],
    queryFn: () => matchesApi.getMatchEvents(activeMatch?.id),
    enabled: !!activeMatch?.id,
    refetchInterval: 2500,
  });

  // Subscribe to Supabase Realtime for live score and event telemetry
  useEffect(() => {
    if (!supabase || !activeMatch?.id) return;

    const channel = supabase
      .channel(`live_match_${activeMatch.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${activeMatch.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['matches'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_events',
          filter: `match_id=eq.${activeMatch.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['match_events', activeMatch.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeMatch?.id, queryClient]);

  if (loadingMatches) {
    return (
      <Card className="p-8 text-center text-sm text-[#9AA69B] rounded-2xl">
        Connecting to live match center...
      </Card>
    );
  }

  if (!activeMatch) {
    return (
      <Card className="p-8 text-center text-sm text-[#9AA69B] rounded-2xl">
        No tournament matches scheduled yet.
      </Card>
    );
  }

  const isLive = activeMatch.status === 'live' || activeMatch.status === 'half_time';
  const hasMatchStarted = isLive || activeMatch.status === 'completed';

  const homeSquad = players.filter((p) => p.team_id === activeMatch.home_team_id);
  const awaySquad = players.filter((p) => p.team_id === activeMatch.away_team_id);

  return (
    <div className="space-y-4 sm:space-y-5 animate-slide-up pb-6">
      {/* Main Scoreboard Showcase Card */}
      <div className="rounded-2xl bg-[#141414] border border-[#262626] overflow-hidden shadow-md">
        {/* Upper Electric Blue Arena Stage */}
        <div className="relative p-4 sm:p-6 pb-8 bg-gradient-to-r from-[#001AFF] via-[#0624C4] to-[#081970] text-[#FFFFFF]">
          {/* Top Tri-Color Championship Strip */}
          <div className="absolute top-0 inset-x-0 h-1.5 flex">
            <span className="flex-1 bg-[#FFC600]" />
            <span className="flex-1 bg-[#FF1E27]" />
            <span className="flex-1 bg-[#001AFF]" />
          </div>

          {/* Top Navigation & Match Switcher */}
          <div className="flex items-center justify-between gap-2 mb-5 pt-1">
            <Link
              to="/public"
              aria-label="Back to overview"
              className="w-10 h-10 rounded-xl bg-white/15 hover:bg-[#FFC600] text-[#FFFFFF] hover:text-[#090909] border border-white/20 flex items-center justify-center transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            {/* Match Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-[#041466]/90 p-1 rounded-xl border border-white/15 overflow-x-auto no-scrollbar">
              {matches.map((m) => {
                const selected = m.id === activeMatch.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMatchId(m.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all whitespace-nowrap ${
                      selected
                        ? 'bg-[#FFC600] text-[#090909] shadow-2xs'
                        : 'text-[#DBEAFE] hover:text-[#FFFFFF]'
                    }`}
                  >
                    M#{m.match_number}: {m.home_team?.short_code} v {m.away_team?.short_code}
                  </button>
                );
              })}
            </div>

            <div
              className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-[#FFC600] shrink-0"
              title={isLive ? 'Live Match Active' : 'Match Telemetry Ready'}
            >
              <Radio className={`w-4 h-4 ${isLive ? 'animate-pulse text-[#FFC600]' : ''}`} />
            </div>
          </div>

          {/* Center Matchup Showcase */}
          <div className="grid grid-cols-3 items-center text-center gap-3 py-2 sm:py-4">
            {/* Home Club */}
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141414] border-2 border-[#FFC600] flex items-center justify-center font-black text-base sm:text-xl text-[#FFC600] shadow-md">
                {activeMatch.home_team?.short_code}
              </div>
              <h2 className="text-xs sm:text-base font-black text-[#FFFFFF] truncate w-full">
                {activeMatch.home_team?.name}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#DBEAFE]">
                Home Club
              </span>
            </div>

            {/* Center VS & Venue Badge */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="px-3.5 py-1 rounded-full bg-[#FF1E27] text-[#FFFFFF] border border-[#FFC600] text-xs font-black tracking-widest uppercase shadow-xs">
                VS
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-extrabold text-[#FFFFFF]">
                <MapPin className="w-3 h-3 text-[#FFC600]" />
                {activeMatch.venue}
              </span>
            </div>

            {/* Away Club */}
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141414] border-2 border-[#FF1E27] flex items-center justify-center font-black text-base sm:text-xl text-[#FF6B72] shadow-md">
                {activeMatch.away_team?.short_code}
              </div>
              <h2 className="text-xs sm:text-base font-black text-[#FFFFFF] truncate w-full">
                {activeMatch.away_team?.name}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#DBEAFE]">
                Away Club
              </span>
            </div>
          </div>
        </div>

        {/* Lower Sleek Dark Telemetry Sheet */}
        <div className="relative -mt-4 rounded-t-3xl bg-[#141414] border-t border-[#262626] p-5 sm:p-6 space-y-5">
          {/* 3-Column Telemetry Readout: Match # | Giant Score | Period */}
          <div className="grid grid-cols-3 items-center text-center gap-2 py-1">
            <div className="text-left sm:text-center">
              <span className="text-[11px] font-semibold text-[#9AA69B] block">
                Fixture
              </span>
              <span className="text-base sm:text-xl font-extrabold text-[#F4F7F2] tabular-nums">
                M#{activeMatch.match_number}
              </span>
            </div>

            {/* Giant Tabular Score Display */}
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl sm:text-6xl font-black text-[#F4F7F2] tabular-nums tracking-tight whitespace-nowrap">
                {activeMatch.home_score ?? 0}:{activeMatch.away_score ?? 0}
              </div>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md mt-1.5 ${
                  isLive
                    ? 'bg-[#FF1E27]/20 text-[#FF6B72] border border-[#FF1E27]/50'
                    : activeMatch.status === 'completed'
                    ? 'bg-emerald-500/15 text-[#4ADE80] border border-emerald-500/35'
                    : 'bg-[#FFC600]/15 text-[#FFC600] border border-[#FFC600]/40'
                }`}
              >
                {isLive
                  ? 'LIVE IN PLAY'
                  : activeMatch.status === 'completed'
                  ? 'FULL TIME'
                  : 'PRE-MATCH'}
              </span>
            </div>

            <div className="text-right sm:text-center">
              <span className="text-[11px] font-semibold text-[#9AA69B] block">
                Period
              </span>
              <span className="text-base sm:text-xl font-extrabold text-[#FFC600] tabular-nums">
                {activeMatch.current_period || 1}/2
              </span>
            </div>
          </div>

          {/* Yellow & Blue Highlight Action Banner */}
          <Link
            to="/public/teams"
            className="group block rounded-2xl bg-[#1C1C1C] hover:bg-[#222222] border border-[#FFC600]/45 text-[#F4F7F2] p-3.5 sm:p-4 transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                <BrandLogo size="sm" />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#FFC600] block">
                    Live Stage Presentation
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-[#F4F7F2] truncate">
                    Live Team Draw &amp; Player Cards
                  </h3>
                </div>
              </div>

              <div className="w-10 h-10 rounded-xl bg-[#001AFF] text-[#FFFFFF] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight className="w-5 h-5 text-[#FFC600]" />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Conditional Content: Pre-Match vs Active/Completed Match */}
      {!hasMatchStarted ? (
        <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 text-center space-y-3 animate-card-pop shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-[#001AFF]/20 border border-[#3B82F6]/45 flex items-center justify-center mx-auto text-[#FFC600]">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-extrabold text-[#F4F7F2]">
              Official Lineups Unlock at Kickoff
            </h3>
            <p className="text-xs text-[#9AA69B] leading-relaxed">
              Matchday lineups and live commentary will appear automatically once the tournament official starts Match #{activeMatch.match_number}.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chronological Event Timeline */}
          <Card className="lg:col-span-5 space-y-3 rounded-2xl bg-[#141414] border-[#262626]">
            <h3 className="text-sm font-extrabold text-[#F4F7F2] flex items-center gap-2 border-b border-[#262626] pb-2.5">
              <Activity className="w-4 h-4 text-[#FFC600]" />
              Live Match Timeline ({events.length})
            </h3>

            {events.length === 0 ? (
              <p className="text-xs text-[#9AA69B] py-8 text-center bg-[#1C1C1C] border border-dashed border-[#303030] rounded-xl">
                Kickoff underway — awaiting first match event.
              </p>
            ) : (
              <div className="space-y-2">
                {events.map((ev, idx) => (
                  <div
                    key={ev.id}
                    style={{ animationDelay: `${idx * 45}ms` }}
                    className="animate-card-pop flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1C1C1C] border border-[#262626] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-[#001AFF]/25 border border-[#3B82F6]/40 font-black text-[#FFC600] tabular-nums shrink-0">
                        {ev.minute}&apos;
                      </span>
                      <span className="font-bold text-[#F4F7F2] shrink-0">
                        {ev.event_type === 'GOAL' ? '⚽ Goal' : ev.event_type.replace('_', ' ')}
                      </span>
                      {ev.player && (
                        <button
                          type="button"
                          onClick={() => {
                            const fullPlayer = players.find((p) => p.id === ev.player_id);
                            if (fullPlayer) setSelectedPlayer(fullPlayer);
                          }}
                          className="font-bold text-[#FFC600] hover:underline truncate"
                        >
                          #{ev.player.jersey_number} {ev.player.name}
                        </button>
                      )}
                    </div>
                    <Badge variant="brand">{ev.team?.short_code || 'TM'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Official Matchday Lineup Cards */}
          <Card className="lg:col-span-7 space-y-4 rounded-2xl bg-[#141414] border-[#262626]">
            <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
              <h3 className="text-sm font-extrabold text-[#F4F7F2] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FFC600]" />
                Official Matchday Squads
              </h3>
              <span className="text-[11px] font-medium text-[#9AA69B]">
                Tap card for player stats
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FFC600]">
                  {activeMatch.home_team?.name} ({homeSquad.length})
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {homeSquad.map((p) => (
                    <PlayerCard
                      key={p.id}
                      player={p}
                      team={activeMatch.home_team}
                      size="xs"
                      onSelect={() => setSelectedPlayer(p)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#262626]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B72]">
                  {activeMatch.away_team?.name} ({awaySquad.length})
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {awaySquad.map((p) => (
                    <PlayerCard
                      key={p.id}
                      player={p}
                      team={activeMatch.away_team}
                      size="xs"
                      onSelect={() => setSelectedPlayer(p)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          team={teams.find((t) => t.id === selectedPlayer.team_id)}
          stats={playerStatsMap[selectedPlayer.id] || {}}
          matchEvents={events.filter((e) => e.player_id === selectedPlayer.id)}
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

export default LiveMatchPage;
