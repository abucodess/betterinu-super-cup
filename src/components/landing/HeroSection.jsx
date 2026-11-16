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
      className="relative h-dvh min-h-[680px] max-h-[1080px] w-full bg-[#001AFF] text-white overflow-hidden select-none flex flex-col justify-between"
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

      {/* Top-Right Inner Golden Yellow Accent Arc */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[55vw] sm:w-[38.5vw] h-[36vh] sm:h-[48.5vh] bg-[#FFC600] -z-10 opacity-95"
        style={{
          clipPath: 'ellipse(94% 90% at 100% 0%)',
        }}
      />

      {/* Bottom-Left Curved Golden Yellow Corner Shape */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[46vw] sm:w-[30vw] h-[26vh] sm:h-[36vh] bg-[#FFC600] z-0 transition-transform duration-500"
        style={{
          clipPath: 'ellipse(90% 86% at 0% 100%)',
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
                  <span className="writing-vertical-rl rotate-180 whitespace-nowrap block drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
                    BETTERINU FOOTBALL LEAGUE 2026
                  </span>
                  <span
                    className={`w-[2px] h-10 shrink-0 block rounded-full ${
                      itemIdx % 2 === 0 ? 'bg-[#FFC600]' : 'bg-[#FF1E27]'
                    }`}
                  />
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
          className="flex flex-col items-center text-[11px] sm:text-xs font-extrabold tracking-[0.24em] text-white uppercase will-change-transform"
        >
          {[0, 1].map((halfIdx) => (
            <div key={halfIdx} className="flex flex-col items-center shrink-0">
              {[0, 1, 2, 3, 4, 5].map((itemIdx) => (
                <div key={itemIdx} className="flex flex-col items-center gap-5 py-2.5 shrink-0">
                  <span className="writing-vertical-rl whitespace-nowrap block drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
                    BETTERINU FOOTBALL LEAGUE 2026
                  </span>
                  <span
                    className={`w-[2px] h-10 shrink-0 block rounded-full ${
                      itemIdx % 2 === 0 ? 'bg-[#FFC600]' : 'bg-[#FF1E27]'
                    }`}
                  />
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
            className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_20px_45px_rgba(0,0,0,0.32)]"
          />
        </div>
      </div>

      {/* LAYER 2 (Z-20): OVERLAPPING STAGGERED WHITE FIFA-STYLE BLOCK TYPOGRAPHY (BETTERINU FOOTBALL LEAGUE) */}
      <div className="pointer-events-none relative z-20 flex-1 flex flex-col justify-end pb-8 sm:pb-10 px-4 sm:px-12">
        <div className="w-full max-w-[1120px] mx-auto flex flex-col">
          {/* Giant Line 1 (Shifted Left — Overlaps Left/Center of Betty's Chest) */}
          <div className="md:pl-[3%] lg:pl-[5%]">
            <h1 className="font-fifa-wide text-[clamp(2.2rem,7.6vw,6.4rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.22)] whitespace-nowrap">
              <span className="block">BETTERINU</span>
            </h1>
          </div>

          {/* Giant Line 2 (Staggered/Indented Right — Overlaps Center/Right of Betty's Chest) */}
          <div className="self-end md:pr-[1%] lg:pr-[2%] -mt-0.5 sm:-mt-2 flex flex-col items-end">
            <div className="relative inline-block">
              <span className="font-fifa-wide text-[clamp(1.65rem,6.1vw,5.2rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.22)] block whitespace-nowrap">
                FOOTBALL LEAGUE
              </span>
            </div>

            {/* 2026 Tucked Under Right Edge of FOOTBALL LEAGUE with Yellow & Red Accent Bar */}
            <div className="mt-1 sm:mt-1.5 flex items-center justify-end gap-2.5">
              <span className="inline-flex items-center overflow-hidden rounded-full shadow-sm">
                <span className="w-4 sm:w-6 h-1.5 sm:h-2 bg-[#FFC600]" />
                <span className="w-4 sm:w-6 h-1.5 sm:h-2 bg-[#FF1E27]" />
                <span className="w-4 sm:w-6 h-1.5 sm:h-2 bg-[#001AFF]" />
              </span>
              <span className="font-fifa-wide text-lg sm:text-2xl md:text-3xl font-black text-[#FFC600] drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] tracking-tight">
                2026
              </span>
            </div>
          </div>

          {/* Bottom Centered Interactive Betty Kick Animation CTA Button */}
          <div className="pointer-events-auto mt-5 sm:mt-7 flex flex-col items-center">
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
