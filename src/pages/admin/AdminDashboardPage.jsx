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
  Trophy,
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
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
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

  // Add Player Form State
  const [playerName, setPlayerName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState('FW');
  const [playerTeamId, setPlayerTeamId] = useState('');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [playerSuccess, setPlayerSuccess] = useState('');

  // Player Directory Filter State
  const [playerSearch, setPlayerSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [allocationFilter, setAllocationFilter] = useState('ALL');
  const [playerViewMode, setPlayerViewMode] = useState('cards');

  // Edit Player Modal State
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editPlayerName, setEditPlayerName] = useState('');
  const [editPlayerJersey, setEditPlayerJersey] = useState('');
  const [editPlayerPos, setEditPlayerPos] = useState('FW');
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

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getTeams(),
  });

  const { data: matches = [] } = useQuery({
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
      setPlayerPhotoUrl('');
      setPlayerTeamId('');
      setPlayerError('');
      setPlayerSuccess(`Added ${created.name}`);
      setTimeout(() => setPlayerSuccess(''), 3000);
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player_stats'] });
    },
    onError: (err) => setPlayerError(err.message || 'Failed to add player'),
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

  const createAnnouncementMutation = useMutation({
    mutationFn: (payload) => tournamentsApi.createAnnouncement(payload),
    onSuccess: () => {
      setAnnouncementTitle('');
      setAnnouncementBody('');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id) => tournamentsApi.deleteAnnouncement(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements'] }),
  });

  // Handlers
  const handleAddPlayer = (e) => {
    e.preventDefault();
    setPlayerError('');
    setPlayerSuccess('');
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
      team_id: playerTeamId || null,
      photo_url: playerPhotoUrl ? playerPhotoUrl.trim() : null,
    });
  };

  const openEditPlayerModal = (player) => {
    setEditingPlayer(player);
    setEditPlayerName(player.name || '');
    setEditPlayerJersey(String(player.jersey_number || 10));
    setEditPlayerPos(player.position || 'FW');
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
        String(p.jersey_number).includes(playerSearch.trim());
      const matchesPosition = positionFilter === 'ALL' || p.position === positionFilter;
      const matchesAllocation =
        allocationFilter === 'ALL' ||
        (allocationFilter === 'ALLOCATED' && p.team_id) ||
        (allocationFilter === 'UNALLOCATED' && !p.team_id);
      return matchesSearch && matchesPosition && matchesAllocation;
    });
  }, [players, playerSearch, positionFilter, allocationFilter]);

  const gkCount = players.filter((p) => p.is_goalkeeper || p.position === 'GK').length;
  const outfieldCount = players.filter((p) => !p.is_goalkeeper && p.position !== 'GK').length;
  const allocatedCount = players.filter((p) => p.team_id).length;

  return (
    <div className="space-y-5">
      {/* Clean Page Title (Navigation is in the bottom bar) */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#F4F7F2]">
          {activeTab === 'players'
            ? 'Player Cards'
            : activeTab === 'teams'
            ? 'Teams & Draft'
            : activeTab === 'matches'
            ? 'Fixtures'
            : 'Overview'}
        </h1>
        {activeTab === 'players' && players.length > 0 && (
          <button
            type="button"
            onClick={() => setShowClearAllConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All ({players.length})</span>
          </button>
        )}
      </div>

      {/* Compact 4-Metric Strip */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 tabular-nums">
        <div className="p-3 sm:p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-[11px] text-[#9AA69B] block">Players</span>
          <p className="text-lg sm:text-2xl font-bold text-[#F4F7F2] mt-0.5">{players.length}</p>
          <span className="text-[10px] text-[#9AA69B] hidden sm:block">
            {gkCount} GK · {outfieldCount} Outfield
          </span>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-[11px] text-[#9AA69B] block">Allocated</span>
          <p className="text-lg sm:text-2xl font-bold text-[#B8F34A] mt-0.5">
            {allocatedCount}/{players.length}
          </p>
          <span className="text-[10px] text-[#9AA69B] hidden sm:block">
            {players.length - allocatedCount} unallocated
          </span>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-[11px] text-[#9AA69B] block">Teams</span>
          <p className="text-lg sm:text-2xl font-bold text-[#F4F7F2] mt-0.5">{teams.length}</p>
          <span className="text-[10px] text-[#9AA69B] hidden sm:block">5-a-side</span>
        </div>
        <div className="p-3 sm:p-4 rounded-xl bg-[#141414] border border-[#262626]">
          <span className="text-[11px] text-[#9AA69B] block">Fixtures</span>
          <p className="text-lg sm:text-2xl font-bold text-[#F4F7F2] mt-0.5">{matches.length}</p>
          <span className="text-[10px] text-[#9AA69B] hidden sm:block">
            {matches.filter((m) => m.status === 'completed').length} completed
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#B8F34A]" />
                <h2 className="text-base font-semibold text-[#F4F7F2]">Tournament Settings</h2>
              </div>
              <Badge variant="accent">{tournament?.status?.toUpperCase() || 'IN_PROGRESS'}</Badge>
            </div>

            {settingsSavedMsg && (
              <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
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
                  defaultValue={tournament?.name || 'BetterInU Super Cup'}
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
                <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                  Stage
                </label>
                <select
                  name="status"
                  defaultValue={tournament?.status || 'in_progress'}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F7F2] focus:outline-none focus:border-[#B8F34A]"
                >
                  <option value="draft">Draft</option>
                  <option value="allocation">Allocation</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                  Rules Summary
                </label>
                <textarea
                  name="rules_summary"
                  rows={2}
                  defaultValue={
                    tournament?.rules_summary ||
                    '3 Teams, 15 Players (3 GKs, 12 Outfield). Dual Spin-Wheel Draft. 5-a-side format.'
                  }
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3.5 py-2 text-sm text-[#F4F7F2] focus:outline-none focus:border-[#B8F34A]"
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
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#B8F34A]" />
                <h2 className="text-base font-semibold text-[#F4F7F2]">Announcements</h2>
              </div>
              <span className="text-xs text-[#9AA69B]">{announcements.length}</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!announcementTitle.trim() || !announcementBody.trim()) return;
                createAnnouncementMutation.mutate({
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
              />
              <div>
                <label className="block text-xs font-medium text-[#9AA69B] mb-1">
                  Message
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter announcement..."
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F4F7F2] focus:outline-none focus:border-[#B8F34A]"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="w-full"
                isLoading={createAnnouncementMutation.isPending}
              >
                <Plus className="w-3.5 h-3.5" />
                Publish
              </Button>
            </form>

            {announcements.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pt-2 border-t border-[#262626]">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-[#202020] border border-[#303030] flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F4F7F2]">{a.title}</p>
                      <p className="text-[11px] text-[#9AA69B] mt-0.5">{a.body}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteAnnouncementMutation.mutate(a.id)}
                      className="text-[#9AA69B] hover:text-[#EF4444] p-1 shrink-0"
                      aria-label={`Delete announcement ${a.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
          {/* Left: Add Player Panel */}
          <Card className="lg:col-span-4 space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h2 className="text-base font-semibold text-[#F4F7F2] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#B8F34A]" />
                Add Player
              </h2>
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8F34A] hover:underline"
              >
                <Upload className="w-3.5 h-3.5" />
                Bulk CSV
              </button>
            </div>

            {playerError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{playerError}</span>
              </div>
            )}

            {playerSuccess && (
              <div className="p-3 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{playerSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddPlayer} className="space-y-3.5">
              <Input
                label="Player Name"
                placeholder="e.g. Lionel Messi"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
              />

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
                  <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    aria-label="Position"
                    className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3 py-2.5 text-sm text-[#F4F7F2] focus:outline-none focus:border-[#B8F34A]"
                  >
                    <option value="GK">GK — Goalkeeper</option>
                    <option value="CB">CB — Defender</option>
                    <option value="MF">MF — Midfielder</option>
                    <option value="FW">FW — Forward</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                  Team Assignment
                </label>
                <select
                  value={playerTeamId}
                  onChange={(e) => setPlayerTeamId(e.target.value)}
                  aria-label="Team Assignment"
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F4F7F2] focus:outline-none focus:border-[#B8F34A]"
                >
                  <option value="">Unallocated (Draft Pool)</option>
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
              />

              {(playerName.trim() || playerPhotoUrl) && (
                <div className="pt-2 border-t border-[#262626]">
                  <div className="max-w-[175px] mx-auto">
                    <PlayerCard
                      player={{
                        id: 'preview',
                        name: playerName.trim() || 'PLAYER',
                        jersey_number: Number(jerseyNumber) || 10,
                        position,
                        is_goalkeeper: position === 'GK',
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
                Save Player
              </Button>
            </form>
          </Card>

          {/* Right: Players Grid & Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] flex flex-wrap items-center justify-between gap-2.5">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-[#9AA69B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search player..."
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#F4F7F2] placeholder-[#9AA69B]/60 focus:outline-none focus:border-[#B8F34A]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {['ALL', 'GK', 'CB', 'MF', 'FW'].map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPositionFilter(pos)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      positionFilter === pos
                        ? 'bg-[#B8F34A] text-[#090909]'
                        : 'bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}

                <select
                  value={allocationFilter}
                  onChange={(e) => setAllocationFilter(e.target.value)}
                  aria-label="Filter by allocation status"
                  className="bg-[#202020] border border-[#303030] rounded-lg px-2.5 py-1 text-xs text-[#F4F7F2]"
                >
                  <option value="ALL">All</option>
                  <option value="ALLOCATED">Allocated</option>
                  <option value="UNALLOCATED">Unallocated</option>
                </select>

                <div className="flex items-center bg-[#202020] rounded-lg border border-[#303030] p-0.5">
                  <button
                    type="button"
                    onClick={() => setPlayerViewMode('cards')}
                    className={`p-1 rounded ${
                      playerViewMode === 'cards' ? 'bg-[#B8F34A] text-[#090909]' : 'text-[#9AA69B]'
                    }`}
                    aria-label="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerViewMode('table')}
                    className={`p-1 rounded ${
                      playerViewMode === 'table' ? 'bg-[#B8F34A] text-[#090909]' : 'text-[#9AA69B]'
                    }`}
                    aria-label="Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {loadingPlayers ? (
              <Card className="p-8 text-center text-sm text-[#9AA69B]">
                Loading players...
              </Card>
            ) : filteredPlayers.length === 0 ? (
              <Card className="p-8 text-center text-sm text-[#9AA69B]">
                No players found.
              </Card>
            ) : playerViewMode === 'cards' ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
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
                            className="inline-flex items-center gap-0.5 font-medium text-[#9AA69B] hover:text-[#F4F7F2]"
                            aria-label={`Edit ${player.name}`}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeletePlayerModal(player)}
                            className="inline-flex items-center gap-0.5 font-medium text-[#EF4444] hover:text-red-300"
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-[#262626] text-[11px] font-semibold uppercase tracking-wider text-[#9AA69B] bg-[#202020]/50">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-4">Pos</th>
                        <th className="py-3 px-4">Team</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {filteredPlayers.map((p) => {
                        const assignedTeam = teams.find((t) => t.id === p.team_id);
                        return (
                          <tr key={p.id} className="hover:bg-[#202020]/40">
                            <td className="py-2.5 px-4 font-bold tabular-nums text-[#9AA69B]">
                              #{p.jersey_number}
                            </td>
                            <td className="py-2.5 px-4">
                              <button
                                type="button"
                                onClick={() => setSelectedPlayerForProfile(p)}
                                className="font-semibold text-[#F4F7F2] hover:text-[#B8F34A]"
                              >
                                {p.name}
                              </button>
                            </td>
                            <td className="py-2.5 px-4">
                              <Badge variant={p.position === 'GK' ? 'accent' : 'neutral'}>
                                {p.position}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4 text-xs">
                              {assignedTeam ? (
                                <span className="inline-flex items-center gap-1.5 text-[#F4F7F2]">
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: assignedTeam.color_code }}
                                  />
                                  {assignedTeam.name}
                                </span>
                              ) : (
                                <span className="text-[#9AA69B]">Unallocated</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => openEditPlayerModal(p)}
                                className="text-[#9AA69B] hover:text-[#F4F7F2] p-1"
                                aria-label={`Edit ${p.name}`}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openDeletePlayerModal(p)}
                                className="text-[#9AA69B] hover:text-[#EF4444] p-1"
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
          <div className="flex items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#262626] w-fit">
            <button
              type="button"
              onClick={() => setTeamsSubView('wheel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                teamsSubView === 'wheel'
                  ? 'bg-[#B8F34A] text-[#090909]'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2]'
              }`}
            >
              Drag &amp; Drop Assignment
            </button>
            <button
              type="button"
              onClick={() => setTeamsSubView('directory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                teamsSubView === 'directory'
                  ? 'bg-[#B8F34A] text-[#090909]'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2]'
              }`}
            >
              Team Settings ({teams.length})
            </button>
          </div>

          {loadingPlayers ? (
            <Card className="p-10 text-center text-sm text-[#9AA69B]">Loading...</Card>
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
                    <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-[#090909]"
                          style={{ backgroundColor: team.color_code }}
                        >
                          {team.short_code}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#F4F7F2]">{team.name}</h3>
                          <p className="text-xs text-[#9AA69B]">
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
                        className="p-2 rounded-lg bg-[#202020] text-[#9AA69B] hover:text-[#F4F7F2] border border-[#303030]"
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
                        className="space-y-3 p-3 rounded-xl bg-[#202020] border border-[#303030]"
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
                            <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                              Color
                            </label>
                            <input
                              type="color"
                              value={editTeamColor}
                              onChange={(e) => setEditTeamColor(e.target.value)}
                              className="w-full h-10 rounded-lg bg-[#141414] border border-[#303030] p-1 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                            Manager
                          </label>
                          <select
                            value={editTeamManagerId}
                            onChange={(e) => setEditTeamManagerId(e.target.value)}
                            className="w-full bg-[#141414] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F4F7F2]"
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
                        <div className="flex items-center justify-between text-xs text-[#9AA69B]">
                          <span>Squad</span>
                          <span className="font-semibold text-[#F4F7F2] tabular-nums">
                            {roster.length} / 5
                          </span>
                        </div>
                        {roster.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedPlayerForProfile(p)}
                            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#202020] hover:border-[#B8F34A] border border-[#303030] text-left transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#9AA69B] tabular-nums w-6">
                                #{p.jersey_number}
                              </span>
                              <span className="text-sm font-medium text-[#F4F7F2]">{p.name}</span>
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
            <h2 className="text-base font-semibold text-[#F4F7F2] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#B8F34A]" />
              Schedule Fixture
            </h2>

            {fixtureError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
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
                <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                  Home Team
                </label>
                <select
                  value={homeTeamId || teams[0]?.id || ''}
                  onChange={(e) => setHomeTeamId(e.target.value)}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F7F2]"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                  Away Team
                </label>
                <select
                  value={awayTeamId || teams[1]?.id || ''}
                  onChange={(e) => setAwayTeamId(e.target.value)}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3.5 py-2.5 text-sm text-[#F4F7F2]"
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
            <h2 className="text-base font-semibold text-[#F4F7F2]">
              Fixtures ({matches.length})
            </h2>

            {matches.length === 0 ? (
              <p className="text-sm text-[#9AA69B] py-8 text-center">No fixtures scheduled.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => {
                  const isEditingThis = editingMatch?.id === m.id;

                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-[#202020] border border-[#303030] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-xs text-[#9AA69B]">
                            <span className="font-semibold text-[#B8F34A]">
                              Match #{m.match_number}
                            </span>
                            <span>·</span>
                            <span>{m.venue}</span>
                          </div>
                          <p className="font-bold text-[#F4F7F2] mt-1">
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
                            onClick={() => setEditingMatch(isEditingThis ? null : { ...m })}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {isEditingThis ? 'Close' : 'Edit'}
                          </Button>
                          <button
                            type="button"
                            onClick={() => deleteMatchMutation.mutate(m.id)}
                            className="p-2 rounded-lg text-[#9AA69B] hover:text-[#EF4444] bg-[#141414] border border-[#303030]"
                            aria-label={`Delete Match ${m.match_number}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                          className="pt-3 border-t border-[#303030] grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                        >
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
                            <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                              Status
                            </label>
                            <select
                              value={editingMatch.status}
                              onChange={(e) =>
                                setEditingMatch({ ...editingMatch, status: e.target.value })
                              }
                              className="w-full bg-[#141414] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F4F7F2]"
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

      {/* EDIT PLAYER MODAL */}
      {editingPlayer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-player-modal-title"
        >
          <Card className="w-full max-w-md space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 id="edit-player-modal-title" className="font-semibold text-[#F4F7F2]">
                Edit Player
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlayer(null)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
                aria-label="Close edit modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editPlayerError && (
              <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
                {editPlayerError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditPlayerError('');
                if (!editPlayerName.trim()) {
                  setEditPlayerError('Player name is required.');
                  return;
                }
                updatePlayerMutation.mutate({
                  id: editingPlayer.id,
                  updates: {
                    name: editPlayerName.trim(),
                    jersey_number: Number(editPlayerJersey),
                    position: editPlayerPos,
                    team_id: editPlayerTeamId || null,
                    photo_url: editPlayerPhotoUrl ? editPlayerPhotoUrl.trim() : null,
                  },
                });
              }}
              className="space-y-3.5"
            >
              <Input
                label="Player Name"
                value={editPlayerName}
                onChange={(e) => setEditPlayerName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Jersey Number"
                  type="number"
                  min="1"
                  max="99"
                  value={editPlayerJersey}
                  onChange={(e) => setEditPlayerJersey(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                    Position
                  </label>
                  <select
                    value={editPlayerPos}
                    onChange={(e) => setEditPlayerPos(e.target.value)}
                    className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3 py-2.5 text-sm text-[#F4F7F2]"
                  >
                    <option value="GK">GK — Goalkeeper</option>
                    <option value="CB">CB — Defender</option>
                    <option value="MF">MF — Midfielder</option>
                    <option value="FW">FW — Forward</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9AA69B] mb-1.5">
                  Team Assignment
                </label>
                <select
                  value={editPlayerTeamId}
                  onChange={(e) => setEditPlayerTeamId(e.target.value)}
                  className="w-full bg-[#202020] border border-[#303030] rounded-lg px-3 py-2 text-xs text-[#F4F7F2]"
                >
                  <option value="">Unallocated (Draft Pool)</option>
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
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-[#262626]">
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
        </div>
      )}

      {/* DELETE PLAYER CONFIRMATION MODAL (With Team & Match Relationship Checks) */}
      {playerToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-player-modal-title"
        >
          <Card className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <AlertTriangle className="w-5 h-5" />
                <h3 id="delete-player-modal-title" className="font-semibold text-[#F4F7F2]">
                  Delete Player
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
                aria-label="Close delete confirmation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-[#F4F7F2]">
                Are you sure you want to delete{' '}
                <strong className="text-[#B8F34A]">
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
                  <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 space-y-1.5 text-xs text-[#F59E0B]">
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
                <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
                  {deletePlayerError}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#262626]">
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
        </div>
      )}

      {/* CLEAR ALL PLAYERS CONFIRMATION MODAL */}
      {showClearAllConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2 text-[#EF4444]">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold text-[#F4F7F2]">Clear All Players</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#9AA69B] leading-relaxed">
              This will permanently remove all <strong className="text-[#F4F7F2]">{players.length}</strong> players so you can upload your own custom eFootball cards from scratch.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
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
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="font-semibold text-[#F4F7F2]">Bulk Import Players</h3>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
                aria-label="Close bulk import modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#9AA69B]">
              Format: <code className="text-[#B8F34A]">Name, JerseyNumber, Position</code> (GK, CB, MF, FW)
            </p>
            {bulkFeedback && (
              <div className="p-3 rounded-lg bg-[#202020] border border-[#303030] text-xs text-[#B8F34A]">
                {bulkFeedback}
              </div>
            )}
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <textarea
                rows={5}
                placeholder={'Cole Palmer, 20, MF\nWilliam Saliba, 2, CB'}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full bg-[#202020] border border-[#303030] rounded-lg p-3 text-xs text-[#F4F7F2] font-mono"
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
        </div>
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
