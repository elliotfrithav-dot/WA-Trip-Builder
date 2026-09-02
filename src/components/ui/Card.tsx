import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-cream-300/70 bg-cream-50 shadow-sm shadow-ink-900/5',
        className,
      )}
      {...props}
    />
  )
}
