import React from 'react';
import { HeroSection } from '../../components/landing/HeroSection';
import { useArenaViewport } from '../../hooks/useArenaViewport';

export function LandingPage() {
  useArenaViewport();

  return (
    <main className="championship-landing">
      <HeroSection />
    </main>
  );
}

export default LandingPage;
