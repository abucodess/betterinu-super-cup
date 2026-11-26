import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClubCrest, FormIndicator } from '../../components/shared/ArenaUI';
import { calculateTeamFormAndStats } from '../../utils/tournamentRules';
import { officialCrests } from './officialCrests';

export function StandingsTable({ standings, matches }) {
  const [expanded, setExpanded] = useState(false);
  const columns = [
    ['played', 'P', 'Played'],
    ['won', 'W', 'Won', true],
    ['drawn', 'D', 'Drawn', true],
    ['lost', 'L', 'Lost', true],
    ['goals_for', 'GF', 'Goals for', true],
    ['goals_against', 'GA', 'Goals against', true],
    ['goal_difference', 'GD', 'Goal difference'],
  ];

  return (
    <div className="league-table-card">
      <div className="league-table-scroll" tabIndex={0} role="region" aria-label="League standings table">
        <table id="arena-standings-table" className="league-table" data-expanded={expanded}>
          <caption className="sr-only">League standings</caption>
          <thead>
            <tr>
              <th scope="col"><abbr title="Position">POS</abbr></th>
              <th scope="col">Team</th>
              {columns.map(([key, label, full, extra]) => (
                <th scope="col" key={key} className={extra ? 'league-table-extra' : undefined}><abbr title={full}>{label}</abbr></th>
              ))}
              <th scope="col" className="league-table-points"><abbr title="Points">PTS</abbr></th>
              <th scope="col" className="league-table-extra">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, index) => {
              const club = { ...row, logo_url: officialCrests[row.short_code] || row.logo_url };
              const form = matches ? calculateTeamFormAndStats(row.team_id, matches).form : null;
              return (
                <tr key={row.team_id} data-leader={index === 0 && row.played > 0}>
                  <td className="league-table-rank">{index + 1}</td>
                  <th scope="row">
                    <Link to={`/public/teams?club=${encodeURIComponent(row.team_id)}`}>
                      <ClubCrest club={club} eager /><span>{row.team_name}</span>
                    </Link>
                  </th>
                  {columns.map(([key, , , extra]) => (
                    <td key={key} className={extra ? 'league-table-extra' : undefined}>{key === 'goal_difference' && row[key] > 0 ? `+${row[key]}` : row[key]}</td>
                  ))}
                  <td className="league-table-points">{row.points}</td>
                  <td className="league-table-extra">
                    {form ? <FormIndicator form={form} /> : <><span aria-hidden="true">—</span><span className="sr-only">Form unavailable</span></>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="league-table-tools">
        <button type="button" aria-expanded={expanded} aria-controls="arena-standings-table" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show compact table' : 'Show all columns'}
        </button>
      </div>
    </div>
  );
}
