import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ExternalLink, LogOut } from 'lucide-react';
import { BrandLogo } from '../components/shared/BrandLogo';
import { authApi } from '../services/api/auth.api';
import { useArenaViewport } from '../hooks/useArenaViewport';
import '../arena.css';
import './staff-portal.css';

export function StaffArenaLayout({ title, roleName, fallbackName, destinations, portal = false }) {
  useArenaViewport();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, profile } = useSelector((state) => state.auth);
  const displayName = profile?.full_name || user?.email?.split('@')[0] || fallbackName;
  const activePage = destinations.find(({ to, end }) => end ? pathname === to : pathname.startsWith(to)) || destinations[0];
  const overview = portal && activePage === destinations[0];
  const navigation = destinations.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className="arena-nav-link">
      <Icon size={portal ? 18 : 16} aria-hidden="true" /> {label}
    </NavLink>
  ));

  async function handleSignOut() {
    try {
      await authApi.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <div className={portal ? 'arena arena-staff-shell staff-portal' : 'arena arena-staff-shell'}>
      <a className="arena-skip" href="#staff-content">Skip to content</a>
      {portal && (
        <aside className="staff-portal-sidebar">
          <Link to={destinations[0].to} className="staff-portal-brand">
            <img src="/assets/betterinu-league-logo.webp" width="900" height="524" alt="Betterinu Football League" />
            <span>{title}</span>
          </Link>
          <nav aria-label={`${roleName} navigation`}>{navigation}</nav>
        </aside>
      )}
      <header className="arena-header">
        <div className="arena-header-inner">
          {portal ? (
            <Link to={destinations[0].to} className="staff-portal-brand staff-portal-mobile-brand">
              <img src="/assets/betterinu-league-logo.webp" width="900" height="524" alt="Betterinu Football League" />
              <span>{title}</span>
            </Link>
          ) : <Link to="/" className="arena-brand">
            <span aria-hidden="true"><BrandLogo size="xs" to={null} /></span>
            <span className="arena-brand-name">Betterinu <span>Football League</span></span>
          </Link>}
          {!portal && <nav className="arena-nav" aria-label={`${roleName} navigation`}>{navigation}</nav>}
          <div className="arena-header-actions arena-staff-actions">
            {portal && <span className="staff-portal-account">{displayName}</span>}
            <Link to="/public" className="arena-icon-button" aria-label="Public League Hub" title="Public League Hub">
              <ExternalLink size={17} aria-hidden="true" /><span>League hub</span>
            </Link>
            <button type="button" onClick={handleSignOut} className="arena-icon-button arena-sign-out" aria-label="Sign Out" title="Sign Out">
              <LogOut size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main id="staff-content" tabIndex={-1} className="arena-content">
        <div className={overview ? 'arena-staff-heading staff-portal-banner' : 'arena-staff-heading'}>
          <div>
            <span className="arena-kicker">{overview ? 'Season 2026/27' : title}</span>
            <h1>{overview ? (roleName === 'Admin' ? 'League Management' : 'Match Official') : activePage.label}</h1>
            {overview && (
              <p>{roleName === 'Admin' ? 'Manage the league roster, fixtures and announcements.' : 'Manage your assigned fixtures and record match events.'}</p>
            )}
          </div>
          {!portal && <span className="arena-staff-name">{displayName}</span>}
        </div>
        <Outlet />
      </main>

      <nav className="arena-bottom-nav arena-staff-bottom" aria-label={`${roleName} mobile navigation`} style={{ '--staff-destinations': destinations.length }}>
        {destinations.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>
        ))}
      </nav>
    </div>
  );
}
