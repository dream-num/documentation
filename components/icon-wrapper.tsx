import type { ElementType, ReactNode } from 'react'

import { clsx } from '@/lib/clsx'

type IconComponent = ElementType<{ className?: string }>

interface IIconProps {
  type: 'icon'
  icon: IconComponent
}

interface IRefProps {
  type: 'ref'
  text: ReactNode
}

interface ITextProps {
  type: 'text'
  text: string
}

const REF_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  M: { border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  E: { border: 'border-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-600' },
  C: { border: 'border-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  P: { border: 'border-green-600', bg: 'bg-green-50', text: 'text-green-600' },
  T: { border: 'border-teal-600', bg: 'bg-teal-50', text: 'text-teal-600' },
  F: { border: 'border-lime-600', bg: 'bg-lime-50', text: 'text-lime-600' },
}

export function IconWrapper(props: (IIconProps | ITextProps | IRefProps) & { className?: string }) {
  const { type, className } = props

  if (type === 'icon') {
    const { icon: IconComponent } = props

    return (
      <span
        className={clsx('inline-block rounded-md border bg-linear-to-b p-1 shadow-sm', 'from-secondary', className)}
      >
        <IconComponent className="size-6" />
      </span>
    )
  }

  if (type === 'text') {
    const { text } = props

    return <span className={clsx('inline-flex size-8 items-center justify-center text-lg', className)}>{text}</span>
  }

  if (type === 'ref') {
    const { text } = props
    const colors = typeof text === 'string' ? REF_COLORS[text] : undefined

    return (
      <span
        className={clsx(
          `inline-flex size-6 shrink-0 items-center justify-center rounded-md border bg-linear-to-b font-semibold shadow-sm`,
          'from-secondary',
          colors ? ` ${colors.border} ${colors.bg} ${colors.text} ` : '',
          className,
        )}
      >
        {text}
      </span>
    )
  }
}
