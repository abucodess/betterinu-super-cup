import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Activity, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
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
      <Card className="p-8 text-center text-sm text-[#9AA69B]">
        Connecting to live match center...
      </Card>
    );
  }

  if (!activeMatch) {
    return (
      <Card className="p-8 text-center text-sm text-[#9AA69B]">
        No tournament matches scheduled yet.
      </Card>
    );
  }

  const isLive = activeMatch.status === 'live' || activeMatch.status === 'half_time';
  const homeSquad = players.filter((p) => p.team_id === activeMatch.home_team_id);
  const awaySquad = players.filter((p) => p.team_id === activeMatch.away_team_id);

  return (
    <div className="space-y-4">
      {/* Match Selector Strip */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
        {matches.map((m) => {
          const selected = m.id === activeMatch.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMatchId(m.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selected
                  ? 'bg-[#B8F34A] text-[#090909]'
                  : 'bg-[#141414] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#262626]'
              }`}
            >
              M#{m.match_number}: {m.home_team?.short_code} vs {m.away_team?.short_code}
            </button>
          );
        })}
      </div>

      {/* Mobile-Responsive Broadcast Scoreboard */}
      <Card className="p-4 sm:p-6 bg-gradient-to-b from-[#1a1a1a] to-[#141414] space-y-4">
        <div className="flex items-center justify-between gap-2">
          {isLive ? (
            <Badge variant="live">
              <span className="w-2 h-2 rounded-full bg-[#FF414D] animate-pulse" />
              LIVE • P{activeMatch.current_period || 1}
            </Badge>
          ) : (
            <Badge variant={activeMatch.status === 'completed' ? 'success' : 'neutral'}>
              {activeMatch.status.toUpperCase()}
            </Badge>
          )}
          <span className="text-[11px] text-[#9AA69B] truncate">
            Match #{activeMatch.match_number} • {activeMatch.venue}
          </span>
        </div>

        {/* 3-Column Scoreboard Grid (Zero text collision on 390px screens) */}
        <div className="grid grid-cols-3 items-center text-center gap-2 bg-[#0E0E0E] rounded-2xl p-3.5 sm:p-5 border border-[#262626]">
          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xs text-[#090909] shrink-0 shadow"
              style={{ backgroundColor: activeMatch.home_team?.color_code || '#B8F34A' }}
            >
              {activeMatch.home_team?.short_code}
            </div>
            <h2 className="text-xs sm:text-base font-bold text-[#F4F7F2] truncate w-full">
              {activeMatch.home_team?.name}
            </h2>
            <span className="text-[10px] text-[#9AA69B]">HOME</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 min-w-0">
            <div className="text-2xl sm:text-5xl font-black text-[#F4F7F2] tabular-nums whitespace-nowrap tracking-tight">
              {activeMatch.home_score ?? 0} - {activeMatch.away_score ?? 0}
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#B8F34A] whitespace-nowrap">
              <Clock className="w-3 h-3 shrink-0" />
              <span>{activeMatch.status.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1.5 min-w-0">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xs text-[#090909] shrink-0 shadow"
              style={{ backgroundColor: activeMatch.away_team?.color_code || '#EF4444' }}
            >
              {activeMatch.away_team?.short_code}
            </div>
            <h2 className="text-xs sm:text-base font-bold text-[#F4F7F2] truncate w-full">
              {activeMatch.away_team?.name}
            </h2>
            <span className="text-[10px] text-[#9AA69B]">AWAY</span>
          </div>
        </div>
      </Card>

      {/* Match Events + Responsive Matchday Squads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chronological Event Timeline */}
        <Card className="lg:col-span-6 space-y-3">
          <h3 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2 border-b border-[#262626] pb-2.5">
            <Activity className="w-4 h-4 text-[#B8F34A]" />
            Match Events ({events.length})
          </h3>

          {events.length === 0 ? (
            <p className="text-xs text-[#9AA69B] py-8 text-center border border-dashed border-[#303030] rounded-xl">
              No match events recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#202020] border border-[#303030] text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[#B8F34A] tabular-nums shrink-0">
                      {ev.minute}&apos;
                    </span>
                    <span className="font-semibold text-[#F4F7F2] shrink-0">
                      {ev.event_type === 'GOAL' ? '⚽ Goal' : ev.event_type.replace('_', ' ')}
                    </span>
                    {ev.player && (
                      <button
                        type="button"
                        onClick={() => {
                          const fullPlayer = players.find((p) => p.id === ev.player_id);
                          if (fullPlayer) setSelectedPlayer(fullPlayer);
                        }}
                        className="font-bold text-[#B8F34A] hover:underline truncate"
                      >
                        #{ev.player.jersey_number} {ev.player.name}
                      </button>
                    )}
                  </div>
                  <Badge variant="neutral">{ev.team?.short_code || 'TM'}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Responsive Matchday Squads (Tap Player for Card) */}
        <Card className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
            <h3 className="text-sm font-bold text-[#F4F7F2] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#B8F34A]" />
              Matchday Squads
            </h3>
            <span className="text-[11px] text-[#9AA69B]">Tap player for card</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Home Squad Column */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9AA69B] block">
                {activeMatch.home_team?.name} ({homeSquad.length})
              </span>
              {homeSquad.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayer(p)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#202020] hover:border-[#B8F34A] border border-[#303030] text-xs transition-colors"
                >
                  <span className="font-semibold text-[#F4F7F2] truncate">
                    <strong className="text-[#B8F34A] mr-1.5 tabular-nums">
                      #{p.jersey_number}
                    </strong>
                    {p.name}
                  </span>
                  <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>{p.position}</Badge>
                </button>
              ))}
            </div>

            {/* Away Squad Column */}
            <div className="space-y-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#262626]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9AA69B] block">
                {activeMatch.away_team?.name} ({awaySquad.length})
              </span>
              {awaySquad.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayer(p)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#202020] hover:border-[#B8F34A] border border-[#303030] text-xs transition-colors"
                >
                  <span className="font-semibold text-[#F4F7F2] truncate">
                    <strong className="text-[#B8F34A] mr-1.5 tabular-nums">
                      #{p.jersey_number}
                    </strong>
                    {p.name}
                  </span>
                  <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>{p.position}</Badge>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

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
