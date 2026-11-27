import React from 'react';
import { UserRound } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ClubCrest } from './ArenaUI';
import { MatchSummary } from './MatchSummary';
import { officialCrests } from '../../features/teams/officialCrests';
import { cloudinaryService } from '../../services/cloudinary/cloudinary.service';

export function StaffButton({ variant = 'primary', ...props }) {
  return <Button variant={variant} data-staff-button={variant} {...props} />;
}

export function StaffCard({ className = '', ...props }) {
  return <Card className={`staff-card ${className}`} {...props} />;
}

export function StaffBadge({ variant = 'neutral', ...props }) {
  return <Badge variant={variant} data-staff-badge={variant} {...props} />;
}

export function StaffCrest({ club }) {
  return <ClubCrest club={withOfficialCrest(club)} className="staff-crest" />;
}

function withOfficialCrest(club) {
  return club && { ...club, logo_url: officialCrests[club.short_code] || club.logo_url };
}

export function StaffMatchSummary({ match }) {
  return <MatchSummary match={{ ...match, home_team: withOfficialCrest(match.home_team), away_team: withOfficialCrest(match.away_team) }} compact />;
}

export function StaffPlayerAvatar({ player }) {
  const source = cloudinaryService.getOptimizedPortraitUrl(player.photo_url);
  const [failedSource, setFailedSource] = React.useState(null);
  return (
    <span className="staff-player-avatar" aria-hidden="true">
      {source && source !== failedSource ? <img src={source} alt="" loading="lazy" onError={() => setFailedSource(source)} /> : <UserRound size={18} />}
    </span>
  );
}
