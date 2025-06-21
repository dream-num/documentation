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

interface ITextProps {
  type: 'text'
  text: ReactNode
}

export function IconWrapper(props: (IIconProps | IProProps | ITextProps) & { className?: string }) {
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
            inline-block rounded-md bg-gradient-to-b from-[#5357ED] to-[#40B9FF] p-1 text-white shadow-sm
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
      <span className={clsx('flex size-6 items-center justify-center text-lg', className)}>
        {text}
      </span>
    )
  }
}
