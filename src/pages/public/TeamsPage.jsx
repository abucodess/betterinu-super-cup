import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { teamsApi } from '@/services/api/teams.api'
import { playersApi } from '@/services/api/players.api'

export function TeamsPage() {
  const { data: teamsRes } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  })
  const teams = teamsRes?.data || []

  const { data: playersRes } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  })
  const players = playersRes?.data || []

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#F4F7F2]">Participating Teams</h1>
        <p className="text-xs text-[#9AA69B] uppercase tracking-wider">
          Official Team Profiles & Allocated Squads
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teams.map((t) => {
          const squad = players.filter((p) => p.team_id === t.id)
          const gk = squad.find((p) => p.is_goalkeeper)
          const outfield = squad.filter((p) => !p.is_goalkeeper)

          return (
            <Card key={t.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-center font-black text-xl text-[#B8F34A]">
                    {t.short_code}
                  </div>
                  <Badge variant={squad.length === 5 ? 'success' : 'brand'}>
                    {squad.length} / 5 Players
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-[#F4F7F2]">{t.name}</h3>
                <p className="text-xs text-[#9AA69B] mt-0.5 mb-4">
                  Manager: {t.manager?.full_name || t.manager?.email || 'Assigned'}
                </p>

                <div className="space-y-2 text-xs border-t border-[#252525] pt-3">
                  <div className="flex justify-between items-center text-[#9AA69B]">
                    <span>Goalkeeper</span>
                    <span className="text-[#F4F7F2] font-semibold">
                      {gk ? gk.name : 'Draft Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#9AA69B]">
                    <span>Outfield Players</span>
                    <span className="text-[#F4F7F2] font-semibold">
                      {outfield.length} / 4 Assigned
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#252525] flex justify-between items-center text-[11px] text-[#9AA69B]">
                <span>Color Accent</span>
                <span className="flex items-center gap-1.5 font-bold" style={{ color: t.color_code }}>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: t.color_code }}
                  />
                  {t.color_code}
                </span>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
