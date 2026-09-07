'use client'

import {
  ArrowUpRightIcon,
  BookOpenIcon,
  DatabaseIcon,
  FileStackIcon,
  FileTextIcon,
  PanelsTopLeftIcon,
  PresentationIcon,
  SheetIcon,
  WorkflowIcon,
} from 'lucide-react'
import { useState } from 'react'

import type { ShowcaseCatalogItem } from '@/showcase/catalog'
import type { ProductId } from '@/showcase/types'
import { Badge } from '@/components/ui/badge'
import { clsx } from '@/lib/clsx'

export interface ShowcaseItem extends ShowcaseCatalogItem {
  image?: string
}

export const typeConfig: Record<
  ProductId,
  {
    icon: React.ReactNode
    badgeColor: string
    gradient: string
    iconColor: string
    borderColor: string
  }
> = {
  sheets: {
    icon: <SheetIcon className="size-5" />,
    badgeColor: 'bg-emerald-500 text-white dark:bg-emerald-600',
    gradient: 'from-emerald-500/10 to-teal-500/5 dark:from-emerald-900/20 dark:to-teal-900/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-800',
  },
  'docs-modern': {
    icon: <FileTextIcon className="size-5" />,
    badgeColor: 'bg-blue-500 text-white dark:bg-blue-600',
    gradient: 'from-blue-500/10 to-indigo-500/5 dark:from-blue-900/20 dark:to-indigo-900/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
  },
  'docs-traditional': {
    icon: <BookOpenIcon className="size-5" />,
    badgeColor: 'bg-indigo-500 text-white dark:bg-indigo-600',
    gradient: 'from-indigo-500/10 to-violet-500/5 dark:from-indigo-900/20 dark:to-violet-900/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'group-hover:border-indigo-200 dark:group-hover:border-indigo-800',
  },
  slides: {
    icon: <PresentationIcon className="size-5" />,
    badgeColor: 'bg-rose-500 text-white dark:bg-rose-600',
    gradient: 'from-rose-500/10 to-pink-500/5 dark:from-rose-900/20 dark:to-pink-900/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'group-hover:border-rose-200 dark:group-hover:border-rose-800',
  },
  boards: {
    icon: <WorkflowIcon className="size-5" />,
    badgeColor: 'bg-amber-500 text-white dark:bg-amber-600',
    gradient: 'from-amber-500/10 to-orange-500/5 dark:from-amber-900/20 dark:to-orange-900/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'group-hover:border-amber-200 dark:group-hover:border-amber-800',
  },
  bases: {
    icon: <DatabaseIcon className="size-5" />,
    badgeColor: 'bg-violet-500 text-white dark:bg-violet-600',
    gradient: 'from-violet-500/10 to-fuchsia-500/5 dark:from-violet-900/20 dark:to-fuchsia-900/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'group-hover:border-violet-200 dark:group-hover:border-violet-800',
  },
  pdfs: {
    icon: <FileStackIcon className="size-5" />,
    badgeColor: 'bg-red-500 text-white dark:bg-red-600',
    gradient: 'from-red-500/10 to-orange-500/5 dark:from-red-900/20 dark:to-orange-900/10',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'group-hover:border-red-200 dark:group-hover:border-red-800',
  },
  embed: {
    icon: <PanelsTopLeftIcon className="size-5" />,
    badgeColor: 'bg-cyan-500 text-white dark:bg-cyan-600',
    gradient: 'from-cyan-500/10 to-sky-500/5 dark:from-cyan-900/20 dark:to-sky-900/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'group-hover:border-cyan-200 dark:group-hover:border-cyan-800',
  },
}

interface ShowcaseCardProps {
  item: ShowcaseItem
}

export function ShowcaseCard({ item }: ShowcaseCardProps) {
  const config = typeConfig[item.product]
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const showImage = item.image && !imgError

  return (
    <a
      href={`/showcase/${item.slug}`}
      className={clsx(
        `group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-900/50`,
        config.borderColor,
      )}
    >
      {/* Preview Area */}
      <div className={clsx(`relative h-48 overflow-hidden bg-linear-to-br`, config.gradient)}>
        {showImage ? (
          <>
            {/* Skeleton placeholder */}
            {!imgLoaded && <div className="absolute inset-0 animate-pulse bg-neutral-200/50 dark:bg-neutral-700/50" />}
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 size-full object-cover object-top-left transition-all duration-500 ease-out group-hover:scale-[1.03]"
              loading="lazy"
              onError={() => setImgError(true)}
              onLoad={() => setImgLoaded(true)}
            />
            {/* Bottom gradient vignette for depth */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/15 to-transparent dark:from-black/25" />
            {/* Subtle top highlight border */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20 dark:bg-white/10" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div
              className={clsx(
                `flex size-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 dark:bg-neutral-800/80`,
                config.iconColor,
              )}
            >
              {config.icon}
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/5 dark:group-hover:bg-white/5`}
        >
          <div
            className={`flex size-10 items-center justify-center rounded-full bg-white/90 text-neutral-700 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 dark:bg-neutral-800/90 dark:text-neutral-200`}
          >
            <ArrowUpRightIcon className="size-5" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge className={clsx(`h-5 px-1.5 text-[10px] font-semibold`, config.badgeColor)}>{item.productName}</Badge>
        </div>

        <h3 className={`mb-1 text-base font-semibold text-neutral-800 dark:text-neutral-100`}>{item.title}</h3>

        <p className={`line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400`}>{item.description}</p>

        {item.tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
