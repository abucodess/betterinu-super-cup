import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { BrandLogo } from '../../components/shared/BrandLogo';

const HERO_SLIDES = [
  {
    id: 'messi',
    name: 'Lionel Messi',
    tag: 'Lionel Messi • #10',
    image: '/assets/aistudio/pngwing.com_3118625d.png',
  },
  {
    id: 'ronaldo',
    name: 'Cristiano Ronaldo',
    tag: 'Cristiano Ronaldo • #7',
    image: '/assets/aistudio/pngwing.com__1__835a6242.png',
  },
  {
    id: 'neymar',
    name: 'Neymar Jr.',
    tag: 'Neymar Jr. • #11',
    image: '/assets/aistudio/neymar_d3efd123.png',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-advance the 3-player carousel (Messi -> Ronaldo -> Neymar)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const currentHero = HERO_SLIDES[activeSlide] || HERO_SLIDES[0];

  return (
    <div className="h-dvh min-h-screen w-full bg-[#090909] text-[#F4F7F2] flex items-center justify-center overflow-hidden select-none">
      {/* Mobile-First Fullscreen Container */}
      <div className="relative w-full max-w-[440px] h-full flex flex-col justify-between overflow-hidden bg-[#090909]">
        {/* Upper Hero Cutout Area (3-Player Carousel: Messi, Ronaldo, Neymar) */}
        <div
          onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
            }
          }}
          aria-label="Switch featured football icon"
          className="relative z-10 flex-1 flex items-end justify-center pt-6 px-4 min-h-0 cursor-pointer"
        >
          <div className="relative w-full h-full max-h-[58vh] flex items-end justify-center">
            <img
              key={currentHero.id}
              src={currentHero.image}
              alt={currentHero.name}
              className="w-full h-full object-contain object-bottom animate-card-pop animate-float"
            />
            {/* Smooth Bottom Vignette Fade into Pitch Black */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090909] via-[#090909]/85 to-transparent" />
          </div>
        </div>

        {/* Bottom Sheet: Headline, 3-Player Carousel Selector & Track-Style Start Button */}
        <div className="relative z-20 px-6 pb-8 pt-2 space-y-5 bg-[#090909] animate-slide-up">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Hero slides">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = activeSlide === idx;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Show ${slide.name}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isActive ? 'w-7 bg-[#B8F34A]' : 'w-2 bg-[#262626] hover:bg-[#383838]'
                      }`}
                    />
                  );
                })}
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B8F34A]">
                {currentHero.tag}
              </span>
            </div>

            <h1 className="text-[34px] sm:text-[38px] font-black tracking-tight text-[#F4F7F2] leading-[1.1]">
              <span className="block">Step into the game</span>
              <span className="inline-flex items-center gap-3 flex-wrap mt-1">
                <span>Own the win</span>
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161616] border border-[#B8F34A] translate-y-[1px]">
                  <BrandLogo size="xs" className="!w-5 !h-5 !rounded-full !p-0 !border-0" />
                </span>
              </span>
            </h1>

            <p className="text-sm text-[#9AA69B] leading-relaxed max-w-[280px]">
              Join the action, watch the live team draw, and claim your victory.
            </p>
          </div>

          {/* Signature Track-Style Pill Button */}
          <button
            type="button"
            onClick={() => navigate('/public')}
            className="group w-full rounded-full bg-[#090909] border border-[#B8F34A] p-1.5 flex items-center justify-between transition-all hover:bg-[#141414] active:scale-[0.98]"
          >
            <span className="w-12 h-12 rounded-full bg-[#B8F34A] text-[#090909] flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </span>

            <span className="text-sm font-bold text-[#F4F7F2] tracking-wide">
              Get started
            </span>

            <span className="pr-4 flex items-center text-[#B8F34A]">
              <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-1" />
              <ChevronRight className="w-4 h-4 -mr-2 animate-chevron-2" />
              <ChevronRight className="w-4 h-4 animate-chevron-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
