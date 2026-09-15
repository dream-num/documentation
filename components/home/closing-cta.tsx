'use client'

import { BookTextIcon, FerrisWheelIcon } from 'lucide-react'
import { useInView } from 'motion/react'
import { useRef } from 'react'

import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Link } from '@/i18n/navigation'

interface IClosingCTAProps {
  title: string
  description: string
  startLabel: string
  demoLabel: string
}

export function ClosingCTA({ title, description, startLabel, demoLabel }: IClosingCTAProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { amount: 0.15 })
  const signals = [
    {
      color: 'text-[#35BD4B] [--laser-delay:-1s]',
      paths: ['M-80 120H80C260 120 280 160 480 160H600', 'M1280 124H1144C968 124 940 160 720 160H600'],
    },
    {
      color: 'text-[#4B7DFF] [--laser-delay:-4s]',
      paths: ['M-80 20H32C208 20 216 160 480 160H600', 'M1280 20H1168C992 20 984 160 720 160H600'],
    },
    {
      color: 'text-[#FF6B4B] [--laser-delay:-2s]',
      paths: ['M-80 256H56C232 256 248 160 480 160H600', 'M1280 260H1144C968 260 952 160 720 160H600'],
    },
    {
      color: 'text-[#14B8A6] [--laser-delay:-5s]',
      paths: ['M-80 72H72C248 72 248 160 480 160H600', 'M1280 76H1128C952 76 952 160 720 160H600'],
    },
    {
      color: 'text-[#8B5CF6] [--laser-delay:-3s]',
      paths: ['M-80 208H88C264 208 280 160 480 160H600', 'M1280 212H1112C936 212 920 160 720 160H600'],
    },
    {
      color: 'text-[#E5484D] [--laser-delay:0s]',
      paths: ['M-80 308H32C208 308 224 160 480 160H600', 'M1280 308H1168C992 308 976 160 720 160H600'],
    },
  ]

  return (
    <section
      ref={ref}
      id="get-started"
      aria-labelledby="get-started-title"
      data-active={isInView}
      className="group/cta data-[active=false]:**:paused data-[active=false]:[&_a]:before:paused relative isolate w-full pt-16 pb-36 text-center md:pt-24 md:pb-48 motion-reduce:[&_*]:animate-none motion-reduce:[&_a]:before:animate-none"
    >
      <h2
        id="get-started-title"
        className="group-data-[active=true]/cta:animate-cta-enter mx-auto max-w-5xl px-6 text-[clamp(30px,4.2vw,54px)] leading-[1.2] font-medium tracking-[-0.045em] text-balance"
      >
        {title.split('\n').map((line) => (
          <span
            key={line}
            className="block last:mt-2 last:text-[clamp(44px,6vw,76px)] last:font-semibold last:tracking-[-0.055em]"
          >
            {line}
          </span>
        ))}
      </h2>
      <p className="group-data-[active=true]/cta:animate-cta-enter mx-auto mt-6 max-w-4xl px-6 text-sm/relaxed text-pretty whitespace-pre-line text-(--landing-muted) [animation-delay:100ms] md:px-12 md:text-base/relaxed">
        {description}
      </p>
      <div className="group-data-[active=true]/cta:animate-cta-enter relative isolate mt-8 flex flex-wrap justify-center gap-4 px-6 [animation-delay:200ms] md:mt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-40 -translate-y-1/2 overflow-hidden sm:h-48 lg:h-80"
        >
          <svg
            viewBox="0 0 1200 320"
            preserveAspectRatio="none"
            fill="none"
            className="size-full [&_path]:[vector-effect:non-scaling-stroke]"
          >
            {signals.flatMap((signal) =>
              signal.paths.map((path) => (
                <g key={path} className={signal.color}>
                  <path d={path} className="stroke-current stroke-3 opacity-20 blur-[2px] dark:opacity-25" />
                  <path
                    d={path}
                    pathLength="1000"
                    className="animate-circuit-flow stroke-current stroke-3 opacity-70 blur-[1px] drop-shadow-[0_0_5px_currentColor] [animation-duration:6s] [stroke-dasharray:240_760] [stroke-linecap:round] motion-reduce:hidden"
                  />
                </g>
              )),
            )}
          </svg>
        </div>
        <RainbowButton render={<Link href="/guides/sheets/getting-started/quickstart" />}>
          <BookTextIcon aria-hidden="true" />
          {startLabel}
        </RainbowButton>
        <RainbowButton variant="outline" render={<Link href="https://office.univer.ai" />}>
          <FerrisWheelIcon aria-hidden="true" />
          {demoLabel}
        </RainbowButton>
      </div>
    </section>
  )
}
