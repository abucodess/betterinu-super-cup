import React, { useState, useRef } from 'react';
import { BettyKickButton } from './BettyKickButton';
import { BrandLogo } from '../shared/BrandLogo';

export const BETTY_MASCOT_URL = '/assets/aistudio/betty_robott__1__e878ecff.png';

export function HeroSection() {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Refs for 60fps continuous vertical marquee loop on both side rails
  const leftTrackRef = useRef(null);
  const rightTrackRef = useRef(null);
  const leftHalfRef = useRef(null);

  React.useEffect(() => {
    let rafId;
    let offset = 0;
    let lastTime = performance.now();
    const speedPxPerSec = 65;

    const step = (now) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const halfHeight = leftHalfRef.current?.offsetHeight || 900;
      if (halfHeight > 0) {
        offset = (offset + speedPxPerSec * dt) % halfHeight;
      }
      const transformValue = `translate3d(0, -${offset.toFixed(2)}px, 0)`;
      if (leftTrackRef.current) {
        leftTrackRef.current.style.transform = transformValue;
      }
      if (rightTrackRef.current) {
        rightTrackRef.current.style.transform = transformValue;
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({
      x: Math.round(relX * 16),
      y: Math.round(relY * 10),
    });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-full w-full bg-[#001AFF] bg-[radial-gradient(ellipse_at_48%_34%,#3D5CFF_0%,#142EFF_34%,#0819C4_64%,#050B67_100%)] text-white overflow-hidden select-none flex flex-col justify-between max-sm:[--mobile-portrait-width:min(160vw,88dvh)]"
    >
      <div className="pointer-events-auto absolute top-[calc((100%_-_var(--mobile-portrait-width)*0.78)/2)] max-sm:-translate-y-1/2 left-1/2 z-30 -translate-x-1/2 overflow-visible sm:top-6 sm:left-14 sm:translate-x-0 md:top-7 md:left-16">
        <BrandLogo size="hero" to="/" className="max-sm:h-[clamp(5.25rem,24dvh,10.5rem)]" />
      </div>

      {/* Top-Right Curved Vibrant Red Corner Shape */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[36%] h-[46%] bg-[#FF1E27] bg-[radial-gradient(ellipse_at_top_right,#FF6060_0%,#FF1E27_50%,#B50B35_100%)] z-0 transition-transform duration-500"
        style={{
          clipPath: 'ellipse(92% 88% at 100% 0%)',
        }}
      />

      {/* Bottom-Right Curved Deep Emerald Corner Shape */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[38%] h-[52%] bg-[#00B140] bg-[radial-gradient(ellipse_at_bottom_right,#20D967_0%,#00A74A_52%,#005A53_100%)] z-0 transition-transform duration-500"
        style={{
          clipPath: 'ellipse(92% 88% at 100% 100%)',
        }}
      />

      {/* Left Infinite Looping Vertical Marquee Rail ("Betterinu Football league 2026") */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute sm:left-6 inset-y-0 z-30 overflow-hidden max-sm:hidden"
      >
        <div
          ref={leftTrackRef}
          className="flex flex-col items-center text-[11px] sm:text-xs font-extrabold tracking-[0.24em] text-white/95 will-change-transform"
        >
          {[0, 1].map((halfIdx) => (
            <div
              key={halfIdx}
              ref={halfIdx === 0 ? leftHalfRef : undefined}
              className="flex flex-col items-center shrink-0"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7].map((itemIdx) => (
                <div key={itemIdx} className="flex flex-col items-center gap-5 py-2.5 shrink-0">
                  <span className="writing-vertical-rl rotate-180 whitespace-nowrap block">
                    Betterinu Football league 2026
                  </span>
                  <span className="w-[1.5px] h-10 shrink-0 block rounded-full bg-white/80" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right Infinite Looping Vertical Marquee Rail ("Betterinu Football league 2026") */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute sm:right-6 inset-y-0 z-30 overflow-hidden max-sm:hidden"
      >
        <div
          ref={rightTrackRef}
          className="flex flex-col items-center text-[11px] sm:text-xs font-extrabold tracking-[0.24em] text-white/95 will-change-transform"
        >
          {[0, 1].map((halfIdx) => (
            <div key={halfIdx} className="flex flex-col items-center shrink-0">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((itemIdx) => (
                <div key={itemIdx} className="flex flex-col items-center gap-5 py-2.5 shrink-0">
                  <span className="writing-vertical-rl whitespace-nowrap block">
                    Betterinu Football league 2026
                  </span>
                  <span className="w-[1.5px] h-10 shrink-0 block rounded-full bg-white/80" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Keep all three players in frame as the hero changes size. */}
      <picture className="pointer-events-none absolute inset-0 z-10 block overflow-hidden lg:inset-x-12 lg:top-[10%]">
        <source media="(min-width: 1024px)" srcSet="/assets/landing-captains.png" />
        {/* On phones, crop the portrait at source row 1080. On tablets, offset the 161px below the boots. */}
        <img
          src="/assets/landing-captains-portrait.png"
          alt="Three football captains in their team kits"
          fetchPriority="high"
          style={{
            '--hero-parallax-x': `${parallax.x}px`,
          }}
          className="block h-full w-full object-contain object-bottom max-sm:absolute max-sm:bottom-[calc(var(--mobile-portrait-width)*-0.6291)] max-sm:left-1/2 max-sm:h-auto max-sm:w-[var(--mobile-portrait-width)] max-sm:max-w-none max-sm:-translate-x-1/2 sm:max-lg:translate-y-[min(9.63%,17.11vw)] max-lg:[mask:url('/assets/landing-captains-portrait-mask.png')_center_bottom/contain_no-repeat] lg:translate-x-[var(--hero-parallax-x)] lg:drop-shadow-[0_20px_45px_rgba(0,0,0,0.35)] lg:transition-transform lg:duration-200 lg:ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </picture>

      {/* LAYER 2 (Z-20): STAGGERED WHITE FIFA-STYLE BLOCK TYPOGRAPHY (BETTERINU FOOTBALL LEAGUE) */}
      <div className="pointer-events-none relative z-20 flex-1 flex flex-col justify-end pb-6 sm:pb-[3.5vh] px-8 sm:px-12 md:px-16">
        <div className="w-full max-w-[min(92vw,151vh)] mx-auto flex flex-col">
          {/* Title scales with viewport height on tall monitors. */}
          <div className="flex flex-col max-sm:sr-only sm:mb-[11.3vh]">
            {/* Giant Line 1 (Aligned With Top-Left Logo & Spans Across Chest to Right Sleeve Armband) */}
            <div className="self-start pl-[1%] sm:pl-[4.5%] md:pl-[6%]">
              <h1
                style={{
                  transform: 'scaleX(1.26)',
                  transformOrigin: 'left center',
                  letterSpacing: '0.01em',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.85), 0 6px 18px rgba(0, 0, 0, 0.55)',
                }}
                className="font-fifa-wide text-[clamp(1.6rem,min(7.05vw,11.3vh),14rem)] font-black leading-[0.86] text-white whitespace-nowrap"
              >
                <span className="block">Betterinu</span>
              </h1>
            </div>

            {/* Giant Line 2 (Staggered Right — Covers #10 & Extends Over Green Curve) */}
            <div className="self-end pr-[1%] sm:pr-[1%] mt-0.5 sm:mt-[0.5vh] flex flex-col items-end">
              <div className="relative inline-flex items-center">
                <span
                  style={{
                    transform: 'scaleX(0.95)',
                    transformOrigin: 'right center',
                    letterSpacing: '-0.01em',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.85), 0 6px 18px rgba(0, 0, 0, 0.55)',
                  }}
                  className="font-fifa-wide text-[clamp(1.22rem,min(6.25vw,10.05vh),12.5rem)] font-black leading-[0.86] text-white block whitespace-nowrap"
                >
                  Football league
                </span>
              </div>

              {/* 2026 Tucked Under Right Edge of FOOTBALL LEAGUE */}
              <div className="mt-2 sm:mt-[1.5vh] pr-0.5 flex items-center justify-end">
                <span
                  style={{
                    transform: 'scaleX(1.14)',
                    transformOrigin: 'right center',
                    letterSpacing: '0.02em',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.85), 0 4px 10px rgba(0, 0, 0, 0.5)',
                  }}
                  className="font-fifa-wide text-[clamp(1rem,min(2.2vw,3.45vh),4.2rem)] font-black text-white leading-none"
                >
                  2026
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <BettyKickButton
              to="/public"
              variant="hero"
              size="lg"
              label="Enter the Arena"
              className="pointer-events-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
