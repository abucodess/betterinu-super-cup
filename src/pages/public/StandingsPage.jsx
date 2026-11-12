import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Trophy } from 'lucide-react'
import { standingsApi } from '@/services/api/standings.api'

export function StandingsPage() {
  const { data: standingsRes } = useQuery({
    queryKey: ['standings'],
    queryFn: () => standingsApi.getStandings(),
  })
  const standings = standingsRes?.data || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F7F2]">Tournament Standings</h1>
        <p className="text-xs text-[#9AA69B] uppercase tracking-wider">
          Official Dynamic League Table (Win: 3 • Draw: 1 • Loss: 0)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#B8F34A]" />
            League Phase (3 Participating Teams)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#303030] text-[#9AA69B]">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-2 text-center">MP</th>
                  <th className="py-2.5 px-2 text-center">W</th>
                  <th className="py-2.5 px-2 text-center">D</th>
                  <th className="py-2.5 px-2 text-center">L</th>
                  <th className="py-2.5 px-2 text-center">GF</th>
                  <th className="py-2.5 px-2 text-center">GA</th>
                  <th className="py-2.5 px-2 text-center">GD</th>
                  <th className="py-2.5 px-3 text-right">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020] text-[#F4F7F2]">
                {standings.map((row, idx) => (
                  <tr key={row.team_id || idx} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-3 px-2 font-bold text-[#B8F34A]">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold">{row.team_name}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{row.matches_played}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{row.won}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{row.drawn}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{row.lost}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{row.goals_for}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{row.goals_against}</td>
                    <td className="py-3 px-2 text-center tabular-nums">{row.goal_difference}</td>
                    <td className="py-3 px-3 text-right font-black tabular-nums text-[#B8F34A] text-sm">
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
  )
}
