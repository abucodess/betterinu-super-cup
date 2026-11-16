import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  MapPin,
  X,
  Activity,
  Radio,
  Trophy,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CircularRing } from '../../components/ui/CircularRing';
import { BrandLogo } from '../../components/shared/BrandLogo';
import { matchesApi } from '../../services/api/matches.api';
import { standingsApi } from '../../services/api/standings.api';

export function FixturesPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMatch, setSelectedMatch] = useState(null);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
    refetchInterval: 3000,
  });

  const { data: standings = [] } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
    refetchInterval: 5000,
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['all_match_events'],
    queryFn: () => matchesApi.getAllMatchEvents(),
  });

  const filteredMatches = useMemo(() => {
    if (statusFilter === 'ALL') return matches;
    if (statusFilter === 'LIVE') {
      return matches.filter((m) => m.status === 'live' || m.status === 'half_time');
    }
    return matches.filter((m) => m.status === statusFilter.toLowerCase());
  }, [matches, statusFilter]);

  const topTwoTeams = useMemo(() => {
    const first = standings[0] || null;
    const second = standings[1] || null;
    return { first, second };
  }, [standings]);

  return (
    <div className="space-y-5 animate-slide-up pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/public"
            aria-label="Back to Overview"
            className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-[#F4F7F2] hover:bg-[#1C1C1C] hover:border-[#FFC600] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[#F4F7F2]">
              Official Match Fixtures
            </h1>
            <p className="text-[11px] sm:text-xs font-medium text-[#9AA69B]">
              Round-Robin League Stage &amp; Grand Final
            </p>
          </div>
        </div>
        <BrandLogo size="sm" />
      </div>

      {/* Summary Stat Strip + Live Match Center Shortcut */}
      <div className="flex items-stretch gap-3">
        <div className="flex-1 rounded-2xl bg-[#141414] border border-[#262626] px-4 py-3.5 grid grid-cols-2 gap-3 items-center shadow-sm">
          <div>
            <span className="text-[11px] text-[#9AA69B] font-semibold block">
              League Stage
            </span>
            <span className="text-base sm:text-xl font-black text-[#F4F7F2] tabular-nums">
              {matches.length} Matches
            </span>
          </div>
          <div className="border-l border-[#262626] pl-3">
            <span className="text-[11px] text-[#9AA69B] font-semibold block">
              Competition Format
            </span>
            <span className="text-base sm:text-xl font-black text-[#FFC600] tabular-nums">
              5v5 + Final
            </span>
          </div>
        </div>

        <Link
          to="/public/live"
          aria-label="Live Match Center"
          className="w-20 rounded-2xl bg-[#FF1E27] hover:bg-[#E0151E] flex flex-col items-center justify-center gap-1 text-[#FFFFFF] transition-all shrink-0 shadow-[0_6px_20px_rgba(255,30,39,0.3)]"
        >
          <Radio className="w-5 h-5 text-[#FFC600] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider">LIVE</span>
        </Link>
      </div>

      {/* Segmented Filter Bar */}
      <div className="flex items-center gap-1.5 bg-[#141414] p-1.5 rounded-xl border border-[#262626] overflow-x-auto no-scrollbar">
        {['ALL', 'SCHEDULED', 'LIVE', 'COMPLETED'].map((st) => {
          const active = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
                active
                  ? 'bg-[#001AFF] text-[#FFFFFF] shadow-xs border border-[#3B82F6]/40'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2] hover:bg-[#1C1C1C]'
              }`}
            >
              {st === 'ALL' ? 'All Fixtures' : st}
            </button>
          );
        })}
      </div>

      {/* Match Fixture Cards */}
      {isLoading ? (
        <Card className="p-8 text-center text-[#9AA69B] rounded-2xl">
          Loading official fixtures...
        </Card>
      ) : filteredMatches.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[#9AA69B] rounded-2xl">
          No fixtures match the selected filter ({statusFilter}).
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match, idx) => {
            const matchEvents = allEvents.filter((e) => e.match_id === match.id);
            const isLive = match.status === 'live' || match.status === 'half_time';
            const cardPalette = [
              {
                topStrip: 'bg-[#001AFF]',
                card: 'bg-[#141414] border-[#001AFF]/45 hover:border-[#001AFF]',
                badge: 'bg-[#001AFF] text-[#FFFFFF]',
              },
              {
                topStrip: 'bg-[#FFC600]',
                card: 'bg-[#141414] border-[#FFC600]/45 hover:border-[#FFC600]',
                badge: 'bg-[#FFC600] text-[#090909]',
              },
              {
                topStrip: 'bg-[#FF1E27]',
                card: 'bg-[#141414] border-[#FF1E27]/45 hover:border-[#FF1E27]',
                badge: 'bg-[#FF1E27] text-[#FFFFFF]',
              },
            ][idx % 3];

            return (
              <div
                key={match.id}
                style={{ animationDelay: `${idx * 70}ms` }}
                onClick={() => setSelectedMatch(match)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedMatch(match);
                  }
                }}
                className={`relative overflow-hidden animate-card-pop rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 text-[#F4F7F2] border shadow-sm ${cardPalette.card}`}
              >
                <div className={`h-1 w-full absolute top-0 left-0 right-0 ${cardPalette.topStrip}`} />
                <div className="flex items-center justify-between gap-4 pt-0.5">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider tabular-nums ${cardPalette.badge}`}>
                        Match #{match.match_number}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#9AA69B]">
                        <MapPin className="w-3.5 h-3.5 text-[#FFC600] shrink-0" />
                        <span>{match.venue}</span>
                      </span>

                      {isLive && (
                        <span className="px-2.5 py-0.5 rounded-md bg-[#FF1E27] text-[#FFFFFF] text-[10px] font-black uppercase tracking-wider animate-pulse">
                          LIVE NOW
                        </span>
                      )}

                      {match.status === 'completed' && (
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-[#4ADE80] border border-emerald-500/35 text-[10px] font-black uppercase tracking-wider">
                          FULL TIME
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-2xl font-black tracking-tight text-[#F4F7F2] leading-snug">
                      {match.home_team?.name || 'Home Team'}{' '}
                      <span className="px-2.5 py-0.5 mx-1 rounded-lg bg-[#202020] border border-[#303030] text-[#FFC600] font-black tabular-nums">
                        {match.status === 'scheduled'
                          ? 'vs'
                          : `${match.home_score} : ${match.away_score}`}
                      </span>{' '}
                      {match.away_team?.name || 'Away Team'}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#9AA69B]">
                      <span>
                        {match.home_team?.short_code} vs {match.away_team?.short_code} · 5v5 Official Fixture
                      </span>
                      {matchEvents.length > 0 && (
                        <span className="text-[#FFC600]">· {matchEvents.length} events</span>
                      )}
                    </div>
                  </div>

                  <CircularRing
                    value={
                      match.status === 'completed'
                        ? 3
                        : isLive
                        ? 2
                        : idx + 1
                    }
                    max={3}
                    size={56}
                    strokeWidth={5}
                    label={String(match.match_number)}
                  />
                </div>
              </div>
            );
          })}

          {/* Championship Grand Final Highlight Card */}
          <div className="relative rounded-2xl bg-gradient-to-r from-[#001AFF] via-[#0624C4] to-[#081970] border border-[#3B82F6]/40 text-[#FFFFFF] p-5 sm:p-6 shadow-[0_14px_38px_rgba(0,26,255,0.28)] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 flex">
              <span className="flex-1 bg-[#FFC600]" />
              <span className="flex-1 bg-[#FF1E27]" />
              <span className="flex-1 bg-[#001AFF]" />
            </div>
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FFC600] text-[#090909] text-[10px] font-black uppercase tracking-wider">
                    <Trophy className="w-3 h-3" />
                    Championship Final
                  </span>
                  <span className="text-xs font-bold text-[#DBEAFE]">
                    Top 2 League Seeds
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-[#FFFFFF] tracking-tight">
                  {topTwoTeams.first?.team_name || '1st Place Seed'}{' '}
                  <span className="text-[#FFC600] px-1">vs</span>{' '}
                  {topTwoTeams.second?.team_name || '2nd Place Seed'}
                </h3>

                <p className="text-xs font-semibold text-[#DBEAFE]">
                  BetterInU Football League Grand Final · Main Stadium Pitch
                </p>
              </div>

              <CircularRing
                value={3}
                max={3}
                size={56}
                strokeWidth={5}
                label="FIN"
                tone="onBlue"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA Bar */}
      <div className="pt-2">
        <Link
          to="/public/live"
          className="group w-full rounded-2xl bg-[#141414] border border-[#001AFF]/50 hover:border-[#FFC600] p-2 flex items-center justify-between hover:bg-[#1C1C1C] transition-all shadow-sm"
        >
          <span className="w-10 h-10 rounded-xl bg-[#001AFF] text-[#FFFFFF] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="w-5 h-5 stroke-[2.5] text-[#FFC600]" />
          </span>

          <span className="text-sm font-extrabold text-[#F4F7F2] group-hover:text-[#FFC600] tracking-tight">
            Open Live Match Center
          </span>

          <span className="flex items-center pr-3 text-[#FFC600]">
            <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-1" />
            <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-2" />
            <ChevronRight className="w-4 h-4 animate-chevron-3" />
          </span>
        </Link>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setSelectedMatch(null)}
        >
          <Card
            className="w-full max-w-lg space-y-4 bg-[#141414] border-[#303030] rounded-2xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="xs" />
                <div>
                  <span className="text-[11px] font-bold text-[#FFC600] block">
                    MATCH #{selectedMatch.match_number} • {selectedMatch.venue}
                  </span>
                  <h3 className="text-base font-extrabold text-[#F4F7F2]">
                    {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 text-center bg-[#1C1C1C] rounded-xl border border-[#303030]">
              <p className="text-3xl font-black text-[#F4F7F2] tabular-nums">
                {selectedMatch.status === 'scheduled'
                  ? 'VS'
                  : `${selectedMatch.home_score} : ${selectedMatch.away_score}`}
              </p>
              <span className="text-xs text-[#FFC600] font-extrabold uppercase mt-1 block">
                {selectedMatch.status}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA69B] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#FFC600]" /> Match Events
              </h4>
              {allEvents.filter((e) => e.match_id === selectedMatch.id).length === 0 ? (
                <p className="text-xs text-[#9AA69B] py-4 text-center bg-[#1C1C1C] rounded-xl border border-[#262626]">
                  No events recorded for this fixture yet.
                </p>
              ) : (
                allEvents
                  .filter((e) => e.match_id === selectedMatch.id)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-xl bg-[#1C1C1C] border border-[#262626] flex items-center justify-between text-xs"
                    >
                      <span className="text-[#F4F7F2] font-medium">
                        <strong className="text-[#FFC600] mr-2 tabular-nums">
                          {ev.minute}&apos;
                        </strong>
                        {ev.event_type.replace('_', ' ')}
                      </span>
                      <span className="text-[#9AA69B] font-semibold">
                        {ev.team?.name || ''}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
              <Link
                to="/public/live"
                className="text-xs font-bold text-[#FFC600] hover:underline inline-flex items-center gap-1"
              >
                <span>Open in Live Match Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Button variant="secondary" size="sm" onClick={() => setSelectedMatch(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default FixturesPage;
