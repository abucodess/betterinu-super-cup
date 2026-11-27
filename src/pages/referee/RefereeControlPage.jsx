import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Play,
  Pause,
  RotateCcw,
  Goal,
  Handshake,
  Square,
  CheckCircle2,
  ClipboardList,
  X,
  Flag,
} from 'lucide-react';
import { StaffBadge as Badge, StaffButton as Button, StaffCard as Card, StaffCrest, StaffMatchSummary, StaffPlayerAvatar } from '../../components/shared/StaffManagementUI';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { matchesApi } from '../../services/api/matches.api';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { standingsApi } from '../../services/api/standings.api';
import { FinalResultDialog } from './FinalResultDialog';
import { ModalDialog } from '../../components/ui/ModalDialog';
import { formatKickoff } from '../../components/shared/MatchSummary';

const eventActions = [
  { type: 'GOAL', label: 'Goal', icon: Goal },
  { type: 'GOAL', label: 'Goal + Assist', icon: Handshake, withAssist: true },
  { type: 'YELLOW_CARD', label: 'Yellow Card', icon: Square, tone: 'staff-event-yellow' },
  { type: 'RED_CARD', label: 'Red Card', icon: Square, tone: 'staff-event-red' },
];

const eventDetails = {
  GOAL: { label: 'Goal', icon: Goal },
  YELLOW_CARD: { label: 'Yellow card', icon: Square, color: 'var(--staff-warning)' },
  RED_CARD: { label: 'Red card', icon: Square, color: 'var(--staff-danger)' },
};

function EventList({ events }) {
  return (
    <ol className="space-y-2">
      {events.map((event) => {
        const { label, icon: Icon, color } = eventDetails[event.event_type] || {
          label: event.event_type?.replaceAll('_', ' '), icon: ClipboardList,
        };
        return (
          <li key={event.id} className="staff-event-row">
            <span className="staff-event-minute">{event.minute}&apos;</span>
            <Icon size={18} aria-hidden="true" style={{ color, fill: color }} />
            <div className="min-w-0">
              <p className="break-words font-semibold text-sm">
                {label}{event.player ? ` · #${event.player.jersey_number} ${event.player.name}` : ''}
              </p>
              <p className="break-words text-xs text-[color:var(--staff-muted)]">
                {event.team?.name || event.team?.short_code}
                {event.extra_info?.assist_player_name && ` · Assist: ${event.extra_info.assist_player_name}`}
                {event.extra_info?.note && ` · ${event.extra_info.note}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function RefereeControlPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const refereeId = useSelector((state) => state.auth.user?.id);

  const activeTab = useMemo(() => {
    if (location.pathname.startsWith('/referee/events')) return 'events';
    if (location.pathname.startsWith('/referee/history')) return 'history';
    return 'control';
  }, [location.pathname]);

  // Match Selection & Timer State
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [reviewMatchId, setReviewMatchId] = useState(null);
  const [publishedMatchId, setPublishedMatchId] = useState(null);

  // Event Player Attribution Modal State
  const [pendingEvent, setPendingEvent] = useState(null); // { teamId, teamName, eventType }
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [assistPlayerId, setAssistPlayerId] = useState('');
  const [eventNote, setEventNote] = useState('');

  // Player Dossier Modal
  const [inspectPlayer, setInspectPlayer] = useState(null);

  // Queries
  const { data: assignedMatches, isPending: loadingMatches, isError: matchesError, refetch: retryMatches } = useQuery({
    queryKey: ['matches', 'referee', refereeId],
    queryFn: () => matchesApi.getMatches({ refereeId }),
    enabled: Boolean(refereeId),
    refetchInterval: 6000,
  });
  const matches = useMemo(() => (assignedMatches || []).filter((match) => match.referee_id === refereeId), [assignedMatches, refereeId]);

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
    if (activeMatch && activeMatch.id !== selectedMatchId) {
      setSelectedMatchId(activeMatch.id);
      setSeconds(activeMatch.timer_seconds || 0);
      setIsRunning(activeMatch.is_timer_running || false);
    }
  }, [activeMatch, selectedMatchId]);

  const { data: events = [], isFetching: loadingEvents, isError: eventsError, refetch: retryEvents } = useQuery({
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
    mutationFn: ({ matchId, status, period, timerSeconds }) =>
      matchesApi.updateMatchStatus(matchId, status, period, timerSeconds),
    onSuccess: (_, { matchId, status, running }) => {
      setIsRunning(running);
      setReviewMatchId(null);
      setPublishedMatchId(status === 'completed' ? matchId : null);
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
      <Card className="p-8 text-center text-sm text-[color:var(--staff-muted)]">
        <span className="staff-loading" role="status">Loading assigned fixtures…</span>
      </Card>
    );
  }

  if (matchesError) {
    return (
      <Card className="p-8 space-y-3 text-center text-sm text-[color:var(--staff-muted)]">
        <p role="alert">Assigned matches could not be loaded.</p>
        <Button onClick={() => retryMatches()}>Try again</Button>
      </Card>
    );
  }

  if (!activeMatch) {
    return (
      <Card className="p-8 text-center text-sm text-[color:var(--staff-muted)]">
        No matches assigned for officiating yet.
      </Card>
    );
  }

  const homeRoster = players.filter((p) => p.team_id === activeMatch.home_team_id);
  const awayRoster = players.filter((p) => p.team_id === activeMatch.away_team_id);
  const pendingTeamRoster = pendingEvent
    ? players.filter((p) => p.team_id === pendingEvent.teamId)
    : [];

  const openEventRecorder = (teamId, teamName, eventType, withAssist) => {
    const roster = players.filter((p) => p.team_id === teamId);
    recordEventMutation.reset();
    setPendingEvent({ teamId, teamName, eventType, withAssist });
    setSelectedPlayerId(roster[0]?.id || '');
    setAssistPlayerId('');
    setEventNote('');
  };

  const handleConfirmRecordEvent = (e) => {
    e.preventDefault();
    if (!pendingEvent || !activeMatch || recordEventMutation.isPending || (pendingEvent.withAssist && !assistPlayerId)) return;

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
    if (statusMutation.isPending) return;
    statusMutation.mutate({
      matchId: activeMatch.id,
      status: nextStatus,
      period: nextPeriod,
      timerSeconds: seconds,
      running: shouldRun,
    });
  };

  return (
    <div className="space-y-4">
      {publishedMatchId === activeMatch.id && (
        <p role="status" className="text-sm text-[color:var(--staff-blue)]">Final result published.</p>
      )}
      {statusMutation.isError && reviewMatchId !== activeMatch.id && (
        <p role="alert" className="text-sm text-[color:var(--staff-danger)]">Match status could not be updated. Try again.</p>
      )}
      {/* Match selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--staff-surface)] p-3 rounded-xl border border-[color:var(--staff-line)]">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <label htmlFor="referee-active-match" className="text-xs font-bold text-[color:var(--staff-muted)] uppercase">Active Fixture</label>
          <select
            id="referee-active-match"
            value={activeMatch.id}
            disabled={statusMutation.isPending}
            onChange={(e) => {
              const nextMatch = matches.find((m) => m.id === e.target.value);
              setSelectedMatchId(e.target.value);
              setSeconds(nextMatch?.timer_seconds || 0);
              setIsRunning(nextMatch?.is_timer_running || false);
            }}
            className="max-w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-1.5 text-xs font-bold text-[color:var(--staff-ink)] focus:outline-none focus:border-[color:var(--staff-blue)]"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                Match #{m.match_number}: {m.home_team?.name} vs {m.away_team?.name} ({m.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Persistent Match Clock & Scoreboard Card */}
      <Card className="staff-scoreboard p-4 sm:p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
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
                : activeMatch.status.replaceAll('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-xs staff-scoreboard-meta">
              Match #{activeMatch.match_number}{activeMatch.kickoff_time && ` · ${formatKickoff(activeMatch.kickoff_time)}`}
              {activeMatch.venue && ` · ${activeMatch.venue}`}
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
                  onClick={() => {
                    statusMutation.reset();
                    setReviewMatchId(activeMatch.id);
                    retryEvents();
                  }}
                  isLoading={statusMutation.isPending}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Review Final Result
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

        <div className="text-center space-y-3 py-1">
          <div role="timer" className="text-3xl sm:text-4xl font-extrabold staff-scoreboard-meta tabular-nums" aria-label="Match clock">
            {formatClock(seconds)}
          </div>
          <div className="staff-scoreboard-teams">
            <div>
              <StaffCrest club={activeMatch.home_team} />
              <p className="font-bold text-sm sm:text-base">{activeMatch.home_team?.name || 'Home team'}</p>
            </div>
            <div className="text-3xl sm:text-5xl font-black tabular-nums whitespace-nowrap">
              <span className="sr-only">Current score </span>{activeMatch.home_score} <span className="staff-scoreboard-meta">–</span> {activeMatch.away_score}
            </div>
            <div>
              <StaffCrest club={activeMatch.away_team} />
              <p className="font-bold text-sm sm:text-base">{activeMatch.away_team?.name || 'Away team'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t staff-scoreboard-divider">
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
            {[
              { id: activeMatch.home_team_id, club: activeMatch.home_team, roster: homeRoster },
              { id: activeMatch.away_team_id, club: activeMatch.away_team, roster: awayRoster },
            ].map(({ id, club, roster }) => (
              <Card key={id} className="space-y-3 p-4">
                <header className="flex items-center gap-2.5">
                  <StaffCrest club={club} />
                  <h2 className="text-xl font-bold min-w-0">{club?.name || 'Team'}</h2>
                </header>
                <div className="staff-event-grid">
                  {eventActions.map(({ type, label, icon: Icon, tone, withAssist }) => (
                    <Button key={label} variant={tone ? 'secondary' : 'primary'} className={tone || ''}
                      aria-label={`${label} for ${club?.name || 'team'}`}
                      disabled={Boolean(withAssist && roster.length < 2)}
                      onClick={() => openEventRecorder(id, club?.name, type, withAssist)}>
                      <Icon size={17} className={tone ? 'fill-current shrink-0' : 'shrink-0'} aria-hidden="true" />
                      {label}
                    </Button>
                  ))}
                </div>
                <details className="border-t border-[color:var(--staff-line)]">
                  <summary className="min-h-11 py-3 cursor-pointer text-sm font-semibold">Squad · {roster.length} players</summary>
                  <div className="grid gap-1.5">
                    {roster.map((player) => (
                      <button type="button" key={player.id} onClick={() => setInspectPlayer(player)} className="staff-player-option">
                        <StaffPlayerAvatar player={player} />
                        <strong className="min-w-0 break-words text-sm">#{player.jersey_number} {player.name}</strong>
                        <Badge variant={player.position === 'GK' ? 'accent' : 'neutral'}>{player.position}</Badge>
                      </button>
                    ))}
                  </div>
                </details>
              </Card>
            ))}
          </div>

          {/* Chronological Timeline & Atomic Undo */}
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[color:var(--staff-ink)]">
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

            {events.length ? <EventList events={events} /> : (
              <p className="text-sm text-[color:var(--staff-muted)] py-4">No match events recorded yet.</p>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: FULL CHRONOLOGICAL EVENT LOG */}
      {activeTab === 'events' && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--staff-line)] pb-3">
            <h2 className="text-base font-bold text-[color:var(--staff-ink)]">
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

          {events.length ? <EventList events={events} /> : (
            <p className="text-sm text-[color:var(--staff-muted)] py-4">No events have been logged for this fixture yet.</p>
          )}
        </Card>
      )}

      {/* TAB 3: ASSIGNED MATCHES & COMPLETED RESULTS */}
      {activeTab === 'history' && (
        <Card className="space-y-4">
          <h2 className="text-base font-bold text-[color:var(--staff-ink)] border-b border-[color:var(--staff-line)] pb-3">
            Assigned Tournament Matches ({matches.length})
          </h2>
          <div className="staff-match-grid">
            {matches.map((match) => (
              <article key={match.id} className="staff-match-preview">
                <StaffMatchSummary match={match} />
                <Button className="w-full mt-3" size="sm"
                  onClick={() => {
                    setSelectedMatchId(match.id);
                    setSeconds(match.timer_seconds || 0);
                    setIsRunning(match.is_timer_running || false);
                    navigate('/referee');
                  }}
                >
                  Manage Match
                </Button>
              </article>
            ))}
          </div>
        </Card>
      )}

      {/* Player Attribution Modal when recording a Goal / Yellow Card / Red Card */}
      {pendingEvent && (
        <ModalDialog className="staff-dialog" labelledBy="staff-event-title"
          onDismiss={() => { if (!recordEventMutation.isPending) setPendingEvent(null); }}>
          <Card className="w-full max-w-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[color:var(--staff-line)] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--staff-blue)]">
                  Official Match Event Attribution
                </span>
                <h3 id="staff-event-title" className="text-xl font-bold">
                  Record {pendingEvent.withAssist ? 'goal + assist' : eventDetails[pendingEvent.eventType].label.toLowerCase()} · {pendingEvent.teamName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingEvent(null)}
                disabled={recordEventMutation.isPending}
                aria-label="Close event recording"
                className="arena-icon-button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRecordEvent} className="space-y-4">
              <fieldset>
                <legend className="block text-xs font-medium text-[color:var(--staff-muted)] mb-2">
                  Select Player ({pendingTeamRoster.length} Squad Members)
                </legend>
                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto">
                  {pendingTeamRoster.map((p) => {
                    const isSelected = selectedPlayerId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setSelectedPlayerId(p.id); if (assistPlayerId === p.id) setAssistPlayerId(''); }}
                        aria-pressed={isSelected}
                        className={`staff-player-option ${
                          isSelected
                            ? 'bg-[var(--staff-ice)] border-[color:var(--staff-blue)] text-[color:var(--staff-ink)]'
                            : 'bg-[var(--staff-subtle)] border-[color:var(--staff-line)] text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]'
                        }`}
                      >
                        <StaffPlayerAvatar player={p} />
                        <strong className="min-w-0 break-words text-sm">#{p.jersey_number} {p.name}</strong>
                        <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>
                          {p.position}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {pendingEvent.eventType === 'GOAL' && (
                <div>
                  <label htmlFor="staff-event-assist" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                    Assisted by {pendingEvent.withAssist ? '' : '(optional)'}
                  </label>
                  <select
                    id="staff-event-assist"
                    required={pendingEvent.withAssist}
                    value={assistPlayerId}
                    onChange={(e) => setAssistPlayerId(e.target.value)}
                    className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)]"
                  >
                    <option value="">{pendingEvent.withAssist ? 'Select assisting player' : 'Unassisted goal'}</option>
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
                <label htmlFor="staff-event-note" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1">
                  Official Referee Note (Optional)
                </label>
                <input
                  type="text"
                  id="staff-event-note"
                  placeholder="e.g., Penalty kick, tactical foul"
                  value={eventNote}
                  onChange={(e) => setEventNote(e.target.value)}
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)]"
                />
              </div>

              {recordEventMutation.isError && <p role="alert" className="text-sm text-[color:var(--staff-danger)]">The event could not be recorded. Try again.</p>}
              <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-[color:var(--staff-line)]">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={recordEventMutation.isPending}
                  onClick={() => setPendingEvent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pendingEvent.withAssist && !assistPlayerId} isLoading={recordEventMutation.isPending}>
                  Confirm {pendingEvent.eventType.replace('_', ' ')} ({currentMinute}&apos;)
                </Button>
              </div>
            </form>
          </Card>
        </ModalDialog>
      )}

      {reviewMatchId === activeMatch.id && activeMatch.status === 'live' && (
        <FinalResultDialog
          match={activeMatch} events={events} eventsPending={loadingEvents} eventsError={eventsError}
          onRetry={retryEvents} pending={statusMutation.isPending} failed={statusMutation.isError}
          onDismiss={() => { setReviewMatchId(null); statusMutation.reset(); }}
          onConfirm={() => handleMatchPeriodTransition('completed', 2, false)}
        />
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
