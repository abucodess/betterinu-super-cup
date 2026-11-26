import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, CalendarDays, Check, Clock3, Goal, Megaphone, Radio, Trophy, X } from 'lucide-react';
import { ClubCrest } from '../../components/shared/ArenaUI';
import { officialCrests } from '../teams/officialCrests';
import { matchesApi } from '../../services/api/matches.api';
import { notificationsApi } from '../../services/api/notifications.api';
import { tournamentsApi } from '../../services/api/tournaments.api';
import { buildNotifications, formatActivityTime } from './publicNotifications';
import './notifications.css';

const readStorageKey = 'betterinu:read-notification-ids:v1';
const categoryIcons = { fixture: CalendarDays, schedule: Clock3, status: Radio, score: Goal, result: Trophy, announcement: Megaphone };
const empty = [];

function readIds(value) {
  try {
    const ids = JSON.parse(value);
    return new Set(Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : []);
  } catch {
    return new Set();
  }
}

function savedReadIds() {
  try {
    return readIds(window.localStorage.getItem(readStorageKey));
  } catch {
    return new Set();
  }
}

function useReadState() {
  const [read, setRead] = useState(savedReadIds);
  const current = useRef(read);

  useEffect(() => {
    function syncStorage(event) {
      if (event.key !== readStorageKey && event.key !== null) return;
      current.current = readIds(event.newValue);
      setRead(current.current);
    }
    window.addEventListener('storage', syncStorage);
    return () => window.removeEventListener('storage', syncStorage);
  }, []);

  function markRead(keys) {
    const next = new Set([...current.current, ...savedReadIds(), ...keys]);
    current.current = next;
    setRead(next);
    try {
      window.localStorage.setItem(readStorageKey, JSON.stringify([...next]));
    } catch {
      // Read markers are still available for the current visit.
    }
  }

  return [read, markRead];
}

function useNotificationFeed() {
  const tournament = useQuery({ queryKey: ['tournament'], queryFn: tournamentsApi.getActiveTournament });
  const tournamentId = tournament.data?.id;
  const matches = useQuery({ queryKey: ['matches'], queryFn: matchesApi.getMatches, refetchInterval: 6500 });
  const activity = useQuery({
    queryKey: ['public-match-notifications', tournamentId],
    queryFn: () => notificationsApi.getMatchActivity(tournamentId),
    enabled: tournament.isSuccess,
    refetchInterval: (query) => query.state.data === null ? false : 5500,
    staleTime: (query) => query.state.data === null ? 60000 : 0,
  });
  const announcements = useQuery({
    queryKey: ['announcements', 'public', tournamentId],
    queryFn: () => notificationsApi.getLeagueAnnouncements(tournamentId),
    enabled: tournament.isSuccess,
    refetchInterval: 8000,
  });
  const notices = useMemo(() => buildNotifications({
    activity: activity.data === null ? null : activity.data ?? empty,
    announcements: announcements.data ?? empty,
    matches: matches.data ?? empty,
    tournamentId,
  }), [activity.data, announcements.data, matches.data, tournamentId]);
  const dependencies = [tournament, activity, announcements, ...(activity.data === null ? [matches] : [])];
  const error = dependencies.some((query) => query.isError);
  const loading = !error && dependencies.some((query) => query.isPending);

  function retry() {
    for (const query of dependencies) {
      if (query.isError) query.refetch();
    }
  }

  return { notices, loading, error, retry };
}

function NotificationItem({ item, unread, now, onRead, onExpand, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = categoryIcons[item.kind];
  const heading = (
    <span className="public-notification-item-heading">
      <span className="public-notification-category">{item.category}</span>
      <time dateTime={item.publishedAt} title={new Date(item.publishedAt).toLocaleString()}>{formatActivityTime(item.publishedAt, now)}</time>
      <strong>{item.title}</strong>
    </span>
  );
  const crestPair = [item.home, item.away].filter(Boolean);

  function follow() {
    onRead([item.readKey]);
    onClose();
  }

  return (
    <li className="public-notification-item" data-unread={unread}>
      <span className="public-notification-icon" data-kind={item.kind}><Icon size={18} aria-hidden="true" /></span>
      <div className="public-notification-copy">
        {item.to ? (
          <Link className="public-notification-item-action" to={item.to} onClick={follow}>
            {heading}
            {item.description && <span className="public-notification-description">{item.description}</span>}
          </Link>
        ) : (
          <button className="public-notification-item-action" type="button" aria-expanded={expanded}
            aria-controls={`notification-body-${item.id}`} onClick={() => {
              setExpanded(!expanded);
              if (!expanded && unread) onExpand(item.readKey);
            }}>
            {heading}
            {!expanded && <span className="public-notification-description public-notification-excerpt" aria-hidden="true">{item.description}</span>}
          </button>
        )}
        {!item.to && <p id={`notification-body-${item.id}`} className="public-notification-description" hidden={!expanded}>{item.description}</p>}
        {(item.standings || crestPair.length === 2) && (
          <div className="public-notification-related">
            {crestPair.length === 2 && (
              <span className="public-notification-crests">
                {crestPair.map((club) => <ClubCrest key={club.id} club={{ ...club, logo_url: officialCrests[club.short_code] || club.logo_url }} />)}
              </span>
            )}
            {item.standings && <Link to="/public/standings" onClick={follow}>View standings</Link>}
          </div>
        )}
      </div>
      {unread && <button type="button" className="public-notification-mark" aria-label={`Mark ${item.title} as read`}
        title="Mark as read" onClick={() => onRead([item.readKey])}><span /></button>}
    </li>
  );
}

export function NotificationCenter() {
  const { notices, loading, error, retry } = useNotificationFeed();
  const [read, markRead] = useReadState();
  const [filter, setFilter] = useState('all');
  const [opened, setOpened] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [offline, setOffline] = useState(() => !navigator.onLine);
  const { key: locationKey } = useLocation();
  const bellRef = useRef(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const listRef = useRef(null);
  const unread = notices.filter((item) => !read.has(item.readKey));
  const visible = filter === 'unread' ? unread : notices;

  function anchorDialog() {
    const box = bellRef.current.getBoundingClientRect();
    dialogRef.current.style.setProperty('--notification-top', `${Math.max(box.bottom + 8, 8)}px`);
    dialogRef.current.style.setProperty('--notification-right', `${Math.max(12, document.documentElement.clientWidth - box.right)}px`);
  }

  useEffect(() => {
    function reanchor() {
      if (dialogRef.current?.open) anchorDialog();
    }
    const syncOnline = () => setOffline(!navigator.onLine);
    window.addEventListener('resize', reanchor);
    window.addEventListener('offline', syncOnline);
    window.addEventListener('online', syncOnline);
    return () => {
      window.removeEventListener('resize', reanchor);
      window.removeEventListener('offline', syncOnline);
      window.removeEventListener('online', syncOnline);
    };
  }, []);

  useEffect(() => {
    if (!opened) return;
    const tick = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(tick);
  }, [opened]);

  useEffect(() => {
    dialogRef.current?.close();
  }, [locationKey]);

  function closePanel() {
    dialogRef.current.close();
  }

  function openPanel() {
    setNow(Date.now());
    dialogRef.current.showModal();
    anchorDialog();
    closeRef.current.focus();
    setOpened(true);
  }

  function chooseFilter(next) {
    setFilter(next);
    listRef.current.scrollTop = 0;
  }

  function openAnnouncement(key) {
    markRead([key]);
    if (filter === 'unread') setFilter('all');
  }

  return (
    <>
      <button type="button" className="league-public-icon-button public-notification-bell" ref={bellRef} onClick={openPanel}
        aria-haspopup="dialog" aria-controls="public-notifications" aria-expanded={opened}
        aria-label={unread.length ? `Notifications, ${unread.length} unread` : 'Notifications'}>
        <Bell size={23} aria-hidden="true" />
        {unread.length > 0 && <span className="public-notification-badge" aria-hidden="true">{unread.length > 9 ? '9+' : unread.length}</span>}
      </button>
      <dialog className="public-notification-dialog" id="public-notifications" ref={dialogRef} aria-labelledby="public-notification-title"
        onClose={() => setOpened(false)}
        onClick={(event) => { if (event.target === event.currentTarget) closePanel(); }}>
        <div className="public-notification-panel">
          <header className="public-notification-header">
            <div>
              <h2 id="public-notification-title">Notifications</h2>
              <p aria-live="polite">{unread.length} unread</p>
            </div>
            <button type="button" className="league-public-icon-button" ref={closeRef} onClick={closePanel} aria-label="Close notifications"><X size={22} aria-hidden="true" /></button>
          </header>
          <div className="public-notification-toolbar">
            <div role="group" aria-label="Filter notifications">
              <button type="button" aria-pressed={filter === 'all'} onClick={() => chooseFilter('all')}>All</button>
              <button type="button" aria-pressed={filter === 'unread'} onClick={() => chooseFilter('unread')}>Unread</button>
            </div>
            <button type="button" className="public-notification-mark-all" disabled={!unread.length} onClick={() => markRead(unread.map((item) => item.readKey))}>
              <Check size={15} aria-hidden="true" /> Mark all as read
            </button>
          </div>
          <div className="public-notification-scroll" ref={listRef}>
            {(error || offline) && <div className="public-notification-state" role="status">
              <p>{offline ? (notices.length ? 'You’re offline. Some updates may be outdated.' : 'You’re offline.')
                : notices.length ? 'Some updates may be outdated.' : 'Unable to load notifications.'}</p>
              {!offline && <button type="button" onClick={retry}>Retry</button>}
            </div>}
            {!offline && loading && !visible.length && (
              <div className="public-notification-skeleton" role="status">
                <span className="sr-only">Loading notifications…</span><span /><span /><span />
              </div>
            )}
            {visible.length > 0 ? (
              <ul className="public-notification-list" role="list">
                {visible.map((item) => <NotificationItem key={item.id} item={item} unread={!read.has(item.readKey)} now={now}
                  onRead={markRead} onExpand={openAnnouncement} onClose={closePanel} />)}
              </ul>
            ) : !loading && !error && !offline && (
              <div className="public-notification-state">
                {filter === 'unread' ? <p>No unread notifications.</p> : <><strong>You’re all caught up.</strong><p>No league updates yet.</p></>}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
