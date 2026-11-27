import React from 'react';
import { ClipboardList, History, Timer } from 'lucide-react';
import { StaffArenaLayout } from './StaffArenaLayout';

const destinations = [
  { to: '/referee', label: 'Dashboard', icon: Timer, end: true },
  { to: '/referee/events', label: 'Events', icon: ClipboardList },
  { to: '/referee/history', label: 'My Matches', icon: History },
];

export function RefereeLayout() {
  return <StaffArenaLayout title="Referee Portal" roleName="Referee" fallbackName="Match Official" destinations={destinations} portal />;
}

export default RefereeLayout;
