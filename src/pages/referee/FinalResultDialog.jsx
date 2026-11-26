import React from 'react';
import { Button } from '../../components/ui/Button';
import { ModalDialog } from '../../components/ui/ModalDialog';
import { countAssistsByPlayer } from '../../utils/tournamentRules';

function summarize(events, teamId) {
  const teamEvents = events.filter((event) => event.team_id === teamId);
  const count = (type) => teamEvents.filter((event) => event.event_type === type).length;
  const assists = Array.from(countAssistsByPlayer(teamEvents).values()).reduce((total, value) => total + value, 0);
  return [count('GOAL'), assists, count('YELLOW_CARD'), count('RED_CARD')];
}

const labels = ['Recorded goals', 'Assists', 'Yellow cards', 'Red cards'];

export function FinalResultDialog({ match, events, eventsPending, eventsError, onRetry, pending, failed, onDismiss, onConfirm }) {
  const home = match.home_team?.name || 'Home team';
  const away = match.away_team?.name || 'Away team';
  const homeSummary = summarize(events, match.home_team_id);
  const awaySummary = summarize(events, match.away_team_id);
  const validScore = [match.home_score, match.away_score].every((score) => Number.isInteger(score) && score >= 0);

  return (
    <ModalDialog labelledBy="final-result-title" onDismiss={() => { if (!pending) onDismiss(); }}>
      <div className="p-4 space-y-4">
        <div>
          <h2 className="arena-section-title" id="final-result-title">Confirm final result</h2>
          <p className="mt-2 text-sm text-[#b4b4be]">Check the score and recorded events before publishing.</p>
        </div>
        <p className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center text-center text-sm font-bold">
          <span className="break-words">{home}</span>
          <strong className="tabular-nums text-2xl whitespace-nowrap">{match.home_score} – {match.away_score}</strong>
          <span className="break-words">{away}</span>
        </p>
        {eventsPending ? <p role="status" className="text-sm">Loading match events…</p> : eventsError ? (
          <div className="space-y-2">
            <p role="alert" className="text-sm text-[#ffc1ce]">Match events could not be loaded.</p>
            <Button variant="secondary" onClick={onRetry}>Try again</Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Recorded match events by team</caption>
            <thead>
              <tr className="text-[#b4b4be]">
                <th scope="col" className="text-left">Events</th>
                <th scope="col">Home</th>
                <th scope="col">Away</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, index) => (
                <tr className="border-t border-[#323237]" key={label}>
                  <th scope="row" className="py-2 text-left font-medium">{label}</th>
                  <td className="text-center tabular-nums">{homeSummary[index]}</td>
                  <td className="text-center tabular-nums">{awaySummary[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!validScore && <p role="alert" className="text-sm text-[#ffc1ce]">Contact the league administrator to correct the score.</p>}
        {failed && <p role="alert" className="text-sm text-[#ffc1ce]">The result could not be published. Try again.</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled={pending} onClick={onDismiss}>Cancel</Button>
          <Button disabled={!validScore || eventsPending || eventsError} isLoading={pending} onClick={onConfirm}>Publish result</Button>
        </div>
      </div>
    </ModalDialog>
  );
}
