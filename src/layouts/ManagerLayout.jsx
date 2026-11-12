import React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Users,
  LayoutDashboard,
  Calendar,
  BarChart2,
  LogOut,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export function ManagerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItems = [
    { label: 'Overview', path: '/manager', icon: LayoutDashboard },
    { label: 'My Squad', path: '/manager/squad', icon: Users },
    { label: 'Fixtures', path: '/manager/fixtures', icon: Calendar },
    { label: 'Statistics', path: '/manager/statistics', icon: BarChart2 },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col lg:flex-row">
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#303030] bg-[#090909] p-5 shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#252525]">
          <div className="h-10 w-10 rounded-xl bg-[#141414] border border-[#303030] flex items-center justify-center text-[#B8F34A]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-[#F4F7F2]">MANAGER HUB</h1>
            <p className="text-[11px] text-[#9AA69B] uppercase tracking-wider">Team Representative</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 py-6 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-[#9AA69B] uppercase tracking-wider mb-2">
            Team Management
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#141414] text-[#B8F34A] border border-[#303030]'
                    : 'text-[#9AA69B] hover:text-[#F4F7F2] hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#B8F34A]' : 'text-[#9AA69B]'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-[#B8F34A]" />}
              </Link>
            )
          })}
        </nav>

        {/* Bottom User Area */}
        <div className="pt-4 border-t border-[#252525] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#F4F7F2]">Team Manager</p>
              <p className="text-[10px] text-[#9AA69B]">{user?.email || 'manager1@supercup.com'}</p>
            </div>
            <Badge variant="info">MANAGER</Badge>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start text-xs text-[#9AA69B] hover:text-[#FF414D] hover:border-[#FF414D]/50"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-[#090909]/95 backdrop-blur border-b border-[#303030] px-4 py-3 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <span className="lg:hidden h-8 w-8 rounded-lg bg-[#141414] border border-[#303030] flex items-center justify-center text-[#B8F34A]">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <span className="text-sm font-bold text-[#F4F7F2]">Manager Dashboard</span>
              <Badge variant="info" className="ml-2 text-[10px] py-0 px-1.5">
                ASSIGNED SQUAD
              </Badge>
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
              className="lg:hidden text-[#9AA69B] hover:text-[#FF414D] p-1.5 rounded-lg border border-[#303030] bg-[#141414]"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (DESIGN_SYSTEM.md §6.3: Home, Squad, Matches, Statistics, More) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090909] border-t border-[#303030] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] text-[10px] font-medium transition-colors ${
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
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] text-[10px] font-medium text-[#9AA69B]"
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span>Public</span>
        </Link>
      </nav>
    </div>
  )
}

