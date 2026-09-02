import type { ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import clsx from 'clsx'
import { OceanBackground } from '../components/decor/OceanBackground'

const NAV_ITEMS = [
  { to: '/explore', label: 'Explore', icon: '🗺️' },
  { to: '/plan', label: 'Plan', icon: '🧭' },
  { to: '/my-adventures', label: 'My Adventures', icon: '🎒' },
  { to: '/guide', label: 'Guide', icon: '📖' },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-ink-900">
      <OceanBackground />
      <header className="sticky top-0 z-40 hidden border-b border-cream-300/70 bg-cream-50/90 backdrop-blur md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-teal-900">
            <span>🌊</span>
            <span>WA Adventure Explorer</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-teal-900 text-cream-50' : 'text-ink-700 hover:bg-cream-200',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-cream-300/70 bg-cream-50/90 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2 font-display text-base font-semibold text-teal-900">
          <span>🌊</span>
          <span>WA Adventure</span>
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-cream-300/70 bg-cream-50/95 backdrop-blur md:hidden [padding-bottom:env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium',
                isActive ? 'text-teal-900' : 'text-ink-500',
              )
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
