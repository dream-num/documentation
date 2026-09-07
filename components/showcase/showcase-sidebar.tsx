'use client'

import { ChevronRightIcon, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import type { ShowcaseCatalogItem } from '@/showcase/catalog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { clsx } from '@/lib/clsx'
import { categoryLabel, sectionLabel, integrationProductLabel } from '@/showcase/catalog'
import { SECTION_IDS, categoriesFor, directoryGroups, INTEGRATION_PRODUCT_IDS } from '@/showcase/directory'

interface ShowcaseSidebarProps {
  items: ShowcaseCatalogItem[]
  pathname: string
  lang: string
}

export function ShowcaseSidebar({ items, pathname, lang }: ShowcaseSidebarProps) {
  const current = items.find((item) => item.slug === pathname)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(
    () =>
      new Set([
        `product:${current?.section}`,
        `integration-product:${current?.integrationProduct}`,
        `integration-category:${current?.integrationProduct}:${current?.category}`,
        `category:${current?.section}:${current?.category}`,
        `group:${current?.section}:${current?.category}:${current?.group}`,
      ]),
  )

  const filteredItems = useMemo(() => {
    const value = query.trim().toLocaleLowerCase()
    return value ? items.filter((item) => item.searchText.includes(value)) : items
  }, [items, query])

  const toggle = (key: string) => {
    setExpanded((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const isOpen = (key: string) => Boolean(query.trim()) || expanded.has(key)
  const renderItems = (entries: ShowcaseCatalogItem[]) => (
    <>
      {!entries.length && (
        <p className="px-7 py-2 text-xs text-neutral-500">{lang === 'zh-CN' ? '暂无案例' : 'No demos yet'}</p>
      )}
      {entries
        .toSorted((a, b) => a.title.localeCompare(b.title, lang))
        .map((item) => (
          <Link
            key={item.slug}
            href={`/${lang}/showcase/${item.slug}`}
            aria-current={item.slug === pathname ? 'page' : undefined}
            className={clsx(
              'block rounded-md py-1.5 pr-2 pl-8 text-xs transition-colors',
              item.slug === pathname
                ? 'bg-neutral-100 font-medium text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 dark:text-neutral-400 hover:dark:bg-neutral-800/50 hover:dark:text-neutral-100',
            )}
          >
            <span className="line-clamp-2">{item.title}</span>
          </Link>
        ))}
    </>
  )

  return (
    <aside className="fixed hidden h-[calc(100vh-108px)] w-68 shrink-0 overflow-hidden lg:block">
      <div className="flex h-full flex-col pt-4">
        <label className="relative mb-3 block px-1">
          <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={lang === 'zh-CN' ? '搜索功能、变体和 API…' : 'Search features, variants, and APIs…'}
            className="bg-background focus:ring-ring/20 h-9 w-full rounded-md border pr-2 pl-8 text-xs outline-none focus:ring-2"
          />
        </label>

        <ScrollArea className="min-h-0 flex-1">
          {SECTION_IDS.map((product) => {
            const productItems = filteredItems.filter((item) => item.section === product)
            if (!productItems.length && query.trim()) return null
            const productKey = `product:${product}`
            if (product === 'customization-integration')
              return (
                <TreeBranch
                  key={product}
                  depth={0}
                  label={sectionLabel(product, lang)}
                  count={productItems.length}
                  open={isOpen(productKey)}
                  onToggle={() => toggle(productKey)}
                >
                  {INTEGRATION_PRODUCT_IDS.map((scope) => {
                    const scoped = productItems.filter((item) => item.integrationProduct === scope)
                    if (!scoped.length && query.trim()) return null
                    const scopeKey = `integration-product:${scope}`
                    return (
                      <TreeBranch
                        key={scope}
                        depth={1}
                        label={integrationProductLabel(scope, lang)}
                        count={scoped.length}
                        open={isOpen(scopeKey)}
                        onToggle={() => toggle(scopeKey)}
                      >
                        {categoriesFor(product).map((category) => {
                          const entries = scoped.filter((item) => item.category === category)
                          if (!entries.length && query.trim()) return null
                          const categoryKey = `integration-category:${scope}:${category}`
                          return (
                            <TreeBranch
                              key={category}
                              depth={2}
                              label={categoryLabel(category, lang)}
                              count={entries.length}
                              open={isOpen(categoryKey)}
                              onToggle={() => toggle(categoryKey)}
                            >
                              {renderItems(entries)}
                            </TreeBranch>
                          )
                        })}
                      </TreeBranch>
                    )
                  })}
                </TreeBranch>
              )

            return (
              <TreeBranch
                key={product}
                depth={0}
                label={sectionLabel(product, lang)}
                count={productItems.length}
                open={isOpen(productKey)}
                onToggle={() => toggle(productKey)}
              >
                {categoriesFor(product).map((category) => {
                  const categoryItems = productItems.filter((item) => item.category === category)
                  if (!categoryItems.length && query.trim()) return null
                  const categoryKey = `category:${product}:${category}`
                  const groups = directoryGroups(
                    product,
                    category,
                    categoryItems.map((item) => item.group),
                    lang,
                  ).filter((group) => !query.trim() || categoryItems.some((item) => item.group === group))

                  return (
                    <TreeBranch
                      key={category}
                      depth={1}
                      label={categoryLabel(category, lang)}
                      count={categoryItems.length}
                      open={isOpen(categoryKey)}
                      onToggle={() => toggle(categoryKey)}
                    >
                      {!groups.length && (
                        <p className="px-5 py-2 text-xs text-neutral-500">
                          {lang === 'zh-CN' ? '暂无案例' : 'No demos yet'}
                        </p>
                      )}
                      {groups.map((group) => {
                        const groupItems = categoryItems.filter((item) => item.group === group)
                        const groupKey = `group:${product}:${category}:${group}`
                        return (
                          <TreeBranch
                            key={group}
                            depth={2}
                            label={group}
                            count={groupItems.length}
                            open={isOpen(groupKey)}
                            onToggle={() => toggle(groupKey)}
                          >
                            {renderItems(groupItems)}
                          </TreeBranch>
                        )
                      })}
                    </TreeBranch>
                  )
                })}
              </TreeBranch>
            )
          })}

          {!filteredItems.length && (
            <p className="px-3 py-8 text-center text-xs text-neutral-500">
              {lang === 'zh-CN' ? '没有匹配的案例' : 'No matching demos'}
            </p>
          )}
          <div className="h-24" />
        </ScrollArea>
      </div>
    </aside>
  )
}

function TreeBranch({
  label,
  count,
  depth,
  open,
  onToggle,
  children,
}: {
  label: string
  count: number
  depth: 0 | 1 | 2
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={depth === 0 ? 'mb-2' : ''}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={clsx(
          'flex w-full items-center gap-1 rounded-md py-1.5 pr-2 text-left hover:bg-neutral-50 hover:dark:bg-neutral-800/50',
          depth === 0
            ? 'pl-1 text-sm font-semibold'
            : depth === 1
              ? 'pl-3 text-xs font-semibold'
              : 'pl-5 text-xs font-medium',
        )}
      >
        <ChevronRightIcon className={clsx('size-3.5 shrink-0 transition-transform', open && 'rotate-90')} />
        <span className="min-w-0 flex-1" title={label}>
          {label}
        </span>
        <span className="text-[10px] font-normal text-neutral-400">{count}</span>
      </button>
      {open && children}
    </div>
  )
}
