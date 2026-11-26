import React from 'react';
import { BarChart3, Calendar, Shield, Users } from 'lucide-react';
import { StaffArenaLayout } from './StaffArenaLayout';

const destinations = [
  { to: '/manager', label: 'Overview', icon: Shield, end: true },
  { to: '/manager/squad', label: 'Players', icon: Users },
  { to: '/manager/fixtures', label: 'Fixtures', icon: Calendar },
  { to: '/manager/statistics', label: 'Stats', icon: BarChart3 },
];

export function ManagerLayout() {
  return <StaffArenaLayout title="Manager Hub" roleName="Manager" fallbackName="Team Manager" destinations={destinations} />;
}

export default ManagerLayout;
