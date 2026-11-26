import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { ArenaState } from '../../components/shared/ArenaUI';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { ClubProfile } from '../../features/teams/ClubProfile';
import { DarkHorseClub } from '../../features/teams/DarkHorseClub';
import { darkHorseClubId } from '../../features/teams/officialCrests';
import { matchesApi } from '../../services/api/matches.api';
import { playersApi } from '../../services/api/players.api';
import { standingsApi } from '../../services/api/standings.api';
import { teamsApi } from '../../services/api/teams.api';

export function ClubPage() {
  const { teamId } = useParams();
  const isDarkHorse = teamId === darkHorseClubId;
  const [selectedId, setSelectedId] = useState(null);

  const teams = useQuery({ queryKey: ['teams'], queryFn: teamsApi.getTeams, refetchInterval: 4000 });
  const club = teams.data?.find((team) => team.id === teamId);
  const roster = useQuery({
    queryKey: ['players', 'club', teamId],
    queryFn: () => playersApi.getPlayers({ team_id: teamId }),
    enabled: Boolean(club),
    refetchInterval: 2500,
  });
  const matches = useQuery({
    queryKey: ['matches', 'club', teamId],
    queryFn: () => matchesApi.getMatches({ teamId }),
    enabled: Boolean(club),
    refetchInterval: isDarkHorse ? 5000 : false,
  });
  const standings = useQuery({
    queryKey: ['standings'],
    queryFn: standingsApi.getStandings,
    enabled: Boolean(club),
    refetchInterval: isDarkHorse ? 5000 : false,
  });

  const player = roster.data?.find((member) => member.id === selectedId);
  const playerStats = useQuery({
    queryKey: ['player_stats', 'player', selectedId],
    queryFn: () => standingsApi.getPlayerStats({ playerId: selectedId }),
    enabled: Boolean(player) && !player.is_non_player,
  });
  const events = useQuery({
    queryKey: ['all_match_events'],
    queryFn: () => matchesApi.getAllMatchEvents(),
    enabled: (isDarkHorse && Boolean(club)) || (Boolean(player) && !player.is_non_player),
    refetchInterval: isDarkHorse ? 5000 : false,
  });

  const playerProfile = player && <PlayerProfileModal player={player} team={club} stats={playerStats.data?.[0]}
    matchEvents={events.data} teamMatches={matches.data}
    statsLoading={!player.is_non_player && (playerStats.isPending || events.isPending || matches.isPending)}
    statsUnavailable={playerStats.isError || events.isError || matches.isError}
    onClose={() => setSelectedId(null)} />;

  if (club && isDarkHorse) {
    return (
      <>
        <DarkHorseClub club={club} roster={roster} standings={standings} matches={matches} events={events}
          onSelectPlayer={(member) => setSelectedId(member.id)} />
        {playerProfile}
      </>
    );
  }

  let content;
  if (teams.isError || (club && roster.isError)) {
    const retry = teams.isError ? teams.refetch : roster.refetch;
    content = <ArenaState error onRetry={retry}>Club information could not be loaded.</ArenaState>;
  } else if (teams.isPending || (club && roster.isPending)) {
    content = <ArenaState>Loading club information…</ArenaState>;
  } else if (!club) {
    content = <ArenaState>This club could not be found.</ArenaState>;
  } else {
    content = <ClubProfile club={club} players={roster.data || []} standings={standings.data || []}
      matches={matches.data || []} matchState={matches.isPending ? 'loading' : matches.isError ? 'error' : 'ready'}
      onSelectPlayer={(member) => setSelectedId(member.id)} dedicated />;
  }

  return (
    <div className="arena-club-detail-page">
      <Link className="arena-back" to="/public#clubs"><ArrowLeft size={16} /> Choose another club</Link>
      {content}
      {playerProfile}
    </div>
  );
}
