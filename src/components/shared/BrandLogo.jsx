import React from 'react';
import { Link } from 'react-router-dom';

export const OFFICIAL_LOGO_URL =
  '/assets/aistudio/file_00000000ca788208bc4a26fb6d0c94fc__2__7786cd2a.png';

const SIZE_CLASSES = {
  xs: 'h-7 sm:h-8 w-auto',
  sm: 'h-9 sm:h-10 w-auto',
  md: 'h-10 sm:h-12 md:h-14 w-auto',
  lg: 'h-12 sm:h-16 md:h-20 w-auto',
  hero: 'h-14 sm:h-20 md:h-24 lg:h-[11vh] lg:min-h-[96px] lg:max-h-[160px] w-auto',
};

export function BrandLogo({ size = 'md', to = '/', className = '' }) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const logoImg = (
    <img
      src={OFFICIAL_LOGO_URL}
      alt="Betterinu Football league Logo"
      className={`${sizeClass} max-w-none object-contain select-none shrink-0 drop-shadow-[0_6px_16px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:scale-105 ${className}`}
    />
  );

  if (!to) {
    return logoImg;
  }

  return (
    <Link
      to={to}
      aria-label="Betterinu Football league Home"
      className="inline-flex items-center shrink-0 overflow-visible focus:outline-none"
    >
      {logoImg}
    </Link>
  );
}

export default BrandLogo;

