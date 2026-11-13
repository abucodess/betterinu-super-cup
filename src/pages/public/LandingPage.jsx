import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowUpRight } from 'lucide-react';

/**
 * Hero carousel slides.
 * Currently displays Lionel Messi; additional slides (e.g. Neymar, Cristiano)
 * can be added to this array later.
 */
const HERO_SLIDES = [
  {
    id: 'messi',
    name: 'Lionel Messi',
    image: '/assets/aistudio/pngwing.com_3118625d.png',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const currentHero = HERO_SLIDES[activeSlide] || HERO_SLIDES[0];

  return (
    <div className="h-dvh min-h-screen w-full bg-[#090909] text-[#F4F7F2] flex items-center justify-center overflow-hidden select-none">
      {/* Mobile-First Fullscreen Container */}
      <div className="relative w-full max-w-[440px] h-full flex flex-col justify-between overflow-hidden">
        {/* Radial Olive-Lime Stadium Spotlight Backlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 34%, rgba(132, 190, 38, 0.38) 0%, rgba(62, 92, 16, 0.22) 44%, rgba(9, 9, 9, 0.98) 76%)',
          }}
        />

        {/* Upper Hero Cutout Area (Carousel Image) */}
        <div className="relative z-10 flex-1 flex items-end justify-center pt-6 px-4 min-h-0">
          <div className="relative w-full h-full max-h-[58vh] flex items-end justify-center">
            <img
              key={currentHero.id}
              src={currentHero.image}
              alt={currentHero.name}
              className="w-full h-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
            />
            {/* Smooth Bottom Vignette Fade into Headline */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090909] via-[#090909]/85 to-transparent" />
          </div>
        </div>

        {/* Bottom Headline, Subtitle, Carousel Dots & Get Started CTA */}
        <div className="relative z-20 px-6 pb-8 pt-2 space-y-6 bg-[#090909]">
          <div className="space-y-3">
            <h1 className="text-[32px] sm:text-[36px] font-bold tracking-tight text-[#F4F7F2] leading-[1.15]">
              <span className="block">Step into the game</span>
              <span className="inline-flex items-center gap-3 flex-wrap mt-1">
                <span>Own the win</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191B17] border border-white/10 shadow-inner translate-y-[1px]">
                  <span className="text-sm leading-none" role="img" aria-label="Football">
                    ⚽
                  </span>
                  <Trophy className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]/20" />
                </span>
              </span>
            </h1>

            <p className="text-sm text-[#9AA69B] leading-relaxed max-w-[260px]">
              Join the action make your moves and claim your victory
            </p>
          </div>

          {/* Bottom Action Row: 3 Carousel Indicator Dots + "Get started ↗" Pill Button */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Hero slides">
              {[0, 1, 2].map((idx) => {
                const isActive = idx === 2;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(0)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      isActive ? 'w-6 bg-[#B8F34A]' : 'w-1.5 bg-[#32362E]'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => navigate('/public')}
              className="group inline-flex items-center justify-between gap-5 pl-7 pr-2 py-2 rounded-full bg-[#B8F34A] hover:bg-[#c7ff5e] text-[#090909] font-semibold text-sm shadow-[0_8px_28px_rgba(184,243,74,0.28)] transition-all active:scale-[0.98]"
            >
              <span>Get started</span>
              <span className="w-9 h-9 rounded-full bg-[#9ED932] group-hover:bg-[#8ec726] flex items-center justify-center text-[#090909] transition-transform group-hover:translate-x-0.5">
                <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
