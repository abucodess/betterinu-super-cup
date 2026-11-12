import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Users, Calendar, Trophy, ShieldCheck } from 'lucide-react'
import { teamsApi } from '@/services/api/teams.api'
import { playersApi } from '@/services/api/players.api'
import { useAuth } from '@/hooks/useAuth'

export function ManagerDashboardPage() {
  const { user } = useAuth()

  // Fetch Teams
  const { data: teamsRes } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  })
  const teams = teamsRes?.data || []

  // Identify assigned team (matches user.id or email or defaults to Team Alpha)
  const assignedTeam =
    teams.find((t) => t.manager?.email === user?.email || t.manager_id === user?.id) ||
    teams[0] ||
    { id: 'team-1', name: 'Team Alpha', short_code: 'ALP' }

  // Fetch Squad Players for this team
  const { data: playersRes } = useQuery({
    queryKey: ['players', assignedTeam.id],
    queryFn: () => playersApi.getPlayers({ team_id: assignedTeam.id }),
  })
  const squad = playersRes?.data || []
  const gk = squad.find((p) => p.is_goalkeeper)
  const outfield = squad.filter((p) => !p.is_goalkeeper)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F7F2]">{assignedTeam.name} Workspace</h1>
          <p className="text-xs text-[#9AA69B] uppercase tracking-wider">
            Team Manager Dashboard • Official Squad Roster
          </p>
        </div>
        <Badge variant="brand">OFFICIAL SQUAD</Badge>
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs text-[#9AA69B] uppercase tracking-wider block mb-1">Squad Allocated</span>
          <span className="text-2xl font-bold text-[#F4F7F2] tabular-nums block">{squad.length} / 5</span>
          <span className="text-[11px] text-[#B8F34A]">
            {gk ? '1 GK' : '0 GK'} • {outfield.length} Outfield
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-[#9AA69B] uppercase tracking-wider block mb-1">Matches Played</span>
          <span className="text-2xl font-bold text-[#F4F7F2] tabular-nums block">0</span>
          <span className="text-[11px] text-[#9AA69B]">0 W • 0 D • 0 L</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-[#9AA69B] uppercase tracking-wider block mb-1">League Points</span>
          <span className="text-2xl font-bold text-[#B8F34A] tabular-nums block">0</span>
          <span className="text-[11px] text-[#9AA69B]">GD: 0</span>
        </Card>
        <Card className="p-4">
          <span className="text-xs text-[#9AA69B] uppercase tracking-wider block mb-1">Tournament Rank</span>
          <span className="text-2xl font-bold text-[#F4F7F2] tabular-nums block">1st</span>
          <span className="text-[11px] text-[#9AA69B]">3 Competing Teams</span>
        </Card>
      </div>

      {/* Squad Table & Next Fixture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[#B8F34A]" />
                Assigned Squad ({squad.length} / 5)
              </CardTitle>
              <Badge variant={squad.length === 5 ? 'success' : 'neutral'}>
                {squad.length === 5 ? 'FULL ROSTER' : 'DRAFT PENDING'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {squad.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#9AA69B]">
                <p>No players allocated yet.</p>
                <p className="mt-1">Awaiting Super Admin spin-wheel draft.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {squad.map((player) => (
                  <div
                    key={player.id}
                    className="p-3 rounded-lg bg-[#202020] border border-[#303030] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded font-bold bg-[#141414] text-[#B8F34A] border border-[#303030]">
                        {player.position}
                      </span>
                      <div>
                        <span className="font-semibold text-[#F4F7F2] block">{player.name}</span>
                        <span className="text-[10px] text-[#9AA69B]">#{player.jersey_number}</span>
                      </div>
                    </div>
                    <Badge variant={player.is_goalkeeper ? 'brand' : 'neutral'}>
                      {player.is_goalkeeper ? 'Goalkeeper' : 'Outfield'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#B8F34A]" />
              Next Scheduled Fixture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[#202020] border border-[#303030] text-center">
              <Badge variant="neutral" className="mb-2">
                Matchday 1 • Today 15:00
              </Badge>
              <div className="flex items-center justify-around py-3">
                <span className="font-bold text-base text-[#B8F34A]">{assignedTeam.name}</span>
                <span className="text-xs text-[#9AA69B] uppercase font-bold">VS</span>
                <span className="font-bold text-base text-[#F4F7F2]">Team Beta</span>
              </div>
              <span className="text-xs text-[#9AA69B]">Main Institute Ground</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
