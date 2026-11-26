import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArenaState } from '../../components/shared/ArenaUI';
import { PlayerProfileModal } from '../../features/players/PlayerProfileModal';
import { PlayerStandings } from '../../features/players/PlayerStandings';
import { StandingsTable } from '../../features/teams/StandingsTable';
import { matchesApi } from '../../services/api/matches.api';
import { playersApi } from '../../services/api/players.api';
import { standingsApi } from '../../services/api/standings.api';
import './standings.css';

const empty = [];
const refreshInterval = 5000;

export function StandingsPage() {
  const [category, setCategory] = useState('goals');
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const standingsQuery = useQuery({
    queryKey: ['standings'], queryFn: () => standingsApi.getStandings(), refetchInterval: refreshInterval,
  });
  const statsQuery = useQuery({
    queryKey: ['player_stats'], queryFn: () => standingsApi.getPlayerStats(), refetchInterval: refreshInterval,
  });
  const playersQuery = useQuery({
    queryKey: ['players'], queryFn: () => playersApi.getPlayers(), refetchInterval: refreshInterval,
  });
  const matchesQuery = useQuery({
    queryKey: ['matches'], queryFn: matchesApi.getMatches, refetchInterval: refreshInterval,
  });
  const eventsQuery = useQuery({
    queryKey: ['all_match_events'], queryFn: () => matchesApi.getAllMatchEvents(),
    enabled: category === 'assists' || Boolean(selectedPlayerId), refetchInterval: refreshInterval,
  });

  const standings = standingsQuery.data ?? empty;
  const players = playersQuery.data ?? empty;
  const stats = statsQuery.data ?? empty;
  const matches = matchesQuery.data ?? empty;
  const events = eventsQuery.data ?? empty;
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId);
  const selectedPlayerStats = stats.find((row) => row.player_id === selectedPlayerId);
  const categoryQuery = category === 'assists' ? eventsQuery : statsQuery;

  return (
    <div className="standings-page">
      <header className="standings-heading">
        <h1>Standings</h1>
        <p>The top two clubs advance to the Grand Final.</p>
      </header>

      {standingsQuery.isPending ? (
        <div className="standings-skeleton standings-skeleton-table" role="status">
          <span className="sr-only">Loading the league table…</span>
          <div /><div /><div /><div />
        </div>
      ) : standingsQuery.isError ? (
        <ArenaState error onRetry={standingsQuery.refetch}>Standings could not be loaded.</ArenaState>
      ) : standings.length ? (
        <StandingsTable standings={standings} matches={matchesQuery.data} />
      ) : <ArenaState>No standings data is available.</ArenaState>}

      <PlayerStandings
        category={category} onCategoryChange={setCategory}
        players={players} stats={stats} events={events}
        loading={playersQuery.isPending || categoryQuery.isPending}
        error={playersQuery.isError || categoryQuery.isError}
        onRetry={() => {
          if (playersQuery.isError) playersQuery.refetch();
          if (categoryQuery.isError) categoryQuery.refetch();
        }}
        onSelect={setSelectedPlayerId}
      />

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          team={selectedPlayer.team}
          stats={selectedPlayerStats}
          matchEvents={events}
          teamMatches={matches}
          statsLoading={statsQuery.isPending || eventsQuery.isPending || matchesQuery.isPending}
          statsUnavailable={statsQuery.isError || eventsQuery.isError || matchesQuery.isError}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}
    </div>
  );
}

export default StandingsPage;
