import React from 'react';
import { LandingNavbar } from '../../components/landing/LandingNavbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { BelowFoldSections } from '../../components/landing/BelowFoldSections';

export function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-[#090909] text-[#F4F7F2] overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <BelowFoldSections />
      </main>
    </div>
  );
}

export default LandingPage;
