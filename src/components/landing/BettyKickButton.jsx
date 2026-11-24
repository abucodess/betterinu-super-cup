import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Official Mini Full-Body Betty Robot Asset for the Kick Button
export const OFFICIAL_BETTY_ASSET =
  '/assets/aistudio/Gemini_Generated_Image_8vy58f8vy58f8vy5__1__ce4bfc98.png';

/**
 * Animation State Machine:
 * - 'idle'           (Default small transparent interactive CTA state)
 * - 'pressed'        (0 - 250ms: Button compresses, ripple fires, text begins fading)
 * - 'transforming'   (250 - 650ms: Rectangular button shrinks & morphs into 50% spherical SVG football)
 * - 'betty_entering' (650 - 1200ms: Small Mini Betty emerges from behind/below at 85%->100% scale with glowing eyes)
 * - 'preparing_kick' (1200 - 1550ms: Mini Betty leans back and draws her robotic leg backward)
 * - 'kicking'        (1550 - 2100ms: Leg swings forward through the ball, impact flash/particles/trail, ball flies away)
 * - 'completed'      (2100 - 2500ms: Follow-through settles, scene fades, callback executes once)
 */

const PHASE_TIMINGS = {
  TRANSFORMING: 250,
  BETTY_ENTERING: 650,
  PREPARING_KICK: 1200,
  KICKING: 1550,
  COMPLETED: 2100,
  EXECUTE_ACTION: 2480,
};

const IMPACT_PARTICLES = [
  { id: 1, tx: '36px', ty: '-32px', color: '#FFC600', size: 5 },
  { id: 2, tx: '48px', ty: '-14px', color: '#FF1E27', size: 4.5 },
  { id: 3, tx: '22px', ty: '-44px', color: '#001AFF', size: 4.5 },
  { id: 4, tx: '-18px', ty: '-26px', color: '#FFC600', size: 4 },
  { id: 5, tx: '42px', ty: '10px', color: '#FF1E27', size: 4 },
  { id: 6, tx: '16px', ty: '-20px', color: '#FFFFFF', size: 4 },
];

export function BettyKickButton({
  label = 'KICKOFF',
  onClick,
  to,
  variant = 'primary',
  size = 'sm',
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  ariaLabel,
}) {
  const navigate = useNavigate();
  const [animState, setAnimState] = useState('idle');
  const [bettyImgError, setBettyImgError] = useState(false);

  const timersRef = useRef([]);
  const isMountedRef = useRef(true);
  const callbackExecutedRef = useRef(false);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  const executeOriginalAction = useCallback(() => {
    if (callbackExecutedRef.current) return;
    callbackExecutedRef.current = true;

    try {
      if (typeof onClick === 'function') {
        onClick();
      } else if (to) {
        navigate(to);
      }
    } catch (err) {
      console.error('BettyKickButton action error:', err);
    } finally {
      const resetTimer = setTimeout(() => {
        if (isMountedRef.current) {
          setAnimState('idle');
          callbackExecutedRef.current = false;
        }
      }, 320);
      timersRef.current.push(resetTimer);
    }
  }, [onClick, to, navigate]);

  const handleTrigger = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (animState !== 'idle' || disabled || loading) return;

    clearAllTimers();
    callbackExecutedRef.current = false;

    // Phase 1: Button Pressed (0 - 250ms)
    setAnimState('pressed');

    // Phase 2: Button Transforms into Football (250 - 650ms)
    timersRef.current.push(
      setTimeout(() => {
        if (isMountedRef.current) setAnimState('transforming');
      }, PHASE_TIMINGS.TRANSFORMING)
    );

    // Phase 3: Mini Betty Emerges (650 - 1200ms)
    timersRef.current.push(
      setTimeout(() => {
        if (isMountedRef.current) setAnimState('betty_entering');
      }, PHASE_TIMINGS.BETTY_ENTERING)
    );

    // Phase 4: Mini Betty Prepares to Kick (1200 - 1550ms)
    timersRef.current.push(
      setTimeout(() => {
        if (isMountedRef.current) setAnimState('preparing_kick');
      }, PHASE_TIMINGS.PREPARING_KICK)
    );

    // Phase 5: Football Kick (1550 - 2100ms)
    timersRef.current.push(
      setTimeout(() => {
        if (isMountedRef.current) setAnimState('kicking');
      }, PHASE_TIMINGS.KICKING)
    );

    // Phase 6: Animation Completion (2100 - 2500ms)
    timersRef.current.push(
      setTimeout(() => {
        if (isMountedRef.current) setAnimState('completed');
      }, PHASE_TIMINGS.COMPLETED)
    );

    // Execute original action once after kick finishes
    timersRef.current.push(
      setTimeout(() => {
        if (isMountedRef.current) {
          executeOriginalAction();
        }
      }, PHASE_TIMINGS.EXECUTE_ACTION)
    );
  };

  const isAnimating = animState !== 'idle';
  const isFootballStage =
    animState === 'transforming' ||
    animState === 'betty_entering' ||
    animState === 'preparing_kick' ||
    animState === 'kicking' ||
    animState === 'completed';

  // Compact / small button dimensions
  const sizeDims = {
    sm: { width: 'w-[156px] sm:w-[172px]', height: 'h-[38px] sm:h-[40px]', text: 'text-[11px] sm:text-xs' },
    md: { width: 'w-[175px] sm:w-[195px]', height: 'h-[40px] sm:h-[42px]', text: 'text-[11px] sm:text-xs' },
    lg: { width: 'w-[195px] sm:w-[215px]', height: 'h-[42px] sm:h-[44px]', text: 'text-xs' },
  }[size] || { width: 'w-[165px] sm:w-[180px]', height: 'h-[40px] sm:h-[42px]', text: 'text-[11px] sm:text-xs' };

  const variantClasses = {
    dark: 'bg-transparent text-[#080808] border-2 border-[#080808] hover:bg-[#080808]/10 shadow-[0_6px_18px_rgba(0,0,0,0.12)]',
    hero: 'border-2 border-[#164821] bg-gradient-to-b from-[#C6FF36] to-[#A8EA16] text-[#102B15] normal-case shadow-[inset_0_0_0_2px_#CFFF68,0_5px_0_#148541,0_7px_0_#164821,0_10px_16px_rgba(0,0,0,0.30)] hover:from-[#D6FF66]',
  }[variant] || 'bg-black/25 text-white border-2 border-[#FFC600] hover:bg-[#FFC600]/20 hover:border-white backdrop-blur-[3px] shadow-[0_8px_24px_rgba(0,0,0,0.28)]';

  // Compute small Mini Betty's body transform across phases
  const getBettyBodyStyle = () => {
    switch (animState) {
      case 'betty_entering':
        return {
          opacity: 1,
          transform: 'translate3d(-22px, 0px, 0) scale(1) rotate(0deg)',
          transition: 'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 260ms ease-out',
        };
      case 'preparing_kick':
        return {
          opacity: 1,
          transform: 'translate3d(-32px, 2px, 0) scale(1) rotate(-12deg)',
          transition: 'transform 310ms cubic-bezier(0.22, 1, 0.36, 1)',
        };
      case 'kicking':
        return {
          opacity: 1,
          transform: 'translate3d(-14px, -3px, 0) scale(1.04) rotate(10deg)',
          transition: 'transform 175ms cubic-bezier(0.16, 1, 0.3, 1)',
        };
      case 'completed':
        return {
          opacity: 0,
          transform: 'translate3d(-18px, 2px, 0) scale(0.95) rotate(0deg)',
          transition: 'transform 340ms ease-out, opacity 320ms ease-in 50ms',
        };
      default:
        return {
          opacity: 0,
          transform: 'translate3d(-22px, 26px, 0) scale(0.84) rotate(0deg)',
          transition: 'none',
        };
    }
  };

  // Compute Mini Betty's clipped right leg swing across phases
  const getKickingLegLayerStyle = () => {
    switch (animState) {
      case 'preparing_kick':
        return {
          transformOrigin: '56% 76%',
          transform: 'rotate(-36deg) translate3d(-2px, 1px, 0)',
          transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        };
      case 'kicking':
        return {
          transformOrigin: '56% 76%',
          transform: 'rotate(54deg) translate3d(3px, -2px, 0)',
          transition: 'transform 155ms cubic-bezier(0.12, 0.92, 0.24, 1.18)',
        };
      case 'completed':
        return {
          transformOrigin: '56% 76%',
          transform: 'rotate(10deg)',
          transition: 'transform 300ms ease-out',
        };
      default:
        return {
          transformOrigin: '56% 76%',
          transform: 'rotate(0deg)',
          transition: 'transform 240ms ease-out',
        };
    }
  };

  // Compute small Football (36px) trajectory & morphing styles across phases
  const getButtonMorphStyle = () => {
    if (animState === 'pressed') {
      return {
        transform: 'scale(0.93)',
        borderRadius: '12px',
        transition: 'all 210ms cubic-bezier(0.22, 1, 0.36, 1)',
      };
    }
    if (
      animState === 'transforming' ||
      animState === 'betty_entering' ||
      animState === 'preparing_kick'
    ) {
      return {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        padding: '0px',
        transform: 'translate3d(10px, 4px, 0) scale(1)',
        transition:
          'width 360ms cubic-bezier(0.22, 1, 0.36, 1), height 360ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 320ms ease, transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      };
    }
    if (animState === 'kicking' || animState === 'completed') {
      return {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        padding: '0px',
        opacity: animState === 'completed' ? 0 : 1,
        transform:
          'translate3d(clamp(110px, 22vw, 210px), clamp(-145px, -18vh, -105px), 0) scale(0.28) rotate(980deg)',
        transition:
          'transform 520ms cubic-bezier(0.16, 0.84, 0.32, 1), opacity 220ms ease-in 300ms',
      };
    }
    return {};
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none overflow-visible ${sizeDims.width} ${sizeDims.height} ${className}`}
      style={{
        transform:
          animState === 'kicking' ? 'translate3d(1.5px, -1.5px, 0)' : 'translate3d(0, 0, 0)',
        transition: 'transform 90ms ease-out',
      }}
    >
      {/* LAYER 1: SMALL MINI BETTY EMERGING & KICKING SCENE */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 bottom-[-4px] -translate-x-1/2 z-20 w-[76px] sm:w-[86px] h-[64px] sm:h-[72px] flex items-end justify-center overflow-visible"
        style={getBettyBodyStyle()}
      >
        {/* Subtle Ground Shadow beneath Mini Betty */}
        <div
          className="absolute bottom-0.5 w-11 h-2 rounded-full bg-black/35 blur-[2px] transition-all duration-300"
          style={{
            transform:
              animState === 'preparing_kick'
                ? 'translateX(-4px) scaleX(0.9)'
                : animState === 'kicking'
                ? 'translateX(5px) scaleX(1.1)'
                : 'scaleX(1)',
          }}
        />

        {/* Mini Betty Character Container (Preserves exact 1080:806 proportions) */}
        <div className="relative w-full h-auto flex items-center justify-center">
          {/* Bright Green Eye-Glow Boost Overlay during active phases */}
          <div
            className="pointer-events-none absolute top-[28%] left-1/2 -translate-x-1/2 w-7 h-3.5 rounded-full bg-[#22C55E] blur-xs transition-opacity duration-300 z-30"
            style={{
              opacity:
                animState === 'betty_entering' ||
                animState === 'preparing_kick' ||
                animState === 'kicking'
                  ? 0.65
                  : 0,
            }}
          />

          {!bettyImgError ? (
            <div className="relative w-full">
              {/* Base Body Layer (Head, Torso, Both Arms, Left Leg — Right Leg Masked Out) */}
              <img
                src={OFFICIAL_BETTY_ASSET}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setBettyImgError(true)}
                style={{
                  clipPath:
                    'polygon(0% 0%, 100% 0%, 100% 88%, 63% 88%, 61% 75%, 50% 75%, 50% 100%, 0% 100%)',
                }}
                className="w-full h-auto object-contain select-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]"
              />

              {/* Articulated Right Kicking Leg Layer (Same Image Clipped to Viewer-Right Leg) */}
              <img
                src={OFFICIAL_BETTY_ASSET}
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  ...getKickingLegLayerStyle(),
                  clipPath:
                    'polygon(50% 74%, 61.5% 74%, 63.5% 88%, 63.5% 100%, 50% 100%)',
                }}
                className="pointer-events-none absolute inset-0 w-full h-auto object-contain select-none"
              />
            </div>
          ) : (
            /* Resilient Compact SVG Robot Fallback if asset fails to load */
            <div className="w-12 h-14 rounded-xl bg-white border-2 border-[#18181B] flex flex-col items-center justify-center shadow-md">
              <div className="w-9 h-6 rounded-md bg-[#090909] flex items-center justify-around px-1">
                <span className="w-2 h-2 rounded-full bg-[#B8F34A]" />
                <span className="w-2 h-2 rounded-full bg-[#B8F34A]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LAYER 2: GREEN MOTION TRAIL, IMPACT FLASH & PARTICLES (Fires during Phase 5 'kicking') */}
      {(animState === 'preparing_kick' || animState === 'kicking') && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible"
        >
          {/* Electric Lime Curved Kick Motion Trail */}
          {animState === 'kicking' && (
            <svg
              width="210"
              height="165"
              viewBox="0 0 210 165"
              fill="none"
              className="absolute left-1/2 bottom-0 -translate-x-4 pointer-events-none overflow-visible"
            >
              <defs>
                <linearGradient id="bettyKickTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFC600" stopOpacity="0.95" />
                  <stop offset="55%" stopColor="#FF1E27" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#001AFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 14 148 Q 72 95 178 12"
                stroke="url(#bettyKickTrailGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="220"
                style={{
                  animation: 'fadeInFast 170ms ease-out forwards',
                  filter: 'drop-shadow(0 0 8px rgba(184,243,74,0.8))',
                }}
              />
            </svg>
          )}

          {/* Impact Flash Burst at Contact Point */}
          {animState === 'kicking' && (
            <div
              className="absolute translate-x-2.5 translate-y-1 w-11 h-11 rounded-full border-2 border-[#B8F34A] bg-white/75"
              style={{
                animation: 'radarRing 360ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
                boxShadow: '0 0 18px #B8F34A',
              }}
            />
          )}

          {/* 6 Subtle Impact Spark Particles */}
          {IMPACT_PARTICLES.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 6px ${p.color}`,
                transform:
                  animState === 'kicking'
                    ? `translate3d(${p.tx}, ${p.ty}, 0) scale(1)`
                    : 'translate3d(10px, 4px, 0) scale(0.2)',
                opacity: animState === 'kicking' ? 0.95 : 0,
                transition:
                  'transform 400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 360ms ease-out',
              }}
            />
          ))}
        </div>
      )}

      {/* LAYER 3: SMALL TRANSPARENT CTA BUTTON THAT MORPHS INTO THE COMPACT 3D FOOTBALL */}
      <button
        type="button"
        disabled={disabled || loading || isAnimating}
        aria-label={ariaLabel || label}
        aria-busy={loading || isAnimating}
        onClick={handleTrigger}
        style={getButtonMorphStyle()}
        className={`group relative z-30 flex items-center justify-center overflow-hidden font-fifa-wide font-black uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${
          isFootballStage
            ? 'bg-transparent border-0 shadow-[0_10px_20px_rgba(0,0,0,0.4)] cursor-default'
            : `w-full h-full rounded-[10px] px-3.5 py-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95 ${variantClasses} ${sizeDims.text}`
        }`}
      >
        {/* Phase 1 Ripple Ring on Press */}
        {animState === 'pressed' && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[10px] bg-white/35 animate-ping"
          />
        )}

        {/* Default Button Content (Fades out during Phase 1 & 2) */}
        <span
          className={`flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 ${
            animState === 'idle'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-75 pointer-events-none'
          }`}
        >
          {/* Classic Football (Soccer Ball) Icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:rotate-45 group-hover:scale-110"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            {/* Center Pentagon Panel */}
            <polygon
              points="12,7.2 16.5,10.5 14.8,15.8 9.2,15.8 7.5,10.5"
              fill="currentColor"
            />
            {/* Football Panel Seams */}
            <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="12" y1="7.2" x2="12" y2="2.2" />
              <line x1="16.5" y1="10.5" x2="21.2" y2="8.8" />
              <line x1="14.8" y1="15.8" x2="18.2" y2="20" />
              <line x1="9.2" y1="15.8" x2="5.8" y2="20" />
              <line x1="7.5" y1="10.5" x2="2.8" y2="8.8" />
            </g>
          </svg>

          <span>{loading ? 'LOADING...' : label}</span>

          {icon && <span className="shrink-0">{icon}</span>}
        </span>

        {/* 3D Spherical SVG Football (Morphs in during Phase 2 and gets kicked in Phase 5) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            isFootballStage ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{
            filter:
              animState === 'kicking'
                ? 'drop-shadow(-6px 6px 8px rgba(184,243,74,0.55))'
                : 'none',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full rounded-full overflow-hidden"
          >
            <defs>
              <radialGradient id="footballSphereGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="55%" stopColor="#F1F5F9" />
                <stop offset="85%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#64748B" />
              </radialGradient>
            </defs>

            <circle
              cx="50"
              cy="50"
              r="48"
              fill="url(#footballSphereGrad)"
              stroke="#090909"
              strokeWidth="2.5"
            />

            <g stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round">
              <line x1="50" y1="32" x2="50" y2="12" />
              <line x1="67" y1="44" x2="86" y2="36" />
              <line x1="60" y1="64" x2="76" y2="80" />
              <line x1="40" y1="64" x2="24" y2="80" />
              <line x1="33" y1="44" x2="14" y2="36" />
              <line x1="34" y1="16" x2="66" y2="16" />
              <line x1="84" y1="22" x2="92" y2="52" />
              <line x1="88" y1="68" x2="64" y2="90" />
              <line x1="36" y1="90" x2="12" y2="68" />
              <line x1="8" y1="52" x2="16" y2="22" />
            </g>

            <polygon points="50,31 68,44 61,65 39,65 32,44" fill="#090909" />
            <polygon points="50,2 66,14 58,20 42,20 34,14" fill="#090909" />
            <polygon points="96,30 98,50 86,52 82,36 88,22" fill="#090909" />
            <polygon points="86,78 70,94 64,88 74,76 88,68" fill="#090909" />
            <polygon points="14,78 30,94 36,88 26,76 12,68" fill="#090909" />
            <polygon points="4,30 2,50 14,52 18,36 12,22" fill="#090909" />

            <ellipse
              cx="34"
              cy="24"
              rx="14"
              ry="7"
              transform="rotate(-24 34 24)"
              fill="#FFFFFF"
              fillOpacity="0.55"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}

export default BettyKickButton;
