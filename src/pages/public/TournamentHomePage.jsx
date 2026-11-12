import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Trophy, ChevronRight, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { matchesApi } from '@/services/api/matches.api'
import { standingsApi } from '@/services/api/standings.api'

export function TournamentHomePage() {
  const { data: matchesRes } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  })
  const matches = matchesRes?.data || []
  const liveMatch = matches.find((m) => m.status === 'live') || matches[0]

  const { data: standingsRes } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
  })
  const standings = standingsRes?.data || []

  return (
    <div className="space-y-8">
      {/* Live Match Hero Banner */}
      {liveMatch && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="live" isLive>
                LIVE SCOREBOARD
              </Badge>
              <span className="text-xs text-[#9AA69B] uppercase tracking-wider font-semibold">
                Match #{liveMatch.match_number}
              </span>
            </div>
            <Link
              to="/public/live"
              className="text-xs text-[#B8F34A] hover:underline flex items-center font-medium"
            >
              Live Match Center <ChevronRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          <Card className="bg-gradient-to-r from-[#141414] via-[#1A1A1A] to-[#141414] border-[#303030] p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Home Team */}
              <div className="flex items-center gap-4 flex-1 justify-end w-full md:w-auto">
                <span className="font-bold text-lg sm:text-xl text-right text-[#F4F7F2]">
                  {liveMatch.home_team?.name || 'Home Team'}
                </span>
                <div className="h-12 w-12 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-center font-black text-[#B8F34A]">
                  {liveMatch.home_team?.short_code || 'H'}
                </div>
              </div>

              {/* Score & Clock */}
              <div className="flex flex-col items-center px-6 py-2 bg-[#090909]/70 rounded-xl border border-[#303030]">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#F4F7F2] tabular-nums tracking-wider">
                  {liveMatch.home_score} - {liveMatch.away_score}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="h-2 w-2 rounded-full bg-[#FF414D] animate-ping" />
                  <span className="text-xs font-semibold text-[#FF414D] uppercase tracking-wider tabular-nums">
                    {liveMatch.current_minute}&apos; Live
                  </span>
                </div>
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-4 flex-1 justify-start w-full md:w-auto">
                <div className="h-12 w-12 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-center font-black text-[#F4F7F2]">
                  {liveMatch.away_team?.short_code || 'A'}
                </div>
                <span className="font-bold text-lg sm:text-xl text-[#F4F7F2]">
                  {liveMatch.away_team?.name || 'Away Team'}
                </span>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Grid: Upcoming Fixtures & Current Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduled Matches */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#B8F34A]" />
                Tournament Fixtures
              </CardTitle>
              <Link to="/public/fixtures" className="text-xs text-[#9AA69B] hover:text-[#B8F34A]">
                View All ({matches.length})
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-[#202020] border border-[#303030] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-[#9AA69B] mb-1">
                    Match #{m.match_number} • {m.venue || 'Institute Pitch'}
                  </p>
                  <p className="text-sm font-medium text-[#F4F7F2]">
                    {m.home_team?.name || 'Home'} vs {m.away_team?.name || 'Away'}
                  </p>
                </div>
                <Badge variant={m.status === 'live' ? 'live' : 'neutral'} isLive={m.status === 'live'}>
                  {m.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Standings Table Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#B8F34A]" />
                League Standings
              </CardTitle>
              <Link to="/public/standings" className="text-xs text-[#9AA69B] hover:text-[#B8F34A]">
                Full Standings Table
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#303030] text-[#9AA69B]">
                    <th className="py-2 px-1">#</th>
                    <th className="py-2 px-2">Team</th>
                    <th className="py-2 px-2 text-center">MP</th>
                    <th className="py-2 px-2 text-center">GD</th>
                    <th className="py-2 px-2 text-right">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202020] text-[#F4F7F2]">
                  {standings.map((row, idx) => (
                    <tr key={row.team_id || idx}>
                      <td className="py-2.5 px-1 font-semibold text-[#B8F34A]">{idx + 1}</td>
                      <td className="py-2.5 px-2 font-medium">{row.team_name}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums">{row.matches_played}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums">{row.goal_difference}</td>
                      <td className="py-2.5 px-2 text-right font-bold tabular-nums text-[#B8F34A]">
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
