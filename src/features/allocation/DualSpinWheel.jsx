import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Shield, Users, CheckCircle, AlertCircle, RotateCw, Volume2, VolumeX, Sparkles } from 'lucide-react'
import { soundEffects } from '@/utils/soundEffects'
import { Wheel } from 'spin-wheel'

/**
 * Premium Casino-Style Dual Spin Wheel Component using 'spin-wheel' library
 * Features:
 * - Powered by 'spin-wheel' canvas physics engine
 * - Fully reactive onCurrentIndexChange triggering synchronized physical peg clicks
 * - 6.5-second spin duration with custom easing & multi-turn revolutions
 * - Physical stand pedestal and top flapper pointer matching reference photo
 * - High-contrast alternating sports green and carbon black sectors
 * - Radially aligned labels with jersey numbers and player names
 * - Built-in tension music and celebration fanfare
 */

export function DualSpinWheel({
  players = [],
  teams = [],
  onAllocate,
  isAllocating = false,
}) {
  const [activeWheel, setActiveWheel] = useState('GK') // 'GK' | 'OUTFIELD'
  const [isSpinning, setIsSpinning] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [notification, setNotification] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [flapperTick, setFlapperTick] = useState(false)

  const containerRef = useRef(null)
  const wheelInstanceRef = useRef(null)
  const soundEnabledRef = useRef(soundEnabled)
  const stopMusicRef = useRef(null)

  // Keep sound ref updated
  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // Filter unallocated players based on active wheel mode
  const eligiblePlayers = useMemo(() => {
    return players.filter((p) => {
      const isUnallocated = !p.team_id
      if (activeWheel === 'GK') {
        return isUnallocated && p.is_goalkeeper
      } else {
        return isUnallocated && !p.is_goalkeeper
      }
    })
  }, [players, activeWheel])

  // Calculate each team's squad status
  const teamStats = useMemo(() => {
    return teams.map((team) => {
      const teamPlayers = players.filter((p) => p.team_id === team.id)
      const gkCount = teamPlayers.filter((p) => p.is_goalkeeper).length
      const outfieldCount = teamPlayers.filter((p) => !p.is_goalkeeper).length
      return {
        ...team,
        total: teamPlayers.length,
        gkCount,
        outfieldCount,
        canAcceptGK: gkCount < 1 && teamPlayers.length < 5,
        canAcceptOutfield: outfieldCount < 4 && teamPlayers.length < 5,
      }
    })
  }, [teams, players])

  // Initialize and update spin-wheel instance
  useEffect(() => {
    if (!containerRef.current || eligiblePlayers.length === 0) return

    // Clean up previous instance
    if (wheelInstanceRef.current) {
      wheelInstanceRef.current.remove()
      wheelInstanceRef.current = null
    }

    const total = eligiblePlayers.length
    const items = eligiblePlayers.map((player, idx) => {
      const isGreen = idx % 2 === 0
      const surname = player.name.split(' ').pop()
      const label = total <= 4 ? `${player.name}` : `#${player.jersey_number} ${surname}`

      return {
        label,
        backgroundColor: isGreen
          ? activeWheel === 'GK'
            ? '#16A34A'
            : '#15803D'
          : '#141414',
        labelColor: isGreen ? '#FFFFFF' : '#B8F34A',
        value: player,
      }
    })

    const props = {
      items,
      pointerAngle: 270, // 12 o'clock pointer position
      radius: 0.86,
      itemLabelRadius: 0.82,
      itemLabelRadiusMax: 0.22,
      itemLabelAlign: 'right',
      itemLabelFont: 'Inter, system-ui, sans-serif',
      itemLabelFontSizeMax: total <= 3 ? 24 : total <= 6 ? 17 : 12,
      itemLabelStrokeColor: '#000000',
      itemLabelStrokeWidth: 2,
      borderColor: '#CBD5E1',
      borderWidth: 6,
      lineColor: '#FFFFFF',
      lineWidth: 2,
      isInteractive: false, // triggered strictly via button
      onCurrentIndexChange: () => {
        if (soundEnabledRef.current) {
          soundEffects.playTick(0.28)
          setFlapperTick((v) => !v)
        }
      },
      onRest: (event) => {
        setIsSpinning(false)
        if (stopMusicRef.current) {
          stopMusicRef.current()
          stopMusicRef.current = null
        }
        if (soundEnabledRef.current) {
          soundEffects.playWinnerFanfare()
        }

        const winningPlayer = eligiblePlayers[event.currentIndex] || eligiblePlayers[0]
        setSelectedPlayer(winningPlayer)
      },
    }

    wheelInstanceRef.current = new Wheel(containerRef.current, props)

    return () => {
      if (wheelInstanceRef.current) {
        wheelInstanceRef.current.remove()
        wheelInstanceRef.current = null
      }
      if (stopMusicRef.current) {
        stopMusicRef.current()
        stopMusicRef.current = null
      }
    }
  }, [eligiblePlayers, activeWheel])

  // Spin the wheel using spin-wheel API (at least 6.5 seconds)
  const handleSpin = () => {
    if (!wheelInstanceRef.current || eligiblePlayers.length === 0 || isSpinning) return

    setIsSpinning(true)
    setSelectedPlayer(null)
    setSelectedTeamId('')
    setNotification(null)

    // Start 6.5s audio music
    const SPIN_DURATION_MS = 6500
    if (soundEnabled) {
      stopMusicRef.current = soundEffects.startSpinMusic(SPIN_DURATION_MS)
    }

    // Pick random target item
    const targetIndex = Math.floor(Math.random() * eligiblePlayers.length)

    // Spin using spin-wheel's spinToItem method
    // spinToItem(itemIndex, duration, spinToCenter, numberOfRevolutions, direction)
    wheelInstanceRef.current.spinToItem(targetIndex, SPIN_DURATION_MS, true, 8, 1)
  }

  // Confirm allocation
  const handleConfirmAllocation = async () => {
    if (!selectedPlayer || !selectedTeamId) return

    const res = await onAllocate(selectedPlayer.id, selectedTeamId)
    if (res.success) {
      setNotification({
        type: 'success',
        message: `${selectedPlayer.name} successfully assigned!`,
      })
      setSelectedPlayer(null)
      setSelectedTeamId('')
    } else {
      setNotification({
        type: 'error',
        message: res.error || 'Failed to allocate player.',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs & Sound Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-2 rounded-xl bg-[#141414] border border-[#303030]">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={activeWheel === 'GK' ? 'primary' : 'ghost'}
            onClick={() => {
              if (isSpinning) return
              setActiveWheel('GK')
              setSelectedPlayer(null)
              setSelectedTeamId('')
              setNotification(null)
            }}
            className="text-xs font-bold"
          >
            <Shield className="h-4 w-4 mr-1.5" />
            Goalkeeper Wheel ({players.filter((p) => p.is_goalkeeper && !p.team_id).length} Available)
          </Button>

          <Button
            size="sm"
            variant={activeWheel === 'OUTFIELD' ? 'primary' : 'ghost'}
            onClick={() => {
              if (isSpinning) return
              setActiveWheel('OUTFIELD')
              setSelectedPlayer(null)
              setSelectedTeamId('')
              setNotification(null)
            }}
            className="text-xs font-bold"
          >
            <Users className="h-4 w-4 mr-1.5" />
            Outfield Wheel ({players.filter((p) => !p.is_goalkeeper && !p.team_id).length} Available)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-[#202020] border-[#B8F34A]/50 text-[#B8F34A]'
                : 'bg-[#181818] border-[#303030] text-[#71717A]'
            }`}
            title="Toggle Spin Music & Peg Sound"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{soundEnabled ? 'Sound: ON' : 'Sound: Muted'}</span>
          </button>

          <Badge variant="brand" className="text-[11px] hidden sm:inline-flex">
            SPIN-WHEEL ENGINE • 6.5s
          </Badge>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
              : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Wheel & Allocation Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Spin Wheel Visual */}
        <Card className="lg:col-span-7 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-gradient-to-b from-[#161616] to-[#0F0F0F]">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#F4F7F2]">
              {activeWheel === 'GK' ? 'Goalkeeper Prize Wheel' : 'Outfield Players Prize Wheel'}
            </h3>
            <p className="text-xs text-[#9AA69B]">
              {eligiblePlayers.length} unassigned players remaining in wheel
            </p>
          </div>

          {/* Physical Stand, Wheel & Flapper Assembly */}
          <div className="relative my-2 w-[340px] h-[390px] sm:w-[380px] sm:h-[430px] flex flex-col items-center justify-center select-none">
            {/* Top Pointer Flapper Needle */}
            <div
              className="absolute top-0 z-30 flex flex-col items-center transition-transform duration-75"
              style={{
                transformOrigin: '50% 0%',
                transform: isSpinning
                  ? flapperTick
                    ? 'rotate(-8deg)'
                    : 'rotate(8deg)'
                  : 'rotate(0deg)',
              }}
            >
              {/* Bracket */}
              <div className="w-6 h-3 bg-[#222222] border border-[#555] rounded-t-sm" />
              {/* Triangular Needle */}
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[22px] border-t-[#EF4444] drop-shadow-lg" />
            </div>

            {/* Spin Wheel Canvas Container */}
            <div
              ref={containerRef}
              className="w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] relative z-10 flex items-center justify-center"
            >
              {eligiblePlayers.length === 0 && (
                <div className="p-4 rounded-xl bg-[#141414] border border-[#303030] text-xs text-[#9AA69B]">
                  All players in this category have been drafted.
                </div>
              )}
            </div>

            {/* Center Brand Overlay Badge */}
            {eligiblePlayers.length > 0 && (
              <div className="absolute top-[160px] sm:top-[180px] -translate-y-1/2 z-20 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[#0A0A0A] border-2 border-[#FFFFFF] shadow-2xl flex flex-col items-center justify-center p-1 overflow-hidden relative">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 h-full bg-[#16A34A]/80" />
                    <div className="w-1/2 h-full bg-[#111111]" />
                  </div>
                  <div className="relative z-10 text-center">
                    <span className="text-[8px] font-black text-[#FFFFFF] tracking-wider block">SUPER</span>
                    <span className="text-[8px] font-black text-[#B8F34A] tracking-wider block">CUP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Physical Stand Pedestal (Underneath the wheel) */}
            <div className="absolute bottom-0 w-full flex flex-col items-center pointer-events-none z-0">
              {/* Vertical pillar */}
              <div className="w-5 h-16 bg-gradient-to-r from-[#1C1C1C] via-[#333333] to-[#141414] border-x border-[#404040]" />
              {/* Stand base plate */}
              <div className="w-36 h-4 rounded-full bg-[#111111] border-2 border-[#404040] shadow-xl" />
            </div>
          </div>

          {/* Action Trigger */}
          <div className="w-full max-w-xs mt-2">
            <Button
              size="lg"
              className="w-full font-bold text-sm bg-[#B8F34A] text-[#090909] hover:bg-[#A3E635] shadow-lg shadow-[#B8F34A]/10 py-3"
              onClick={handleSpin}
              disabled={eligiblePlayers.length === 0 || isSpinning}
              isLoading={isSpinning}
            >
              <RotateCw className={`h-4 w-4 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning
                ? 'Spinning (6.5s)...'
                : eligiblePlayers.length === 0
                ? 'All Players Allocated'
                : `Spin the ${activeWheel === 'GK' ? 'Goalkeeper' : 'Outfield'} Wheel`}
            </Button>
          </div>
        </Card>

        {/* Right: Team Selection & Assignment Box */}
        <Card className="lg:col-span-5 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#F4F7F2]">Draft Assignment</h3>
              <p className="text-xs text-[#9AA69B]">
                Super Admin manually assigns selected player to receiving team
              </p>
            </div>
            {selectedPlayer && (
              <Badge variant="live" className="animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                DRAFTED
              </Badge>
            )}
          </div>

          {/* Selected Player Announcement Card */}
          <div
            className={`p-5 rounded-xl border text-center transition-all duration-300 ${
              selectedPlayer
                ? 'bg-gradient-to-b from-[#1E2616] to-[#141414] border-[#B8F34A] shadow-xl shadow-[#B8F34A]/10 scale-[1.02]'
                : 'bg-[#202020] border-[#303030]'
            }`}
          >
            <span className="text-[11px] text-[#9AA69B] uppercase tracking-wider block mb-1">
              {selectedPlayer ? 'Winning Draft Selection' : 'Current Draft Status'}
            </span>

            {selectedPlayer ? (
              <div className="space-y-2">
                <span className="text-2xl font-black text-[#B8F34A] tracking-tight block">
                  {selectedPlayer.name}
                </span>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="brand">{selectedPlayer.position}</Badge>
                  <span className="text-sm font-bold text-[#F4F7F2]">
                    Jersey #{selectedPlayer.jersey_number}
                  </span>
                  <Badge variant="neutral">
                    {selectedPlayer.is_goalkeeper ? 'Goalkeeper' : 'Outfield Player'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-1">
                <span className="text-xs text-[#9AA69B] italic block">
                  Click &apos;Spin the Wheel&apos; to initiate random draft selection
                </span>
                <span className="text-[11px] text-[#666] block">
                  6.5s randomized spin with mechanical ticks & suspense music
                </span>
              </div>
            )}
          </div>

          {/* Team Eligibility Options */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#9AA69B] uppercase tracking-wider">
              Choose Receiving Team:
            </label>
            <div className="space-y-2">
              {teamStats.map((team) => {
                const isEligible =
                  selectedPlayer &&
                  (selectedPlayer.is_goalkeeper
                    ? team.canAcceptGK
                    : team.canAcceptOutfield)

                const isSelected = selectedTeamId === team.id

                return (
                  <button
                    key={team.id}
                    type="button"
                    disabled={!selectedPlayer || !isEligible}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-colors min-h-[44px] ${
                      isSelected
                        ? 'bg-[#141414] border-[#B8F34A] text-[#F4F7F2]'
                        : isEligible
                        ? 'bg-[#202020] border-[#303030] text-[#F4F7F2] hover:border-[#555]'
                        : 'bg-[#181818] border-[#252525] text-[#666] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm block">{team.name}</span>
                      <span className="text-[11px] text-[#9AA69B]">
                        Squad: {team.total}/5 (GK: {team.gkCount}/1 • Outfield: {team.outfieldCount}/4)
                      </span>
                    </div>

                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-[#B8F34A]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Finalize Button */}
          <Button
            className="w-full font-bold"
            disabled={!selectedPlayer || !selectedTeamId || isAllocating}
            isLoading={isAllocating}
            onClick={handleConfirmAllocation}
          >
            Confirm Squad Allocation
          </Button>
        </Card>
      </div>
    </div>
  )
}
