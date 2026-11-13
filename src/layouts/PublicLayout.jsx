import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, Calendar, BarChart3, Users, Radio, Lock, ShieldCheck } from 'lucide-react';

export function PublicLayout() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  const getRoleDashboardPath = () => {
    if (role === 'super_admin') return '/admin';
    if (role === 'manager') return '/manager';
    if (role === 'referee') return '/referee';
    return '/login';
  };

  const navItems = [
    { to: '/public', label: 'Home', icon: Home, end: true },
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
      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 pt-4 pb-28">
        <Outlet />
      </main>

      {/* Floating Pill Dock Navigation (Inspired by Reference Design) */}
      <div className="fixed bottom-3 left-0 right-0 z-40 px-3 pointer-events-none flex justify-center">
        <nav
          aria-label="Public navigation"
          className="pointer-events-auto w-full max-w-[430px] rounded-[28px] bg-[#161616]/95 backdrop-blur-xl border border-white/[0.08] p-2 shadow-[0_16px_40px_rgba(0,0,0,0.85)]"
        >
          <div className="grid grid-cols-6 items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className="group flex flex-col items-center justify-center gap-1"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-[#B8F34A] text-[#090909] scale-105 shadow-[0_0_20px_rgba(184,243,74,0.4)]'
                          : 'bg-[#222222] text-[#9AA69B] group-hover:text-[#F4F7F2] group-hover:bg-[#2a2a2a]'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </span>
                    <span
                      className={`text-[9px] font-bold tracking-tight transition-colors ${
                        isActive ? 'text-[#B8F34A]' : 'text-[#9AA69B]'
                      }`}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default PublicLayout;
