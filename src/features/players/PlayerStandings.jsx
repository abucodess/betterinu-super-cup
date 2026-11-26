import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowRightLeft, Goal, UserRound } from 'lucide-react';
import { ArenaState, ClubCrest } from '../../components/shared/ArenaUI';
import { cloudinaryService } from '../../services/cloudinary/cloudinary.service';
import { countAssistsByPlayer } from '../../utils/tournamentRules';
import { officialCrests } from '../teams/officialCrests';

const categories = [
  { id: 'goals', label: 'Goals', feature: 'Top Goalscorer', empty: 'No Goals Recorded Yet', icon: Goal },
  { id: 'assists', label: 'Assists', feature: 'Top Assist Provider', empty: 'No Assists Recorded Yet', icon: ArrowRightLeft },
  { id: 'yellow_cards', label: 'Yellow Cards', feature: 'Most Yellow Cards', empty: 'No Yellow Cards Recorded' },
  { id: 'red_cards', label: 'Red Cards', feature: 'Most Red Cards', empty: 'No Red Cards Recorded' },
];

const initialLimit = 5;

function rankPlayers(players, stats, events, category) {
  const statsById = new Map(stats.map((row) => [row.player_id, row]));
  const assists = category === 'assists' ? countAssistsByPlayer(events) : null;

  const ranked = players
    .filter((player) => !player.is_non_player && (category === 'assists' || statsById.has(player.id)))
    .map((player) => {
      const row = statsById.get(player.id);
      const total = assists ? assists.get(player.id.toLowerCase()) : Number(row[category]);
      return { player, total: Number.isFinite(total) ? total : 0 };
    })
    .sort((a, b) => b.total - a.total || a.player.name.localeCompare(b.player.name) || a.player.id.localeCompare(b.player.id));

  if (!ranked[0]?.total) return [];
  let rank = 0;
  return ranked.map((entry, index) => {
    if (entry.total !== ranked[index - 1]?.total) rank = index + 1;
    return { ...entry, rank };
  });
}

function CategoryTabs({ category, onChange }) {
  function handleKeys(event) {
    const index = categories.findIndex(({ id }) => id === category);
    const last = categories.length - 1;
    const next = {
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowRight: index === last ? 0 : index + 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(categories[next].id);
    event.currentTarget.querySelectorAll('[role="tab"]')[next].focus();
  }

  return (
    <div className="player-stat-tabs" role="tablist" aria-label="Player statistics categories" onKeyDown={handleKeys}>
      {categories.map(({ id, label, icon: Icon }) => (
        <button
          key={id} id={`player-stat-tab-${id}`} type="button" role="tab" aria-selected={category === id}
          aria-controls={`player-stat-panel-${id}`} tabIndex={category === id ? 0 : -1} onClick={() => onChange(id)}
        >
          {Icon ? <Icon size={17} aria-hidden="true" /> : <span className="player-stat-card-icon" data-card={id} aria-hidden="true" />}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function PlayerPortrait({ player, featured = false }) {
  const [failed, setFailed] = useState(null);
  const url = cloudinaryService.getOptimizedPortraitUrl(player.photo_url, featured ? {} : { width: 120, height: 144 });
  return (
    <span className="player-stat-photo" data-featured={featured}>
      {url && url !== failed ? (
        <img src={url} alt={featured ? `${player.name} portrait` : ''} loading={featured ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(url)} />
      ) : <UserRound size={featured ? 56 : 20} aria-hidden="true" />}
    </span>
  );
}

function PlayerClub({ player }) {
  const team = player.team;
  const crest = team && { ...team, logo_url: officialCrests[team.short_code] || team.logo_url };
  return (
    <span className="player-stat-club">
      {crest && <ClubCrest club={crest} />}
      <span>{team?.name || 'Unallocated'}</span>
    </span>
  );
}

function FeaturedPlayer({ entry, category, tied, onSelect }) {
  const { player, total } = entry;
  return (
    <button
      type="button" className="player-feature" aria-haspopup="dialog" data-club={player.team?.short_code}
      onClick={() => onSelect(player.id)}
    >
      <span className="player-feature-info">
        <span className="player-feature-label">{category.feature}</span>
        <strong className="player-feature-name">{player.name}</strong>
        <PlayerClub player={player} />
        <span className="player-feature-total"><strong>{total}</strong><span>{category.label}</span></span>
        {tied && <span className="player-feature-tie">Tied for first</span>}
      </span>
      <PlayerPortrait player={player} featured />
      <ArrowRight size={17} className="player-feature-arrow" aria-hidden="true" />
      <span className="sr-only">Open player profile</span>
    </button>
  );
}

function PlayerLeaderboard({ ranked, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? ranked : ranked.slice(0, initialLimit);

  return (
    <div className="player-ranking">
      <div className="player-ranking-heading">
        <h3>Leaderboard</h3>
        {ranked.length > initialLimit && (
          <button type="button" aria-expanded={expanded} aria-controls="player-ranking-list" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show top 5' : `View all (${ranked.length})`}
          </button>
        )}
      </div>
      <ol className="player-ranking-list" id="player-ranking-list" role="list">
        {displayed.map(({ player, total, rank }) => (
          <li key={player.id}>
            <button type="button" className="player-ranking-row" aria-haspopup="dialog" onClick={() => onSelect(player.id)}>
              <span className="player-ranking-rank"><span className="sr-only">Rank </span>{rank}</span>
              <PlayerPortrait player={player} />
              <span className="player-ranking-identity"><strong>{player.name}</strong><PlayerClub player={player} /></span>
              <strong className="player-ranking-total">{total}</strong>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PlayerStandings({ category, onCategoryChange, players, stats, events, loading, error, onRetry, onSelect }) {
  const ranked = useMemo(() => rankPlayers(players, stats, events, category), [players, stats, events, category]);

  return (
    <section className="player-stats" aria-labelledby="player-stats-title">
      <h2 id="player-stats-title">Player Stats</h2>
      <CategoryTabs category={category} onChange={onCategoryChange} />
      {categories.map((option) => (
        <div
          key={option.id} id={`player-stat-panel-${option.id}`} role="tabpanel"
          aria-labelledby={`player-stat-tab-${option.id}`} hidden={option.id !== category}
        >
          {option.id === category && (
            loading ? (
              <div className="standings-skeleton standings-skeleton-players" role="status">
                <span className="sr-only">Loading player statistics…</span>
                <div /><div /><div />
              </div>
            ) : error ? (
              <ArenaState error onRetry={onRetry}>Player statistics could not be loaded.</ArenaState>
            ) : ranked.length ? (
              <div className="player-stat-panel">
                <FeaturedPlayer entry={ranked[0]} category={option} tied={ranked[1]?.rank === 1} onSelect={onSelect} />
                <PlayerLeaderboard ranked={ranked} onSelect={onSelect} />
              </div>
            ) : <ArenaState>{option.empty}</ArenaState>
          )}
        </div>
      ))}
    </section>
  );
}
