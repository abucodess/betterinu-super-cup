import React from 'react';
import { ClipboardList, History, Timer } from 'lucide-react';
import { StaffArenaLayout } from './StaffArenaLayout';

const destinations = [
  { to: '/referee', label: 'Control', icon: Timer, end: true },
  { to: '/referee/events', label: 'Events', icon: ClipboardList },
  { to: '/referee/history', label: 'Matches', icon: History },
];

export function RefereeLayout() {
  return <StaffArenaLayout title="Referee Console" roleName="Referee" fallbackName="Match Official" destinations={destinations} />;
}

export default RefereeLayout;
