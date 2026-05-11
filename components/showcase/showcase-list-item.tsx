'use client'

import type { ShowcaseItem } from './showcase-card'
import { ArrowUpRightIcon, BookTextIcon, PresentationIcon, SheetIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { clsx } from '@/lib/clsx'

const typeConfig = {
  sheets: {
    label: 'Univer Sheets',
    icon: <SheetIcon className="size-5" />,
    badgeColor: 'bg-emerald-500 text-white dark:bg-emerald-600',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-800',
  },
  docs: {
    label: 'Univer Docs',
    icon: <BookTextIcon className="size-5" />,
    badgeColor: 'bg-blue-500 text-white dark:bg-blue-600',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
  },
  slides: {
    label: 'Univer Slides',
    icon: <PresentationIcon className="size-5" />,
    badgeColor: 'bg-rose-500 text-white dark:bg-rose-600',
    iconColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'group-hover:border-rose-200 dark:group-hover:border-rose-800',
  },
}

interface ShowcaseListItemProps {
  item: ShowcaseItem
}

export function ShowcaseListItem({ item }: ShowcaseListItemProps) {
  const config = typeConfig[item.type]

  return (
    <a
      href={item.url}
      className={clsx(`
        group flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all duration-300
        hover:shadow-md
        dark:bg-neutral-900/50
      `, config.borderColor)}
    >
      {/* Icon */}
      <div
        className={clsx(`
          flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm backdrop-blur-sm
          transition-transform duration-300
          group-hover:scale-110
          dark:bg-neutral-800/80
        `, config.iconColor)}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge className={clsx(`h-5 px-1.5 text-[10px] font-semibold`, config.badgeColor)}>
            {config.label}
          </Badge>
        </div>
        <h3
          className="
            truncate text-base font-semibold text-neutral-800
            dark:text-neutral-100
          "
        >
          {item.title}
        </h3>
        <p
          className="
            truncate text-sm text-neutral-500
            dark:text-neutral-400
          "
        >
          {item.description}
        </p>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div
          className="
            hidden max-w-[200px] shrink-0 flex-wrap justify-end gap-1.5
            sm:flex
          "
        >
          {item.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="
                rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500
                dark:bg-neutral-800 dark:text-neutral-400
              "
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Arrow */}
      <div
        className="
          flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 opacity-0
          transition-all duration-300
          group-hover:opacity-100
          dark:bg-neutral-800 dark:text-neutral-400
        "
      >
        <ArrowUpRightIcon className="size-4" />
      </div>
    </a>
  )
}
