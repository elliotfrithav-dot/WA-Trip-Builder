import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none',
        {
          'bg-teal-900 text-cream-50 hover:bg-teal-800': variant === 'primary',
          'bg-cream-200 text-teal-900 hover:bg-cream-300': variant === 'secondary',
          'bg-transparent text-teal-900 hover:bg-cream-200': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-5 py-2.5 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    />
  )
}
