import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standardized Button System — BetterInU Football League Dark Sports Theme
 */
export function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC600] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap shrink-0 cursor-pointer'

  const variants = {
    primary:
      'bg-[#FFC600] text-[#090909] border border-[#FFC600] hover:bg-[#FFD43B] shadow-sm active:scale-[0.99]',
    blue:
      'bg-[#001AFF] text-[#FFFFFF] border border-[#3B82F6]/40 hover:bg-[#1D4ED8] shadow-sm active:scale-[0.99]',
    secondary:
      'bg-[#202020] text-[#F4F7F2] border border-[#303030] hover:bg-[#2A2A2A] hover:border-[#FFC600]/50 shadow-2xs active:scale-[0.99]',
    accent:
      'bg-[#FFC600] text-[#090909] border border-[#FFC600] hover:bg-[#FFD43B] font-extrabold shadow-xs active:scale-[0.99]',
    destructive:
      'bg-[#FF1E27]/15 border border-[#FF1E27]/40 text-[#FF414D] hover:bg-[#FF1E27] hover:text-[#FFFFFF] hover:border-[#FF1E27]',
    danger:
      'bg-[#FF1E27] text-[#FFFFFF] border border-[#FF1E27] hover:bg-[#DC2626] shadow-xs',
    ghost:
      'bg-transparent text-[#9AA69B] hover:text-[#F4F7F2] hover:bg-[#202020]',
    link:
      'bg-transparent text-[#FFC600] underline-offset-4 hover:underline p-0 h-auto',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg min-h-[36px]',
    md: 'text-sm px-4 py-2 rounded-lg min-h-[42px]',
    lg: 'text-sm sm:text-base px-5 py-2.5 rounded-lg min-h-[46px]',
    icon: 'h-10 w-10 p-0 rounded-lg',
  }

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant] || variants.primary, sizes[size], className)}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}



