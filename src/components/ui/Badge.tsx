import type { ReactNode } from 'react'
import clsx from 'clsx'

interface BadgeProps {
  children: ReactNode
  tone?: 'neutral' | 'good' | 'warn' | 'accent'
  className?: string
}

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        {
          'bg-cream-200 text-ink-700': tone === 'neutral',
          'bg-teal-700/10 text-teal-800': tone === 'good',
          'bg-terracotta-500/10 text-terracotta-600': tone === 'warn',
          'bg-ocean-500/10 text-ocean-600': tone === 'accent',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
