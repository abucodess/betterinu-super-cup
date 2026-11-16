import React from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutGrid,
  Users,
  Shield,
  Calendar,
  LogOut,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from '../components/shared/BrandLogo';
import { authApi } from '../services/api/auth.api';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useSelector((state) => state.auth);

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
    { to: '/admin/players', label: 'Players', icon: Users },
    { to: '/admin/teams', label: 'Teams', icon: Shield },
    { to: '/admin/matches', label: 'Fixtures', icon: Calendar },
  ];

  const handleSignOut = async () => {
    try {
      await authApi.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Super Admin';
  const currentNav =
    navItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ) || navItems[0];

  return (
    <div className="min-h-screen flex bg-[#090909] text-[#F4F7F2]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#121212] border-r border-[#262626] z-30">
        <div className="h-1.5 w-full flex shrink-0">
          <span className="flex-1 bg-[#001AFF]" />
          <span className="flex-1 bg-[#FFC600]" />
          <span className="flex-1 bg-[#FF1E27]" />
        </div>
        <div className="h-16 px-5 border-b border-[#262626] flex items-center gap-3">
          <BrandLogo size="sm" />
          <div className="min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-[#F4F7F2] block leading-none truncate">
              Admin Console
            </span>
            <span className="text-[11px] font-semibold text-[#FFC600] block mt-1">
              League Commissioner
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9AA69B]">
              Management
            </p>
            <nav aria-label="Admin navigation" className="space-y-1">
              {navItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#001AFF] text-[#FFFFFF] shadow-[0_6px_20px_rgba(0,26,255,0.35)] border border-[#3B82F6]/40'
                        : 'text-[#9AA69B] hover:bg-[#1C1C1C] hover:text-[#F4F7F2]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#FFC600]"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#FFC600]' : 'text-current'
                        }`}
                      />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-3 border-t border-[#262626] bg-[#0E0E0E] space-y-2">
          <Link
            to="/public"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#181818] hover:bg-[#001AFF]/20 text-xs font-semibold text-[#F4F7F2] hover:text-[#FFC600] border border-[#303030] transition-colors"
          >
            <span>Public League Hub</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#9AA69B]" />
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF1E27]/15 hover:bg-[#FF1E27]/25 text-[#FF6B72] border border-[#FF1E27]/40 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-[#262626] bg-[#121212]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="lg:hidden">
              <BrandLogo size="sm" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9AA69B]">
                <span>Admin Console</span>
                <ChevronRight className="w-3 h-3 text-[#6E7A70]" />
                <span className="text-[#FFC600] font-bold">{currentNav.label}</span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-[#F4F7F2] truncate leading-tight">
                {currentNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#001AFF]/20 border border-[#3B82F6]/45">
              <span className="w-2 h-2 rounded-full bg-[#FFC600]" />
              <span className="text-xs font-bold text-[#F4F7F2] truncate max-w-[150px]">
                {displayName}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign Out"
              title="Sign Out"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[#FF6B72] bg-[#FF1E27]/15 hover:bg-[#FF1E27]/25 border border-[#FF1E27]/40 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav
          aria-label="Admin mobile navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-16 border-t border-[#262626] bg-[#121212]/95 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.65)]"
        >
          <div className="max-w-lg mx-auto h-full grid grid-cols-4 items-center px-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={label}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-1.5 mx-auto px-3 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#001AFF] text-[#FFC600] shadow-xs'
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
    </div>
  );
}

export default AdminLayout;
