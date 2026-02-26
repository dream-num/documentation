import type { ReactNode } from 'react'
import { BlurFade } from '@/components/magicui/blur-fade'

interface IProps {
  title: ReactNode
  slogan: string
  actions?: ReactNode
}

export function Header(props: IProps) {
  const { title, slogan, actions } = props

  return (
    <header
      className={`
        relative overflow-hidden bg-white/50 px-4 py-12
        dark:bg-neutral-950/50
      `}
    >
      {/* Background Pattern */}
      <div
        className={`
          absolute inset-0 -z-10 size-full
          bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)]
          bg-size-[14px_24px]
        `}
      >
        <div
          className={`
            absolute inset-x-0 top-0 -z-10 m-auto size-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]
            dark:bg-blue-900
          `}
        />
      </div>

      <div>
        <div
          className={`
            relative flex flex-col gap-6
            md:flex-row md:items-center md:justify-between
          `}
        >
          <div className="flex-1">
            <BlurFade delay={0.1} inView>
              <h1
                className={`
                  mb-4 text-xl font-semibold tracking-tight text-neutral-900
                  md:text-3xl
                  dark:text-neutral-50
                `}
              >
                {title}
              </h1>
            </BlurFade>

            <BlurFade delay={0.2} inView>
              <p
                className={`
                  max-w-2xl text-neutral-600
                  dark:text-neutral-400
                `}
              >
                {slogan}
              </p>
            </BlurFade>
          </div>

          {actions && (
            <BlurFade delay={0.3} inView>
              <div className="flex shrink-0 items-center gap-4">
                {actions}
              </div>
            </BlurFade>
          )}
        </div>
      </div>
    </header>
  )
}
