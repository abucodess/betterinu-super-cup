import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BettyKickButton } from './BettyKickButton';

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
      className="relative h-dvh min-h-[680px] max-h-[1080px] w-full bg-[#9EF000] text-white overflow-hidden select-none flex flex-col justify-between"
    >
      {/* Bottom-Right Curved Deep Emerald Corner Shape (Matches FIFA Reference Image) */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-[55vw] sm:w-[38vw] h-[38vh] sm:h-[52vh] bg-[#00B140] z-0 transition-transform duration-500"
        style={{
          clipPath: 'ellipse(92% 88% at 100% 100%)',
        }}
      />

      {/* Left Infinite Looping Vertical Marquee Rail ("BETTERINU SUPER CUP 2026") */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 sm:left-6 inset-y-0 z-30 overflow-hidden"
      >
        <div
          ref={leftTrackRef}
          className="flex flex-col items-center text-[11px] sm:text-xs font-extrabold tracking-[0.24em] text-white uppercase will-change-transform"
        >
          {[0, 1].map((halfIdx) => (
            <div
              key={halfIdx}
              ref={halfIdx === 0 ? leftHalfRef : undefined}
              className="flex flex-col items-center shrink-0"
            >
              {[0, 1, 2, 3, 4, 5].map((itemIdx) => (
                <div key={itemIdx} className="flex flex-col items-center gap-5 py-2.5 shrink-0">
                  <span className="writing-vertical-rl rotate-180 whitespace-nowrap block">
                    BETTERINU SUPER CUP 2026
                  </span>
                  <span className="w-[1.5px] h-10 bg-white/80 shrink-0 block" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right Infinite Looping Vertical Marquee Rail ("BETTERINU SUPER CUP 2026") */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 sm:right-6 inset-y-0 z-30 overflow-hidden"
      >
        <div
          ref={rightTrackRef}
          className="flex flex-col items-center text-[11px] sm:text-xs font-extrabold tracking-[0.24em] text-white uppercase will-change-transform"
        >
          {[0, 1].map((halfIdx) => (
            <div key={halfIdx} className="flex flex-col items-center shrink-0">
              {[0, 1, 2, 3, 4, 5].map((itemIdx) => (
                <div key={itemIdx} className="flex flex-col items-center gap-5 py-2.5 shrink-0">
                  <span className="writing-vertical-rl whitespace-nowrap block">
                    BETTERINU SUPER CUP 2026
                  </span>
                  <span className="w-[1.5px] h-10 bg-white/80 shrink-0 block" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* LAYER 1 (Z-10): CENTRAL GIANT BETTY ROBOT MASCOT (#10 JERSEY) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-2 z-10 flex items-end justify-center overflow-hidden">
        <div
          style={{
            transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative h-[86vh] sm:h-[94vh] w-auto flex items-end justify-center"
        >
          <img
            src={BETTY_MASCOT_URL}
            alt="Betty — Official BetterInU Super Cup #10 Robot Mascot"
            referrerPolicy="no-referrer"
            className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_20px_45px_rgba(0,0,0,0.28)]"
          />
        </div>
      </div>

      {/* LAYER 2 (Z-20): OVERLAPPING STAGGERED WHITE FIFA-STYLE BLOCK TYPOGRAPHY (ONLY BETTERINU SUPER CUP) */}
      <div className="pointer-events-none relative z-20 flex-1 flex flex-col justify-end pb-8 sm:pb-10 px-4 sm:px-12">
        <div className="w-full max-w-[1080px] mx-auto flex flex-col">
          {/* Giant Word 1 (Shifted Left — Overlaps Left/Center of Betty's Chest) */}
          <div className="md:pl-[4%] lg:pl-[6%]">
            <h1 className="font-fifa-wide text-[clamp(3.1rem,10.5vw,8.4rem)] font-black uppercase leading-[0.86] tracking-[-0.04em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.16)]">
              <span className="block">BETTERINU</span>
            </h1>
          </div>

          {/* Giant Word 2 (Staggered/Indented Right — Overlaps Center/Right of Betty's Chest) */}
          <div className="self-end md:pr-[2%] lg:pr-[4%] -mt-1 sm:-mt-3 flex flex-col items-end">
            <div className="relative inline-block">
              <span className="font-fifa-wide text-[clamp(3.1rem,10.5vw,8.4rem)] font-black uppercase leading-[0.86] tracking-[-0.04em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.16)] block">
                SUPER CUP
              </span>
              {/* Subtle Championship Tri-Stripe Accent Bar */}
              <span
                aria-hidden="true"
                className="hidden sm:flex flex-col absolute top-[38%] left-[31%] w-5 h-3.5 shadow-sm overflow-hidden"
              >
                <span className="flex-1 bg-[#B8F34A]" />
                <span className="flex-1 bg-white" />
                <span className="flex-1 bg-[#090909]" />
              </span>
            </div>

            {/* 2026 Tucked Under Right Edge of SUPER CUP */}
            <div className="mt-0.5 sm:mt-1 flex items-center justify-end">
              <span className="font-fifa-wide text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                2026
              </span>
            </div>
          </div>

          {/* Bottom Centered Interactive Betty Kick Animation CTA Button */}
          <div className="pointer-events-auto mt-5 sm:mt-7 flex flex-col items-center">
            <BettyKickButton
              label="EXPLORE THE CUP"
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
