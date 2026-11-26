import { darkHorseClubId, officialCrests } from '../teams/officialCrests';

// These are the existing club IDs returned by the teams and fixtures APIs.
const clubVisuals = {
  '22222222-2222-2222-2222-222222222221': {
    crest: officialCrests.FCA, portrait: '/assets/offside-oracles-captain.webp', style: 'oracles',
  },
  '22222222-2222-2222-2222-222222222222': {
    crest: officialCrests.FCB, portrait: '/assets/lucky-star-captain.webp', style: 'lucky',
  },
  [darkHorseClubId]: {
    crest: officialCrests.FCC, portrait: '/assets/dark-horse-captain.webp', style: 'dark-horse',
  },
};

export function getFixtureClubVisuals(team, teamId) {
  const visuals = clubVisuals[teamId || team?.id];
  return {
    club: { ...team, logo_url: visuals?.crest || team?.logo_url },
    portrait: visuals?.portrait,
    style: visuals?.style,
  };
}
