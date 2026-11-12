import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ManagerLayout } from '@/layouts/ManagerLayout'
import { RefereeLayout } from '@/layouts/RefereeLayout'

// Security & Guards
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

// Pages
import { LandingPage } from '@/pages/public/LandingPage'
import { TournamentHomePage } from '@/pages/public/TournamentHomePage'
import { LiveMatchPage } from '@/pages/public/LiveMatchPage'
import { FixturesPage } from '@/pages/public/FixturesPage'
import { StandingsPage } from '@/pages/public/StandingsPage'
import { TeamsPage } from '@/pages/public/TeamsPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { ManagerDashboardPage } from '@/pages/manager/ManagerDashboardPage'
import { RefereeControlPage } from '@/pages/referee/RefereeControlPage'

export const router = createBrowserRouter([
  // Initial Landing Page Experience (ARCHITECTURE.md §6.1)
  {
    path: '/',
    element: <LandingPage />,
  },

  // Management Login (ARCHITECTURE.md §6.3)
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Public Experience (ARCHITECTURE.md §6.2)
  {
    path: '/public',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <TournamentHomePage />,
      },
      {
        path: 'live',
        element: <LiveMatchPage />,
      },
      {
        path: 'fixtures',
        element: <FixturesPage />,
      },
      {
        path: 'standings',
        element: <StandingsPage />,
      },
      {
        path: 'teams',
        element: <TeamsPage />,
      },
    ],
  },

  // Super Admin Control Center (ARCHITECTURE.md §6.5 & §6.6)
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'players',
        element: <AdminDashboardPage />,
      },
      {
        path: 'teams',
        element: <AdminDashboardPage />,
      },
      {
        path: 'matches',
        element: <AdminDashboardPage />,
      },
    ],
  },

  // Manager Workspace (ARCHITECTURE.md §6.5 & §6.6)
  {
    path: '/manager',
    element: (
      <ProtectedRoute allowedRoles={['manager']}>
        <ManagerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ManagerDashboardPage />,
      },
      {
        path: 'squad',
        element: <ManagerDashboardPage />,
      },
      {
        path: 'fixtures',
        element: <ManagerDashboardPage />,
      },
      {
        path: 'statistics',
        element: <ManagerDashboardPage />,
      },
    ],
  },

  // Referee Match Control Panel (ARCHITECTURE.md §6.5 & §6.6)
  {
    path: '/referee',
    element: (
      <ProtectedRoute allowedRoles={['referee']}>
        <RefereeLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <RefereeControlPage />,
      },
      {
        path: 'events',
        element: <RefereeControlPage />,
      },
      {
        path: 'history',
        element: <RefereeControlPage />,
      },
    ],
  },

  // Fallback Route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

