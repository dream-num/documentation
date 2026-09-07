'use client'

import { LayoutGridIcon, ListIcon, SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

import type { ShowcaseCatalogItem } from '@/showcase/catalog'
import { clsx } from '@/lib/clsx'
import { sectionLabel, categoryLabel, integrationProductLabel } from '@/showcase/catalog'
import {
  SECTION_IDS,
  categoriesFor,
  HOST_IDS,
  HOST_LABELS,
  INTEGRATION_PRODUCT_IDS,
  type SectionId,
} from '@/showcase/directory'
import { localize } from '@/showcase/types'

import { ShowcaseCard } from './showcase-card'
import { ShowcaseListItem } from './showcase-list-item'

interface ShowcaseContentProps {
  items: ShowcaseCatalogItem[]
  lang: string
  counts: Record<SectionId, number>
}

export function ShowcaseContent({ items, lang, counts }: ShowcaseContentProps) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const requestedFilter = searchParams.get('filter')
  const activeFilter: SectionId | 'all' = SECTION_IDS.includes(requestedFilter as SectionId)
    ? (requestedFilter as SectionId)
    : 'all'
  const availableCategories = activeFilter === 'all' ? [] : categoriesFor(activeFilter)
  const requestedCategory = searchParams.get('category')
  const activeCategory = availableCategories.find((category) => category === requestedCategory)
  const activeHost = activeFilter === 'embed' ? HOST_IDS.find((host) => host === searchParams.get('host')) : undefined
  const activeProduct =
    activeFilter === 'customization-integration'
      ? INTEGRATION_PRODUCT_IDS.find((product) => product === searchParams.get('product'))
      : undefined
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

  const sectionItems = activeFilter === 'all' ? items : items.filter((item) => item.section === activeFilter)
  const filteredByType = activeProduct
    ? sectionItems.filter((item) => item.integrationProduct === activeProduct)
    : sectionItems
  const query = searchQuery.trim().toLowerCase()
  const filteredItems = filteredByType.filter(
    (item) =>
      (!activeCategory || item.category === activeCategory) &&
      (!activeHost || item.host === activeHost) &&
      (!query || item.searchText.includes(query)),
  )

  return (
    <>
      {/* Filter */}
      <div className="mt-8 flex justify-center">
        <div
          role="group"
          aria-label={lang === 'zh-CN' ? '案例领域' : 'Demo sections'}
          className="bg-muted text-muted-foreground flex flex-wrap items-center justify-center gap-1 rounded-lg p-[3px]"
        >
          <button
            onClick={() => handleFilterClick('all')}
            className={clsx(
              `focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-4`,
              activeFilter === 'all'
                ? `bg-background text-foreground dark:border-input dark:bg-input/30 shadow-sm`
                : 'hover:text-foreground',
            )}
          >
            <span>{t('showcase.filter.all')}</span>
            <span className="rounded-full bg-neutral-200 px-1.5 py-0 text-[10px] font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
              {items.length}
            </span>
          </button>
          {SECTION_IDS.map((product) => (
            <button
              key={product}
              onClick={() => handleFilterClick(product)}
              className={clsx(
                `focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none`,
                activeFilter === product
                  ? 'bg-background text-foreground dark:border-input dark:bg-input/30 shadow-sm'
                  : 'hover:text-foreground',
              )}
            >
              <span>{sectionLabel(product, lang)}</span>
              <span className="bg-background/70 rounded-full px-1.5 text-[10px]">{counts[product]}</span>
            </button>
          ))}
        </div>
      </div>

      {activeFilter === 'customization-integration' && (
        <label className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
          {lang === 'zh-CN' ? '产品范围' : 'Product scope'}
          <select
            className="bg-background rounded-md border px-3 py-2"
            value={activeProduct ?? ''}
            onChange={(event) => router.push(`${pathname}${buildQuery({ product: event.target.value || undefined })}`)}
          >
            <option value="">{lang === 'zh-CN' ? '全部产品' : 'All products'}</option>
            {INTEGRATION_PRODUCT_IDS.map((product) => (
              <option key={product} value={product}>
                {integrationProductLabel(product, lang)} ·{' '}
                {sectionItems.filter((item) => item.integrationProduct === product).length}
              </option>
            ))}
          </select>
        </label>
      )}
      {availableCategories.length > 0 && (
        <div
          className="mt-4 flex flex-wrap justify-center gap-2"
          aria-label={lang === 'zh-CN' ? '案例类别' : 'Demo categories'}
        >
          {[undefined, ...availableCategories].map((category) => (
            <button
              key={category ?? 'all'}
              aria-pressed={activeCategory === category}
              className={clsx(
                'rounded-md border px-3 py-1.5 text-sm',
                activeCategory === category && 'bg-muted font-medium',
              )}
              onClick={() => router.push(`${pathname}${buildQuery({ category })}`)}
            >
              {category ? categoryLabel(category, lang) : t('showcase.filter.all')}
              {' · '}
              {category ? filteredByType.filter((item) => item.category === category).length : filteredByType.length}
            </button>
          ))}
        </div>
      )}
      {activeFilter === 'embed' && (
        <label className="mt-4 flex items-center justify-center gap-2 text-sm">
          {lang === 'zh-CN' ? '宿主产品' : 'Host product'}
          <select
            className="bg-background rounded-md border px-3 py-2"
            value={activeHost ?? ''}
            onChange={(event) => router.push(`${pathname}${buildQuery({ host: event.target.value || undefined })}`)}
          >
            <option value="">{lang === 'zh-CN' ? '全部宿主' : 'All hosts'}</option>
            {HOST_IDS.map((host) => (
              <option key={host} value={host}>
                {localize(HOST_LABELS[host], lang, host)} ·{' '}
                {
                  filteredByType.filter(
                    (item) => item.host === host && (!activeCategory || item.category === activeCategory),
                  ).length
                }
              </option>
            ))}
          </select>
        </label>
      )}
      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('showcase.search.placeholder')}
            className="bg-background focus:border-ring focus:ring-ring/20 h-10 w-full rounded-lg border pr-8 pl-9 text-sm transition-colors outline-none focus:ring-2 dark:bg-neutral-900/50"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="bg-muted inline-flex h-10 items-center rounded-lg p-[3px]">
          <button
            onClick={() => handleViewClick('grid')}
            className={clsx(
              `focus-visible:ring-ring inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none`,
              currentView === 'grid'
                ? `bg-background text-foreground dark:border-input dark:bg-input/30 shadow-sm`
                : 'hover:text-foreground',
            )}
            aria-label={t('showcase.view.grid')}
          >
            <LayoutGridIcon className="size-4" />
          </button>
          <button
            onClick={() => handleViewClick('list')}
            className={clsx(
              `focus-visible:ring-ring inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none`,
              currentView === 'list'
                ? `bg-background text-foreground dark:border-input dark:bg-input/30 shadow-sm`
                : 'hover:text-foreground',
            )}
            aria-label={t('showcase.view.list')}
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-muted-foreground mt-4 text-sm">
          {filteredItems.length}{' '}
          {filteredItems.length === 1 ? t('showcase.search.result') : t('showcase.search.results')}{' '}
          {t('showcase.search.result-for')}
          {' "'}
          {searchQuery}"
        </p>
      )}

      {/* Grid / List */}
      {currentView === 'grid' ? (
        <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ShowcaseCard key={item.slug} item={item} />
          ))}
        </section>
      ) : (
        <section className="mt-6 flex flex-col gap-3">
          {filteredItems.map((item) => (
            <ShowcaseListItem key={item.slug} item={item} />
          ))}
        </section>
      )}

      {filteredItems.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-neutral-500 dark:text-neutral-400">{t('showcase.search.no-result')}</p>
        </div>
      )}
    </>
  )
}
