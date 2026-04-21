'use client'

import {
  BarChart3Icon,
  ContainerIcon,
  FileInputIcon,
  FunctionSquareIcon,
  GaugeIcon,
  GlobeIcon,
  HistoryIcon,
  LayersIcon,
  MoonIcon,
  PrinterIcon,
  PuzzleIcon,
  UsersIcon,
} from 'lucide-react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BlurFade } from '@/components/magicui/blur-fade'

interface Metric {
  value: number
  suffix: string
  label: string
}

interface Feature {
  icon: React.ReactNode
  title: string
  desc: string
  isPro?: boolean
}

interface IProps {
  title: string
  subtitle: string
  metric1Label: string
  metric1Value: number
  metric1Suffix: string
  metric2Label: string
  metric2Value: number
  metric2Suffix: string
  metric3Label: string
  metric3Value: number
  metric3Suffix: string
  metric4Label: string
  metric4Value: number
  metric4Suffix: string
  feature1Title: string
  feature1Desc: string
  feature2Title: string
  feature2Desc: string
  feature3Title: string
  feature3Desc: string
  feature4Title: string
  feature4Desc: string
  feature5Title: string
  feature5Desc: string
  feature6Title: string
  feature6Desc: string
  feature7Title: string
  feature7Desc: string
  feature8Title: string
  feature8Desc: string
  feature9Title: string
  feature9Desc: string
  feature10Title: string
  feature10Desc: string
  feature11Title: string
  feature11Desc: string
  feature12Title: string
  feature12Desc: string
  proBadge: string
}

function AnimatedNumber({ value, suffix }: { value: number, suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => {
    if (value < 1) return v.toFixed(2)
    if (value < 10) return v.toFixed(1)
    return Math.round(v).toString()
  })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 1.5,
        ease: 'easeOut',
      })
      const unsubscribe = rounded.on('change', v => setDisplay(v))
      return () => {
        controls.stop()
        unsubscribe()
      }
    }
  }, [isInView, value, count, rounded])

  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}

export function EnterprisePerformance(props: IProps) {
  const {
    title,
    subtitle,
    metric1Label,
    metric1Value,
    metric1Suffix,
    metric2Label,
    metric2Value,
    metric2Suffix,
    metric3Label,
    metric3Value,
    metric3Suffix,
    metric4Label,
    metric4Value,
    metric4Suffix,
    feature1Title,
    feature1Desc,
    feature2Title,
    feature2Desc,
    feature3Title,
    feature3Desc,
    feature4Title,
    feature4Desc,
    feature5Title,
    feature5Desc,
    feature6Title,
    feature6Desc,
    feature7Title,
    feature7Desc,
    feature8Title,
    feature8Desc,
    feature9Title,
    feature9Desc,
    feature10Title,
    feature10Desc,
    feature11Title,
    feature11Desc,
    feature12Title,
    feature12Desc,
    proBadge,
  } = props

  const metrics: Metric[] = [
    { value: metric1Value, suffix: metric1Suffix, label: metric1Label },
    { value: metric2Value, suffix: metric2Suffix, label: metric2Label },
    { value: metric3Value, suffix: metric3Suffix, label: metric3Label },
    { value: metric4Value, suffix: metric4Suffix, label: metric4Label },
  ]

  const openSourceFeatures: Feature[] = [
    {
      icon: (
        <GaugeIcon
          className="
            size-5 text-emerald-600
            dark:text-emerald-400
          "
        />
      ),
      title: feature1Title,
      desc: feature1Desc,
    },
    {
      icon: (
        <FunctionSquareIcon
          className="
            size-5 text-blue-600
            dark:text-blue-400
          "
        />
      ),
      title: feature2Title,
      desc: feature2Desc,
    },
    {
      icon: (
        <MoonIcon
          className="
            size-5 text-violet-600
            dark:text-violet-400
          "
        />
      ),
      title: feature7Title,
      desc: feature7Desc,
    },
    {
      icon: (
        <PuzzleIcon
          className="
            size-5 text-orange-600
            dark:text-orange-400
          "
        />
      ),
      title: feature8Title,
      desc: feature8Desc,
    },
    {
      icon: (
        <GlobeIcon
          className="
            size-5 text-sky-600
            dark:text-sky-400
          "
        />
      ),
      title: feature9Title,
      desc: feature9Desc,
    },
    {
      icon: (
        <LayersIcon
          className="
            size-5 text-teal-600
            dark:text-teal-400
          "
        />
      ),
      title: feature10Title,
      desc: feature10Desc,
    },
  ]

  const proFeatures: Feature[] = [
    {
      icon: (
        <UsersIcon
          className="
            size-5 text-amber-600
            dark:text-amber-400
          "
        />
      ),
      title: feature3Title,
      desc: feature3Desc,
      isPro: true,
    },
    {
      icon: (
        <FileInputIcon
          className="
            size-5 text-purple-600
            dark:text-purple-400
          "
        />
      ),
      title: feature4Title,
      desc: feature4Desc,
      isPro: true,
    },
    {
      icon: (
        <PrinterIcon
          className="
            size-5 text-red-600
            dark:text-red-400
          "
        />
      ),
      title: feature5Title,
      desc: feature5Desc,
      isPro: true,
    },
    {
      icon: (
        <ContainerIcon
          className="
            size-5 text-cyan-600
            dark:text-cyan-400
          "
        />
      ),
      title: feature6Title,
      desc: feature6Desc,
      isPro: true,
    },
    {
      icon: (
        <HistoryIcon
          className="
            size-5 text-indigo-600
            dark:text-indigo-400
          "
        />
      ),
      title: feature11Title,
      desc: feature11Desc,
      isPro: true,
    },
    {
      icon: (
        <BarChart3Icon
          className="
            size-5 text-rose-600
            dark:text-rose-400
          "
        />
      ),
      title: feature12Title,
      desc: feature12Desc,
      isPro: true,
    },
  ]

  return (
    <BlurFade inView>
      <section className="container px-4">
        <div className="mb-8 text-center">
          <h2
            className={`
              mb-2 text-2xl font-semibold text-neutral-900
              dark:text-neutral-100
            `}
          >
            {title}
          </h2>
          <p
            className="
              text-neutral-600
              dark:text-neutral-400
            "
          >
            {subtitle}
          </p>
        </div>

        {/* Metrics */}
        <div
          className="
            mb-8 grid grid-cols-2 gap-4
            md:grid-cols-4
          "
        >
          {metrics.map((metric, index) => (
            <BlurFade key={metric.label} inView delay={index * 0.05} className="h-full">
              <div
                className={`
                  flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-white/30 p-5 shadow-xs ring-4
                  ring-neutral-100/20 backdrop-blur-sm transition-colors ring-inset
                  hover:bg-white/50
                  dark:bg-neutral-900/50 dark:ring-neutral-600/20
                  dark:hover:bg-neutral-800/60
                `}
              >
                <div
                  className="
                    text-3xl font-bold text-neutral-900 tabular-nums
                    dark:text-neutral-100
                  "
                >
                  <AnimatedNumber value={metric.value} suffix={metric.suffix} />
                </div>
                <div
                  className="
                    text-center text-xs font-medium text-neutral-600
                    dark:text-neutral-400
                  "
                >
                  {metric.label}
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Open Source Features */}
        <div
          className="
            grid gap-4
            md:grid-cols-2
            lg:grid-cols-3
          "
        >
          {openSourceFeatures.map((feature, index) => (
            <BlurFade key={feature.title} inView delay={0.1 + index * 0.05} className="h-full">
              <div
                className={`
                  flex h-full flex-col gap-3 rounded-2xl bg-white/30 p-5 shadow-xs ring-4 ring-neutral-100/20
                  backdrop-blur-sm transition-colors ring-inset
                  hover:bg-white/50
                  dark:bg-neutral-900/50 dark:ring-neutral-600/20
                  dark:hover:bg-neutral-800/60
                `}
              >
                <div
                  className="
                    inline-flex items-center gap-2 text-sm font-semibold text-neutral-700
                    dark:text-neutral-300
                  "
                >
                  {feature.icon}
                  {feature.title}
                </div>
                <p
                  className="
                    text-sm/relaxed text-neutral-600
                    dark:text-neutral-400
                  "
                >
                  {feature.desc}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Pro Divider */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div
              className="
                w-full border-t border-neutral-200
                dark:border-neutral-700
              "
            />
          </div>
          <div
            className={`
              relative inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-4 py-1.5 text-xs font-semibold
              tracking-wider text-neutral-500 uppercase
              dark:bg-neutral-800 dark:text-neutral-400
            `}
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            {proBadge}
          </div>
        </div>

        {/* Pro Features */}
        <div
          className="
            grid gap-4
            md:grid-cols-2
            lg:grid-cols-3
          "
        >
          {proFeatures.map((feature, index) => (
            <BlurFade key={feature.title} inView delay={0.1 + index * 0.05} className="h-full">
              <div
                className={`
                  relative flex h-full flex-col gap-4 rounded-2xl bg-white/40 p-6 shadow-xs ring-4 ring-amber-100/60
                  backdrop-blur-sm transition-colors ring-inset
                  hover:bg-white/60
                  dark:bg-neutral-900/60 dark:ring-amber-900/30
                  dark:hover:bg-neutral-800/70
                `}
              >
                <div
                  className="
                    inline-flex items-center gap-2 text-sm font-semibold text-neutral-700
                    dark:text-neutral-300
                  "
                >
                  {feature.icon}
                  {feature.title}
                </div>
                <p
                  className="
                    text-sm/relaxed text-neutral-600
                    dark:text-neutral-400
                  "
                >
                  {feature.desc}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>
    </BlurFade>
  )
}
