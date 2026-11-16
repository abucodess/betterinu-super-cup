import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standardized Status & Role Badge — BetterInU Football League Dark Sports Theme
 */
export function Badge({
  children,
  className = '',
  variant = 'neutral',
  isLive = false,
  ...props
}) {
  const variants = {
    neutral: 'bg-[#202020] text-[#9AA69B] border border-[#303030]',
    brand: 'bg-[#001AFF]/20 text-[#60A5FA] border border-[#001AFF]/45',
    blue: 'bg-[#001AFF] text-[#FFFFFF] border border-[#3B82F6]/50',
    accent: 'bg-[#FFC600] text-[#090909] border border-[#FFC600]',
    yellow: 'bg-[#FFC600]/15 text-[#FFC600] border border-[#FFC600]/40',
    live: 'bg-[#FF1E27]/20 text-[#FF414D] border border-[#FF1E27]/45',
    red: 'bg-[#FF1E27] text-[#FFFFFF] border border-[#FF1E27]',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35',
    warning: 'bg-amber-500/15 text-[#FFC600] border border-amber-500/35',
    error: 'bg-red-500/15 text-[#FF414D] border border-red-500/35',
    info: 'bg-blue-500/15 text-blue-400 border border-blue-500/35',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold tracking-tight select-none whitespace-nowrap shrink-0',
        variants[variant] || variants.neutral,
        className
      )}
      {...props}
    >
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF1E27] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF1E27]"></span>
        </span>
      )}
      {children}
    </span>
  )
}



