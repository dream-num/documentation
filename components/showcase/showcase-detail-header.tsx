'use client'

import { ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import type { ProductId } from '@/showcase/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'

interface IShowcaseDetailHeaderProps {
  lang: string
  title: string
  description: string
  tags: string[]
  product: ProductId
  productName: string
}

const badgeColors: Record<ProductId, string> = {
  sheets: 'bg-emerald-500 text-white dark:bg-emerald-600',
  'docs-modern': 'bg-blue-500 text-white dark:bg-blue-600',
  'docs-traditional': 'bg-indigo-500 text-white dark:bg-indigo-600',
  slides: 'bg-rose-500 text-white dark:bg-rose-600',
  boards: 'bg-amber-500 text-white dark:bg-amber-600',
  bases: 'bg-violet-500 text-white dark:bg-violet-600',
  pdfs: 'bg-red-500 text-white dark:bg-red-600',
  embed: 'bg-cyan-500 text-white dark:bg-cyan-600',
}

export function ShowcaseDetailHeader({
  lang,
  title,
  description,
  tags,
  product,
  productName,
}: IShowcaseDetailHeaderProps) {
  const t = useTranslations()

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400">
        <Link href={`/${lang}`} className="transition-colors hover:text-neutral-900 hover:dark:text-neutral-200">
          {t('showcase.breadcrumb.home')}
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <Link href="/showcase" className="transition-colors hover:text-neutral-900 hover:dark:text-neutral-200">
          {t('showcase.breadcrumb.showcase')}
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <span className="text-neutral-900 dark:text-neutral-200">{title}</span>
      </nav>

      <div className={`flex flex-col-reverse justify-between gap-4 md:flex-row md:items-start`}>
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className={clsx('h-5 px-2 text-[10px] font-semibold', badgeColors[product])}>{productName}</Badge>
            {tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="h-5 px-2 text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>

          <h1
            className={`mb-2 text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-50`}
          >
            {title}
          </h1>

          <p className={`max-w-2xl text-sm/relaxed text-neutral-600 dark:text-neutral-400`}>{description}</p>
        </div>

        <div className="shrink-0">
          <Button nativeButton={false} render={<Link href="/showcase" />} variant="outline" size="sm">
            {t('showcase.back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
