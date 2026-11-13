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
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
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
      {/* Screen 3 Top Bar: Circular Back Button + Title + Official Logo */}
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
              Official Match Fixtures
            </h1>
            <p className="text-[11px] sm:text-xs text-[#9AA69B]">
              Round-Robin League Stage &amp; Grand Final
            </p>
          </div>
        </div>
        <BrandLogo size="sm" />
      </div>

      {/* Screen 3 Telemetry Stat Bar + Circular Action Tile */}
      <div className="flex items-stretch gap-3">
        <div className="flex-1 rounded-[24px] bg-[#161616] border border-white/[0.07] px-4 py-3.5 grid grid-cols-2 gap-3 items-center">
          <div>
            <span className="text-[11px] text-[#9AA69B] font-semibold block">
              League Stage
            </span>
            <span className="text-base sm:text-xl font-black text-[#F4F7F2] tabular-nums">
              {matches.length} Matches
            </span>
          </div>
          <div className="border-l border-white/[0.08] pl-3">
            <span className="text-[11px] text-[#9AA69B] font-semibold block">
              Format
            </span>
            <span className="text-base sm:text-xl font-black text-[#B8F34A] tabular-nums">
              5v5 + Final
            </span>
          </div>
        </div>

        <Link
          to="/public/live"
          aria-label="Live Match Center"
          className="w-16 rounded-[24px] bg-[#161616] border border-white/[0.07] hover:border-[#B8F34A] flex flex-col items-center justify-center gap-1 text-[#F4F7F2] hover:text-[#B8F34A] transition-all shrink-0"
        >
          <Radio className="w-5 h-5 text-[#B8F34A] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider">LIVE</span>
        </Link>
      </div>

      {/* Segmented Pill Filter Bar */}
      <div className="flex items-center gap-1.5 bg-[#161616] p-1.5 rounded-full border border-white/[0.06] overflow-x-auto no-scrollbar">
        {['ALL', 'SCHEDULED', 'LIVE', 'COMPLETED'].map((st) => {
          const active = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all whitespace-nowrap ${
                active
                  ? 'bg-[#F4F7F2] text-[#090909] shadow'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2]'
              }`}
            >
              {st === 'ALL' ? 'All Fixtures' : st}
            </button>
          );
        })}
      </div>

      {/* Alternating Lime (#B8F34A) & Charcoal (#161616) [28px] Fixture Stack */}
      {isLoading ? (
        <Card className="p-8 text-center text-[#9AA69B] rounded-[28px]">
          Loading official fixtures...
        </Card>
      ) : filteredMatches.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[#9AA69B] rounded-[28px]">
          No fixtures match the selected filter ({statusFilter}).
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredMatches.map((match, idx) => {
            const matchEvents = allEvents.filter((e) => e.match_id === match.id);
            const isLive = match.status === 'live' || match.status === 'half_time';
            // Alternate solid bright lime (#B8F34A) and deep charcoal (#161616) cards like Screen 3
            const isLimeCard = idx % 2 === 0;

            return (
              <React.Fragment key={match.id}>
                {/* Subtle centered horizontal connector pill between cards */}
                <div className="w-7 h-1 rounded-full bg-white/30 mx-auto" />

                <div
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
                  className={`animate-card-pop rounded-[28px] p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                    isLimeCard
                      ? 'bg-[#B8F34A] text-[#090909] shadow-[0_16px_40px_rgba(184,243,74,0.18)]'
                      : 'bg-[#161616] text-[#F4F7F2] border border-white/[0.08] hover:border-[#B8F34A]/60 shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Column: Match Title, Teams & Metadata */}
                    <div className="space-y-2.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider tabular-nums ${
                            isLimeCard
                              ? 'bg-[#090909] text-[#B8F34A]'
                              : 'bg-[#090909] text-[#B8F34A] border border-white/10'
                          }`}
                        >
                          Match #{match.match_number}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold ${
                            isLimeCard ? 'text-[#090909]/75' : 'text-[#9AA69B]'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{match.venue}</span>
                        </span>

                        {isLive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#090909] text-[#B8F34A] text-[10px] font-black uppercase tracking-wider animate-pulse">
                            LIVE NOW
                          </span>
                        )}
                      </div>

                      {/* Bold Matchup Headline */}
                      <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
                        {match.home_team?.name || 'Home Team'}{' '}
                        <span
                          className={
                            isLimeCard ? 'text-[#090909]/55 font-extrabold' : 'text-[#B8F34A]'
                          }
                        >
                          {match.status === 'scheduled'
                            ? 'vs'
                            : `${match.home_score} : ${match.away_score}`}
                        </span>{' '}
                        {match.away_team?.name || 'Away Team'}
                      </h2>

                      {/* Sub-caption */}
                      <div
                        className={`flex flex-wrap items-center gap-3 text-xs font-semibold ${
                          isLimeCard ? 'text-[#090909]/75' : 'text-[#9AA69B]'
                        }`}
                      >
                        <span>
                          {match.home_team?.short_code} vs {match.away_team?.short_code} • 5v5 Official Fixture
                        </span>
                        {matchEvents.length > 0 && (
                          <span>• {matchEvents.length} events</span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Animated Circular Progress Ring */}
                    <CircularRing
                      value={
                        match.status === 'completed'
                          ? 3
                          : isLive
                          ? 2
                          : idx + 1
                      }
                      max={3}
                      size={58}
                      strokeWidth={5}
                      label={String(match.match_number)}
                      invertColors={isLimeCard}
                    />
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Championship Grand Final Card (1st vs 2nd Place) */}
          <div className="w-7 h-1 rounded-full bg-white/30 mx-auto" />

          <div className="rounded-[28px] bg-[#161616] border-2 border-[#B8F34A] p-5 sm:p-6 shadow-[0_16px_40px_rgba(184,243,74,0.12)]">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#B8F34A] text-[#090909] text-[10px] font-black uppercase tracking-wider">
                    Championship Final
                  </span>
                  <span className="text-xs font-bold text-[#9AA69B]">
                    Top 2 League Seeds
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-[#F4F7F2] tracking-tight">
                  {topTwoTeams.first?.team_name || '1st Place Seed'}{' '}
                  <span className="text-[#B8F34A]">vs</span>{' '}
                  {topTwoTeams.second?.team_name || '2nd Place Seed'}
                </h3>

                <p className="text-xs font-semibold text-[#9AA69B]">
                  Super Cup Grand Final • Main Stadium Pitch
                </p>
              </div>

              <CircularRing
                value={3}
                max={3}
                size={58}
                strokeWidth={5}
                label="FIN"
                invertColors={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bottom Track-Style Pill CTA Bar (Matches Screen 3 Bottom CTA) */}
      <div className="pt-2">
        <Link
          to="/public/live"
          className="group w-full rounded-full bg-[#090909] border border-[#B8F34A] p-1.5 flex items-center justify-between hover:bg-[#141414] transition-all shadow-[0_10px_30px_rgba(184,243,74,0.15)]"
        >
          <span className="w-11 h-11 rounded-full bg-[#B8F34A] text-[#090909] flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </span>

          <span className="text-sm font-extrabold text-[#F4F7F2] tracking-tight">
            Open Live Match Center
          </span>

          <span className="flex items-center pr-4 text-[#B8F34A]">
            <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-1" />
            <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-2" />
            <ChevronRight className="w-4 h-4 animate-chevron-3" />
          </span>
        </Link>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedMatch(null)}
        >
          <Card
            className="w-full max-w-lg space-y-4 bg-[#141414] border-[#262626] rounded-[28px] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="xs" />
                <div>
                  <span className="text-[11px] font-bold text-[#B8F34A] block">
                    MATCH #{selectedMatch.match_number} • {selectedMatch.venue}
                  </span>
                  <h3 className="text-base font-bold text-[#F4F7F2]">
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

            <div className="py-5 text-center bg-[#090909] rounded-2xl border border-[#262626]">
              <p className="text-3xl font-black text-[#F4F7F2] tabular-nums">
                {selectedMatch.status === 'scheduled'
                  ? 'VS'
                  : `${selectedMatch.home_score} : ${selectedMatch.away_score}`}
              </p>
              <span className="text-xs text-[#B8F34A] font-bold uppercase mt-1 block">
                {selectedMatch.status}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA69B] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#B8F34A]" /> Match Events
              </h4>
              {allEvents.filter((e) => e.match_id === selectedMatch.id).length === 0 ? (
                <p className="text-xs text-[#9AA69B] py-4 text-center">
                  No events recorded for this fixture yet.
                </p>
              ) : (
                allEvents
                  .filter((e) => e.match_id === selectedMatch.id)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-xl bg-[#090909] border border-[#262626] flex items-center justify-between text-xs"
                    >
                      <span>
                        <strong className="text-[#B8F34A] mr-2 tabular-nums">
                          {ev.minute}&apos;
                        </strong>
                        {ev.event_type.replace('_', ' ')}
                      </span>
                      <span className="text-[#9AA69B]">{ev.team?.name || ''}</span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
              <Link
                to="/public/live"
                className="text-xs font-bold text-[#B8F34A] hover:underline inline-flex items-center gap-1"
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
