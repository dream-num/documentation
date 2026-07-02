'use client'

import {
  BookTextIcon,
  LayoutGridIcon,
  ListIcon,
  PresentationIcon,
  SearchIcon,
  SheetIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { clsx } from '@/lib/clsx'
import { ShowcaseCard } from './showcase-card'
import { ShowcaseListItem } from './showcase-list-item'

interface ShowcaseContentProps {
  items: Array<{
    title: string
    description: string
    tags: string[]
    url: string
    type: 'sheets' | 'docs' | 'slides'
    index: number
  }>
  lang: string
  sheetsCount: number
  docsCount: number
  slidesCount: number
}

export function ShowcaseContent({
  items,
  sheetsCount,
  docsCount,
  slidesCount,
}: ShowcaseContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeFilter = searchParams.get('filter') || 'all'
  const currentView = (searchParams.get('view') as 'grid' | 'list') || 'grid'
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const buildQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const sp = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          sp.set(key, value)
        } else {
          sp.delete(key)
        }
      })
      const qs = sp.toString()
      return qs ? `?${qs}` : ''
    },
    [searchParams],
  )

  const handleFilterClick = (filter: string) => {
    router.push(`${pathname}${buildQuery({ filter })}`)
  }

  const handleViewClick = (view: 'grid' | 'list') => {
    router.replace(`${pathname}${buildQuery({ view })}`)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    router.replace(`${pathname}${buildQuery({ q: value || undefined })}`)
  }

  const filteredByType = useMemo(() => {
    return activeFilter === 'all'
      ? items
      : items.filter(item => item.type === activeFilter)
  }, [items, activeFilter])

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return filteredByType
    const q = searchQuery.toLowerCase()
    return filteredByType.filter(
      item =>
        item.title.toLowerCase().includes(q)
        || item.description.toLowerCase().includes(q)
        || item.tags.some(tag => tag.toLowerCase().includes(q)),
    )
  }, [filteredByType, searchQuery])

  return (
    <>
      {/* Filter */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex h-10 items-center rounded-lg bg-muted p-[3px] text-muted-foreground">
          <button
            onClick={() => handleFilterClick('all')}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'all'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <span>{t('showcase.filter.all')}</span>
            <span
              className="
                rounded-full bg-neutral-200 px-1.5 py-0 text-[10px] font-medium text-neutral-600
                dark:bg-neutral-700 dark:text-neutral-300
              "
            >
              {items.length}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('sheets')}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'sheets'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <SheetIcon className="size-3.5" />
            <span
              className="
                hidden
                sm:inline
              "
            >
              {t('showcase.filter.sheets')}
            </span>
            <span
              className="
                rounded-full bg-emerald-100 px-1.5 py-0 text-[10px] font-medium text-emerald-700
                dark:bg-emerald-900/30 dark:text-emerald-400
              "
            >
              {sheetsCount}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('docs')}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'docs'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <BookTextIcon className="size-3.5" />
            <span
              className="
                hidden
                sm:inline
              "
            >
              {t('showcase.filter.docs')}
            </span>
            <span
              className="
                rounded-full bg-blue-100 px-1.5 py-0 text-[10px] font-medium text-blue-700
                dark:bg-blue-900/30 dark:text-blue-400
              "
            >
              {docsCount}
            </span>
          </button>
          <button
            onClick={() => handleFilterClick('slides')}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent
              px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
              sm:px-4
            `, activeFilter === 'slides'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
          >
            <PresentationIcon className="size-3.5" />
            <span
              className="
                hidden
                sm:inline
              "
            >
              {t('showcase.filter.slides')}
            </span>
            <span
              className="
                rounded-full bg-rose-100 px-1.5 py-0 text-[10px] font-medium text-rose-700
                dark:bg-rose-900/30 dark:text-rose-400
              "
            >
              {slidesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="
          mt-6 flex flex-col gap-4
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        {/* Search */}
        <div
          className="
            relative w-full
            sm:max-w-xs
          "
        >
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder={t('showcase.search.placeholder')}
            className="
              h-10 w-full rounded-lg border bg-background pr-8 pl-9 text-sm transition-colors outline-none
              focus:border-ring focus:ring-2 focus:ring-ring/20
              dark:bg-neutral-900/50
            "
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="
                absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground
                hover:text-foreground
              "
            >
              ✕
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="inline-flex h-10 items-center rounded-lg bg-muted p-[3px]">
          <button
            onClick={() => handleViewClick('grid')}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1
              text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
            `, currentView === 'grid'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
            aria-label={t('showcase.view.grid')}
          >
            <LayoutGridIcon className="size-4" />
          </button>
          <button
            onClick={() => handleViewClick('list')}
            className={clsx(`
              inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1
              text-sm font-medium whitespace-nowrap transition-colors
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
            `, currentView === 'list'
              ? `
                bg-background text-foreground shadow-sm
                dark:border-input dark:bg-input/30
              `
              : 'hover:text-foreground')}
            aria-label={t('showcase.view.list')}
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="mt-4 text-sm text-muted-foreground">
          {filteredItems.length}
          {' '}
          {filteredItems.length === 1 ? t('showcase.search.result') : t('showcase.search.results')}
          {' '}
          {t('showcase.search.result-for')}
          {' "'}
          {searchQuery}
          "
        </p>
      )}

      {/* Grid / List */}
      {currentView === 'grid'
        ? (
            <section
              className="
                mt-6 grid grid-cols-1 gap-5
                md:grid-cols-2
                lg:grid-cols-3
              "
            >
              {filteredItems.map(item => (
                <ShowcaseCard key={item.url} item={item} />
              ))}
            </section>
          )
        : (
            <section className="mt-6 flex flex-col gap-3">
              {filteredItems.map(item => (
                <ShowcaseListItem key={item.url} item={item} />
              ))}
            </section>
          )}

      {filteredItems.length === 0 && (
        <div className="py-24 text-center">
          <p
            className="
              text-neutral-500
              dark:text-neutral-400
            "
          >
            {t('showcase.search.no-result')}
          </p>
        </div>
      )}
    </>
  )
}
