'use client'

import { BookTextIcon, PresentationIcon, SheetIcon, SparklesIcon } from 'lucide-react'
import { BlurFade } from '@/components/magicui/blur-fade'
import { clsx } from '@/lib/clsx'
import { customTranslations } from '@/lib/i18n'

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
}

function StatItem({ icon, label, value, colorClass }: StatItemProps) {
  return (
    <BlurFade delay={0.3} inView>
      <div
        className={`
          flex items-center gap-3 rounded-xl border bg-card/60 px-4 py-3 shadow-sm backdrop-blur-sm
          dark:bg-card/40
        `}
      >
        <div
          className={clsx(`flex size-10 shrink-0 items-center justify-center rounded-lg text-white`, colorClass)}
        >
          {icon}
        </div>
        <div>
          <div className="text-xl leading-none font-bold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </BlurFade>
  )
}

interface ShowcaseHeroProps {
  lang: string
  sheetsCount: number
  docsCount: number
  slidesCount: number
}

export function ShowcaseHero({ lang, sheetsCount, docsCount, slidesCount }: ShowcaseHeroProps) {
  const t = customTranslations[lang]

  return (
    <section
      className={`
        relative overflow-hidden rounded-2xl border bg-white/50 px-6 py-12
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
        <div
          className={`
            absolute right-1/4 bottom-0 -z-10 size-[200px] rounded-full bg-emerald-400 opacity-15 blur-[80px]
            dark:bg-emerald-900
          `}
        />
      </div>

      <div className="relative">
        <BlurFade delay={0.1} inView>
          <div
            className={`
              mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium
              text-neutral-600
              dark:bg-neutral-800 dark:text-neutral-300
            `}
          >
            <SparklesIcon className="size-3.5" />
            <span>{t['showcase.slogan']}</span>
          </div>
        </BlurFade>

        <BlurFade delay={0.15} inView>
          <h1
            className={`
              mb-4 text-center text-3xl font-semibold tracking-tight text-neutral-900
              md:text-4xl
              dark:text-neutral-50
            `}
          >
            {t['showcase.title']}
          </h1>
        </BlurFade>

        <BlurFade delay={0.2} inView>
          <p
            className={`
              mx-auto mb-8 max-w-xl text-center text-sm text-neutral-600
              md:text-base
              dark:text-neutral-400
            `}
          >
            {t['showcase.slogan']}
          </p>
        </BlurFade>

        <div
          className="mx-auto grid max-w-xl grid-cols-3 gap-3"
        >
          <StatItem
            icon={<SheetIcon className="size-5" />}
            label={t['showcase.stats.sheets']}
            value={sheetsCount}
            colorClass="bg-linear-to-br from-emerald-500 to-emerald-700"
          />
          <StatItem
            icon={<BookTextIcon className="size-5" />}
            label={t['showcase.stats.docs']}
            value={docsCount}
            colorClass="bg-linear-to-br from-blue-500 to-blue-700"
          />
          <StatItem
            icon={<PresentationIcon className="size-5" />}
            label={t['showcase.stats.slides']}
            value={slidesCount}
            colorClass="bg-linear-to-br from-rose-500 to-rose-700"
          />
        </div>
      </div>
    </section>
  )
}
