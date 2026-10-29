'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DocsTable } from '@/components/mdx/table'
import type { IFeatureGroup } from './feature-comparison'

export function FeatureComparisonTable({ groups }: { groups: IFeatureGroup[] }) {
  const t = useTranslations('featureComparison')
  const sections = useRef(new Map<string, HTMLElement>())
  const pendingAnchor = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [openSource, setOpenSource] = useState(false)
  const [differences, setDifferences] = useState(false)
  const search = query.trim().toLocaleLowerCase()
  const filtered = groups.map((section, index) => ({
    ...section,
    rows: section.rows.map((row) => ({
      ...row,
      visible:
        (group === 'all' || group === String(index)) &&
        (!openSource || row.openSource) &&
        (!differences || row.differs) &&
        row.text.includes(search),
    })),
  }))
  const total = groups.reduce((count, section) => count + section.rows.length, 0)
  const visible = filtered.reduce((count, section) => count + section.rows.filter((row) => row.visible).length, 0)

  function reset() {
    setQuery('')
    setGroup('all')
    setOpenSource(false)
    setDifferences(false)
  }

  useLayoutEffect(() => {
    pendingAnchor.current?.scrollIntoView({ block: 'start' })
    pendingAnchor.current = null
  }, [query, group, openSource, differences])

  useEffect(() => {
    function revealHeading(hash: string) {
      if (!query && group === 'all' && !openSource && !differences) return
      const section = sections.current.get(decodeURIComponent(hash.slice(1)))
      if (!section) return
      pendingAnchor.current = section
      reset()
    }
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return
      const link = event.target.closest('a')
      if (!link || link.target || link.hasAttribute('download')) return
      if (
        link.origin === window.location.origin &&
        link.pathname === window.location.pathname &&
        link.search === window.location.search
      )
        revealHeading(link.hash)
    }
    function onHashChange() {
      revealHeading(window.location.hash)
    }
    window.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      window.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [query, group, openSource, differences])

  return (
    <div>
      <div className="not-prose my-6 space-y-3 rounded-lg border bg-muted/20 p-4">
        <div className="flex flex-wrap gap-3">
          <label className="min-w-48 flex-1 text-sm">
            <span className="mb-1.5 block font-medium">{t('search')}</span>
            <input
              className="h-9 w-full rounded-md border bg-background px-3"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('placeholder')}
              type="search"
            />
          </label>
          <label className="min-w-48 flex-1 text-sm">
            <span className="mb-1.5 block font-medium">{t('group')}</span>
            <select
              className="h-9 w-full rounded-md border bg-background px-2"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            >
              <option value="all">{t('allGroups')}</option>
              {groups.map(({ title, id }, index) => (
                <option key={id} value={index}>
                  {title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={openSource} onChange={(event) => setOpenSource(event.target.checked)} />
            {t('openSource')}
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={differences} onChange={(event) => setDifferences(event.target.checked)} />
            {t('differences')}
          </label>
          <button className="rounded-sm underline underline-offset-4" type="button" onClick={reset}>
            {t('reset')}
          </button>
          <span className="text-muted-foreground" role="status">
            {t('count', { visible, total })}
          </span>
        </div>
      </div>
      {visible === 0 ? <p role="status">{t('empty')}</p> : null}
      <div className="feature-comparison [&_[data-support=no]]:text-muted-foreground [&_[data-support=partial]]:text-amber-700 dark:[&_[data-support=partial]]:text-amber-400 [&_[data-support=yes]]:text-emerald-700 dark:[&_[data-support=yes]]:text-emerald-400 [&_small]:mt-2 [&_small]:block [&_small]:text-xs [&_small]:leading-relaxed [&_small]:text-muted-foreground [&_table]:min-w-180 [&_table]:table-fixed [&_td]:wrap-break-word [&_td_img]:h-auto [&_td_img]:w-40 [&_td:first-child]:font-medium [&_th]:whitespace-normal!">
        {filtered.map((section) => (
          <section
            key={section.id}
            className="mt-10 scroll-m-24 first:mt-0"
            hidden={!section.rows.some((row) => row.visible)}
            ref={(element) => {
              if (element) sections.current.set(section.id, element)
              else sections.current.delete(section.id)
            }}
          >
            {section.heading}
            <DocsTable>
              {section.header}
              <tbody>
                {section.rows.map((row) => (
                  <tr key={row.text} hidden={!row.visible}>
                    {row.children}
                  </tr>
                ))}
              </tbody>
            </DocsTable>
          </section>
        ))}
      </div>
    </div>
  )
}
