import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Home,
  Calendar,
  BarChart3,
  Users,
  Radio,
  Lock,
  ShieldCheck,
  Menu,
  X,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from '../components/shared/BrandLogo';

export function PublicLayout() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleDashboardPath = () => {
    if (role === 'super_admin') return '/admin';
    if (role === 'manager') return '/manager';
    if (role === 'referee') return '/referee';
    return '/login';
  };

  const primaryNavItems = [
    { to: '/public', label: 'Overview', shortLabel: 'Home', icon: Home, end: true },
    { to: '/public/live', label: 'Live Match Center', shortLabel: 'Live', icon: Radio },
    { to: '/public/fixtures', label: 'Match Fixtures', shortLabel: 'Fixtures', icon: Calendar },
    { to: '/public/standings', label: 'Standings & Stats', shortLabel: 'Table', icon: BarChart3 },
    { to: '/public/teams', label: 'Teams & Draft', shortLabel: 'Teams', icon: Users },
  ];

  const portalItem = {
    to: isAuthenticated ? getRoleDashboardPath() : '/login',
    label: isAuthenticated ? 'Staff Dashboard' : 'Staff Sign In',
    shortLabel: isAuthenticated ? 'Portal' : 'Staff',
    icon: isAuthenticated ? ShieldCheck : Lock,
  };

  const currentPage =
    primaryNavItems.find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    ) || primaryNavItems[0];

  return (
    <div className="min-h-screen flex bg-[#090909] text-[#F4F7F2]">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-[#121212] border-r border-[#262626] z-30">
        {/* Top Tri-Color Championship Strip */}
        <div className="h-1.5 w-full flex shrink-0">
          <span className="flex-1 bg-[#001AFF]" />
          <span className="flex-1 bg-[#FFC600]" />
          <span className="flex-1 bg-[#FF1E27]" />
        </div>

        {/* Brand Identity Header */}
        <div className="h-16 px-5 border-b border-[#262626] flex items-center justify-between">
          <Link to="/public" className="flex items-center gap-3 min-w-0 group">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <span className="font-extrabold text-sm tracking-tight text-[#F4F7F2] block leading-none truncate group-hover:text-[#FFC600] transition-colors">
                BetterInU League
              </span>
              <span className="text-[11px] font-semibold text-[#FFC600] block mt-1">
                2026 Official Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Primary Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          <div>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#9AA69B]">
              Tournament Hub
            </p>
            <nav aria-label="Primary tournament navigation" className="space-y-1">
              {primaryNavItems.map(({ to, label, icon: Icon, end }) => (
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
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Competition Highlight Card */}
          <div className="mx-1 p-3.5 rounded-xl bg-[#181818] border border-[#FFC600]/35 relative overflow-hidden">
            <div className="h-0.5 w-full absolute top-0 left-0 right-0 flex">
              <span className="flex-1 bg-[#001AFF]" />
              <span className="flex-1 bg-[#FFC600]" />
              <span className="flex-1 bg-[#FF1E27]" />
            </div>
            <div className="flex items-center gap-2 mb-1.5 pt-0.5">
              <span className="w-6 h-6 rounded-lg bg-[#FFC600] text-[#090909] flex items-center justify-center shrink-0 shadow-xs">
                <Trophy className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-extrabold text-[#F4F7F2]">
                5-a-Side Championship
              </span>
            </div>
            <p className="text-[11px] text-[#9AA69B] leading-relaxed">
              3 official clubs • 15 draft players • Round-robin league &amp; Grand Final.
            </p>
          </div>
        </div>

        {/* Secondary Navigation / Staff Access Footer */}
        <div className="p-3 border-t border-[#262626] bg-[#0E0E0E]">
          <NavLink
            to={portalItem.to}
            className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#181818] hover:bg-[#001AFF]/20 text-[#F4F7F2] hover:text-[#FFC600] border border-[#303030] hover:border-[#001AFF]/60 text-xs font-bold transition-all"
          >
            <span className="flex items-center gap-2.5">
              <portalItem.icon className="w-4 h-4 text-[#FFC600]" />
              <span>{portalItem.label}</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9AA69B]" />
          </NavLink>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Tri-Color Championship Strip */}
        <div className="h-1.5 w-full flex shrink-0 sticky top-0 z-40">
          <span className="flex-1 bg-[#001AFF]" />
          <span className="flex-1 bg-[#FFC600]" />
          <span className="flex-1 bg-[#FF1E27]" />
        </div>

        {/* Top Navigation Bar */}
        <header className="sticky top-1.5 z-30 h-16 bg-[#121212]/95 backdrop-blur-md border-b border-[#262626] px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#303030] flex items-center justify-center text-[#F4F7F2] hover:border-[#FFC600]"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="lg:hidden">
              <BrandLogo size="sm" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9AA69B]">
                <span>BetterInU League</span>
                <ChevronRight className="w-3 h-3 text-[#6E7A70]" />
                <span className="text-[#FFC600] font-bold truncate">
                  {currentPage.label}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-[#F4F7F2] truncate leading-tight">
                {currentPage.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/public/live"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF1E27]/15 border border-[#FF1E27]/45 text-[#FF6B72] text-xs font-extrabold hover:bg-[#FF1E27] hover:text-[#FFFFFF] transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-[#FF1E27] animate-pulse" />
              <span>Matchday Live</span>
            </Link>

            <Link
              to={portalItem.to}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#001AFF] hover:bg-[#1B3BFF] text-[#FFFFFF] text-xs font-bold transition-colors border border-[#3B82F6]/40 shadow-xs"
            >
              <portalItem.icon className="w-3.5 h-3.5 text-[#FFC600]" />
              <span>{portalItem.shortLabel}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[82vw] bg-[#121212] h-full flex flex-col border-r border-[#262626] shadow-2xl z-10">
              <div className="h-16 px-4 border-b border-[#262626] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BrandLogo size="sm" />
                  <div>
                    <span className="font-extrabold text-sm text-[#F4F7F2] block leading-none">
                      BetterInU League
                    </span>
                    <span className="text-[10px] font-semibold text-[#FFC600]">
                      Official Tournament Hub
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#1C1C1C] border border-[#303030] flex items-center justify-center text-[#9AA69B]"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {primaryNavItems.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#001AFF] text-[#FFFFFF]'
                          : 'text-[#9AA69B] hover:bg-[#1C1C1C] hover:text-[#F4F7F2]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-[#FFC600]' : 'text-current'
                          }`}
                        />
                        <span>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="p-3 border-t border-[#262626] bg-[#0E0E0E]">
                <NavLink
                  to={portalItem.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#181818] border border-[#303030] text-xs font-bold text-[#F4F7F2]"
                >
                  <span className="flex items-center gap-2">
                    <portalItem.icon className="w-4 h-4 text-[#FFC600]" />
                    <span>{portalItem.label}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#9AA69B]" />
                </NavLink>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-10">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Public mobile navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#121212]/95 backdrop-blur-md border-t border-[#262626] px-2 py-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.65)]"
        >
          <div className="max-w-md mx-auto grid grid-cols-6 items-center gap-1">
            {[...primaryNavItems, portalItem].map(({ to, shortLabel, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                aria-label={shortLabel}
                className="flex flex-col items-center justify-center py-1 rounded-xl transition-colors"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-[#001AFF] text-[#FFC600] shadow-xs'
                          : 'text-[#9AA69B]'
                      }`}
                    >
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </span>
                    <span
                      className={`text-[10px] mt-0.5 font-bold tracking-tight ${
                        isActive ? 'text-[#FFC600]' : 'text-[#9AA69B]'
                      }`}
                    >
                      {shortLabel}
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
