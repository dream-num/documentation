'use client'

import { ArrowRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import type { ProductId } from '@/showcase/types'
import { Badge } from '@/components/ui/badge'
import { clsx } from '@/lib/clsx'

import { typeConfig } from './showcase-card'

export interface RelatedItem {
  title: string
  description: string
  slug: string
  product: ProductId
  productName: string
}

interface RelatedShowcasesProps {
  lang: string
  items: RelatedItem[]
  currentSlug: string
}

export function RelatedShowcases({ items, currentSlug }: RelatedShowcasesProps) {
  const t = useTranslations()

  const filteredItems = items.filter((item) => item.slug !== currentSlug).slice(0, 3)

  if (filteredItems.length === 0) {
    return null
  }

  return (
    <section className="mt-12">
      <h2 className={`mb-4 text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-50`}>
        {t('showcase.related-title')}
      </h2>

      <div className={`grid grid-cols-1 gap-4 md:grid-cols-3`}>
        {filteredItems.map((item) => {
          const config = typeConfig[item.product]
          return (
            <Link
              key={item.slug}
              href={`/showcase/${item.slug}`}
              className={`group flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900/50`}
            >
              <div className="mb-2 flex items-center justify-between">
                <Badge className={clsx('h-5 px-1.5 text-[10px] font-semibold', config.badgeColor)}>
                  {item.productName}
                </Badge>
                <ArrowRightIcon
                  className={`size-4 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-neutral-600`}
                />
              </div>

              <h3 className={`mb-1 text-sm font-semibold text-neutral-800 dark:text-neutral-100`}>{item.title}</h3>

              <p className={`line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400`}>{item.description}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
