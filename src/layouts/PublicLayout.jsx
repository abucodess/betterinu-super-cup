import React, { useEffect, useRef } from 'react';
import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { BarChart3, CalendarDays, ChevronRight, ClipboardList, Ellipsis, House, LockKeyhole, Radio, ShieldCheck, Users, X } from 'lucide-react';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import { useAuth } from '../hooks/useAuth';
import { useArenaViewport } from '../hooks/useArenaViewport';
import { getStaffDashboard } from '../utils/staffRoles';
import '../arena.css';
import '../pages/public/tournament-home.css';
import './public-navigation.css';

const primaryLinks = [
  { to: '/public', label: 'Home', icon: House },
  { to: '/public/fixtures', label: 'Fixtures', icon: CalendarDays },
  { to: '/public/standings', label: 'Standings', icon: BarChart3 },
];

function PublicNavigation({ page }) {
  const active = page === 'live' || page === 'fixtures' ? '/public/fixtures'
    : page === 'standings' ? '/public/standings' : '/public';
  const exact = !page || page === 'fixtures' || page === 'standings';

  return (
    <nav className="league-public-nav" aria-label="League navigation">
      {primaryLinks.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to} aria-current={to === active ? (exact ? 'page' : 'location') : undefined}>
          <Icon size={20} aria-hidden="true" /><span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

function PublicHeader({ page, onMore }) {
  return (
    <header className="league-public-header">
      <div className="league-public-header-inner">
        <Link to="/public" className="league-public-brand" aria-label="Betterinu Football League home">
          <img src="/assets/betterinu-league-logo.webp" width="900" height="524" alt="" />
        </Link>
        <PublicNavigation page={page} />
        <div className="league-public-header-actions">
          <span className="league-public-season">Season <strong>2026/27</strong></span>
          <button type="button" className="league-public-icon-button" onClick={onMore} aria-label="More league links" aria-haspopup="dialog">
            <Ellipsis size={22} aria-hidden="true" />
          </button>
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}

export function PublicLayout() {
  const { isAuthenticated, role } = useAuth();
  const { pathname } = useLocation();
  const page = pathname.split('/')[2];
  const lightPage = !page || page === 'fixtures' || page === 'standings';
  const layoutClass = ['arena', 'arena-public-shell', lightPage && 'arena-home-layout', page === 'fixtures' && 'arena-fixtures-layout']
    .filter(Boolean).join(' ');
  const moreRef = useRef(null);
  const closeRef = useRef(null);
  const dashboard = isAuthenticated && getStaffDashboard(role);
  const closeMore = () => moreRef.current?.close();

  useArenaViewport();

  useEffect(() => {
    moreRef.current?.close();
  }, [pathname]);

  return (
    <div className={layoutClass}>
      <ScrollRestoration />
      <a className="arena-skip" href="#arena-content">Skip to content</a>
      <PublicHeader page={page} onMore={() => {
        moreRef.current?.showModal();
        closeRef.current?.focus();
      }} />
      <main id="arena-content" tabIndex={-1} className="arena-content">
        <div key={pathname} className="arena-route"><Outlet /></div>
      </main>
      {!lightPage && (
        <footer className="arena-footer">
          <Link to="/">Betterinu Football League</Link>
          <span>5-a-side · 2026/27 season</span>
        </footer>
      )}
      <dialog ref={moreRef} className="arena-dialog arena-more league-public-more" aria-labelledby="arena-more-title"
        onClick={(event) => { if (event.target === event.currentTarget) closeMore(); }}>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 id="arena-more-title">More</h2>
            <button ref={closeRef} className="league-public-icon-button" type="button" onClick={closeMore} aria-label="Close navigation">
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <Link to="/public/teams" onClick={closeMore}><Users size={19} aria-hidden="true" /> Teams <ChevronRight size={16} aria-hidden="true" /></Link>
          <Link to="/public/teams?view=draft" onClick={closeMore}><ClipboardList size={19} aria-hidden="true" /> Draft board <ChevronRight size={16} aria-hidden="true" /></Link>
          <Link to="/public/teams?view=players&team=UNALLOCATED" onClick={closeMore}><Users size={19} aria-hidden="true" /> Draft pool <ChevronRight size={16} aria-hidden="true" /></Link>
          <Link to="/public/live" onClick={closeMore}><Radio size={19} aria-hidden="true" /> Live scores <ChevronRight size={16} aria-hidden="true" /></Link>
          <Link to="/" onClick={closeMore}><House size={19} aria-hidden="true" /> League entrance <ChevronRight size={16} aria-hidden="true" /></Link>
          {dashboard ? (
            <Link to={dashboard} onClick={closeMore}><ShieldCheck size={19} aria-hidden="true" /> Staff dashboard <ChevronRight size={16} aria-hidden="true" /></Link>
          ) : (
            <Link to="/login" onClick={closeMore}><LockKeyhole size={19} aria-hidden="true" /> Staff Login <ChevronRight size={16} aria-hidden="true" /></Link>
          )}
        </div>
      </dialog>
    </div>
  );
}

export default PublicLayout;
