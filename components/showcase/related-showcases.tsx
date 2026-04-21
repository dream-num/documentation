'use client'

import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import { BlurFade } from '@/components/magicui/blur-fade'
import { Badge } from '@/components/ui/badge'
import { clsx } from '@/lib/clsx'
import { customTranslations } from '@/lib/i18n'

export interface RelatedItem {
  title: string
  description: string
  slug: string
  type: 'sheets' | 'docs' | 'slides'
}

interface RelatedShowcasesProps {
  lang: string
  items: RelatedItem[]
  currentSlug: string
}

const typeConfig = {
  sheets: {
    label: 'Univer Sheets',
    badgeColor: 'bg-emerald-500 text-white dark:bg-emerald-600',
    gradient: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/20 dark:to-teal-900/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  docs: {
    label: 'Univer Docs',
    badgeColor: 'bg-blue-500 text-white dark:bg-blue-600',
    gradient: 'from-blue-500/10 to-indigo-500/5 dark:from-blue-900/20 dark:to-indigo-900/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  slides: {
    label: 'Univer Slides',
    badgeColor: 'bg-rose-500 text-white dark:bg-rose-600',
    gradient: 'from-rose-500/10 to-pink-500/5 dark:from-rose-900/20 dark:to-pink-900/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
}

export function RelatedShowcases({ lang, items, currentSlug }: RelatedShowcasesProps) {
  const t = customTranslations[lang]

  const filteredItems = items.filter(item => item.slug !== currentSlug).slice(0, 3)

  if (filteredItems.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <BlurFade inView>
        <h2
          className={`
            mb-4 text-lg font-semibold tracking-tight text-neutral-900
            dark:text-neutral-50
          `}
        >
          {t['showcase.related.title']}
        </h2>
      </BlurFade>

      <div
        className={`
          grid grid-cols-1 gap-4
          md:grid-cols-3
        `}
      >
        {filteredItems.map((item, index) => {
          const config = typeConfig[item.type]
          return (
            <BlurFade key={item.slug} delay={0.05 * index} inView>
              <Link
                href={`/${lang}/showcase/${item.slug}`}
                className={`
                  group flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-300
                  hover:-translate-y-0.5 hover:shadow-md
                  dark:bg-neutral-900/50
                `}
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge className={clsx('h-5 px-1.5 text-[10px] font-semibold', config.badgeColor)}>
                    {config.label}
                  </Badge>
                  <ArrowRightIcon
                    className={`
                      size-4 text-neutral-400 transition-transform duration-200
                      group-hover:translate-x-0.5
                      dark:text-neutral-600
                    `}
                  />
                </div>

                <h3
                  className={`
                    mb-1 text-sm font-semibold text-neutral-800
                    dark:text-neutral-100
                  `}
                >
                  {item.title}
                </h3>

                <p
                  className={`
                    line-clamp-2 text-xs text-neutral-500
                    dark:text-neutral-400
                  `}
                >
                  {item.description}
                </p>
              </Link>
            </BlurFade>
          )
        })}
      </div>
    </section>
  )
}
