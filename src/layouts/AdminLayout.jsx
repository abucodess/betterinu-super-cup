import React from 'react';
import { Calendar, LayoutGrid, Shield, Users } from 'lucide-react';
import { StaffArenaLayout } from './StaffArenaLayout';

const destinations = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/admin/players', label: 'Players', icon: Users },
  { to: '/admin/teams', label: 'Teams', icon: Shield },
  { to: '/admin/matches', label: 'Fixtures', icon: Calendar },
];

export function AdminLayout() {
  return <StaffArenaLayout title="Admin Console" roleName="Admin" fallbackName="Super Admin" destinations={destinations} />;
}

export default AdminLayout;
