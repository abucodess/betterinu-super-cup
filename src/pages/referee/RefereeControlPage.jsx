import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Play, Pause, RotateCcw, Radio, Shield, Users, Clock } from 'lucide-react'
import { matchesApi } from '@/services/api/matches.api'
import { playersApi } from '@/services/api/players.api'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/services/supabase/client'

export function RefereeControlPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Fetch active matches
  const { data: matchesRes, isLoading: matchesLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  })
  const matches = matchesRes?.data || []
  const activeMatch = matches.find((m) => m.status === 'live') || matches[0] || null

  // Fetch players for event tagging
  const { data: playersRes } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  })
  const players = playersRes?.data || []

  // Local Match Clock State
  const [isRunning, setIsRunning] = useState(activeMatch?.status === 'live')
  const [minutes, setMinutes] = useState(activeMatch?.current_minute || 14)
  const [seconds, setSeconds] = useState(0)

  // Clock tick interval
  useEffect(() => {
    let interval = null
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSec) => {
          if (prevSec >= 59) {
            setMinutes((prevMin) => prevMin + 1)
            return 0
          }
          return prevSec + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // Realtime subscription for live match events
  useEffect(() => {
    if (!activeMatch) return
    const channel = supabase
      .channel(`match-${activeMatch.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${activeMatch.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['matches'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeMatch, queryClient])

  // Event Mutations
  const recordEventMutation = useMutation({
    mutationFn: ({ teamId, eventType, playerId }) =>
      matchesApi.recordMatchEvent({
        matchId: activeMatch.id,
        teamId,
        playerId,
        eventType,
        minute: minutes,
        recordedBy: user?.id || 'referee-id',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })

  const undoEventMutation = useMutation({
    mutationFn: () =>
      matchesApi.undoLastEvent(activeMatch.id, user?.id || 'referee-id'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
    },
  })

  if (!activeMatch) {
    return (
      <div className="py-12 text-center text-[#9AA69B]">
        <p>No tournament fixtures available to officiate.</p>
      </div>
    )
  }

  const homeTeamPlayers = players.filter((p) => p.team_id === activeMatch.home_team_id)
  const awayTeamPlayers = players.filter((p) => p.team_id === activeMatch.away_team_id)

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Match Header */}
      <div className="text-center">
        <Badge variant="live" isLive className="mb-2">
          OFFICIAL MATCH CONTROL
        </Badge>
        <h1 className="text-xl sm:text-2xl font-black text-[#F4F7F2]">
          {activeMatch.home_team?.name || 'Home'} vs {activeMatch.away_team?.name || 'Away'}
        </h1>
        <p className="text-xs text-[#9AA69B]">
          Match #{activeMatch.match_number} • {activeMatch.venue || 'Main Pitch'}
        </p>
      </div>

      {/* Score and Clock Box */}
      <Card className="p-6 bg-[#141414] border-[#303030] text-center">
        <div className="text-5xl sm:text-7xl font-black tracking-tight text-[#F4F7F2] tabular-nums mb-3">
          {activeMatch.home_score} - {activeMatch.away_score}
        </div>

        <div className="text-2xl font-bold text-[#FF414D] tabular-nums mb-6 flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          <span>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-xs uppercase text-[#9AA69B] ml-1">
            ({minutes <= 25 ? '1st Half' : '2nd Half'})
          </span>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button
            size="md"
            variant={isRunning ? 'destructive' : 'primary'}
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 font-bold"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" /> Pause Clock
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Start Clock
              </>
            )}
          </Button>

          <Button
            size="md"
            variant="secondary"
            onClick={() => undoEventMutation.mutate()}
            disabled={undoEventMutation.isPending}
            isLoading={undoEventMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Undo Last Event
          </Button>
        </div>
      </Card>

      {/* Rapid Action Buttons (Mobile-First Touch Friendly >= 44px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Home Team Actions */}
        <Card className="p-4 space-y-3">
          <span className="text-xs font-bold text-[#B8F34A] uppercase tracking-wider block text-center truncate">
            {activeMatch.home_team?.name || 'Home Team'} Actions
          </span>
          <Button
            variant="secondary"
            className="w-full font-bold border-[#303030] hover:border-[#B8F34A] min-h-[48px]"
            onClick={() =>
              recordEventMutation.mutate({
                teamId: activeMatch.home_team_id,
                eventType: 'GOAL',
                playerId: homeTeamPlayers[0]?.id || null,
              })
            }
            disabled={recordEventMutation.isPending}
          >
            ⚽ Goal (+1)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="text-xs border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/10 min-h-[44px]"
              onClick={() =>
                recordEventMutation.mutate({
                  teamId: activeMatch.home_team_id,
                  eventType: 'YELLOW_CARD',
                  playerId: homeTeamPlayers[0]?.id || null,
                })
              }
              disabled={recordEventMutation.isPending}
            >
              Yellow
            </Button>
            <Button
              variant="secondary"
              className="text-xs border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 min-h-[44px]"
              onClick={() =>
                recordEventMutation.mutate({
                  teamId: activeMatch.home_team_id,
                  eventType: 'RED_CARD',
                  playerId: homeTeamPlayers[0]?.id || null,
                })
              }
              disabled={recordEventMutation.isPending}
            >
              Red
            </Button>
          </div>
        </Card>

        {/* Away Team Actions */}
        <Card className="p-4 space-y-3">
          <span className="text-xs font-bold text-[#F4F7F2] uppercase tracking-wider block text-center truncate">
            {activeMatch.away_team?.name || 'Away Team'} Actions
          </span>
          <Button
            variant="secondary"
            className="w-full font-bold border-[#303030] hover:border-[#F4F7F2] min-h-[48px]"
            onClick={() =>
              recordEventMutation.mutate({
                teamId: activeMatch.away_team_id,
                eventType: 'GOAL',
                playerId: awayTeamPlayers[0]?.id || null,
              })
            }
            disabled={recordEventMutation.isPending}
          >
            ⚽ Goal (+1)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="text-xs border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/10 min-h-[44px]"
              onClick={() =>
                recordEventMutation.mutate({
                  teamId: activeMatch.away_team_id,
                  eventType: 'YELLOW_CARD',
                  playerId: awayTeamPlayers[0]?.id || null,
                })
              }
              disabled={recordEventMutation.isPending}
            >
              Yellow
            </Button>
            <Button
              variant="secondary"
              className="text-xs border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 min-h-[44px]"
              onClick={() =>
                recordEventMutation.mutate({
                  teamId: activeMatch.away_team_id,
                  eventType: 'RED_CARD',
                  playerId: awayTeamPlayers[0]?.id || null,
                })
              }
              disabled={recordEventMutation.isPending}
            >
              Red
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
