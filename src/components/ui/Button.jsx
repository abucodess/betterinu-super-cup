import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Standard button component adhering to DESIGN_SYSTEM.md §10.2
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
    'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F34A] disabled:pointer-events-none disabled:opacity-50 select-none'

  const variants = {
    primary:
      'bg-[#B8F34A] text-[#090909] font-semibold hover:bg-[#A5E035] active:scale-[0.98]',
    secondary:
      'bg-[#202020] text-[#F4F7F2] border border-[#303030] hover:bg-[#2A2A2A] hover:border-[#404040]',
    destructive:
      'bg-transparent border border-[#FF414D] text-[#FF414D] hover:bg-[#FF414D]/10',
    danger:
      'bg-transparent border border-[#FF414D] text-[#FF414D] hover:bg-[#FF414D]/10',
    ghost:
      'bg-transparent text-[#9AA69B] hover:text-[#F4F7F2] hover:bg-[#202020]',
    link:
      'bg-transparent text-[#B8F34A] underline-offset-4 hover:underline p-0 h-auto',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-md min-h-[36px]',
    md: 'text-sm px-4 py-2 rounded-lg min-h-[44px]', // WCAG 44x44px touch target
    lg: 'text-base px-6 py-3 rounded-lg min-h-[48px]',
    icon: 'h-10 w-10 p-0 rounded-lg',
  }

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
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

