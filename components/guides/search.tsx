'use client'

import { SearchIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { clsx } from '@/lib/clsx'

type SearchScope = 'guides' | 'reference' | 'icons' | 'all'

interface SearchResult {
  id: string
  title: string
  url: string
  content?: string
  source?: string
}

const searchScopes: SearchScope[] = ['guides', 'reference', 'icons', 'all']

function normalizeResults(payload: unknown): SearchResult[] {
  const source = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null && 'results' in payload
      ? (payload as { results?: unknown }).results
      : []

  if (!Array.isArray(source)) return []

  return source.flatMap((item, index) => {
    if (typeof item !== 'object' || item === null) return []

    const value = item as Record<string, unknown>
    const url = value.url ?? value.href
    const title = value.title ?? value.content ?? value.id

    if (typeof url !== 'string' || typeof title !== 'string') return []

    return {
      id: typeof value.id === 'string' ? value.id : `${url}-${index}`,
      title,
      url,
      content: typeof value.content === 'string' ? value.content : undefined,
      source: typeof value.source === 'string' ? value.source : undefined,
    }
  })
}

export function GuidesSearch({
  lang,
  defaultScope = 'guides',
  compact = false,
}: {
  lang: string
  defaultScope?: SearchScope
  compact?: boolean
}) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>(defaultScope)
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const trimmedQuery = query.trim()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (trimmedQuery.length === 0) {
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          query: trimmedQuery,
          scope,
          locale: lang,
        })
        const response = await fetch(`/api/search?${params}`, {
          signal: controller.signal,
        })
        const payload: unknown = await response.json()
        setResults(normalizeResults(payload))
        setActiveIndex(0)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error)
          setResults([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 150)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [lang, scope, trimmedQuery])

  const activeResult = useMemo(() => results[activeIndex], [activeIndex, results])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        className={clsx('text-muted-foreground gap-2', compact ? 'shrink-0' : `w-44 justify-start md:w-64`)}
        aria-label={t('search.label')}
        size={compact ? 'icon' : 'default'}
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-4" />
        {compact ? null : (
          <>
            <span className="min-w-0 flex-1 truncate text-left">{t('search.label')}</span>
            <kbd
              className="bg-muted text-muted-foreground hidden rounded-sm border px-1.5 py-0.5 text-[10px] font-medium sm:block"
            >
              Ctrl K
            </kbd>
          </>
        )}
      </Button>
      <DialogContent
        className="top-24 max-h-[min(42rem,calc(100vh-4rem))] translate-y-0 gap-0 overflow-hidden p-0 sm:top-28"
      >
        <DialogTitle className="sr-only">{t('search.label')}</DialogTitle>
        <DialogDescription className="sr-only">{t('search.description')}</DialogDescription>
        <div className="border-b p-3">
          <div className="flex items-center gap-2">
            <SearchIcon className="text-muted-foreground size-4" />
            <Input
              ref={inputRef}
              className="h-10 border-0 px-0 shadow-none focus-visible:ring-0"
              value={query}
              placeholder={t('search.label')}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActiveIndex((index) => Math.min(index + 1, results.length - 1))
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActiveIndex((index) => Math.max(index - 1, 0))
                }
                if (event.key === 'Enter' && activeResult) {
                  window.location.href = activeResult.url
                }
              }}
            />
          </div>
          <div aria-label={t('search.scope-label')} className="mt-3 flex gap-1 overflow-x-auto" role="tablist">
            {searchScopes.map((item) => (
              <button
                aria-selected={scope === item}
                className={clsx(
                  `hover:bg-accent hover:text-accent-foreground rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors`,
                  scope === item ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
                )}
                key={item}
                role="tab"
                type="button"
                onClick={() => setScope(item)}
              >
                {t(`search.scope.${item}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-112 overflow-y-auto p-2">
          {trimmedQuery && isLoading ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">{t('search.loading')}</p>
          ) : trimmedQuery && results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((result, index) => (
                <li key={result.id}>
                  <Link
                    className={clsx(
                      `hover:bg-accent hover:text-accent-foreground block rounded-md px-3 py-2 text-sm transition-colors`,
                      activeIndex === index && 'bg-accent text-accent-foreground',
                    )}
                    href={result.url}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="block font-medium">{result.title}</span>
                    {result.content ? (
                      <span className="text-muted-foreground mt-1 line-clamp-2 text-xs">{result.content}</span>
                    ) : null}
                    {result.source ? (
                      <span className="text-muted-foreground mt-1 block text-[11px]">{result.source}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              {trimmedQuery ? t('search.no-result') : t('search.type-to-search')}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
