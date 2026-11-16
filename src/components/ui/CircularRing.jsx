import React from 'react';

/**
 * Animated SVG Circular Progress Ring — BetterInU Football League Dark Sports Theme.
 * Supports dark cards (default), blue banners (tone="onBlue"), yellow accents (tone="onYellow"), and red accents (tone="onRed").
 */
export function CircularRing({
  value = 0,
  max = 5,
  label,
  size = 52,
  strokeWidth = 5,
  invertColors = false,
  tone = 'default', // 'default' | 'onBlue' | 'onYellow' | 'onRed'
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference - ratio * circumference;

  const resolvedTone = tone !== 'default' ? tone : invertColors ? 'onYellow' : 'default';

  const trackColor =
    resolvedTone === 'onBlue'
      ? 'rgba(255, 255, 255, 0.22)'
      : 'rgba(255, 255, 255, 0.12)';

  const progressColor =
    resolvedTone === 'onBlue'
      ? '#FFC600'
      : resolvedTone === 'onYellow'
      ? '#FFC600'
      : resolvedTone === 'onRed'
      ? '#FF1E27'
      : '#3B82F6';

  const textColor = 'text-[#F4F7F2]';

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
        className={`absolute inset-0 flex items-center justify-center text-xs font-extrabold tabular-nums ${textColor}`}
      >
        {label !== undefined ? label : value}
      </span>
    </div>
  );
}

export default CircularRing;


