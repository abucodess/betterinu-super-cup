import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Clock, X, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { matchesApi } from '../../services/api/matches.api';

export function FixturesPage() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMatch, setSelectedMatch] = useState(null);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: () => matchesApi.getMatches(),
  });

  const { data: allEvents = [] } = useQuery({
    queryKey: ['all_match_events'],
    queryFn: () => matchesApi.getAllMatchEvents(),
  });

  const filteredMatches = useMemo(() => {
    if (statusFilter === 'ALL') return matches;
    if (statusFilter === 'LIVE') {
      return matches.filter((m) => m.status === 'live' || m.status === 'half_time');
    }
    return matches.filter((m) => m.status === statusFilter.toLowerCase());
  }, [matches, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F7F2]">
          Fixtures
        </h1>

        <div className="flex flex-wrap items-center gap-1.5 bg-[#141414] p-1 rounded-xl border border-[#303030]">
          {['ALL', 'SCHEDULED', 'LIVE', 'COMPLETED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-[#B8F34A] text-[#090909]'
                  : 'text-[#9AA69B] hover:text-[#F4F7F2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-[#9AA69B]">Loading fixtures...</Card>
      ) : filteredMatches.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[#9AA69B]">
          No fixtures match the selected filter ({statusFilter}).
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMatches.map((match) => {
            const matchEvents = allEvents.filter((e) => e.match_id === match.id);
            return (
              <Card
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:border-[#B8F34A] transition-colors"
              >
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                  <span className="text-xs font-bold text-[#9AA69B] uppercase">
                    Match #{match.match_number}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#9AA69B]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{match.venue}</span>
                    {match.kickoff_time && (
                      <>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(match.kickoff_time).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 w-full sm:w-auto">
                  <span className="font-bold text-sm sm:text-base text-right flex-1 sm:w-36 truncate text-[#F4F7F2]">
                    {match.home_team?.name}
                  </span>
                  <div className="px-4 py-1.5 rounded-lg bg-[#202020] border border-[#303030] font-bold text-base tabular-nums text-[#B8F34A]">
                    {match.status === 'scheduled'
                      ? 'vs'
                      : `${match.home_score} - ${match.away_score}`}
                  </div>
                  <span className="font-bold text-sm sm:text-base text-left flex-1 sm:w-36 truncate text-[#F4F7F2]">
                    {match.away_team?.name}
                  </span>
                </div>

                <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                  {matchEvents.length > 0 && (
                    <span className="text-xs text-[#9AA69B]">
                      {matchEvents.length} events
                    </span>
                  )}
                  <Badge
                    variant={
                      match.status === 'live' || match.status === 'half_time'
                        ? 'live'
                        : match.status === 'completed'
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {match.status.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedMatch(null)}
        >
          <Card
            className="w-full max-w-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#303030] pb-3">
              <div>
                <span className="text-xs font-bold text-[#B8F34A]">
                  MATCH #{selectedMatch.match_number} • {selectedMatch.venue}
                </span>
                <h3 className="text-lg font-bold text-[#F4F7F2]">
                  {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="text-[#9AA69B] hover:text-[#F4F7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-center bg-[#202020] rounded-xl border border-[#303030]">
              <p className="text-3xl font-black text-[#F4F7F2] tabular-nums">
                {selectedMatch.home_score} - {selectedMatch.away_score}
              </p>
              <span className="text-xs text-[#B8F34A] font-bold uppercase">
                {selectedMatch.status}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#9AA69B] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#B8F34A]" /> Match Events
              </h4>
              {allEvents.filter((e) => e.match_id === selectedMatch.id).length === 0 ? (
                <p className="text-xs text-[#9AA69B] py-4 text-center">
                  No events recorded for this fixture yet.
                </p>
              ) : (
                allEvents
                  .filter((e) => e.match_id === selectedMatch.id)
                  .map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg bg-[#202020] border border-[#303030] flex items-center justify-between text-xs"
                    >
                      <span>
                        <strong className="text-[#B8F34A] mr-2 tabular-nums">
                          {ev.minute}&apos;
                        </strong>
                        {ev.event_type.replace('_', ' ')}
                      </span>
                      <span className="text-[#9AA69B]">
                        {ev.team?.name || ''}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedMatch(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
export default FixturesPage;
