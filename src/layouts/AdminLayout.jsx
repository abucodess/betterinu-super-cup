import React from 'react';
import { Calendar, LayoutGrid, Shield, Users } from 'lucide-react';
import { StaffArenaLayout } from './StaffArenaLayout';

const destinations = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/admin/players', label: 'Players', icon: Users },
  { to: '/admin/matches', label: 'Fixtures', icon: Calendar },
  { to: '/admin/teams', label: 'Teams', icon: Shield },
];

export function AdminLayout() {
  return <StaffArenaLayout title="Admin Portal" roleName="Admin" fallbackName="Super Admin" destinations={destinations} portal />;
}

export default AdminLayout;
