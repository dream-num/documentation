import type { LucideProps } from 'lucide-react'
import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'
import { SparklesIcon } from 'lucide-react'
import { Tooltip } from '@/components/tooltip'
import { clsx } from '@/lib/clsx'

interface IIconProps {
  type: 'icon'
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
}

interface IProProps {
  type: 'pro'
  size?: 'sm'
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
}

interface IRefProps {
  type: 'ref'
  text: ReactNode
}

interface ITextProps {
  type: 'text'
  text: string
}

export function IconWrapper(props: (IIconProps | IProProps | ITextProps | IRefProps) & { className?: string }) {
  const { type, className } = props

  if (type === 'icon') {
    const { icon: IconComponent } = props

    return (
      <span className={clsx('inline-block rounded-md border bg-gradient-to-b from-secondary p-1 shadow-sm', className)}>
        <IconComponent className="size-6" />
      </span>
    )
  }

  if (type === 'pro') {
    const { icon: IconComponent, size } = props

    const iconClassName = clsx({
      'size-4': size === 'sm',
    })

    return (
      <Tooltip content="Univer Pro feature">
        <span
          className={clsx(`
            inline-block rounded-md bg-gradient-to-b from-[#5357ED] to-[#40B9FF] p-[5px] text-white shadow-lg
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
      <span className={clsx('inline-flex size-full items-center justify-center text-lg', className)}>
        {text}
      </span>
    )
  }

  if (type === 'ref') {
    const { text } = props

    return (
      <span
        className={clsx(`
          inline-flex size-6 items-center justify-center rounded-md border bg-gradient-to-b from-secondary font-semibold
          shadow-sm
        `, {
          'border-blue-600 bg-blue-50 text-blue-600': text === 'M',
          'border-yellow-600 bg-yellow-50 text-yellow-600': text === 'E',
          'border-indigo-600 bg-indigo-50 text-indigo-600': text === 'C',
          'border-green-600 bg-green-50 text-green-600': text === 'P',
          'border-teal-600 bg-teal-50 text-teal-600': text === 'T',
          'border-lime-600 bg-lime-50 text-lime-600': text === 'F',
        }, className)}
      >
        {text}
      </span>
    )
  }
}
