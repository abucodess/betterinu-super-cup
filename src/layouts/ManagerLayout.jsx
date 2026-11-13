import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Shield, Users, Calendar, BarChart3, LogOut } from 'lucide-react';
import { BrandLogo } from '../components/shared/BrandLogo';
import { authApi } from '../services/api/auth.api';

export function ManagerLayout() {
  const navigate = useNavigate();
  const { user, profile } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/manager', label: 'Overview', icon: Shield, end: true },
    { to: '/manager/squad', label: 'Players', icon: Users },
    { to: '/manager/fixtures', label: 'Fixtures', icon: Calendar },
    { to: '/manager/statistics', label: 'Stats', icon: BarChart3 },
  ];

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Team Manager';

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-[#F4F7F2]">
      {/* Minimal Top Header with Official Brand Logo & Icon-Only Logout */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#262626] bg-[#141414]/95 backdrop-blur-md px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandLogo size="sm" />
          <div className="min-w-0">
            <span className="font-bold text-xs uppercase tracking-wide block leading-none text-[#F4F7F2]">
              Manager Hub
            </span>
            <span className="text-[10px] text-[#B8F34A] truncate block mt-0.5 font-medium">
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

      {/* Single Bottom Navigation Bar */}
      <nav
        aria-label="Manager navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[#262626] bg-[#141414]/95 backdrop-blur-md"
      >
        <div className="max-w-lg mx-auto h-full grid grid-cols-4 items-center px-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1.5 mx-auto px-3 rounded-2xl text-[10px] font-semibold transition-all whitespace-nowrap ${
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

export default ManagerLayout;
