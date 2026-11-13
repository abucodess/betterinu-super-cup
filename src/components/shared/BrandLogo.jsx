import React from 'react';

export const OFFICIAL_LOGO_URL = '/assets/aistudio/betty_ball__1__4523a0a9.png';

const SIZE_CLASSES = {
  xs: {
    container: 'w-7 h-7 rounded-lg p-0.5',
    emblem: 'w-7 h-7',
  },
  sm: {
    container: 'w-9 h-9 rounded-xl p-0.5',
    emblem: 'w-9 h-9',
  },
  md: {
    container: 'w-11 h-11 rounded-xl p-1',
    emblem: 'w-11 h-11',
  },
  lg: {
    container: 'w-14 h-14 rounded-2xl p-1',
    emblem: 'w-14 h-14',
  },
  xl: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1.5',
    emblem: 'w-16 h-16 sm:w-20 sm:h-20',
  },
  hero: {
    container: 'w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-2',
    emblem: 'w-28 h-28 sm:w-32 sm:h-32',
  },
};

/**
 * Official BetterInU Super Cup Mascot & Brand Logo Component.
 * Uses strictly pitch dark black (#090909) background and bright green (#B8F34A) border.
 */
export function BrandLogo({
  size = 'sm',
  variant = 'badge', // 'badge' | 'emblem'
  className = '',
  alt = 'BetterInU Super Cup Official Logo',
}) {
  const dims = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  if (variant === 'emblem') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 select-none bg-[#090909] rounded-2xl ${dims.emblem} ${className}`}
      >
        <img
          src={OFFICIAL_LOGO_URL}
          alt={alt}
          draggable={false}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden select-none bg-[#090909] border border-[#B8F34A] ${dims.container} ${className}`}
    >
      <img
        src={OFFICIAL_LOGO_URL}
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain scale-105"
      />
    </div>
  );
}

export default BrandLogo;
