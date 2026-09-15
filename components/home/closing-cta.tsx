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
      path: 'M-80 186H124C310 186 312 18 490 18H710C888 18 890 186 1076 186H1280',
    },
    {
      color: 'text-[#4B7DFF] [--laser-delay:-4s]',
      path: 'M-80 204H152C332 204 334 34 504 34H696C866 34 868 204 1048 204H1280',
    },
    {
      color: 'text-[#FF6B4B] [--laser-delay:-2s]',
      path: 'M-80 222H180C354 222 356 50 518 50H682C844 50 846 222 1020 222H1280',
    },
    {
      color: 'text-[#14B8A6] [--laser-delay:-5s]',
      path: 'M1280 240H992C824 240 824 66 668 66H532C376 66 376 240 208 240H-80',
    },
    {
      color: 'text-[#8B5CF6] [--laser-delay:-3s]',
      path: 'M1280 258H964C802 258 802 82 654 82H546C398 82 398 258 236 258H-80',
    },
    {
      color: 'text-[#E5484D] [--laser-delay:0s]',
      path: 'M1280 276H936C780 276 780 98 640 98H560C420 98 420 276 264 276H-80',
    },
  ]

  return (
    <section
      ref={ref}
      id="get-started"
      aria-labelledby="get-started-title"
      data-active={isInView}
      className="group/cta data-[active=false]:**:paused data-[active=false]:[&_a]:before:paused relative isolate w-full px-6 pt-16 pb-36 text-center md:px-12 md:pt-24 md:pb-48 motion-reduce:[&_*]:animate-none motion-reduce:[&_a]:before:animate-none"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-52 overflow-hidden md:h-64"
      >
        <div className="absolute inset-x-[15%] bottom-4 h-24 bg-[linear-gradient(90deg,#35bd4b,#4b7dff,#ff6b4b,#14b8a6,#8b5cf6,#e5484d)] opacity-15 blur-3xl dark:opacity-20" />
        <svg viewBox="0 0 1200 280" preserveAspectRatio="none" fill="none" className="size-full">
          {signals.map((signal) => (
            <g key={signal.color} className={signal.color}>
              <path d={signal.path} className="stroke-current stroke-1 opacity-20 dark:opacity-25" />
              <path
                d={signal.path}
                pathLength="1000"
                className="animate-circuit-flow stroke-current stroke-[1.8] opacity-80 drop-shadow-[0_0_4px_currentColor] [animation-duration:9s] [stroke-dasharray:65_935] [stroke-linecap:round] motion-reduce:hidden"
              />
            </g>
          ))}
        </svg>
      </div>

      <h2
        id="get-started-title"
        className="group-data-[active=true]/cta:animate-cta-enter mx-auto max-w-5xl text-[clamp(30px,4.2vw,54px)] leading-[1.2] font-medium tracking-[-0.045em] text-balance"
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
      <p className="group-data-[active=true]/cta:animate-cta-enter mx-auto mt-6 max-w-2xl text-sm/relaxed text-pretty text-(--landing-muted) [animation-delay:100ms] md:text-base/relaxed">
        {description}
      </p>
      <div className="group-data-[active=true]/cta:animate-cta-enter mt-8 flex flex-wrap justify-center gap-4 [animation-delay:200ms] md:mt-10">
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
