'use client'

import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

export function FeatureComparison({
  children,
  groups,
  compareSummaries = true,
}: {
  children: ReactNode
  groups: string[]
  compareSummaries?: boolean
}) {
  const t = useTranslations('featureComparison')
  const content = useRef<HTMLDivElement>(null)
  const pendingAnchor = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [openSource, setOpenSource] = useState(false)
  const [differences, setDifferences] = useState(false)
  const [counts, setCounts] = useState<{ visible: number; total: number }>()

  function reset() {
    setQuery('')
    setGroup('all')
    setOpenSource(false)
    setDifferences(false)
  }

  useEffect(() => {
    const root = content.current
    if (!root) return
    const headings = root.querySelectorAll('h2')
    let visible = 0
    let total = 0
    root.querySelectorAll('table').forEach((table, index) => {
      let matches = 0
      table.querySelectorAll('tbody tr').forEach((row) => {
        const cells = [...row.querySelectorAll<HTMLElement>('[data-support]')]
        const differs = cells.some(
          (cell) =>
            cell.dataset.support !== cells[0]?.dataset.support ||
            (compareSummaries && cell.dataset.summary !== cells[0]?.dataset.summary),
        )
        const show =
          (group === 'all' || group === String(index)) &&
          (!openSource || cells[0]?.dataset.openSource === 'true') &&
          (!differences || differs) &&
          `${groups[index]} ${row.textContent ?? ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
        ;(row as HTMLElement).hidden = !show
        total += 1
        if (show) matches += 1
      })
      if (table.parentElement) table.parentElement.hidden = matches === 0
      if (headings[index]) (headings[index] as HTMLElement).hidden = matches === 0
      visible += matches
    })
    setCounts({ visible, total })
    pendingAnchor.current?.scrollIntoView({ block: 'start' })
    pendingAnchor.current = null
  }, [query, group, openSource, differences, compareSummaries, groups])

  useEffect(() => {
    function revealHeading(hash: string, onlyHidden = false) {
      if (!query && group === 'all' && !openSource && !differences) return
      let id: string
      try {
        id = decodeURIComponent(hash.slice(1))
      } catch {
        return
      }
      const heading = document.getElementById(id)
      if (!heading || heading.tagName !== 'H2' || !content.current?.contains(heading)) return
      if (onlyHidden && !heading.hidden) return
      pendingAnchor.current = heading
      reset()
    }
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const link = event.target instanceof Element ? event.target.closest('a') : null
      if (!link || link.target || link.hasAttribute('download')) return
      const url = new URL(link.href)
      if (
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        revealHeading(url.hash)
    }
    function onHashChange() {
      revealHeading(window.location.hash, true)
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
              {groups.map((name, index) => (
                <option key={name} value={index}>
                  {name}
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
            {counts ? t('count', counts) : null}
          </span>
        </div>
      </div>
      {counts?.visible === 0 ? <p role="status">{t('empty')}</p> : null}
      <div
        ref={content}
        className="feature-comparison [&_[data-support=no]]:text-muted-foreground [&_[data-support=partial]]:text-amber-700 dark:[&_[data-support=partial]]:text-amber-400 [&_[data-support=yes]]:text-emerald-700 dark:[&_[data-support=yes]]:text-emerald-400 [&_small]:mt-2 [&_small]:block [&_small]:text-xs [&_small]:leading-relaxed [&_small]:text-muted-foreground [&_table]:min-w-180 [&_table]:table-fixed [&_td]:wrap-break-word [&_td_img]:h-auto [&_td_img]:w-40 [&_td:first-child]:font-medium [&_th]:whitespace-normal!"
      >
        {children}
      </div>
    </div>
  )
}
