import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ExternalLink, LogOut } from 'lucide-react';
import { BrandLogo } from '../components/shared/BrandLogo';
import { authApi } from '../services/api/auth.api';
import { useArenaViewport } from '../hooks/useArenaViewport';
import '../arena.css';

export function StaffArenaLayout({ title, roleName, fallbackName, destinations }) {
  useArenaViewport();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, profile } = useSelector((state) => state.auth);
  const displayName = profile?.full_name || user?.email?.split('@')[0] || fallbackName;
  const activePage = destinations.find(({ to, end }) => end ? pathname === to : pathname.startsWith(to)) || destinations[0];

  async function handleSignOut() {
    try {
      await authApi.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <div className="arena arena-staff-shell">
      <a className="arena-skip" href="#staff-content">Skip to content</a>
      <header className="arena-header">
        <div className="arena-header-inner">
          <Link to="/" className="arena-brand">
            <span aria-hidden="true"><BrandLogo size="xs" to={null} /></span>
            <span className="arena-brand-name">Betterinu <span>Football League</span></span>
          </Link>
          <nav className="arena-nav" aria-label={`${roleName} navigation`}>
            {destinations.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="arena-nav-link">
                <Icon size={16} aria-hidden="true" /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="arena-header-actions arena-staff-actions">
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
        <div className="arena-staff-heading">
          <div>
            <span className="arena-kicker">{title}</span>
            <h1>{activePage.label}</h1>
          </div>
          <span className="arena-staff-name">{displayName}</span>
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
