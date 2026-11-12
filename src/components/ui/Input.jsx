import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standard Input component adhering to DESIGN_SYSTEM.md §2.4 & §10
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
          className="block text-xs font-medium text-[#9AA69B] uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full bg-[#202020] border border-[#303030] text-[#F4F7F2] placeholder-[#9AA69B]/60 text-sm rounded-lg px-3.5 py-2.5 min-h-[44px] transition-colors',
          'focus:outline-none focus:border-[#B8F34A] focus:ring-1 focus:ring-[#B8F34A]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-[#EF4444] mt-1">{error}</p>
      )}
    </div>
  )
}

