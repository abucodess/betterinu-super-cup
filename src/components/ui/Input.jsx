import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standardized Input Component — BetterInU Football League Dark Sports Theme
 */
export function Input({
  className = '',
  type = 'text',
  error,
  label,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#F4F7F2] tracking-tight"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full bg-[#202020] border border-[#303030] text-[#F4F7F2] placeholder-[#9AA69B]/60 text-sm rounded-lg px-3.5 py-2.5 min-h-[42px] transition-all duration-150',
          'focus:outline-none focus:border-[#FFC600] focus:ring-2 focus:ring-[#FFC600]/20',
          'disabled:opacity-50 disabled:bg-[#141414] disabled:cursor-not-allowed',
          error && 'border-[#FF1E27] focus:border-[#FF1E27] focus:ring-[#FF1E27]/20',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-[#FF414D] mt-1">{error}</p>
      )}
    </div>
  )
}



