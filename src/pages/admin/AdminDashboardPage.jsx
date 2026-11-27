import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Megaphone,
  Upload,
  Edit3,
  Search,
  LayoutGrid,
  List,
  Save,
  X,
  UserCog,
  AlertTriangle,
} from 'lucide-react';
import { StaffBadge as Badge, StaffButton as Button, StaffCard as Card, StaffCrest, StaffMatchSummary, StaffPlayerAvatar } from '../../components/shared/StaffManagementUI';
import { Input } from '../../components/ui/Input';
import { ModalDialog } from '../../components/ui/ModalDialog';
import { LiveTeamAssignmentBoard } from '../../features/allocation/LiveTeamAssignmentBoard';
import { PlayerCard } from '../../features/players/PlayerCard';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { PlayerImageUploader } from '../../features/players/PlayerImageUploader';
import { playersApi } from '../../services/api/players.api';
import { teamsApi } from '../../services/api/teams.api';
import { matchesApi } from '../../services/api/matches.api';
import { tournamentsApi } from '../../services/api/tournaments.api';
import { standingsApi } from '../../services/api/standings.api';
import { authApi } from '../../services/api/auth.api';

export function AdminDashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const activeTab = useMemo(() => {
    if (location.pathname.startsWith('/admin/players')) return 'players';
    if (location.pathname.startsWith('/admin/teams')) return 'teams';
    if (location.pathname.startsWith('/admin/matches')) return 'matches';
    return 'overview';
  }, [location.pathname]);

  const setActiveTab = (tab) => {
    if (tab === 'overview') navigate('/admin');
    else navigate(`/admin/${tab}`);
  };

  // Player Dossier Modal
  const [selectedPlayerForProfile, setSelectedPlayerForProfile] = useState(null);

  // Add Player / Non-Player Supporter Form State
  const [isNonPlayerMode, setIsNonPlayerMode] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('FW');
  const [supporterDetails, setSupporterDetails] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState('');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [playerSuccess, setPlayerSuccess] = useState('');

  // Player Directory Filter State
  const [playerSearch, setPlayerSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [allocationFilter, setAllocationFilter] = useState('ALL');
  const [playerViewMode, setPlayerViewMode] = useState(() => window.matchMedia('(min-width: 1024px)').matches ? 'table' : 'cards');

  // Edit Player / Supporter Modal State
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editIsNonPlayer, setEditIsNonPlayer] = useState(false);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerJersey, setEditPlayerJersey] = useState('');
  const [editPlayerPos, setEditPlayerPos] = useState('FW');
  const [editSupporterDetails, setEditSupporterDetails] = useState('');
  const [editPlayerTeamId, setEditPlayerTeamId] = useState('');
  const [editPlayerPhotoUrl, setEditPlayerPhotoUrl] = useState('');
  const [editPlayerError, setEditPlayerError] = useState('');

  // Delete Player Confirmation Modal State
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [deletePlayerError, setDeletePlayerError] = useState('');
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Bulk Upload Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkFeedback, setBulkFeedback] = useState('');

  // Team & Manager Editing State
  const [teamsSubView, setTeamsSubView] = useState('wheel');
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamCode, setEditTeamCode] = useState('');
  const [editTeamColor, setEditTeamColor] = useState('#B8F34A');
  const [editTeamManagerId, setEditTeamManagerId] = useState('');

  // Fixture Creation & Editing State
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [venue, setVenue] = useState('Institute Main Arena');
  const [matchNumber, setMatchNumber] = useState('');
  const [kickoffTime, setKickoffTime] = useState('');
  const [fixtureError, setFixtureError] = useState('');
  const [editingMatch, setEditingMatch] = useState(null);

  // Tournament Settings & Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Queries
  const { data: tournament } = useQuery({
    queryKey: ['tournament'],
    queryFn: () => tournamentsApi.getActiveTournament(),
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', tournament?.id],
    queryFn: () => tournamentsApi.getAnnouncements(tournament?.id),
  });

  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ['players'],
    queryFn: () => playersApi.getPlayers(),
  });

  const { data: teams = [], isPending: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  });

  const { data: matches = [], isPending: loadingFixtures } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['all_match_events'],
    queryFn: () => matchesApi.getAllMatchEvents(),
  });

  const { data: playerStatsList = [] } = useQuery({
    queryKey: ['player_stats'],
    queryFn: () => standingsApi.getPlayerStats(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => authApi.getAllProfiles(),
  });

  const playerStatsMap = useMemo(() => {
    const map = {};
    playerStatsList.forEach((s) => {
      map[s.player_id] = s;
    });
    return map;
  }, [playerStatsList]);

  const managerProfiles = useMemo(
    () => profiles.filter((p) => p.role === 'manager'),
    [profiles]
  );

  // Mutations
  const addPlayerMutation = useMutation({
    mutationFn: (payload) =>
      playersApi.addPlayer({
        ...payload,
        tournament_id: tournament?.id || '11111111-1111-1111-1111-111111111111',
      }),
    onSuccess: (created) => {
      setPlayerName('');
      setJerseyNumber('');
      setSupporterDetails('');
      setPlayerPhotoUrl('');
      setPlayerTeamId('');
      setPlayerError('');
      setPlayerSuccess(
        created.is_non_player
          ? `Added Team Supporter: ${created.name}`
          : `Added Player: ${created.name}`
      );
      setTimeout(() => setPlayerSuccess(''), 3000);
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
    onError: (err) => setPlayerError(err.message || 'Failed to add entry'),
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ id, updates }) => playersApi.updatePlayer(id, updates),
    onSuccess: () => {
      setEditingPlayer(null);
      setEditPlayerError('');
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
    onError: (err) => setEditPlayerError(err.message || 'Failed to update player'),
  });

  const deletePlayerMutation = useMutation({
    mutationFn: (id) => playersApi.deletePlayer(id),
    onSuccess: () => {
      setPlayerToDelete(null);
      setDeletePlayerError('');
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
    onError: (err) => setDeletePlayerError(err.message || 'Failed to delete player'),
  });

  const deleteAllPlayersMutation = useMutation({
    mutationFn: () => playersApi.deleteAllPlayers(),
    onSuccess: () => {
      setShowClearAllConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
  });

  const bulkAddPlayersMutation = useMutation({
    mutationFn: (records) => playersApi.bulkAddPlayers(records),
    onSuccess: (created) => {
      setBulkFeedback(`Imported ${created.length} players.`);
      setBulkText('');
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
    onError: (err) => setBulkFeedback(`Error: ${err.message}`),
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, updates }) => teamsApi.updateTeam(id, updates),
    onSuccess: () => {
      setEditingTeamId(null);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: (payload) =>
      matchesApi.createMatch({
        ...payload,
        tournament_id: tournament?.id || '11111111-1111-1111-1111-111111111111',
      }),
    onSuccess: () => {
      setMatchNumber('');
      setFixtureError('');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (err) => setFixtureError(err.message || 'Failed to schedule fixture'),
  });

  const updateMatchMutation = useMutation({
    mutationFn: ({ id, updates }) => matchesApi.updateMatch(id, updates),
    onSuccess: () => {
      setEditingMatch(null);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: (id) => matchesApi.deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
    },
  });

  const updateTournamentMutation = useMutation({
    mutationFn: ({ id, updates }) => tournamentsApi.updateTournament(id, updates),
    onSuccess: () => {
      setSettingsSavedMsg('Settings saved.');
      setTimeout(() => setSettingsSavedMsg(''), 3000);
      queryClient.invalidateQueries({ queryKey: ['tournament'] });
    },
  });

  const saveAnnouncementMutation = useMutation({
    mutationFn: ({ id, ...payload }) => id
      ? tournamentsApi.updateAnnouncement(id, payload)
      : tournamentsApi.createAnnouncement(payload),
    onSuccess: () => {
      setAnnouncementTitle('');
      setAnnouncementBody('');
      setEditingAnnouncementId(null);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id) => tournamentsApi.deleteAnnouncement(id),
    onSuccess: (_, id) => {
      if (id === editingAnnouncementId) {
        setEditingAnnouncementId(null);
        setAnnouncementTitle('');
        setAnnouncementBody('');
      }
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  // Handlers
  const handleAddPlayer = (e) => {
    e.preventDefault();
    setPlayerError('');
    setPlayerSuccess('');

    if (isNonPlayerMode) {
      if (!playerName.trim()) {
        setPlayerError('Supporter name is required.');
        return;
      }
      addPlayerMutation.mutate({
        name: playerName.trim(),
        details: supporterDetails.trim() || 'Team Supporter',
        is_non_player: true,
        member_type: 'SUPPORTER',
        position: 'SUP',
        jersey_number: 0,
        team_id: playerTeamId || null,
        photo_url: playerPhotoUrl ? playerPhotoUrl.trim() : null,
      });
      return;
    }

    if (!playerName.trim() || !jerseyNumber) {
      setPlayerError('Player name and jersey number are required.');
      return;
    }
    const num = Number(jerseyNumber);
    if (Number.isNaN(num) || num < 1 || num > 99) {
      setPlayerError('Jersey number must be between 1 and 99.');
      return;
    }
    addPlayerMutation.mutate({
      name: playerName.trim(),
      jersey_number: num,
      position,
      is_non_player: false,
      member_type: 'PLAYER',
      team_id: playerTeamId || null,
      photo_url: playerPhotoUrl ? playerPhotoUrl.trim() : null,
    });
  };

  const openEditPlayerModal = (player) => {
    const nonPlayer = Boolean(
      player.is_non_player || player.position === 'SUP' || player.jersey_number === 0
    );
    setEditingPlayer(player);
    setEditIsNonPlayer(nonPlayer);
    setEditPlayerName(player.name || '');
    setEditPlayerJersey(String(player.jersey_number || 10));
    setEditPlayerPos(nonPlayer ? 'FW' : player.position || 'FW');
    setEditSupporterDetails(player.details || 'Team Supporter');
    setEditPlayerTeamId(player.team_id || '');
    setEditPlayerPhotoUrl(player.photo_url || '');
    setEditPlayerError('');
  };

  const openDeletePlayerModal = (player) => {
    setPlayerToDelete(player);
    setDeletePlayerError('');
  };

  const handleBulkUpload = (e) => {
    e.preventDefault();
    setBulkFeedback('');
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setBulkFeedback('Enter at least one line: Name, JerseyNumber, Position');
      return;
    }
    const parsed = [];
    for (const line of lines) {
      const parts = line.split(',').map((s) => s.trim());
      const name = parts[0];
      const num = Number(parts[1] || 10);
      const pos = (parts[2] || 'MF').toUpperCase();
      if (name && ['GK', 'CB', 'MF', 'FW'].includes(pos)) {
        parsed.push({
          tournament_id: tournament?.id || '11111111-1111-1111-1111-111111111111',
          name,
          jersey_number: num,
          position: pos,
        });
      }
    }
    if (parsed.length === 0) {
      setBulkFeedback('Invalid format. Use: Name, JerseyNumber, Position (GK/CB/MF/FW)');
      return;
    }
    bulkAddPlayersMutation.mutate(parsed);
  };

  const handleCreateFixture = (e) => {
    e.preventDefault();
    setFixtureError('');
    const hId = homeTeamId || teams[0]?.id;
    const aId = awayTeamId || teams[1]?.id;
    if (!hId || !aId || hId === aId) {
      setFixtureError('Select two different teams.');
      return;
    }
    createMatchMutation.mutate({
      match_number: Number(matchNumber) || matches.length + 1,
      home_team_id: hId,
      away_team_id: aId,
      venue: venue.trim() || 'Institute Main Arena',
      kickoff_time: kickoffTime
        ? new Date(kickoffTime).toISOString()
        : new Date(Date.now() + 86400000).toISOString(),
    });
  };

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch =
        !playerSearch.trim() ||
        p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
        (p.details && p.details.toLowerCase().includes(playerSearch.toLowerCase())) ||
        String(p.jersey_number).includes(playerSearch.trim());
      const matchesPosition =
        positionFilter === 'ALL'
          ? true
          : positionFilter === 'SUP'
          ? Boolean(p.is_non_player || p.position === 'SUP')
          : !p.is_non_player && p.position === positionFilter;
      const matchesAllocation =
        allocationFilter === 'ALL' ||
        (allocationFilter === 'ALLOCATED' && p.team_id) ||
        (allocationFilter === 'UNALLOCATED' && !p.team_id) ||
        allocationFilter === `team:${p.team_id}`;
      return matchesSearch && matchesPosition && matchesAllocation;
    });
  }, [players, playerSearch, positionFilter, allocationFilter]);

  const activePlayersOnly = players.filter((p) => !p.is_non_player && p.position !== 'SUP');
  const supporterCount = players.filter((p) => p.is_non_player || p.position === 'SUP').length;
  const gkCount = activePlayersOnly.filter((p) => p.is_goalkeeper || p.position === 'GK').length;
  const outfieldCount = activePlayersOnly.filter(
    (p) => !p.is_goalkeeper && p.position !== 'GK'
  ).length;
  const allocatedCount = activePlayersOnly.filter((p) => p.team_id).length;
  const removalMutation = pendingRemoval?.kind === 'fixture' ? deleteMatchMutation : deleteAnnouncementMutation;

  return (
    <div className="space-y-5">
      {activeTab === 'players' && players.length > 0 && (
        <div className="flex justify-end">
          <Button variant="danger" size="sm" onClick={() => setShowClearAllConfirm(true)}>
            <Trash2 size={16} aria-hidden="true" /> Clear All ({players.length})
          </Button>
        </div>
      )}

      {activeTab === 'overview' && (
        <section aria-label="League overview" className="grid grid-cols-2 min-[950px]:grid-cols-5 gap-2.5">
          {[
            { label: 'Teams', value: loadingTeams ? '—' : teams.length, icon: UserCog, detail: 'Registered clubs' },
            { label: 'Players', value: loadingPlayers ? '—' : activePlayersOnly.length, icon: Users, detail: loadingPlayers ? '' : `${gkCount} GK · ${outfieldCount} outfield${supporterCount ? ` · ${supporterCount} supporters` : ''}` },
            { label: 'Allocated', value: loadingPlayers ? '—' : `${allocatedCount}/${activePlayersOnly.length}`, icon: LayoutGrid, detail: loadingPlayers ? '' : `${activePlayersOnly.length - allocatedCount} unallocated` },
            { label: 'Upcoming', value: loadingFixtures ? '—' : matches.filter((match) => match.status === 'scheduled' && Date.parse(match.kickoff_time) >= Date.now()).length, icon: Calendar, detail: 'Scheduled fixtures' },
            { label: 'Completed', value: loadingFixtures ? '—' : matches.filter((match) => match.status === 'completed').length, icon: CheckCircle2, detail: 'Final results' },
          ].map(({ label, value, icon: Icon, detail }) => (
            <Card key={label} className="staff-stat">
              <Icon size={20} aria-hidden="true" />
              <span className="text-sm font-semibold">{label}</span>
              <strong>{value}</strong>
              {detail && <small>{detail}</small>}
            </Card>
          ))}
        </section>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[color:var(--staff-blue)]" />
                <h2 className="text-base font-semibold text-[color:var(--staff-ink)]">Tournament Settings</h2>
              </div>
              {tournament?.status && <Badge variant="accent">{tournament.status.replaceAll('_', ' ')}</Badge>}
            </div>

            {settingsSavedMsg && (
              <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[color:var(--staff-success)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{settingsSavedMsg}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                if (!tournament?.id) return;
                updateTournamentMutation.mutate({
                  id: tournament.id,
                  updates: {
                    name: formData.get('name'),
                    season_year: Number(formData.get('season_year')),
                    status: formData.get('status'),
                    rules_summary: formData.get('rules_summary'),
                  },
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tournament Name"
                  name="name"
                  defaultValue={tournament?.name || 'Betterinu Football league'}
                  required
                />
                <Input
                  label="Season Year"
                  name="season_year"
                  type="number"
                  defaultValue={tournament?.season_year || 2026}
                  required
                />
              </div>

              <div>
                <label htmlFor="staff-tournament-stage" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                  Stage
                </label>
                <select
                  id="staff-tournament-stage"
                  name="status"
                  defaultValue={tournament?.status || 'in_progress'}
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3.5 py-2.5 text-sm text-[color:var(--staff-ink)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                >
                  <option value="draft">Draft</option>
                  <option value="allocation">Allocation</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="staff-tournament-rules" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                  Rules Summary
                </label>
                <textarea
                  id="staff-tournament-rules"
                  name="rules_summary"
                  rows={2}
                  defaultValue={
                    tournament?.rules_summary ||
                    '3 Teams, 15 Players (3 GKs, 12 Outfield). Dual Spin-Wheel Draft. 5-a-side format.'
                  }
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3.5 py-2 text-sm text-[color:var(--staff-ink)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateTournamentMutation.isPending}
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </Button>
              </div>
            </form>
          </Card>

          <Card className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[color:var(--staff-blue)]" />
                <h2 className="text-base font-semibold text-[color:var(--staff-ink)]">Announcements</h2>
              </div>
              <span className="text-xs text-[color:var(--staff-muted)]">{announcements.length}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!announcementTitle.trim() || !announcementBody.trim() || saveAnnouncementMutation.isPending) return;
                saveAnnouncementMutation.mutate({
                  id: editingAnnouncementId,
                  tournament_id: tournament?.id || '11111111-1111-1111-1111-111111111111',
                  title: announcementTitle.trim(),
                  body: announcementBody.trim(),
                });
              }}
              className="space-y-3"
            >
              <Input
                label="Headline"
                placeholder="Matchday update"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                required
              />
              <div>
                <label htmlFor="announcement-message" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1">
                  Message
                </label>
                <textarea
                  id="announcement-message"
                  rows={2}
                  placeholder="Enter announcement..."
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  required
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                />
              </div>
              {(saveAnnouncementMutation.isError || deleteAnnouncementMutation.isError) && (
                <p role="alert" className="text-xs text-[color:var(--staff-danger)]">The announcement could not be saved or removed. Try again.</p>
              )}
              {editingAnnouncementId && (
                <Button type="button" size="sm" variant="secondary" disabled={saveAnnouncementMutation.isPending} onClick={() => {
                  setEditingAnnouncementId(null);
                  setAnnouncementTitle('');
                  setAnnouncementBody('');
                  saveAnnouncementMutation.reset();
                }}>Cancel editing</Button>
              )}
              <Button
                type="submit"
                size="sm"
                className="w-full"
                isLoading={saveAnnouncementMutation.isPending}
              >
                <Plus className="w-3.5 h-3.5" />
                {editingAnnouncementId ? 'Save published update' : 'Publish'}
              </Button>
            </form>

            {announcements.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pt-2 border-t border-[color:var(--staff-line)]">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[color:var(--staff-ink)]">{a.title}</p>
                      <p className="text-[11px] text-[color:var(--staff-muted)] mt-0.5">{a.body}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" className="arena-icon-button" disabled={saveAnnouncementMutation.isPending} aria-label={`Edit announcement ${a.title}`}
                        onClick={() => {
                          setEditingAnnouncementId(a.id);
                          setAnnouncementTitle(a.title);
                          setAnnouncementBody(a.body);
                          saveAnnouncementMutation.reset();
                        }}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="arena-icon-button staff-remove-icon"
                        disabled={deleteAnnouncementMutation.isPending || saveAnnouncementMutation.isPending}
                        onClick={() => { deleteAnnouncementMutation.reset(); setPendingRemoval({ kind: 'announcement', item: a }); }}
                        aria-label={`Delete announcement ${a.title}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: PLAYERS (Add, Edit, Delete, Transparent PNG Upload) */}
      {activeTab === 'players' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Add Player / Non-Player Supporter Panel */}
          <Card className="lg:col-span-4 space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
              <h2 className="text-base font-semibold text-[color:var(--staff-ink)] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[color:var(--staff-blue)]" />
                {isNonPlayerMode ? 'Add Non-Player Supporter' : 'Add Player'}
              </h2>
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--staff-blue)] hover:underline"
              >
                <Upload className="w-3.5 h-3.5" />
                Bulk CSV
              </button>
            </div>

            {/* Segmented Mode Toggle: On-Pitch Player vs Non-Player Team Supporter */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--staff-subtle)] border border-[color:var(--staff-line)]">
              <button
                type="button"
                onClick={() => {
                  setIsNonPlayerMode(false);
                  setPlayerError('');
                }}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  !isNonPlayerMode
                    ? 'bg-[var(--staff-blue)] text-white shadow-sm'
                    : 'text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]'
                }`}
              >
                On-Pitch Player
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNonPlayerMode(true);
                  setPlayerError('');
                }}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  isNonPlayerMode
                    ? 'bg-[var(--staff-blue)] text-white shadow-sm'
                    : 'text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]'
                }`}
              >
                Non-Player (Supporter)
              </button>
            </div>

            {playerError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[color:var(--staff-danger)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{playerError}</span>
              </div>
            )}

            {playerSuccess && (
              <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[color:var(--staff-success)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{playerSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddPlayer} className="space-y-3.5">
              <Input
                label={isNonPlayerMode ? 'Supporter Name' : 'Player Name'}
                placeholder={isNonPlayerMode ? 'e.g. Alex Mathew' : 'e.g. Lionel Messi'}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />

              {isNonPlayerMode ? (
                <div>
                  <label htmlFor="staff-supporterDetails" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                    Supporter Role &amp; Details
                  </label>
                  <textarea
                    id="staff-supporterDetails"
                    rows={2}
                    placeholder="e.g. Team Supporter, Cheer Squad, Batch Coordinator..."
                    value={supporterDetails}
                    onChange={(e) => setSupporterDetails(e.target.value)}
                    className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)] placeholder-[color:var(--staff-muted)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                  />
                  <span className="text-[10px] text-[color:var(--staff-muted)] block mt-1">
                    Non-players support the team off the pitch and do not take up a 5v5 playing slot.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Jersey Number"
                    type="number"
                    min="1"
                    max="99"
                    placeholder="10"
                    value={jerseyNumber}
                    onChange={(e) => setJerseyNumber(e.target.value)}
                    required
                  />
                  <div>
                    <label htmlFor="staff-position" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                      Position
                    </label>
                    <select
                      id="staff-position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      aria-label="Position"
                      className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2.5 text-sm text-[color:var(--staff-ink)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                    >
                      <option value="GK">GK — Goalkeeper</option>
                      <option value="CB">CB — Defender</option>
                      <option value="MF">MF — Midfielder</option>
                      <option value="FW">FW — Forward</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="staff-playerTeamId" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                  {isNonPlayerMode ? 'Supporting Team' : 'Team Assignment'}
                </label>
                <select
                  id="staff-playerTeamId"
                  value={playerTeamId}
                  onChange={(e) => setPlayerTeamId(e.target.value)}
                  aria-label="Team Assignment"
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                >
                  <option value="">
                    {isNonPlayerMode ? 'All Teams / Unassigned' : 'Unallocated (Draft Pool)'}
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.short_code})
                    </option>
                  ))}
                </select>
              </div>

              <PlayerImageUploader
                value={playerPhotoUrl}
                onChange={setPlayerPhotoUrl}
                label={
                  isNonPlayerMode
                    ? 'Supporter Photo (Optional — Not Required)'
                    : 'eFootball Player Card Image (Optional)'
                }
              />

              {(playerName.trim() || playerPhotoUrl) && (
                <div className="pt-2 border-t border-[color:var(--staff-line)]">
                  <div className="max-w-[175px] mx-auto">
                    <PlayerCard
                      player={{
                        id: 'preview',
                        name: playerName.trim() || (isNonPlayerMode ? 'SUPPORTER' : 'PLAYER'),
                        jersey_number: isNonPlayerMode ? 0 : Number(jerseyNumber) || 10,
                        position: isNonPlayerMode ? 'SUP' : position,
                        is_non_player: isNonPlayerMode,
                        details: supporterDetails.trim() || 'Team Supporter',
                        is_goalkeeper: !isNonPlayerMode && position === 'GK',
                        photo_url: playerPhotoUrl || null,
                      }}
                      team={teams.find((t) => t.id === playerTeamId)}
                      variant="full"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={addPlayerMutation.isPending}
              >
                <Plus className="w-4 h-4" />
                {isNonPlayerMode ? 'Save Supporter' : 'Save Player'}
              </Button>
            </form>
          </Card>

          {/* Right: Players Grid & Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-3 rounded-xl bg-[var(--staff-surface)] border border-[color:var(--staff-line)] flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-[color:var(--staff-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player or supporter..."
                  aria-label="Search players or supporters"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[color:var(--staff-ink)] placeholder-[color:var(--staff-muted)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'GK', 'CB', 'MF', 'FW', 'SUP'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPositionFilter(pos)}
                    aria-pressed={positionFilter === pos}
                    className={`min-h-11 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      positionFilter === pos
                        ? 'bg-[var(--staff-blue)] text-white'
                        : 'bg-[var(--staff-subtle)] text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)] border border-[color:var(--staff-line)]'
                    }`}
                  >
                    {pos === 'SUP' ? 'Supporters' : pos}
                  </button>
                ))}

                <select
                  value={allocationFilter}
                  onChange={(e) => setAllocationFilter(e.target.value)}
                  aria-label="Filter by team or allocation status"
                  className="bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-2.5 py-1 text-xs text-[color:var(--staff-ink)]"
                >
                  <option value="ALL">All</option>
                  <option value="ALLOCATED">Allocated</option>
                  <option value="UNALLOCATED">Unallocated</option>
                  {teams.length > 0 && (
                    <optgroup label="Teams">
                      {teams.map((team) => <option key={team.id} value={`team:${team.id}`}>{team.name}</option>)}
                    </optgroup>
                  )}
                </select>

                <div className="flex items-center bg-[var(--staff-subtle)] rounded-lg border border-[color:var(--staff-line)] p-0.5">
                  <button
                    type="button"
                    onClick={() => setPlayerViewMode('cards')}
                    className={`p-1 rounded ${
                      playerViewMode === 'cards' ? 'bg-[var(--staff-blue)] text-white' : 'text-[color:var(--staff-muted)]'
                    }`}
                    aria-label="Card View"
                    aria-pressed={playerViewMode === 'cards'}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerViewMode('table')}
                    className={`p-1 rounded ${
                      playerViewMode === 'table' ? 'bg-[var(--staff-blue)] text-white' : 'text-[color:var(--staff-muted)]'
                    }`}
                    aria-label="Table View"
                    aria-pressed={playerViewMode === 'table'}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {loadingPlayers ? (
              <Card className="p-8 text-center text-sm text-[color:var(--staff-muted)]">
                Loading players...
              </Card>
            ) : filteredPlayers.length === 0 ? (
              <Card className="p-8 text-center text-sm text-[color:var(--staff-muted)]">
                No players found.
              </Card>
            ) : playerViewMode === 'cards' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
                {filteredPlayers.map((player) => {
                  const pTeam = teams.find((t) => t.id === player.team_id) || player.team;
                  const pStats = playerStatsMap[player.id] || {};
                  const pEvents = allEvents.filter((e) => e.player_id === player.id);
                  const tMatches = matches.filter(
                    (m) => m.home_team_id === player.team_id || m.away_team_id === player.team_id
                  );

                  return (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      team={pTeam}
                      size="xs"
                      stats={pStats}
                      matchEvents={pEvents}
                      teamMatches={tMatches}
                      onSelect={(p) => setSelectedPlayerForProfile(p)}
                      actionSlot={
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <button
                            type="button"
                            onClick={() => openEditPlayerModal(player)}
                            className="inline-flex items-center gap-0.5 font-medium text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]"
                            aria-label={`Edit ${player.name}`}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeletePlayerModal(player)}
                            className="inline-flex items-center gap-0.5 font-medium text-[color:var(--staff-danger)] hover:text-[color:var(--staff-danger)]"
                            aria-label={`Delete ${player.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Del</span>
                          </button>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto" role="region" aria-label="Player roster table" tabIndex={0}>
                  <table className="w-full min-w-[570px] text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[color:var(--staff-line)] text-[11px] font-semibold uppercase tracking-wider text-[color:var(--staff-muted)] bg-[var(--staff-subtle)]">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-4">Pos</th>
                        <th className="py-3 px-4">Team</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color:var(--staff-line)]">
                      {filteredPlayers.map((p) => {
                        const assignedTeam = teams.find((t) => t.id === p.team_id);
                        return (
                          <tr key={p.id} className="hover:bg-[var(--staff-subtle)]">
                            <td className="py-2.5 px-4 font-bold tabular-nums text-[color:var(--staff-muted)]">
                              {p.is_non_player ? 'SUP' : `#${p.jersey_number}`}
                            </td>
                            <td className="py-2.5 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedPlayerForProfile(p)}
                                className="inline-flex items-center gap-2.5 font-semibold text-[color:var(--staff-ink)] hover:text-[color:var(--staff-blue)] text-left"
                              >
                                <StaffPlayerAvatar player={p} />
                                <span>{p.name}{p.is_non_player && p.details && (
                                  <small className="block font-normal text-[color:var(--staff-muted)]">{p.details}</small>
                                )}</span>
                              </button>
                            </td>
                            <td className="py-2.5 px-4">
                              <Badge
                                variant={
                                  p.is_non_player || p.position === 'GK' ? 'accent' : 'neutral'
                                }
                              >
                                {p.is_non_player ? 'SUPPORTER' : p.position}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4 text-xs">
                              {assignedTeam ? (
                                <span className="inline-flex items-center gap-1.5 text-[color:var(--staff-ink)]">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: assignedTeam.color_code }}
                                  />
                                  {assignedTeam.name}
                                </span>
                              ) : (
                                <span className="text-[color:var(--staff-muted)]">Unallocated</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => openEditPlayerModal(p)}
                                className="text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)] p-1"
                                aria-label={`Edit ${p.name}`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeletePlayerModal(p)}
                                className="text-[color:var(--staff-muted)] hover:text-[color:var(--staff-danger)] p-1"
                                aria-label={`Delete ${p.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TEAMS & LIVE DRAG-AND-DROP ASSIGNMENT */}
      {activeTab === 'teams' && (
        <div className="space-y-5">
          <div className="flex items-center gap-1.5 bg-[var(--staff-surface)] p-1 rounded-xl border border-[color:var(--staff-line)] w-fit">
            <button
              type="button"
              onClick={() => setTeamsSubView('wheel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                teamsSubView === 'wheel'
                  ? 'bg-[var(--staff-blue)] text-white'
                  : 'text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]'
              }`}
            >
              Drag &amp; Drop Assignment
            </button>
            <button
              type="button"
              onClick={() => setTeamsSubView('directory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                teamsSubView === 'directory'
                  ? 'bg-[var(--staff-blue)] text-white'
                  : 'text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]'
              }`}
            >
              Team Settings ({teams.length})
            </button>
          </div>

          {loadingPlayers ? (
            <Card className="p-10 text-center text-sm text-[color:var(--staff-muted)]">Loading...</Card>
          ) : teamsSubView === 'wheel' ? (
            <LiveTeamAssignmentBoard
              players={players}
              teams={teams}
              onSelectPlayer={(p) => setSelectedPlayerForProfile(p)}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {teams.map((team) => {
                const roster = players.filter((p) => p.team_id === team.id);
                const isEditing = editingTeamId === team.id;

                return (
                  <Card key={team.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
                      <div className="flex items-center gap-3">
                        <StaffCrest club={team} />
                        <div>
                          <h3 className="font-semibold text-[color:var(--staff-ink)]">{team.name}</h3>
                          <p className="text-xs text-[color:var(--staff-muted)]">
                            {team.manager?.full_name || team.manager?.email || 'No manager'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            setEditingTeamId(null);
                          } else {
                            setEditingTeamId(team.id);
                            setEditTeamName(team.name);
                            setEditTeamCode(team.short_code);
                            setEditTeamColor(team.color_code);
                            setEditTeamManagerId(team.manager_id || '');
                          }
                        }}
                        className="p-2 rounded-lg bg-[var(--staff-subtle)] text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)] border border-[color:var(--staff-line)]"
                        aria-label={`Configure ${team.name}`}
                      >
                        <UserCog className="w-4 h-4" />
                      </button>
                    </div>

                    {isEditing ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          updateTeamMutation.mutate({
                            id: team.id,
                            updates: {
                              name: editTeamName.trim(),
                              short_code: editTeamCode.trim().toUpperCase(),
                              color_code: editTeamColor,
                              manager_id: editTeamManagerId || null,
                            },
                          });
                        }}
                        className="space-y-3 p-3 rounded-xl bg-[var(--staff-subtle)] border border-[color:var(--staff-line)]"
                      >
                        <Input
                          label="Team Name"
                          value={editTeamName}
                          onChange={(e) => setEditTeamName(e.target.value)}
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Code"
                            maxLength={4}
                            value={editTeamCode}
                            onChange={(e) => setEditTeamCode(e.target.value)}
                            required
                          />
                          <div>
                            <label htmlFor="staff-editTeamColor" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                              Color
                            </label>
                            <input
                              id="staff-editTeamColor"
                              type="color"
                              value={editTeamColor}
                              onChange={(e) => setEditTeamColor(e.target.value)}
                              className="w-full h-10 rounded-lg bg-[var(--staff-surface)] border border-[color:var(--staff-line)] p-1 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="staff-editTeamManagerId" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                            Manager
                          </label>
                          <select
                            id="staff-editTeamManagerId"
                            value={editTeamManagerId}
                            onChange={(e) => setEditTeamManagerId(e.target.value)}
                            className="w-full bg-[var(--staff-surface)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)]"
                          >
                            <option value="">Unassigned</option>
                            {managerProfiles.map((mp) => (
                              <option key={mp.id} value={mp.id}>
                                {mp.full_name} ({mp.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            type="submit"
                            size="sm"
                            className="flex-1"
                            isLoading={updateTeamMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingTeamId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-[color:var(--staff-muted)]">
                          <span>Squad</span>
                          <span className="font-semibold text-[color:var(--staff-ink)] tabular-nums">
                            {roster.length} / 5
                          </span>
                        </div>
                        {roster.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPlayerForProfile(p)}
                            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[var(--staff-subtle)] hover:border-[color:var(--staff-blue)] border border-[color:var(--staff-line)] text-left transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[color:var(--staff-muted)] tabular-nums w-6">
                                #{p.jersey_number}
                              </span>
                              <span className="text-sm font-medium text-[color:var(--staff-ink)]">{p.name}</span>
                            </div>
                            <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>
                              {p.position}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FIXTURES */}
      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-4 space-y-4 h-fit">
            <h2 className="text-base font-semibold text-[color:var(--staff-ink)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[color:var(--staff-blue)]" />
              Schedule Fixture
            </h2>

            {fixtureError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[color:var(--staff-danger)]">
                {fixtureError}
              </div>
            )}

            <form onSubmit={handleCreateFixture} className="space-y-3.5">
              <Input
                label="Match Number"
                type="number"
                min="1"
                placeholder={String(matches.length + 1)}
                value={matchNumber}
                onChange={(e) => setMatchNumber(e.target.value)}
              />
              <div>
                <label htmlFor="staff-homeTeamId" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                  Home Team
                </label>
                <select
                  id="staff-homeTeamId"
                  value={homeTeamId || teams[0]?.id || ''}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3.5 py-2.5 text-sm text-[color:var(--staff-ink)]"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="staff-awayTeamId" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                  Away Team
                </label>
                <select
                  id="staff-awayTeamId"
                  value={awayTeamId || teams[1]?.id || ''}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3.5 py-2.5 text-sm text-[color:var(--staff-ink)]"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Kickoff"
                type="datetime-local"
                value={kickoffTime}
                onChange={(e) => setKickoffTime(e.target.value)}
              />
              <Input
                label="Venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full"
                isLoading={createMatchMutation.isPending}
              >
                <Plus className="w-4 h-4" />
                Create Fixture
              </Button>
            </form>
          </Card>

          <Card className="lg:col-span-8 space-y-4">
            <h2 className="text-base font-semibold text-[color:var(--staff-ink)]">
              Fixtures ({matches.length})
            </h2>

            {loadingFixtures ? <p className="staff-loading" role="status">Loading fixtures…</p> : matches.length === 0 ? (
              <p className="text-sm text-[color:var(--staff-muted)] py-8 text-center">No fixtures scheduled.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => {
                  const isEditingThis = editingMatch?.id === m.id;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] space-y-3"
                    >
                      <div className="staff-match-preview"><StaffMatchSummary match={m} /></div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" size="sm"
                          onClick={() => { updateMatchMutation.reset(); setEditingMatch(isEditingThis ? null : { ...m }); }}
                        >
                          <Edit3 size={16} aria-hidden="true" /> {isEditingThis ? 'Close' : 'Edit'}
                        </Button>
                        <Button variant="destructive" size="sm" aria-label={`Delete Match ${m.match_number}`}
                          onClick={() => { deleteMatchMutation.reset(); setPendingRemoval({ kind: 'fixture', item: m }); }}
                        >
                          <Trash2 size={16} aria-hidden="true" /> Delete
                        </Button>
                      </div>

                      {isEditingThis && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            updateMatchMutation.mutate({
                              id: m.id,
                              updates: {
                                home_score: Number(editingMatch.home_score),
                                away_score: Number(editingMatch.away_score),
                                status: editingMatch.status,
                                venue: editingMatch.venue,
                              },
                            });
                          }}
                          className="pt-3 border-t border-[color:var(--staff-line)] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                        >
                          {updateMatchMutation.isError && <p role="alert" className="sm:col-span-4 text-sm text-[color:var(--staff-danger)]">The fixture could not be saved. Try again.</p>}
                          <Input
                            label={`${m.home_team?.short_code || 'Home'} Score`}
                            type="number"
                            min="0"
                            value={editingMatch.home_score}
                            onChange={(e) =>
                              setEditingMatch({ ...editingMatch, home_score: e.target.value })
                            }
                          />
                          <Input
                            label={`${m.away_team?.short_code || 'Away'} Score`}
                            type="number"
                            min="0"
                            value={editingMatch.away_score}
                            onChange={(e) =>
                              setEditingMatch({ ...editingMatch, away_score: e.target.value })
                            }
                          />
                          <div>
                            <label htmlFor="staff-editingMatch-status" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                              Status
                            </label>
                            <select
                              id="staff-editingMatch-status"
                              value={editingMatch.status}
                              onChange={(e) =>
                                setEditingMatch({ ...editingMatch, status: e.target.value })
                              }
                              className="w-full bg-[var(--staff-surface)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)]"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="live">Live</option>
                              <option value="half_time">Half-Time</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                          <Button
                            type="submit"
                            size="sm"
                            isLoading={updateMatchMutation.isPending}
                          >
                            Save
                          </Button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {pendingRemoval && (
        <ModalDialog className="staff-dialog" labelledBy="staff-remove-title"
          onDismiss={() => { if (!removalMutation.isPending) setPendingRemoval(null); }}>
          <Card className="space-y-4">
            <h2 id="staff-remove-title" className="text-xl font-bold">Delete {pendingRemoval.kind}?</h2>
            <p className="text-sm text-[color:var(--staff-muted)]">
              {pendingRemoval.kind === 'fixture' ? `Match #${pendingRemoval.item.match_number}` : pendingRemoval.item.title}
            </p>
            {removalMutation.isError && (
              <p role="alert" className="text-sm text-[color:var(--staff-danger)]">The {pendingRemoval.kind} could not be deleted. Try again.</p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" disabled={removalMutation.isPending} onClick={() => setPendingRemoval(null)}>Cancel</Button>
              <Button variant="danger" isLoading={removalMutation.isPending}
                onClick={() => removalMutation.mutate(pendingRemoval.item.id, { onSuccess: () => setPendingRemoval(null) })}>
                Delete {pendingRemoval.kind}
              </Button>
            </div>
          </Card>
        </ModalDialog>
      )}

      {/* EDIT PLAYER / SUPPORTER MODAL */}
      {editingPlayer && (
        <ModalDialog className="staff-dialog" labelledBy="edit-player-modal-title"
          onDismiss={() => { if (!updatePlayerMutation.isPending) setEditingPlayer(null); }}>
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
              <h3 id="edit-player-modal-title" className="font-semibold text-[color:var(--staff-ink)]">
                {editIsNonPlayer ? 'Edit Non-Player Supporter' : 'Edit Player'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlayer(null)}
                className="text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]"
                aria-label="Close edit modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editPlayerError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[color:var(--staff-danger)]">
                {editPlayerError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--staff-subtle)] border border-[color:var(--staff-line)]">
              <button
                type="button"
                onClick={() => setEditIsNonPlayer(false)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  !editIsNonPlayer
                    ? 'bg-[var(--staff-blue)] text-white'
                    : 'text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]'
                }`}
              >
                On-Pitch Player
              </button>
              <button
                type="button"
                onClick={() => setEditIsNonPlayer(true)}
                className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all ${
                  editIsNonPlayer
                    ? 'bg-[var(--staff-blue)] text-white'
                    : 'text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]'
                }`}
              >
                Non-Player (Supporter)
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditPlayerError('');
                if (!editPlayerName.trim()) {
                  setEditPlayerError('Name is required.');
                  return;
                }
                updatePlayerMutation.mutate({
                  id: editingPlayer.id,
                  updates: editIsNonPlayer
                    ? {
                        name: editPlayerName.trim(),
                        details: editSupporterDetails.trim() || 'Team Supporter',
                        is_non_player: true,
                        member_type: 'SUPPORTER',
                        position: 'SUP',
                        jersey_number: 0,
                        team_id: editPlayerTeamId || null,
                        photo_url: editPlayerPhotoUrl ? editPlayerPhotoUrl.trim() : null,
                      }
                    : {
                        name: editPlayerName.trim(),
                        jersey_number: Number(editPlayerJersey) || 10,
                        position: editPlayerPos,
                        is_non_player: false,
                        member_type: 'PLAYER',
                        team_id: editPlayerTeamId || null,
                        photo_url: editPlayerPhotoUrl ? editPlayerPhotoUrl.trim() : null,
                      },
                });
              }}
              className="space-y-3.5"
            >
              <Input
                label={editIsNonPlayer ? 'Supporter Name' : 'Player Name'}
                id="staff-edit-player-name"
                value={editPlayerName}
                onChange={(e) => setEditPlayerName(e.target.value)}
                required
              />

              {editIsNonPlayer ? (
                <div>
                  <label htmlFor="staff-editSupporterDetails" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                    Supporter Role &amp; Details
                  </label>
                  <textarea
                    id="staff-editSupporterDetails"
                    rows={2}
                    placeholder="e.g. Team Supporter, Cheer Squad, Batch Coordinator..."
                    value={editSupporterDetails}
                    onChange={(e) => setEditSupporterDetails(e.target.value)}
                    className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)] focus:outline-none focus:border-[color:var(--staff-blue)]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Jersey Number"
                    type="number"
                    min="1"
                    max="99"
                    id="staff-edit-jersey-number"
                    value={editPlayerJersey}
                    onChange={(e) => setEditPlayerJersey(e.target.value)}
                    required
                  />
                  <div>
                    <label htmlFor="staff-editPlayerPos" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                      Position
                    </label>
                    <select
                      id="staff-editPlayerPos"
                      value={editPlayerPos}
                      onChange={(e) => setEditPlayerPos(e.target.value)}
                      className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2.5 text-sm text-[color:var(--staff-ink)]"
                    >
                      <option value="GK">GK — Goalkeeper</option>
                      <option value="CB">CB — Defender</option>
                      <option value="MF">MF — Midfielder</option>
                      <option value="FW">FW — Forward</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="staff-editPlayerTeamId" className="block text-xs font-medium text-[color:var(--staff-muted)] mb-1.5">
                  {editIsNonPlayer ? 'Supporting Team' : 'Team Assignment'}
                </label>
                <select
                  id="staff-editPlayerTeamId"
                  value={editPlayerTeamId}
                  onChange={(e) => setEditPlayerTeamId(e.target.value)}
                  className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg px-3 py-2 text-xs text-[color:var(--staff-ink)]"
                >
                  <option value="">
                    {editIsNonPlayer ? 'All Teams / Unassigned' : 'Unallocated (Draft Pool)'}
                  </option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.short_code})
                    </option>
                  ))}
                </select>
              </div>

              <PlayerImageUploader
                value={editPlayerPhotoUrl}
                onChange={setEditPlayerPhotoUrl}
                label={
                  editIsNonPlayer
                    ? 'Supporter Photo (Optional — Not Required)'
                    : 'eFootball Player Card Image (Optional)'
                }
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-[color:var(--staff-line)]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingPlayer(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={updatePlayerMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </ModalDialog>
      )}

      {/* DELETE PLAYER CONFIRMATION MODAL (With Team & Match Relationship Checks) */}
      {playerToDelete && (
        <ModalDialog className="staff-dialog" labelledBy="delete-player-modal-title"
          onDismiss={() => { if (!deletePlayerMutation.isPending) setPlayerToDelete(null); }}>
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
              <div className="flex items-center gap-2 text-[color:var(--staff-danger)]">
                <AlertTriangle className="w-5 h-5" />
                <h3 id="delete-player-modal-title" className="font-semibold text-[color:var(--staff-ink)]">
                  Delete Player
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className="text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]"
                aria-label="Close delete confirmation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-[color:var(--staff-ink)]">
                Are you sure you want to delete{' '}
                <strong className="text-[color:var(--staff-blue)]">
                  #{playerToDelete.jersey_number} {playerToDelete.name}
                </strong>{' '}
                ({playerToDelete.position})?
              </p>

              {(() => {
                const assignedTeam = teams.find((t) => t.id === playerToDelete.team_id);
                const relatedEvents = allEvents.filter(
                  (e) => e.player_id === playerToDelete.id
                );

                if (!assignedTeam && relatedEvents.length === 0) return null;

                return (
                  <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 space-y-1.5 text-xs text-[color:var(--staff-warning)]">
                    {assignedTeam && (
                      <p>
                        • Currently assigned to <strong>{assignedTeam.name}</strong>.
                      </p>
                    )}
                    {relatedEvents.length > 0 && (
                      <p>
                        • Referenced in <strong>{relatedEvents.length}</strong> recorded match{' '}
                        {relatedEvents.length === 1 ? 'event' : 'events'}.
                      </p>
                    )}
                  </div>
                );
              })()}

              {deletePlayerError && (
                <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[color:var(--staff-danger)]">
                  {deletePlayerError}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[color:var(--staff-line)]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPlayerToDelete(null)}
              >
                Cancel
              </Button>

              {playerToDelete.team_id && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  isLoading={updatePlayerMutation.isPending}
                  onClick={() => {
                    updatePlayerMutation.mutate(
                      {
                        id: playerToDelete.id,
                        updates: { team_id: null },
                      },
                      {
                        onSuccess: () => setPlayerToDelete(null),
                      }
                    );
                  }}
                >
                  Unassign Only
                </Button>
              )}

              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={deletePlayerMutation.isPending}
                onClick={() => deletePlayerMutation.mutate(playerToDelete.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Confirm Delete
              </Button>
            </div>
          </Card>
        </ModalDialog>
      )}

      {/* CLEAR ALL PLAYERS CONFIRMATION MODAL */}
      {showClearAllConfirm && (
        <ModalDialog className="staff-dialog" labelledBy="clear-players-modal-title"
          onDismiss={() => { if (!deleteAllPlayersMutation.isPending) setShowClearAllConfirm(false); }}>
          <Card className="w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
              <div className="flex items-center gap-2 text-[color:var(--staff-danger)]">
                <AlertTriangle className="w-5 h-5" />
                <h3 id="clear-players-modal-title" className="font-semibold text-[color:var(--staff-ink)]">Clear All Players</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[color:var(--staff-muted)] leading-relaxed">
              This will permanently remove all <strong className="text-[color:var(--staff-ink)]">{players.length}</strong> players so you can upload your own custom eFootball cards from scratch.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[color:var(--staff-line)]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowClearAllConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={deleteAllPlayersMutation.isPending}
                onClick={() => deleteAllPlayersMutation.mutate()}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete All Players
              </Button>
            </div>
          </Card>
        </ModalDialog>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <ModalDialog className="staff-dialog" labelledBy="bulk-players-modal-title"
          onDismiss={() => { if (!bulkAddPlayersMutation.isPending) setShowBulkModal(false); }}>
          <Card className="w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--staff-line)] pb-3">
              <h3 id="bulk-players-modal-title" className="font-semibold text-[color:var(--staff-ink)]">Bulk Import Players</h3>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-[color:var(--staff-muted)] hover:text-[color:var(--staff-ink)]"
                aria-label="Close bulk import modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[color:var(--staff-muted)]">
              Format: <code className="text-[color:var(--staff-blue)]">Name, JerseyNumber, Position</code> (GK, CB, MF, FW)
            </p>
            {bulkFeedback && (
              <div className="p-3 rounded-lg bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] text-xs text-[color:var(--staff-blue)]">
                {bulkFeedback}
              </div>
            )}
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <textarea
                aria-label="Players to import"
                rows={5}
                placeholder={'Cole Palmer, 20, MF\nWilliam Saliba, 2, CB'}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full bg-[var(--staff-subtle)] border border-[color:var(--staff-line)] rounded-lg p-3 text-xs text-[color:var(--staff-ink)] font-mono"
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowBulkModal(false)}
                >
                  Close
                </Button>
                <Button type="submit" isLoading={bulkAddPlayersMutation.isPending}>
                  Import
                </Button>
              </div>
            </form>
          </Card>
        </ModalDialog>
      )}

      {/* Player Profile Modal */}
      {selectedPlayerForProfile && (
        <PlayerProfileModal
          player={selectedPlayerForProfile}
          team={teams.find((t) => t.id === selectedPlayerForProfile.team_id)}
          stats={playerStatsMap[selectedPlayerForProfile.id] || {}}
          matchEvents={allEvents.filter((e) => e.player_id === selectedPlayerForProfile.id)}
          teamMatches={matches.filter(
            (m) =>
              m.home_team_id === selectedPlayerForProfile.team_id ||
              m.away_team_id === selectedPlayerForProfile.team_id
          )}
          onClose={() => setSelectedPlayerForProfile(null)}
        />
      )}
    </div>
  );
}
export default AdminDashboardPage;
