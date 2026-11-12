import React, { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Radio, Clock, Shield } from 'lucide-react'
import { matchesApi } from '@/services/api/matches.api'
import { supabase } from '@/services/supabase/client'

export function LiveMatchPage() {
  const queryClient = useQueryClient()

  const { data: matchesRes } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  })
  const matches = matchesRes?.data || []
  const liveMatch = matches.find((m) => m.status === 'live') || matches[0]

  // Query events for this match
  const { data: eventsRes } = useQuery({
    queryKey: ['match_events', liveMatch?.id],
    queryFn: () => matchesApi.getMatchEvents(liveMatch.id),
    enabled: Boolean(liveMatch?.id),
  })
  const events = eventsRes?.data || []

  // Realtime subscription for live scores and events
  useEffect(() => {
    if (!liveMatch) return
    const channel = supabase
      .channel(`public-match-${liveMatch.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${liveMatch.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['matches'] })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${liveMatch.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['match_events', liveMatch.id] })
          queryClient.invalidateQueries({ queryKey: ['matches'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [liveMatch, queryClient])

  if (!liveMatch) {
    return (
      <div className="py-16 text-center text-[#9AA69B]">
        <p>No active matches scheduled today.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F7F2]">Live Match Center</h1>
          <p className="text-xs text-[#9AA69B] uppercase tracking-wider">
            Official Real-Time Tournament Broadcasting
          </p>
        </div>
        <Badge variant={liveMatch.status === 'live' ? 'live' : 'neutral'} isLive={liveMatch.status === 'live'}>
          {liveMatch.status === 'live' ? 'LIVE ON PITCH' : liveMatch.status.toUpperCase()}
        </Badge>
      </div>

      {/* Main Scoreboard */}
      <Card className="p-6 bg-gradient-to-b from-[#181818] to-[#121212] border-[#303030]">
        <div className="text-center mb-4">
          <Badge variant="neutral" className="text-[11px]">
            Match #{liveMatch.match_number} • {liveMatch.venue || 'Institute Ground'}
          </Badge>
        </div>

        <div className="flex items-center justify-between max-w-xl mx-auto py-4">
          <div className="text-center flex-1">
            <div className="h-16 w-16 mx-auto mb-2 rounded-2xl bg-[#202020] border border-[#303030] flex items-center justify-center font-black text-2xl text-[#B8F34A]">
              {liveMatch.home_team?.short_code || 'H'}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#F4F7F2]">
              {liveMatch.home_team?.name || 'Home Team'}
            </h2>
          </div>

          <div className="text-center px-4">
            <div className="text-5xl sm:text-7xl font-black tracking-tight text-[#F4F7F2] tabular-nums">
              {liveMatch.home_score} - {liveMatch.away_score}
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <Clock className="h-4 w-4 text-[#FF414D]" />
              <span className="text-sm font-semibold text-[#FF414D] tabular-nums">
                {liveMatch.current_minute}&apos; ({liveMatch.current_minute <= 25 ? '1st Half' : '2nd Half'})
              </span>
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="h-16 w-16 mx-auto mb-2 rounded-2xl bg-[#202020] border border-[#303030] flex items-center justify-center font-black text-2xl text-[#F4F7F2]">
              {liveMatch.away_team?.short_code || 'A'}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#F4F7F2]">
              {liveMatch.away_team?.name || 'Away Team'}
            </h2>
          </div>
        </div>
      </Card>

      {/* Realtime Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#B8F34A]" />
            Official Match Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#9AA69B]">
              <p>No match events recorded yet. Goals, cards, and match milestones will appear here live in real time.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {events.map((ev) => {
                const isGoal = ev.event_type === 'GOAL'
                const isYellow = ev.event_type === 'YELLOW_CARD'
                const isRed = ev.event_type === 'RED_CARD'

                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-[#1A1A1A] border border-[#282828] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#F4F7F2] tabular-nums bg-[#222222] px-2 py-1 rounded border border-[#333333]">
                        {ev.minute}&apos;
                      </span>
                      <div>
                        <div className="font-bold text-[#F4F7F2] text-sm flex items-center gap-2">
                          {isGoal && <span>⚽</span>}
                          {isYellow && <span>🟨</span>}
                          {isRed && <span>🟥</span>}
                          <span>
                            {ev.player?.name
                              ? `${ev.player.name} (#${ev.player.jersey_number || '?'})`
                              : ev.extra_info || ev.event_type}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#9AA69B]">
                          {ev.team?.name || 'Tournament Official'}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={isGoal ? 'success' : isYellow ? 'neutral' : isRed ? 'live' : 'brand'}
                    >
                      {ev.event_type.replace('_', ' ')}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
