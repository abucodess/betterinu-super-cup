import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { BarChart3, CalendarDays, DoorOpen, Ellipsis, House, Shield, ShieldCheck } from 'lucide-react';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import { useArenaViewport } from '../hooks/useArenaViewport';
import '../arena.css';
import '../pages/public/tournament-home.css';
import './public-navigation.css';

const primaryLinks = [
  { to: '/public', label: 'Home', icon: House },
  { to: '/public/fixtures', label: 'Fixtures', icon: CalendarDays },
  { to: '/public/standings', label: 'Standings', icon: BarChart3 },
  { to: '/login', label: 'Staff Login', icon: ShieldCheck },
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

function PublicOverflow() {
  const { key } = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const close = () => setOpen(false);

  useEffect(() => {
    setOpen(false);
  }, [key]);

  useEffect(() => {
    if (!open) return;

    function dismissOutside(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    function dismissOnEscape(event) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    }

    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [open]);

  return (
    <div className="league-public-overflow" ref={menuRef} onBlur={(event) => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close();
    }}>
      <button type="button" className="league-public-icon-button" ref={triggerRef}
        onClick={() => setOpen((wasOpen) => !wasOpen)} aria-label="More league links"
        aria-controls="league-public-more" aria-expanded={open}>
        <Ellipsis size={22} aria-hidden="true" />
      </button>
      <nav className="league-public-more" id="league-public-more" aria-label="More league links"
        data-open={open || undefined} inert={open ? undefined : ''}>
        <Link to="/" onClick={close}><DoorOpen size={19} aria-hidden="true" /> Go to Entrance</Link>
        <Link to="/public#clubs" onClick={close}><Shield size={19} aria-hidden="true" /> Explore Teams</Link>
      </nav>
    </div>
  );
}

function PublicHeader({ page }) {
  return (
    <header className="league-public-header">
      <div className="league-public-header-inner">
        <Link to="/public" className="league-public-brand" aria-label="Betterinu Football League home">
          <img src="/assets/betterinu-league-logo.webp" width="900" height="524" alt="" />
        </Link>
        <PublicNavigation page={page} />
        <div className="league-public-header-actions">
          <span className="league-public-season">Season <strong>2026/27</strong></span>
          <PublicOverflow />
          <NotificationCenter />
        </div>
      </div>
    </header>
  );
}

export function PublicLayout() {
  const { pathname } = useLocation();
  const page = pathname.split('/')[2];
  const lightPage = !page || page === 'fixtures' || page === 'standings';
  const layoutClass = ['arena', 'arena-public-shell', lightPage && 'arena-home-layout', page === 'fixtures' && 'arena-fixtures-layout']
    .filter(Boolean).join(' ');
  useArenaViewport();

  return (
    <div className={layoutClass}>
      <ScrollRestoration />
      <a className="arena-skip" href="#arena-content">Skip to content</a>
      <PublicHeader page={page} />
      <main id="arena-content" tabIndex={-1} className="arena-content">
        <div key={pathname} className="arena-route"><Outlet /></div>
      </main>
      {!lightPage && (
        <footer className="arena-footer">
          <Link to="/">Betterinu Football League</Link>
          <span>5-a-side · 2026/27 season</span>
        </footer>
      )}
    </div>
  );
}

export default PublicLayout;
