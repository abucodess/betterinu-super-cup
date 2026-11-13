import React from 'react';

/**
 * Animated SVG Circular Progress Ring inspired by the reference UI.
 * Works on both solid lime cards (invertColors=true) and dark charcoal cards (invertColors=false).
 */
export function CircularRing({
  value = 0,
  max = 5,
  label,
  size = 52,
  strokeWidth = 5,
  invertColors = false,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference - ratio * circumference;

  const trackColor = invertColors ? 'rgba(9, 9, 9, 0.16)' : '#262626';
  const progressColor = invertColors ? '#F4F7F2' : '#B8F34A';
  const textColor = invertColors ? 'text-[#090909]' : 'text-[#F4F7F2]';

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0 select-none"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center text-xs font-black tabular-nums ${textColor}`}
      >
        {label !== undefined ? label : value}
      </span>
    </div>
  );
}

export default CircularRing;
