import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ManagerLayout } from '../layouts/ManagerLayout';
import { RefereeLayout } from '../layouts/RefereeLayout';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';

import { LandingPage } from '../pages/public/LandingPage';
import { TournamentHomePage } from '../pages/public/TournamentHomePage';
import { LiveMatchPage } from '../pages/public/LiveMatchPage';
import { FixturesPage } from '../pages/public/FixturesPage';
import { StandingsPage } from '../pages/public/StandingsPage';
import { TeamsPage } from '../pages/public/TeamsPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ManagerDashboardPage } from '../pages/manager/ManagerDashboardPage';
import { RefereeControlPage } from '../pages/referee/RefereeControlPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/public',
    element: <PublicLayout />,
    children: [
      { index: true, element: <TournamentHomePage /> },
      { path: 'live', element: <LiveMatchPage /> },
      { path: 'fixtures', element: <FixturesPage /> },
      { path: 'standings', element: <StandingsPage /> },
      { path: 'teams', element: <TeamsPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'players', element: <AdminDashboardPage /> },
      { path: 'teams', element: <AdminDashboardPage /> },
      { path: 'matches', element: <AdminDashboardPage /> },
    ],
  },
  {
    path: '/manager',
    element: (
      <ProtectedRoute allowedRoles={['manager']}>
        <ManagerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ManagerDashboardPage /> },
      { path: 'squad', element: <ManagerDashboardPage /> },
      { path: 'fixtures', element: <ManagerDashboardPage /> },
      { path: 'statistics', element: <ManagerDashboardPage /> },
    ],
  },
  {
    path: '/referee',
    element: (
      <ProtectedRoute allowedRoles={['referee']}>
        <RefereeLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RefereeControlPage /> },
      { path: 'events', element: <RefereeControlPage /> },
      { path: 'history', element: <RefereeControlPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
export default router;
