import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { ArenaState, ClubCrest } from '../../components/shared/ArenaUI';
import { selectUpcomingFixtures } from '../../features/matches/publicFixtures';
import { matchesApi } from '../../services/api/matches.api';
import { teamsApi } from '../../services/api/teams.api';
import { allocationApi } from '../../services/api/allocation.api';
import { UpcomingMatches } from './UpcomingMatches';
import { officialCrests } from '../../features/teams/officialCrests';

export function TournamentHomePage() {
  const queryClient = useQueryClient();
  const matchQuery = useQuery({ queryKey: ['matches'], queryFn: matchesApi.getMatches, refetchInterval: 5000 });
  const teamQuery = useQuery({ queryKey: ['teams'], queryFn: teamsApi.getTeams, refetchInterval: 4000 });

  useEffect(() => allocationApi.subscribeToLiveDraft(() => {
    queryClient.invalidateQueries({ queryKey: ['players'] });
    queryClient.invalidateQueries({ queryKey: ['teams'] });
  }), [queryClient]);

  const teams = (teamQuery.data || []).filter((team) => Object.hasOwn(officialCrests, team.short_code));
  const { data: matches = [], dataUpdatedAt } = matchQuery;
  const cutoff = Math.max(dataUpdatedAt, Date.now());
  const upcoming = selectUpcomingFixtures(matches, cutoff).slice(0, 3);

  return (
    <div className="league-home">
      <h1 className="sr-only">Betterinu Football League</h1>
      <img
        className="league-home-banner"
        src="/assets/betterinu-home-banner.png"
        width="1672"
        height="941"
        alt="Three Betterinu club captains wearing their team jerseys"
        fetchPriority="high"
      />

      <section id="clubs" aria-labelledby="league-home-teams">
        <h2 id="league-home-teams" className="league-home-title">The Teams</h2>
        {teamQuery.isError && !teams.length ? (
          <ArenaState error onRetry={teamQuery.refetch}>Teams could not be loaded.</ArenaState>
        ) : teams.length ? (
          <ul className="league-home-teams" role="list">
            {teams.map((team) => (
              <li key={team.id}>
                <Link to={`/public/teams/${encodeURIComponent(team.id)}`}>
                  <ClubCrest club={{ ...team, logo_url: officialCrests[team.short_code] }} eager />
                  <span>{team.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ArenaState>{teamQuery.isPending ? 'Loading teams…' : 'No teams have been published.'}</ArenaState>
        )}
      </section>

      <section aria-labelledby="league-home-matches">
        <div className="league-home-section-head">
          <h2 id="league-home-matches" className="league-home-title">Next Matches</h2>
          <Link className="league-home-view-all" to="/public/fixtures">
            View All <span className="sr-only">fixtures</span><ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {upcoming.length ? (
          <UpcomingMatches matches={upcoming} />
        ) : matchQuery.isError && !matchQuery.data ? (
          <ArenaState error onRetry={matchQuery.refetch}>Fixtures could not be loaded.</ArenaState>
        ) : (
          <ArenaState>{matchQuery.isPending ? 'Loading fixtures…' : 'No upcoming matches scheduled.'}</ArenaState>
        )}
      </section>
    </div>
  );
}

export default TournamentHomePage;
