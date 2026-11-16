import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BettyKickButton } from './BettyKickButton';
import { BrandLogo } from '../shared/BrandLogo';

export const BETTY_MASCOT_URL = '/assets/aistudio/betty_robott__1__e878ecff.png';

export function HeroSection() {
  const navigate = useNavigate();
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
      className="relative h-screen h-dvh min-h-[640px] w-full bg-[#001AFF] text-white overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Top Tri-Color Championship Ribbon (Blue • Yellow • Red) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-1.5 z-40 flex"
      >
        <span className="flex-1 bg-[#FFC600]" />
        <span className="flex-1 bg-[#FF1E27]" />
        <span className="flex-1 bg-[#001AFF]" />
      </div>

      {/* Top-Left Responsive BetterInU Football League Logo (Uncut) */}
      <div className="pointer-events-auto absolute top-4 left-9 sm:top-6 sm:left-14 md:top-7 md:left-16 z-30 overflow-visible">
        <BrandLogo size="hero" to="/" />
      </div>

      {/* Top-Right Curved Vibrant Red Corner Shape */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[52vw] sm:w-[36vw] h-[34vh] sm:h-[46vh] bg-[#FF1E27] z-0 transition-transform duration-500"
        style={{
          clipPath: 'ellipse(92% 88% at 100% 0%)',
        }}
      />

      {/* Bottom-Right Curved Deep Emerald Corner Shape */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[55vw] sm:w-[38vw] h-[38vh] sm:h-[52vh] bg-[#00B140] z-0 transition-transform duration-500"
        style={{
          clipPath: 'ellipse(92% 88% at 100% 100%)',
        }}
      />

      {/* Left Infinite Looping Vertical Marquee Rail ("BETTERINU FOOTBALL LEAGUE 2026") */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 sm:left-6 inset-y-0 z-30 overflow-hidden"
      >
        <div
          ref={leftTrackRef}
          className="flex flex-col items-center text-[11px] sm:text-xs font-extrabold tracking-[0.24em] text-white/95 uppercase will-change-transform"
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
                    BETTERINU FOOTBALL LEAGUE 2026
                  </span>
                  <span className="w-[1.5px] h-10 shrink-0 block rounded-full bg-white/80" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right Infinite Looping Vertical Marquee Rail ("BETTERINU FOOTBALL LEAGUE 2026") */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 sm:right-6 inset-y-0 z-30 overflow-hidden"
      >
        <div
          ref={rightTrackRef}
          className="flex flex-col items-center text-[11px] sm:text-xs font-extrabold tracking-[0.24em] text-white/95 uppercase will-change-transform"
        >
          {[0, 1].map((halfIdx) => (
            <div key={halfIdx} className="flex flex-col items-center shrink-0">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((itemIdx) => (
                <div key={itemIdx} className="flex flex-col items-center gap-5 py-2.5 shrink-0">
                  <span className="writing-vertical-rl whitespace-nowrap block">
                    BETTERINU FOOTBALL LEAGUE 2026
                  </span>
                  <span className="w-[1.5px] h-10 shrink-0 block rounded-full bg-white/80" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* LAYER 1 (Z-10): CENTRAL GIANT BETTY ROBOT MASCOT (#10 JERSEY) — STRICTLY PINNED TO BOTTOM */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 z-10 flex items-end justify-center overflow-hidden">
        <div
          style={{
            transform: `translate3d(${parallax.x}px, 0px, 0)`,
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative h-[86vh] sm:h-[94vh] w-auto flex items-end justify-center"
        >
          <img
            src={BETTY_MASCOT_URL}
            alt="Betty — Official BetterInU Super Cup #10 Robot Mascot"
            referrerPolicy="no-referrer"
            className="h-full w-auto max-w-none object-contain object-bottom block drop-shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
          />
        </div>
      </div>

      {/* LAYER 2 (Z-20): STAGGERED WHITE FIFA-STYLE BLOCK TYPOGRAPHY (BETTERINU FOOTBALL LEAGUE) */}
      <div className="pointer-events-none relative z-20 flex-1 flex flex-col justify-end pb-6 sm:pb-[3.5vh] px-8 sm:px-12 md:px-16">
        <div className="w-full max-w-[min(92vw,151vh)] mx-auto flex flex-col">
          {/* Title Lockup Positioned Squarely Over Betty's Chest (Scales With Viewport Height on Tall Monitors) */}
          <div className="mb-12 sm:mb-[11.3vh] flex flex-col">
            {/* Giant Line 1 (Aligned With Top-Left Logo & Spans Across Chest to Right Sleeve Armband) */}
            <div className="self-start pl-[1%] sm:pl-[4.5%] md:pl-[6%]">
              <h1
                style={{
                  transform: 'scaleX(1.26)',
                  transformOrigin: 'left center',
                  letterSpacing: '0.01em',
                  textShadow: '0 10px 28px rgba(0, 8, 45, 0.38)',
                }}
                className="font-fifa-wide text-[clamp(1.6rem,min(7.05vw,11.3vh),14rem)] font-black uppercase leading-[0.86] text-white whitespace-nowrap"
              >
                <span className="block">BETTERINU</span>
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
                    textShadow: '0 10px 28px rgba(0, 8, 45, 0.38)',
                  }}
                  className="font-fifa-wide text-[clamp(1.22rem,min(6.25vw,10.05vh),12.5rem)] font-black uppercase leading-[0.86] text-white block whitespace-nowrap"
                >
                  FOOTBALL LEAGUE
                </span>
              </div>

              {/* 2026 Tucked Under Right Edge of FOOTBALL LEAGUE */}
              <div className="mt-2 sm:mt-[1.5vh] pr-0.5 flex items-center justify-end">
                <span
                  style={{
                    transform: 'scaleX(1.14)',
                    transformOrigin: 'right center',
                    letterSpacing: '0.02em',
                    textShadow: '0 4px 16px rgba(0, 8, 45, 0.35)',
                  }}
                  className="font-fifa-wide text-[clamp(1rem,min(2.2vw,3.45vh),4.2rem)] font-black text-white leading-none"
                >
                  2026
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Centered Interactive Betty Kick Animation CTA Button */}
          <div className="pointer-events-auto flex flex-col items-center">
            <BettyKickButton
              label="KICKOFF"
              size="sm"
              variant="primary"
              onClick={() => navigate('/public')}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
