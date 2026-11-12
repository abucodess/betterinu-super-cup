import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines Tailwind CSS classes reliably with conflict resolution.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

