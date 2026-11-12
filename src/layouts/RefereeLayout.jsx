import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  FileText,
  History,
  LogOut,
  Radio,
  Menu,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'

export function RefereeLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItems = [
    { label: 'Match', path: '/referee', icon: Activity },
    { label: 'Events', path: '/referee/events', icon: Radio },
    { label: 'History', path: '/referee/history', icon: History },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col">
      {/* Referee Header */}
      <header className="sticky top-0 z-40 bg-[#090909] border-b border-[#303030] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#141414] border border-[#303030] flex items-center justify-center text-[#FF414D]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[#F4F7F2]">REFEREE PANEL</span>
              <Badge variant="live" isLive className="text-[10px] py-0 px-1.5">
                MATCH CONTROL
              </Badge>
            </div>
            <p className="text-[10px] text-[#9AA69B] uppercase tracking-wider">Live Match Official</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/public"
            className="text-xs text-[#9AA69B] hover:text-[#B8F34A] px-2.5 py-1.5 rounded-lg border border-[#303030] bg-[#141414]"
          >
            Public View
          </Link>
          <button
            onClick={handleLogout}
            className="text-[#9AA69B] hover:text-[#FF414D] p-1.5 rounded-lg border border-[#303030] bg-[#141414]"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 pb-24">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (DESIGN_SYSTEM.md §6.3: Match, Events, History, More) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#090909] border-t border-[#303030] px-4 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[64px] min-h-[44px] text-xs font-semibold transition-colors ${
                isActive ? 'text-[#B8F34A]' : 'text-[#9AA69B]'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <Link
          to="/public"
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-lg min-w-[64px] min-h-[44px] text-xs font-semibold text-[#9AA69B]"
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span>Exit</span>
        </Link>
      </nav>
    </div>
  )
}

