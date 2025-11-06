import type { ReactNode } from 'react'
import pkg from '@/package.json'

interface IProps {
  title: string
  slogan: string
  actions?: ReactNode
}

export function Header(props: IProps) {
  const { title, slogan, actions } = props

  const iconVersion = pkg.dependencies['@univerjs/icons'].replace('^', '')

  return (
    <header
      className={`
        relative p-6
        before:pointer-events-none before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-full
        before:bg-[url('/assets/images/noise.gif')] before:opacity-[0.05] before:content-['']
      `}
    >
      <div className="relative flex justify-between">
        <div>
          <h1
            className={`
              mb-2 text-3xl font-semibold text-neutral-800
              dark:text-neutral-100
            `}
          >
            {title}
            <sup className="-top-4 ml-1 text-sm">
              v
              {iconVersion}
            </sup>
          </h1>
          <p
            className={`
              text-neutral-700
              dark:text-neutral-300
            `}
          >
            {slogan}
          </p>
        </div>

        <div className="absolute top-0 right-0">
          {actions}
        </div>
      </div>
    </header>
  )
}
