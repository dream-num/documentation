import type { ForwardRefExoticComponent, ReactNode, RefAttributes } from 'react'
import { type LucideProps, SparklesIcon } from 'lucide-react'
import { Tooltip } from '@/components/tooltip'

interface IIconProps {
  type: 'icon'
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
}

interface IProProps {
  type: 'pro'
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
}

interface ITextProps {
  type: 'text'
  text: ReactNode
}

export function IconWrapper(props: IIconProps | IProProps | ITextProps) {
  const { type } = props

  if (type === 'icon') {
    const { icon: IconComponent } = props

    return (
      <div className="rounded-md border bg-gradient-to-b from-secondary p-1 shadow-sm">
        <IconComponent className="size-6" />
      </div>
    )
  }

  if (type === 'pro') {
    const { icon: IconComponent } = props

    return (
      <Tooltip content="Univer Pro feature">
        <div
          className={`
            rounded-md bg-gradient-to-b from-[#5357ED] to-[#40B9FF] p-1 text-white shadow-sm
            dark:from-[#1d1f54] dark:to-[#2d3048]
          `}
        >
          {IconComponent ? <IconComponent /> : <SparklesIcon />}
        </div>
      </Tooltip>
    )
  }

  if (type === 'text') {
    const { text } = props

    return (
      <div className="flex size-6 items-center justify-center text-lg">
        {text}
      </div>
    )
  }
}
