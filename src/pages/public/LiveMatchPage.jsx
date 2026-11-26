import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Activity,
  Users,
  Lock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ArenaHeading, ArenaState } from '../../components/shared/ArenaUI';
import { isLiveMatch, MatchSummary } from '../../components/shared/MatchSummary';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { matchesApi } from '../../services/api/matches.api';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { standingsApi } from '../../services/api/standings.api';
import { supabase } from '../../services/supabase/client';

export function LiveMatchPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedMatchId = searchParams.get('match');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const { data: matches = [], isLoading: loadingMatches, isError: matchesError, refetch: retryMatches } = useQuery({
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

  const { data: events = [], isPending: loadingEvents, isError: eventsError, refetch: retryEvents } = useQuery({
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

  if (loadingMatches || matchesError || !activeMatch) {
    return (
      <div>
        <ArenaHeading title="Match Center" description="Follow the score, lineups and match events.">
          <Link to="/public/fixtures" className="arena-button">Fixtures <ArrowRight size={16} /></Link>
        </ArenaHeading>
        {loadingMatches ? <ArenaState>Loading the match center?</ArenaState> : matchesError ?
          <ArenaState error onRetry={retryMatches}>Match data could not be loaded.</ArenaState> :
          <ArenaState>No fixtures have been published yet.</ArenaState>}
      </div>
    );
  }

  const hasMatchStarted = isLiveMatch(activeMatch) || activeMatch.status === 'completed';

  const homeSquad = players.filter((p) => p.team_id === activeMatch.home_team_id);
  const awaySquad = players.filter((p) => p.team_id === activeMatch.away_team_id);

  return (
    <div className="space-y-4 sm:space-y-5 animate-slide-up pb-6">
      <ArenaHeading title="Match Center">
        <Link to="/public/fixtures" className="arena-button">Fixtures <ArrowRight size={16} /></Link>
      </ArenaHeading>
      <div className="arena-tabs" role="group" aria-label="Select a match">
        {matches.map((match) => <button key={match.id} type="button" aria-pressed={match.id === activeMatch.id}
          onClick={() => setSearchParams({ match: match.id }, { replace: true, preventScrollReset: true })}>
          Match {match.match_number} ? {match.home_team?.short_code} v {match.away_team?.short_code}
        </button>)}
      </div>

      <section className="arena-panel arena-match-card arena-scoreboard" aria-label="Match scoreboard">
        <MatchSummary match={activeMatch} compact />
        {hasMatchStarted && <div className="arena-scoreboard-period">
          {isLiveMatch(activeMatch) && Number.isFinite(activeMatch.current_minute) && <span>{activeMatch.current_minute}?</span>}
          <span>Period {activeMatch.current_period || 1} of 2</span>
        </div>}
      </section>
      <Link to="/public/teams?view=draft" className="arena-text-link">Live draft board <ArrowRight size={16} /></Link>

      {/* Conditional Content: Pre-Match vs Active/Completed Match */}
      {!hasMatchStarted ? (
        <div className="rounded-2xl bg-[#141414] border border-[#262626] p-6 text-center space-y-3 animate-card-pop shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-[#001AFF]/20 border border-[#3B82F6]/45 flex items-center justify-center mx-auto text-[#FFC600]">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm sm:text-base font-extrabold text-[#F4F7F2]">
              {activeMatch.status === 'cancelled' ? 'Match cancelled' : 'Official lineups unlock at kickoff'}
            </h3>
            <p className="text-xs text-[#9AA69B] leading-relaxed">
              {activeMatch.status === 'cancelled' ? 'No lineups or match events are available.' : 'Matchday lineups and live commentary will appear once the match starts.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Chronological Event Timeline */}
          <Card className="arena-info lg:col-span-5 space-y-3">
            <h3 className="text-sm font-extrabold text-[#F4F7F2] flex items-center gap-2 border-b border-[#262626] pb-2.5">
              <Activity className="w-4 h-4 text-[#FFC600]" />
              {isLiveMatch(activeMatch) ? 'Live Match Timeline' : 'Match Timeline'} ({events.length})
            </h3>

            {loadingEvents ? <ArenaState>Loading match events…</ArenaState> : eventsError ?
              <ArenaState error onRetry={retryEvents}>Match events could not be loaded.</ArenaState> : events.length === 0 ? (
              <p className="text-xs text-[#9AA69B] py-8 text-center bg-[#1C1C1C] border border-dashed border-[#303030] rounded-xl">
                No events have been recorded.
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
                        {ev.event_type === 'GOAL' ? 'Goal' : ev.event_type.replaceAll('_', ' ')}
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
          <Card className="arena-info lg:col-span-7 space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between border-b border-[#262626] pb-2.5">
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
                <div className="arena-player-grid">
                  {homeSquad.map((p) => (
                    <PlayerCard
                      key={p.id}
                      player={p}
                      team={activeMatch.home_team}
                      variant="row"
                      onSelect={() => setSelectedPlayer(p)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-[#262626]">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF6B72]">
                  {activeMatch.away_team?.name} ({awaySquad.length})
                </span>
                <div className="arena-player-grid">
                  {awaySquad.map((p) => (
                    <PlayerCard
                      key={p.id}
                      player={p}
                      team={activeMatch.away_team}
                      variant="row"
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
          matchEvents={events}
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
