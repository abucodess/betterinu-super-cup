import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Square,
  CheckCircle2,
  ClipboardList,
  Timer,
  History,
  X,
  UserCheck,
  Shield,
  Flag,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { matchesApi } from '../../services/api/matches.api';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { standingsApi } from '../../services/api/standings.api';

export function RefereeControlPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const activeTab = useMemo(() => {
    if (location.pathname.startsWith('/referee/events')) return 'events';
    if (location.pathname.startsWith('/referee/history')) return 'history';
    return 'control';
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    if (tab === 'control') navigate('/referee');
    else navigate(`/referee/${tab}`);
  };

  // Match Selection & Timer State
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Event Player Attribution Modal State
  const [pendingEvent, setPendingEvent] = useState(null); // { teamId, teamName, eventType }
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [assistPlayerId, setAssistPlayerId] = useState('');
  const [eventNote, setEventNote] = useState('');

  // Player Dossier Modal
  const [inspectPlayer, setInspectPlayer] = useState(null);

  // Queries
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  });

  const { data: playerStatsList = [] } = useQuery({
    queryKey: ['player_stats'],
    queryFn: () => standingsApi.getPlayerStats(),
  });

  const playerStatsMap = useMemo(() => {
    const map = {};
    playerStatsList.forEach((s) => {
      map[s.player_id] = s;
    });
    return map;
  }, [playerStatsList]);

  // Select default match (prefer live/half_time, otherwise first scheduled, otherwise first match)
  const activeMatch = useMemo(() => {
    if (selectedMatchId) {
      const found = matches.find((m) => m.id === selectedMatchId);
      if (found) return found;
    }
    return (
      matches.find((m) => m.status === 'live' || m.status === 'half_time') ||
      matches.find((m) => m.status === 'scheduled') ||
      matches[0] ||
      null
    );
  }, [matches, selectedMatchId]);

  useEffect(() => {
    if (activeMatch && !selectedMatchId) {
      setSelectedMatchId(activeMatch.id);
      setSeconds(activeMatch.timer_seconds || 0);
      setIsRunning(activeMatch.is_timer_running || false);
    }
  }, [activeMatch, selectedMatchId]);

  const { data: events = [] } = useQuery({
    queryKey: ['match_events', activeMatch?.id],
    queryFn: () => matchesApi.getMatchEvents(activeMatch?.id),
    enabled: !!activeMatch?.id,
  });

  // Match Clock Interval
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Mutations
  const recordEventMutation = useMutation({
    mutationFn: (payload) => matchesApi.recordMatchEvent(payload),
    onSuccess: () => {
      setPendingEvent(null);
      setSelectedPlayerId('');
      setAssistPlayerId('');
      setEventNote('');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match_events', activeMatch?.id] });
      queryClient.invalidateQueries({ queryKey: ['all_match_events'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: () => matchesApi.undoLastEvent(activeMatch?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match_events', activeMatch?.id] });
      queryClient.invalidateQueries({ queryKey: ['all_match_events'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, period, timerSeconds, running }) =>
      matchesApi.updateMatchStatus(activeMatch?.id, status, period, timerSeconds, running),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
    },
  });

  const formatClock = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentMinute = Math.max(1, Math.floor(seconds / 60) + 1);

  if (loadingMatches) {
    return (
      <Card className="p-8 text-center text-sm text-[#9AA69B]">
        Loading pitchside officiating console...
      </Card>
    );
  }

  if (!activeMatch) {
    return (
      <Card className="p-8 text-center text-sm text-[#9AA69B]">
        No matches assigned for officiating yet.
      </Card>
    );
  }

  const homeRoster = players.filter((p) => p.team_id === activeMatch.home_team_id);
  const awayRoster = players.filter((p) => p.team_id === activeMatch.away_team_id);
  const pendingTeamRoster = pendingEvent
    ? players.filter((p) => p.team_id === pendingEvent.teamId)
    : [];

  const openEventRecorder = (teamId, teamName, eventType) => {
    const roster = players.filter((p) => p.team_id === teamId);
    setPendingEvent({ teamId, teamName, eventType });
    setSelectedPlayerId(roster[0]?.id || '');
    setAssistPlayerId('');
    setEventNote('');
  };

  const handleConfirmRecordEvent = (e) => {
    e.preventDefault();
    if (!pendingEvent || !activeMatch) return;

    const extraInfo = {};
    if (assistPlayerId) {
      const assistPlayer = players.find((p) => p.id === assistPlayerId);
      extraInfo.assist_player_id = assistPlayerId;
      extraInfo.assist_player_name = assistPlayer?.name || '';
    }
    if (eventNote.trim()) {
      extraInfo.note = eventNote.trim();
    }

    recordEventMutation.mutate({
      matchId: activeMatch.id,
      teamId: pendingEvent.teamId,
      playerId: selectedPlayerId || null,
      eventType: pendingEvent.eventType,
      minute: currentMinute,
      period: activeMatch.current_period || 1,
      extraInfo,
    });
  };

  const handleMatchPeriodTransition = (nextStatus, nextPeriod, shouldRun) => {
    setIsRunning(shouldRun);
    statusMutation.mutate({
      status: nextStatus,
      period: nextPeriod,
      timerSeconds: seconds,
      running: shouldRun,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Match Selector & Console Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#141414] p-3 rounded-xl border border-[#303030]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#9AA69B] uppercase">Active Fixture:</span>
          <select
            value={activeMatch.id}
            onChange={(e) => {
              const nextMatch = matches.find((m) => m.id === e.target.value);
              setSelectedMatchId(e.target.value);
              setSeconds(nextMatch?.timer_seconds || 0);
              setIsRunning(nextMatch?.is_timer_running || false);
            }}
            className="bg-[#202020] border border-[#303030] rounded-lg px-3 py-1.5 text-xs font-bold text-[#F4F7F2] focus:outline-none focus:border-[#B8F34A]"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                Match #{m.match_number}: {m.home_team?.name} vs {m.away_team?.name} ({m.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#090909] p-1 rounded-lg border border-[#303030]">
          {[
            { id: 'control', label: 'Pitchside Control', icon: Timer },
            { id: 'events', label: `Event Log (${events.length})`, icon: ClipboardList },
            { id: 'history', label: `All Matches (${matches.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#B8F34A] text-[#090909]'
                    : 'text-[#9AA69B] hover:text-[#F4F7F2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Persistent Match Clock & Scoreboard Card */}
      <Card className="bg-gradient-to-b from-[#1a1a1a] to-[#141414] border-[#303030] p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                activeMatch.status === 'live' || activeMatch.status === 'half_time'
                  ? 'live'
                  : activeMatch.status === 'completed'
                  ? 'success'
                  : 'neutral'
              }
            >
              {activeMatch.status === 'live'
                ? `LIVE • PERIOD ${activeMatch.current_period || 1}`
                : activeMatch.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-[#9AA69B]">
              Match #{activeMatch.match_number} • {activeMatch.venue}
            </span>
          </div>

          {/* Match Status / Period Transitions */}
          <div className="flex flex-wrap items-center gap-1.5">
            {activeMatch.status === 'scheduled' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleMatchPeriodTransition('live', 1, true)}
                isLoading={statusMutation.isPending}
              >
                <Play className="w-3.5 h-3.5" /> Kick Off (1st Half)
              </Button>
            )}
            {activeMatch.status === 'live' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleMatchPeriodTransition('half_time', 1, false)}
                  isLoading={statusMutation.isPending}
                >
                  <Flag className="w-3.5 h-3.5" /> Half-Time
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleMatchPeriodTransition('completed', 2, false)}
                  isLoading={statusMutation.isPending}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Full-Time (Complete)
                </Button>
              </>
            )}
            {activeMatch.status === 'half_time' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleMatchPeriodTransition('live', 2, true)}
                isLoading={statusMutation.isPending}
              >
                <Play className="w-3.5 h-3.5" /> Start 2nd Half
              </Button>
            )}
            {activeMatch.status === 'completed' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleMatchPeriodTransition('live', 2, false)}
                isLoading={statusMutation.isPending}
              >
                Re-open Match
              </Button>
            )}
          </div>
        </div>

        {/* Central Clock & Score Display */}
        <div className="text-center space-y-2 py-1">
          <div className="text-4xl sm:text-5xl font-black text-[#B8F34A] tabular-nums tracking-tight">
            {formatClock(seconds)}
          </div>

          <div className="grid grid-cols-3 items-center gap-2 pt-2">
            <div>
              <p className="font-bold text-sm sm:text-base text-[#F4F7F2]">
                {activeMatch.home_team?.name}
              </p>
              <span className="text-xs text-[#9AA69B]">HOME</span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-[#F4F7F2] tabular-nums">
              {activeMatch.home_score} <span className="text-[#9AA69B] mx-1">-</span>{' '}
              {activeMatch.away_score}
            </div>

            <div>
              <p className="font-bold text-sm sm:text-base text-[#F4F7F2]">
                {activeMatch.away_team?.name}
              </p>
              <span className="text-xs text-[#9AA69B]">AWAY</span>
            </div>
          </div>
        </div>

        {/* Clock Controls */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#303030]">
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="lg"
            onClick={() => setIsRunning((r) => !r)}
            className="h-12 text-sm font-bold"
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause Clock' : 'Run Match Clock'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              setIsRunning(false);
              setSeconds(0);
            }}
            className="h-12 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Clock
          </Button>
        </div>
      </Card>

      {/* TAB 1: PITCHSIDE ACTION CONTROLS */}
      {activeTab === 'control' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home Team Action Deck */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#303030] pb-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#9AA69B] flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeMatch.home_team?.color_code || '#B8F34A' }}
                  />
                  {activeMatch.home_team?.name} Actions
                </h2>
                <span className="text-[11px] text-[#9AA69B]">{homeRoster.length} Players</span>
              </div>

              <Button
                variant="primary"
                className="w-full h-12 text-sm font-bold"
                onClick={() =>
                  openEventRecorder(
                    activeMatch.home_team_id,
                    activeMatch.home_team?.name,
                    'GOAL'
                  )
                }
              >
                <Plus className="w-4 h-4" />
                +1 GOAL ({activeMatch.home_team?.short_code})
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="h-11 text-xs border-amber-400/30 text-amber-400"
                  onClick={() =>
                    openEventRecorder(
                      activeMatch.home_team_id,
                      activeMatch.home_team?.name,
                      'YELLOW_CARD'
                    )
                  }
                >
                  <Square className="w-3.5 h-3.5 fill-amber-400" />
                  Yellow Card
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 text-xs border-red-500/30 text-red-400"
                  onClick={() =>
                    openEventRecorder(
                      activeMatch.home_team_id,
                      activeMatch.home_team?.name,
                      'RED_CARD'
                    )
                  }
                >
                  <Square className="w-3.5 h-3.5 fill-red-500" />
                  Red Card
                </Button>
              </div>

              {/* Home Team Lineup Sheet */}
              <div className="pt-2 border-t border-[#303030] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA69B]">
                  Official Squad Sheet (Click player to inspect)
                </span>
                {homeRoster.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setInspectPlayer(p)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#202020] hover:border-[#B8F34A] border border-[#303030] text-xs transition-colors"
                  >
                    <span className="font-medium text-[#F4F7F2]">
                      <strong className="text-[#9AA69B] mr-1.5 tabular-nums">
                        #{p.jersey_number}
                      </strong>
                      {p.name}
                    </span>
                    <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>
                      {p.position}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>

            {/* Away Team Action Deck */}
            <Card className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#303030] pb-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#9AA69B] flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeMatch.away_team?.color_code || '#EF4444' }}
                  />
                  {activeMatch.away_team?.name} Actions
                </h2>
                <span className="text-[11px] text-[#9AA69B]">{awayRoster.length} Players</span>
              </div>

              <Button
                variant="primary"
                className="w-full h-12 text-sm font-bold"
                onClick={() =>
                  openEventRecorder(
                    activeMatch.away_team_id,
                    activeMatch.away_team?.name,
                    'GOAL'
                  )
                }
              >
                <Plus className="w-4 h-4" />
                +1 GOAL ({activeMatch.away_team?.short_code})
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  className="h-11 text-xs border-amber-400/30 text-amber-400"
                  onClick={() =>
                    openEventRecorder(
                      activeMatch.away_team_id,
                      activeMatch.away_team?.name,
                      'YELLOW_CARD'
                    )
                  }
                >
                  <Square className="w-3.5 h-3.5 fill-amber-400" />
                  Yellow Card
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 text-xs border-red-500/30 text-red-400"
                  onClick={() =>
                    openEventRecorder(
                      activeMatch.away_team_id,
                      activeMatch.away_team?.name,
                      'RED_CARD'
                    )
                  }
                >
                  <Square className="w-3.5 h-3.5 fill-red-500" />
                  Red Card
                </Button>
              </div>

              {/* Away Team Lineup Sheet */}
              <div className="pt-2 border-t border-[#303030] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA69B]">
                  Official Squad Sheet (Click player to inspect)
                </span>
                {awayRoster.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setInspectPlayer(p)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#202020] hover:border-[#B8F34A] border border-[#303030] text-xs transition-colors"
                  >
                    <span className="font-medium text-[#F4F7F2]">
                      <strong className="text-[#9AA69B] mr-1.5 tabular-nums">
                        #{p.jersey_number}
                      </strong>
                      {p.name}
                    </span>
                    <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>
                      {p.position}
                    </Badge>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chronological Timeline & Atomic Undo */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F4F7F2]">
                Recorded Match Events ({events.length})
              </h3>
              <Button
                variant="danger"
                size="sm"
                onClick={() => undoMutation.mutate()}
                disabled={events.length === 0 || undoMutation.isPending}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Undo Last Action
              </Button>
            </div>

            {events.length === 0 ? (
              <p className="text-xs text-[#9AA69B] py-4 text-center border border-dashed border-[#303030] rounded-lg">
                No match events recorded yet. Select +1 GOAL or Card above to log an official event.
              </p>
            ) : (
              <div className="space-y-2">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#202020] border border-[#303030] text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-[#B8F34A] tabular-nums w-8">
                        {ev.minute}&apos;
                      </span>
                      <span className="font-bold text-[#F4F7F2]">
                        {ev.event_type === 'GOAL' ? '⚽ GOAL' : ev.event_type.replace('_', ' ')}
                      </span>
                      {ev.player && (
                        <span className="text-[#F4F7F2] font-medium">
                          — #{ev.player.jersey_number} {ev.player.name}
                        </span>
                      )}
                      {ev.extra_info?.assist_player_name && (
                        <span className="text-[#9AA69B]">
                          (Assist: {ev.extra_info.assist_player_name})
                        </span>
                      )}
                    </div>
                    <Badge variant="neutral">{ev.team?.short_code || 'TEAM'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: FULL CHRONOLOGICAL EVENT LOG */}
      {activeTab === 'events' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#303030] pb-3">
            <h2 className="text-base font-bold text-[#F4F7F2]">
              Official Chronological Event Log — Match #{activeMatch.match_number}
            </h2>
            <Button
              variant="danger"
              size="sm"
              onClick={() => undoMutation.mutate()}
              disabled={events.length === 0 || undoMutation.isPending}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo Latest Event
            </Button>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-[#9AA69B] py-10 text-center">
              No events have been logged for this fixture yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-[#202020] border border-[#303030] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded bg-[#141414] border border-[#303030] font-black text-xs text-[#B8F34A] tabular-nums">
                      {ev.minute}&apos; (P{ev.period || 1})
                    </span>
                    <div>
                      <p className="text-sm font-bold text-[#F4F7F2]">
                        {ev.event_type.replace('_', ' ')}{' '}
                        {ev.player ? `• #${ev.player.jersey_number} ${ev.player.name}` : ''}
                      </p>
                      <p className="text-xs text-[#9AA69B]">
                        Team: {ev.team?.name}
                        {ev.extra_info?.assist_player_name
                          ? ` • Assist: ${ev.extra_info.assist_player_name}`
                          : ''}
                        {ev.extra_info?.note ? ` • Note: ${ev.extra_info.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral">{ev.team?.short_code}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: ASSIGNED MATCHES & COMPLETED RESULTS */}
      {activeTab === 'history' && (
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-[#F4F7F2] border-b border-[#303030] pb-3">
            Assigned Tournament Matches ({matches.length})
          </h2>
          <div className="space-y-3">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#202020] border border-[#303030] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-[#B8F34A]">
                    MATCH #{m.match_number} • {m.venue}
                  </span>
                  <p className="text-base font-bold text-[#F4F7F2] mt-0.5">
                    {m.home_team?.name}{' '}
                    <span className="text-[#B8F34A] px-2 tabular-nums">
                      {m.home_score} - {m.away_score}
                    </span>{' '}
                    {m.away_team?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      m.status === 'live' || m.status === 'half_time'
                        ? 'live'
                        : m.status === 'completed'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {m.status.toUpperCase()}
                  </Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedMatchId(m.id);
                      setSeconds(m.timer_seconds || 0);
                      setIsRunning(m.is_timer_running || false);
                      setActiveTab('control');
                    }}
                  >
                    Officiate Match
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Player Attribution Modal when recording a Goal / Yellow Card / Red Card */}
      {pendingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#303030] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B8F34A]">
                  Official Match Event Attribution
                </span>
                <h3 className="text-base font-bold text-[#F4F7F2]">
                  Record {pendingEvent.eventType.replace('_', ' ')} — {pendingEvent.teamName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingEvent(null)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRecordEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9AA69B] mb-2">
                  Select Player ({pendingTeamRoster.length} Squad Members)
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto">
                  {pendingTeamRoster.map((p) => {
                    const isSelected = selectedPlayerId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPlayerId(p.id)}
                        className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#B8F34A]/15 border-[#B8F34A] text-[#F4F7F2]'
                            : 'bg-[#202020] border-[#303030] text-[#9AA69B] hover:text-[#F4F7F2]'
                        }`}
                      >
                        <span className="text-xs font-bold">
                          #{p.jersey_number} {p.name}
                        </span>
                        <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>
                          {p.position}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {pendingEvent.eventType === 'GOAL' && (
                <div>
                  <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                    Assisted By (Optional)
                  </label>
                  <select
                    value={assistPlayerId}
                    onChange={(e) => setAssistPlayerId(e.target.value)}
                    className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F4F7F2]"
                  >
                    <option value="">-- Unassisted / Solo Goal --</option>
                    {pendingTeamRoster
                      .filter((p) => p.id !== selectedPlayerId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.jersey_number} {p.name} ({p.position})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#9AA69B] mb-1">
                  Official Referee Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Penalty kick, Tactical foul..."
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F4F7F2]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#303030]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setPendingEvent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={recordEventMutation.isPending}>
                  Confirm {pendingEvent.eventType.replace('_', ' ')} ({currentMinute}&apos;)
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Player Dossier Modal */}
      {inspectPlayer && (
        <PlayerProfileModal
          player={inspectPlayer}
          team={teams.find((t) => t.id === inspectPlayer.team_id)}
          stats={playerStatsMap[inspectPlayer.id] || {}}
          matchEvents={events.filter((e) => e.player_id === inspectPlayer.id)}
          teamMatches={matches.filter(
            (m) =>
              m.home_team_id === inspectPlayer.team_id ||
              m.away_team_id === inspectPlayer.team_id
          )}
          onClose={() => setInspectPlayer(null)}
        />
      )}
    </div>
  );
}
export default RefereeControlPage;
