import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { Trophy, Activity, Calendar, Shield, Users, Settings } from 'lucide-react'

export function PublicLayout() {
  const location = useLocation()

  const navLinks = [
    { label: 'Overview', path: '/public', icon: Trophy },
    { label: 'Live Match', path: '/public/live', icon: Activity },
    { label: 'Fixtures', path: '/public/fixtures', icon: Calendar },
    { label: 'Standings', path: '/public/standings', icon: Shield },
    { label: 'Teams', path: '/public/teams', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#090909]/95 backdrop-blur border-b border-[#303030] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-[#141414] border border-[#303030] flex items-center justify-center text-[#B8F34A] group-hover:border-[#B8F34A] transition-colors">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm sm:text-base text-[#F4F7F2] block leading-tight">
                IFL PLATFORM
              </span>
              <span className="text-[10px] text-[#9AA69B] uppercase tracking-wider block leading-tight">
                Institute Football League
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-[#141414] text-[#B8F34A] border border-[#303030]'
                      : 'text-[#9AA69B] hover:text-[#F4F7F2] hover:bg-[#141414]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Action: Management Entry */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              title="Management Login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141414] border border-[#303030] text-[#9AA69B] hover:text-[#B8F34A] hover:border-[#B8F34A]/50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Management</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090909] border-t border-[#303030] px-2 py-2 flex items-center justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = location.pathname === link.path
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#B8F34A]' : 'text-[#9AA69B]'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{link.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <footer className="hidden md:block border-t border-[#303030] bg-[#090909] py-6 text-center text-xs text-[#9AA69B]">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Institute Football League Platform. Official Tournament System.</p>
        </div>
      </footer>
    </div>
  )
}

