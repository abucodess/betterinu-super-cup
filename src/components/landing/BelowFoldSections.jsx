import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  Calendar,
  MapPin,
  Shield,
} from 'lucide-react';
import { teamsApi } from '../../services/api/teams.api';
import { playersApi } from '../../services/api/players.api';
import { matchesApi } from '../../services/api/matches.api';
import { standingsApi } from '../../services/api/standings.api';
import { BettyKickButton } from './BettyKickButton';
import { BETTY_MASCOT_URL } from './HeroSection';

export function BelowFoldSections() {
  const navigate = useNavigate();

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: standings = [] } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
  });

  // Build 4 team presentation cards using real database teams + Championship Finalists slot if 3 clubs exist
  const teamPresentationCards = React.useMemo(() => {
    const realCards = teams.map((t, idx) => {
      const roster = players.filter((p) => p.team_id === t.id);
      return {
        id: t.id,
        number: `0${idx + 1}`,
        name: t.name,
        shortCode: t.short_code,
        color: t.color_code || '#B8F34A',
        playerCount: roster.length,
        subtitle:
          roster.length > 0
            ? `${roster.length} Custom Player Cards Assigned`
            : 'Official 5-a-side Contender',
        link: '/public/teams',
      };
    });

    if (realCards.length < 4) {
      realCards.push({
        id: 'championship-finalists',
        number: `0${realCards.length + 1}`,
        name: 'Grand Finalists',
        shortCode: 'FIN',
        color: '#B8F34A',
        playerCount: players.length,
        subtitle: 'Top 2 League Seeds Advance to the Super Cup Final',
        link: '/public/fixtures',
      });
    }

    return realCards.slice(0, 4);
  }, [teams, players]);

  return (
    <div className="bg-[#090909] text-[#F4F7F2]">
      {/* SECTION A: TOURNAMENT INTRODUCTION ("THIS IS MORE THAN A GAME.") */}
      <section
        id="intro"
        className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 border-b border-white/10"
      >
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7 space-y-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#B8F34A]">
              01. OFFICIAL TOURNAMENT MANIFESTO
            </p>
            <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight leading-[0.9] text-[#F4F7F2]">
              THIS IS MORE THAN A GAME.
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-6 pt-2">
            <p className="text-base sm:text-lg text-[#F4F7F2]/90 leading-relaxed font-medium">
              The <strong className="text-[#B8F34A]">BetterInU Super Cup 2026</strong> brings campus athletes and supporters together through high-intensity 5-a-side football, live stage squad drafts, and real-time match telemetry.
            </p>
            <p className="text-sm sm:text-base text-[#9AA69B] leading-relaxed">
              Every custom player card is drafted live onto the big screen, every goal updates the league table in real time, and only the top two clubs earn their place in the Super Cup Grand Final.
            </p>

            {/* Concrete Tournament Proof Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 tabular-nums">
              <div>
                <span className="font-display text-3xl sm:text-4xl font-black text-[#B8F34A] block">
                  {players.length || 15}
                </span>
                <span className="text-xs font-semibold text-[#9AA69B]">
                  Custom Player Cards
                </span>
              </div>
              <div>
                <span className="font-display text-3xl sm:text-4xl font-black text-[#F4F7F2] block">
                  5v5
                </span>
                <span className="text-xs font-semibold text-[#9AA69B]">
                  Official Format
                </span>
              </div>
              <div>
                <span className="font-display text-3xl sm:text-4xl font-black text-[#B8F34A] block">
                  {matches.length || 3}+1
                </span>
                <span className="text-xs font-semibold text-[#9AA69B]">
                  League + Grand Final
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: MEET THE TEAMS */}
      <section
        id="teams"
        className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 border-b border-white/10"
      >
        <div className="max-w-[1320px] mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#B8F34A]">
                02. CONTENDERS &amp; LIVE SQUADS
              </p>
              <h2 className="font-display text-5xl sm:text-7xl font-black uppercase tracking-tight leading-[0.92] text-[#F4F7F2]">
                MEET THE TEAMS
              </h2>
            </div>

            <BettyKickButton
              label="MEET THE TEAMS"
              size="sm"
              to="/public/teams"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {teamPresentationCards.map((card) => (
              <Link
                key={card.id}
                to={card.link}
                className="group relative bg-[#141414] border border-white/10 hover:border-[#B8F34A] p-6 flex flex-col justify-between min-h-[290px] transition-all duration-300 hover:-translate-y-1.5"
              >
                {/* Top Index & Team Crest */}
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-2xl font-black text-[#9AA69B]/60 group-hover:text-[#B8F34A] transition-colors tabular-nums">
                    {card.number}
                  </span>
                  <div
                    className="w-12 h-12 flex items-center justify-center font-display text-base font-black text-[#090909] transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: card.color }}
                  >
                    {card.shortCode}
                  </div>
                </div>

                {/* Middle Club Name & Info */}
                <div className="my-8 space-y-2">
                  <h3 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#F4F7F2] group-hover:text-[#B8F34A] transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-xs text-[#9AA69B] leading-relaxed">
                    {card.subtitle}
                  </p>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[#F4F7F2]">
                  <span>Explore Squad</span>
                  <span className="w-8 h-8 rounded-full bg-[#202020] group-hover:bg-[#B8F34A] group-hover:text-[#090909] flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION C: UPCOMING FIXTURES */}
      <section
        id="fixtures"
        className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 border-b border-white/10"
      >
        <div className="max-w-[1320px] mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#B8F34A]">
                03. OFFICIAL MATCH SCHEDULE
              </p>
              <h2 className="font-display text-5xl sm:text-7xl font-black uppercase tracking-tight leading-[0.92] text-[#F4F7F2]">
                MATCH FIXTURES
              </h2>
            </div>

            <BettyKickButton
              label="VIEW ALL FIXTURES"
              size="sm"
              to="/public/fixtures"
            />
          </div>

          {matches.length === 0 ? (
            <div className="p-10 bg-[#141414] border border-white/10 text-center text-sm text-[#9AA69B]">
              Official fixtures are being scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {matches.map((match, idx) => {
                const isLime = idx === 0;
                const isLive =
                  match.status === 'live' || match.status === 'half_time';

                return (
                  <Link
                    key={match.id}
                    to="/public/fixtures"
                    className={`group p-6 flex flex-col justify-between min-h-[240px] transition-transform duration-300 hover:-translate-y-1 ${
                      isLime
                        ? 'bg-[#B8F34A] text-[#090909]'
                        : 'bg-[#141414] text-[#F4F7F2] border border-white/10 hover:border-[#B8F34A]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider">
                      <span>MATCH #{match.match_number}</span>
                      <span>
                        {isLive
                          ? 'LIVE NOW'
                          : match.status === 'completed'
                          ? 'FULL TIME'
                          : 'SCHEDULED'}
                      </span>
                    </div>

                    <div className="my-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight truncate">
                          {match.home_team?.name || 'Home Team'}
                        </span>
                        <span className="font-display text-2xl font-black tabular-nums">
                          {match.status === 'scheduled' ? '' : match.home_score}
                        </span>
                      </div>

                      <div
                        className={`text-xs font-black uppercase tracking-widest ${
                          isLime ? 'text-[#090909]/60' : 'text-[#B8F34A]'
                        }`}
                      >
                        VS
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight truncate">
                          {match.away_team?.name || 'Away Team'}
                        </span>
                        <span className="font-display text-2xl font-black tabular-nums">
                          {match.status === 'scheduled' ? '' : match.away_score}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`pt-3 border-t flex items-center justify-between text-xs font-semibold ${
                        isLime
                          ? 'border-[#090909]/15 text-[#090909]/80'
                          : 'border-white/10 text-[#9AA69B]'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{match.venue}</span>
                      </span>
                      <ArrowUpRight className="w-4 h-4 shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* SECTION D: LEADERBOARD PREVIEW */}
      <section
        id="leaderboard"
        className="py-20 sm:py-28 px-4 sm:px-8 lg:px-16 border-b border-white/10"
      >
        <div className="max-w-[1320px] mx-auto space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#B8F34A]">
                04. ROAD TO THE FINAL
              </p>
              <h2 className="font-display text-5xl sm:text-7xl font-black uppercase tracking-tight leading-[0.92] text-[#F4F7F2]">
                TOURNAMENT STANDINGS
              </h2>
            </div>

            <BettyKickButton
              label="VIEW FULL STANDINGS"
              size="sm"
              to="/public/standings"
            />
          </div>

          <div className="bg-[#141414] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0E0E0E] text-xs font-extrabold uppercase tracking-wider text-[#9AA69B]">
                    <th className="py-4 px-5">Pos</th>
                    <th className="py-4 px-5">Team</th>
                    <th className="py-4 px-4 text-center">Played</th>
                    <th className="py-4 px-4 text-center">Wins</th>
                    <th className="py-4 px-4 text-center">Draws</th>
                    <th className="py-4 px-4 text-center">Losses</th>
                    <th className="py-4 px-5 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 tabular-nums">
                  {standings.map((row, idx) => (
                    <tr
                      key={row.team_id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-4 px-5 font-display text-xl font-black text-[#B8F34A]">
                        0{idx + 1}
                      </td>
                      <td className="py-4 px-5 font-extrabold text-base text-[#F4F7F2]">
                        {row.team_name}
                      </td>
                      <td className="py-4 px-4 text-center text-[#9AA69B]">
                        {row.played}
                      </td>
                      <td className="py-4 px-4 text-center text-[#9AA69B]">
                        {row.won}
                      </td>
                      <td className="py-4 px-4 text-center text-[#9AA69B]">
                        {row.drawn}
                      </td>
                      <td className="py-4 px-4 text-center text-[#9AA69B]">
                        {row.lost}
                      </td>
                      <td className="py-4 px-5 text-right font-display text-2xl font-black text-[#B8F34A]">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: FINAL CTA ("THE CUP IS WAITING.") */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-8 lg:px-16 bg-[#B8F34A] text-[#090909] overflow-hidden">
        <div className="max-w-[1320px] mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-10 relative z-10">
          <div className="lg:col-span-8 space-y-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#090909]/80">
              BETTERINU SUPER CUP 2026
            </p>
            <h2 className="font-display text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-[0.86] text-[#090909]">
              THE CUP IS WAITING.
            </h2>
            <p className="text-base sm:text-xl font-bold text-[#090909]/85 max-w-xl leading-relaxed">
              Every match writes a story. Every goal brings you closer to glory.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              <BettyKickButton
                label="EXPLORE THE TOURNAMENT"
                size="lg"
                variant="dark"
                onClick={() => navigate('/public')}
              />
            </div>
          </div>

          {/* Supporting Betty Mascot Visual Element */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-56 sm:w-72 lg:w-80">
              <img
                src={BETTY_MASCOT_URL}
                alt="Betty Mascot — BetterInU Super Cup"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain drop-shadow-[0_18px_28px_rgba(9,9,9,0.35)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* QUIET EDITORIAL FOOTER */}
      <footer className="bg-[#090909] border-t border-white/10 py-10 px-4 sm:px-8 lg:px-16 text-xs text-[#9AA69B]">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-black uppercase text-[#B8F34A]">
              BETTERINU SUPER CUP
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-semibold">
            <Link to="/public" className="hover:text-[#B8F34A] transition-colors">
              Overview
            </Link>
            <Link to="/public/teams" className="hover:text-[#B8F34A] transition-colors">
              Teams &amp; Draw
            </Link>
            <Link to="/public/fixtures" className="hover:text-[#B8F34A] transition-colors">
              Fixtures
            </Link>
            <Link to="/public/standings" className="hover:text-[#B8F34A] transition-colors">
              Leaderboard
            </Link>
            <Link to="/login" className="hover:text-[#B8F34A] transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BelowFoldSections;
