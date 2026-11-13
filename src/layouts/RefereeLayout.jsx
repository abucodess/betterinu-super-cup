import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Timer, ClipboardList, History, LogOut } from 'lucide-react';
import { authApi } from '../services/api/auth.api';

export function RefereeLayout() {
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/referee', label: 'Control', icon: Timer, end: true },
    { to: '/referee/events', label: 'Events', icon: ClipboardList },
    { to: '/referee/history', label: 'Matches', icon: History },
  ];

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Match Official';

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-[#F4F7F2]">
      {/* Minimal Pitchside Header with Icon-Only Logout */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#262626] bg-[#141414]/95 backdrop-blur-md px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF414D] animate-pulse shrink-0" />
          <div className="min-w-0">
            <span className="font-bold text-xs tracking-wider uppercase text-[#F4F7F2] block leading-none">
              Referee Console
            </span>
            <span className="text-[10px] text-[#9AA69B] truncate block mt-0.5">
              {displayName}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign Out"
          title="Sign Out"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-4 pb-24">
        <Outlet />
      </main>

      {/* Single Bottom Navigation */}
      <nav
        aria-label="Referee navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[#262626] bg-[#141414]/95 backdrop-blur-md"
      >
        <div className="max-w-lg mx-auto h-full grid grid-cols-3 items-center px-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1.5 mx-auto px-4 rounded-2xl text-[10px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#B8F34A] text-[#090909] shadow-md'
                    : 'text-[#9AA69B] hover:text-[#F4F7F2]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default RefereeLayout;
