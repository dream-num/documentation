'use client'

import { ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'
import { customTranslations, localizePath } from '@/lib/i18n'

interface IShowcaseDetailHeaderProps {
  lang: string
  title: string
  description: string
  tags: string[]
  type: 'sheets' | 'docs' | 'slides'
}

const typeConfig = {
  sheets: {
    label: 'Univer Sheets',
    badgeColor: 'bg-emerald-500 text-white dark:bg-emerald-600',
  },
  docs: {
    label: 'Univer Docs',
    badgeColor: 'bg-blue-500 text-white dark:bg-blue-600',
  },
  slides: {
    label: 'Univer Slides',
    badgeColor: 'bg-rose-500 text-white dark:bg-rose-600',
  },
}

export function ShowcaseDetailHeader({ lang, title, description, tags, type }: IShowcaseDetailHeaderProps) {
  const t = customTranslations[lang]
  const config = typeConfig[type]

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        className="
          mb-4 flex items-center gap-1 text-sm text-neutral-500
          dark:text-neutral-400
        "
      >
        <Link
          href={localizePath('/', lang)}
          className="
            transition-colors
            hover:text-neutral-900
            dark:hover:text-neutral-200
          "
        >
          {t['showcase.breadcrumb.home']}
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <Link
          href={localizePath('/showcase', lang)}
          className="
            transition-colors
            hover:text-neutral-900
            dark:hover:text-neutral-200
          "
        >
          {t['showcase.breadcrumb.showcase']}
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <span
          className="
            text-neutral-900
            dark:text-neutral-200
          "
        >
          {title}
        </span>
      </nav>

      <div
        className={`
          flex flex-col-reverse justify-between gap-4
          md:flex-row md:items-start
        `}
      >
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className={clsx('h-5 px-2 text-[10px] font-semibold', config.badgeColor)}>
              {config.label}
            </Badge>
            {tags?.map(tag => (
              <Badge key={tag} variant="secondary" className="h-5 px-2 text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>

          <h1
            className={`
              mb-2 text-2xl font-semibold tracking-tight text-neutral-900
              md:text-3xl
              dark:text-neutral-50
            `}
          >
            {title}
          </h1>

          <p
            className={`
              max-w-2xl text-sm/relaxed text-neutral-600
              dark:text-neutral-400
            `}
          >
            {description}
          </p>
        </div>

        <div className="shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={localizePath('/showcase', lang)}>
              {t['showcase.back']}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
