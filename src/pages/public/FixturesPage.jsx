import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar } from 'lucide-react'
import { matchesApi } from '@/services/api/matches.api'

export function FixturesPage() {
  const { data: matchesRes } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  })
  const matches = matchesRes?.data || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F7F2]">Tournament Fixtures</h1>
        <p className="text-xs text-[#9AA69B] uppercase tracking-wider">
          Official Tournament Schedule & Match Results
        </p>
      </div>

      <div className="space-y-3">
        {matches.map((m) => (
          <Card key={m.id} className="p-4 hover:border-[#404040] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9AA69B] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#B8F34A]" />
                Match #{m.match_number} • {m.venue || 'Institute Pitch'}
              </span>
              <Badge variant={m.status === 'live' ? 'live' : 'neutral'} isLive={m.status === 'live'}>
                {m.status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-4 max-w-md mx-auto">
              <span className="font-semibold text-sm sm:text-base text-right flex-1 text-[#F4F7F2]">
                {m.home_team?.name || 'Home Team'}
              </span>
              <span className="px-4 py-1 text-sm font-black bg-[#202020] rounded-lg mx-4 tabular-nums text-[#B8F34A] border border-[#303030]">
                {m.status === 'scheduled' ? 'VS' : `${m.home_score} - ${m.away_score}`}
              </span>
              <span className="font-semibold text-sm sm:text-base text-left flex-1 text-[#F4F7F2]">
                {m.away_team?.name || 'Away Team'}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
