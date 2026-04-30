import type { ReactNode } from 'react'
import { clsx } from '@univerjs/design'

export function ToolbarField(props: { label: string, children: ReactNode }) {
  const { label, children } = props

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="
          shrink-0 text-[11px] font-medium tracking-[0.06em] text-slate-500 uppercase
          dark:text-gray-400!
        "
      >
        {label}
      </div>
      {children}
    </div>
  )
}

export function ToolbarToggleGroup(props: {
  items: Array<{ label: string, value: string }>
  value: string
  onChange: (value: string) => void
}) {
  const { items, value, onChange } = props

  return (
    <div className="inline-flex items-center gap-1">
      {items.map((item) => {
        const active = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            className={clsx(`
              cursor-pointer rounded-md border-none bg-transparent px-2.5 py-1 text-sm font-medium transition-colors
            `, active
              ? ''
              : `
                text-slate-600
                hover:bg-slate-100 hover:text-slate-900
                dark:text-gray-300!
                dark:hover:bg-gray-800! dark:hover:text-white!
              `)}
            style={active
              ? {
                  backgroundColor: 'var(--primary-600)',
                  color: '#FFFFFF',
                }
              : undefined}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
