import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standard Status Badge adhering to DESIGN_SYSTEM.md §2.3 and §10.3
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
    brand: 'bg-[#B8F34A]/10 text-[#B8F34A] border border-[#B8F34A]/30',
    live: 'bg-[#FF414D]/10 text-[#FF414D] border border-[#FF414D]/30',
    success: 'bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30',
    warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30',
    error: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30',
    info: 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF414D] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF414D]"></span>
        </span>
      )}
      {children}
    </span>
  )
}

