import React from 'react';
import { HeroSection } from '../../components/landing/HeroSection';

export function LandingPage() {
  return (
    <div className="h-dvh w-full bg-[#001AFF] text-[#F4F7F2] overflow-hidden">
      <main className="h-full w-full">
        <HeroSection />
      </main>
    </div>
  );
}

export default LandingPage;

