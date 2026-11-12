import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Users, Shuffle, Shield, CheckCircle, AlertCircle, RefreshCw, RotateCcw } from 'lucide-react'
import { teamsApi } from '@/services/api/teams.api'
import { playersApi } from '@/services/api/players.api'
import { allocationApi } from '@/services/api/allocation.api'
import { DualSpinWheel } from '@/features/allocation/DualSpinWheel'
import { useAuth } from '@/hooks/useAuth'

export function AdminDashboardPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('DRAFT') // 'DRAFT' | 'TEAMS' | 'PLAYERS'
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Fetch Teams
  const { data: teamsRes, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  })
  const teams = teamsRes?.data || []

  // Fetch Players
  const { data: playersRes, isLoading: playersLoading } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  })
  const players = playersRes?.data || []

  // Allocation Mutation
  const allocateMutation = useMutation({
    mutationFn: ({ playerId, teamId }) =>
      allocationApi.allocatePlayer({
        playerId,
        teamId,
        adminId: user?.id || 'admin-id',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  // Reset Draft Mutation
  const resetMutation = useMutation({
    mutationFn: () => allocationApi.resetAllocations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setShowResetConfirm(false)
    },
  })

  const handleAllocate = async (playerId, teamId) => {
    return await allocateMutation.mutateAsync({ playerId, teamId })
  }

  // Calculated Stats
  const totalPlayers = players.length
  const allocatedPlayers = players.filter((p) => p.team_id !== null).length
  const gkAllocated = players.filter((p) => p.is_goalkeeper && p.team_id !== null).length
  const outfieldAllocated = players.filter((p) => !p.is_goalkeeper && p.team_id !== null).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4F7F2]">Tournament Control Center</h1>
          <p className="text-xs text-[#9AA69B] uppercase tracking-wider">
            Super Admin Administration • Dual Spin Wheel Draft
          </p>
        </div>
        <div className="flex items-center gap-2">
          {allocatedPlayers > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset Draft
            </Button>
          )}
          <Badge variant={allocatedPlayers === 15 ? 'success' : 'brand'}>
            {allocatedPlayers === 15 ? 'SQUADS COMPLETE' : 'DRAFT IN PROGRESS'}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-[#9AA69B] uppercase tracking-wider block mb-1">
            Teams
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] tabular-nums block mb-1">
            {teams.length} / 3
          </span>
          <span className="text-[11px] text-[#B8F34A]">Confirmed Squads</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-[#9AA69B] uppercase tracking-wider block mb-1">
            Total Players
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] tabular-nums block mb-1">
            {totalPlayers}
          </span>
          <span className="text-[11px] text-[#9AA69B]">3 GK • 12 Outfield</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-[#9AA69B] uppercase tracking-wider block mb-1">
            GK Drafted
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] tabular-nums block mb-1">
            {gkAllocated} / 3
          </span>
          <span className="text-[11px] text-[#B8F34A]">1 per team</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-[#9AA69B] uppercase tracking-wider block mb-1">
            Outfield Drafted
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F4F7F2] tabular-nums block mb-1">
            {outfieldAllocated} / 12
          </span>
          <span className="text-[11px] text-[#B8F34A]">4 per team</span>
        </Card>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#303030] pb-2">
        <button
          onClick={() => setActiveTab('DRAFT')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'DRAFT'
              ? 'bg-[#141414] text-[#B8F34A] border border-[#303030]'
              : 'text-[#9AA69B] hover:text-[#F4F7F2]'
          }`}
        >
          Dual Spin Wheel Draft
        </button>
        <button
          onClick={() => setActiveTab('TEAMS')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'TEAMS'
              ? 'bg-[#141414] text-[#B8F34A] border border-[#303030]'
              : 'text-[#9AA69B] hover:text-[#F4F7F2]'
          }`}
        >
          Teams & Squad Rosters
        </button>
        <button
          onClick={() => setActiveTab('PLAYERS')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeTab === 'PLAYERS'
              ? 'bg-[#141414] text-[#B8F34A] border border-[#303030]'
              : 'text-[#9AA69B] hover:text-[#F4F7F2]'
          }`}
        >
          Player Registry ({players.length})
        </button>
      </div>

      {/* TAB 1: DUAL SPIN WHEEL DRAFT */}
      {activeTab === 'DRAFT' && (
        <DualSpinWheel
          players={players}
          teams={teams}
          onAllocate={handleAllocate}
          isAllocating={allocateMutation.isPending}
        />
      )}

      {/* TAB 2: TEAMS & SQUADS ROSTER */}
      {activeTab === 'TEAMS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teams.map((team) => {
            const teamSquad = players.filter((p) => p.team_id === team.id)
            const gk = teamSquad.find((p) => p.is_goalkeeper)
            const outfield = teamSquad.filter((p) => !p.is_goalkeeper)

            return (
              <Card key={team.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="h-10 w-10 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-center font-black text-[#B8F34A]">
                      {team.short_code}
                    </span>
                    <Badge variant={teamSquad.length === 5 ? 'success' : 'neutral'}>
                      {teamSquad.length} / 5 Players
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-[#F4F7F2]">{team.name}</h3>
                  <p className="text-xs text-[#9AA69B] mb-4">
                    Manager: {team.manager?.full_name || team.manager?.email || 'Assigned'}
                  </p>

                  {/* Goalkeeper Slot */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-[#9AA69B] uppercase tracking-wider block mb-1">
                      Goalkeeper (Max 1)
                    </span>
                    {gk ? (
                      <div className="p-2.5 rounded-lg bg-[#202020] border border-[#303030] flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F4F7F2]">{gk.name}</span>
                        <Badge variant="brand">GK</Badge>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-dashed border-[#303030] text-center text-xs text-[#9AA69B]">
                        Awaiting GK Draft Pick
                      </div>
                    )}
                  </div>

                  {/* Outfield Slots */}
                  <div>
                    <span className="text-[10px] font-bold text-[#9AA69B] uppercase tracking-wider block mb-1">
                      Outfield Players ({outfield.length} / 4)
                    </span>
                    <div className="space-y-1.5">
                      {outfield.map((p) => (
                        <div
                          key={p.id}
                          className="p-2 rounded-lg bg-[#202020] border border-[#303030] flex items-center justify-between text-xs"
                        >
                          <span className="text-[#F4F7F2]">{p.name}</span>
                          <span className="text-[10px] text-[#B8F34A] font-bold">{p.position}</span>
                        </div>
                      ))}
                      {Array.from({ length: Math.max(0, 4 - outfield.length) }).map((_, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg border border-dashed border-[#282828] text-center text-[11px] text-[#666]"
                        >
                          Empty Outfield Slot
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* TAB 3: PLAYER REGISTRY */}
      {activeTab === 'PLAYERS' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-[#B8F34A]" />
                Tournament Player Pool (15 Confirmed)
              </CardTitle>
              <Badge variant="neutral">Draft Eligibility List</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#303030] text-[#9AA69B]">
                    <th className="py-2.5 px-3">Player Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Position</th>
                    <th className="py-2.5 px-3">Jersey #</th>
                    <th className="py-2.5 px-3">Current Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202020] text-[#F4F7F2]">
                  {players.map((p) => {
                    const assignedTeam = teams.find((t) => t.id === p.team_id)
                    return (
                      <tr key={p.id} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="py-3 px-3 font-semibold">{p.name}</td>
                        <td className="py-3 px-3">
                          <Badge variant={p.is_goalkeeper ? 'brand' : 'neutral'}>
                            {p.is_goalkeeper ? 'Goalkeeper' : 'Outfield'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#B8F34A]">{p.position}</td>
                        <td className="py-3 px-3 tabular-nums text-[#9AA69B]">#{p.jersey_number}</td>
                        <td className="py-3 px-3">
                          {assignedTeam ? (
                            <span className="font-bold text-[#22C55E] flex items-center gap-1.5">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {assignedTeam.name}
                            </span>
                          ) : (
                            <span className="text-[#9AA69B] italic">Unassigned (In Wheel)</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal for Reset Draft */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-[#EF4444]/40 bg-[#141414] shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#F4F7F2]">Reset All Draft Allocations?</h3>
                <p className="text-xs text-[#9AA69B] leading-relaxed">
                  This will unassign all players from their teams and reset the spin wheel draft state. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                disabled={resetMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => resetMutation.mutate()}
                isLoading={resetMutation.isPending}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
              >
                Yes, Reset Draft
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
