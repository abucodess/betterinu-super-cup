import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Trophy, Calendar, BarChart3, Users, Radio, Lock, ShieldCheck } from 'lucide-react';

export function PublicLayout() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  const getRoleDashboardPath = () => {
    if (role === 'super_admin') return '/admin';
    if (role === 'manager') return '/manager';
    if (role === 'referee') return '/referee';
    return '/login';
  };

  const navItems = [
    { to: '/public', label: 'Home', icon: Trophy, end: true },
    { to: '/public/live', label: 'Live', icon: Radio },
    { to: '/public/fixtures', label: 'Fixtures', icon: Calendar },
    { to: '/public/standings', label: 'Table', icon: BarChart3 },
    { to: '/public/teams', label: 'Players', icon: Users },
    {
      to: isAuthenticated ? getRoleDashboardPath() : '/login',
      label: isAuthenticated ? 'Portal' : 'Staff',
      icon: isAuthenticated ? ShieldCheck : Lock,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090909] text-[#F4F7F2]">
      {/* Main Content Container (No top header — mobile-first layout with bottom-only navigation) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 pt-4 pb-24">
        <Outlet />
      </main>

      {/* Single Bottom Navigation Dock */}
      <nav
        aria-label="Public navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[#262626] bg-[#0B0D0A]/95 backdrop-blur-md"
      >
        <div className="max-w-lg mx-auto h-full grid grid-cols-6 items-center px-1.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-1.5 mx-auto px-2 rounded-2xl text-[10px] font-semibold transition-all whitespace-nowrap ${
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

export default PublicLayout;
