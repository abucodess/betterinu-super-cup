import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standard Card component adhering to DESIGN_SYSTEM.md §10.1
 */
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'bg-[#141414] border border-[#303030] rounded-xl p-4 text-[#F4F7F2]',
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
    <div className={cn('flex flex-col space-y-1.5 pb-3 border-b border-[#252525] mb-3', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={cn('text-base sm:text-lg font-semibold text-[#F4F7F2]', className)}
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
      className={cn('flex items-center pt-3 border-t border-[#252525] mt-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

