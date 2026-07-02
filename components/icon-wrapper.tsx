import type { ElementType, ReactNode } from 'react'
import { SparklesIcon } from 'lucide-react'
import { Tooltip } from '@/components/tooltip'
import { clsx } from '@/lib/clsx'

type IconComponent = ElementType<{ className?: string }>

interface IIconProps {
  type: 'icon'
  icon: IconComponent
}

interface IProProps {
  type: 'pro'
  size?: 'sm' | 'xs' | 'md'
  icon?: IconComponent
}

interface IRefProps {
  type: 'ref'
  text: ReactNode
}

interface ITextProps {
  type: 'text'
  text: string
}

const REF_COLORS: Record<string, { border: string, bg: string, text: string }> = {
  M: { border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  E: { border: 'border-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-600' },
  C: { border: 'border-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  P: { border: 'border-green-600', bg: 'bg-green-50', text: 'text-green-600' },
  T: { border: 'border-teal-600', bg: 'bg-teal-50', text: 'text-teal-600' },
  F: { border: 'border-lime-600', bg: 'bg-lime-50', text: 'text-lime-600' },
}

export function IconWrapper(props: (IIconProps | IProProps | ITextProps | IRefProps) & { className?: string }) {
  const { type, className } = props

  if (type === 'icon') {
    const { icon: IconComponent } = props

    return (
      <span className={clsx('inline-block rounded-md border bg-linear-to-b from-secondary p-1 shadow-sm', className)}>
        <IconComponent className="size-6" />
      </span>
    )
  }

  if (type === 'pro') {
    const { icon: IconComponent, size = 'md' } = props

    const iconClassName = clsx({
      'size-4': size === 'sm',
      'size-3': size === 'xs',
      'size-5': size === 'md',
    })

    return (
      <Tooltip content="Univer Pro feature">
        <span
          className={clsx(`
            inline-block rounded-md bg-linear-to-b from-[#5357ED] to-[#40B9FF] p-[5px] text-white shadow-lg
            dark:from-[#1d1f54] dark:to-[#2d3048]
          `, className)}
        >
          {IconComponent ? <IconComponent className={iconClassName} /> : <SparklesIcon className={iconClassName} />}
        </span>
      </Tooltip>
    )
  }

  if (type === 'text') {
    const { text } = props

    return (
      <span className={clsx('inline-flex size-8 items-center justify-center text-lg', className)}>
        {text}
      </span>
    )
  }

  if (type === 'ref') {
    const { text } = props
    const colors = typeof text === 'string' ? REF_COLORS[text] : undefined

    return (
      <span
        className={clsx(`
          inline-flex size-6 shrink-0 items-center justify-center rounded-md border bg-linear-to-b from-secondary
          font-semibold shadow-sm
        `, colors
          ? `
            ${colors.border}
            ${colors.bg}
            ${colors.text}
          `
          : '', className)}
      >
        {text}
      </span>
    )
  }
}
