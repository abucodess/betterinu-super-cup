import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standardized Dark Sports Card Component — BetterInU Football League Design System
 */
export function Card({ children, variant = 'default', className = '', ...props }) {
  const surfaceVariants = {
    default: 'bg-[#141414] border-[#262626] text-[#F4F7F2]',
    secondary: 'bg-[#1C1C1C] border-[#303030] text-[#F4F7F2]',
    yellow: 'bg-[#141414] border-[#FFC600]/45 text-[#F4F7F2]',
    blue: 'bg-[#141414] border-[#001AFF]/55 text-[#F4F7F2]',
    red: 'bg-[#141414] border-[#FF1E27]/50 text-[#F4F7F2]',
  }

  return (
    <div
      className={cn(
        'border rounded-2xl p-5 shadow-lg transition-colors',
        surfaceVariants[variant] || surfaceVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 pb-3.5 border-b border-[#262626] mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={cn('text-base sm:text-lg font-bold text-[#F4F7F2] tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={cn('text-xs sm:text-sm text-[#9AA69B]', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={cn('flex items-center pt-3.5 border-t border-[#262626] mt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}



