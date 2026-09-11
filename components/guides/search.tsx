'use client'

import {
  ArrowDownIcon,
  ArrowRightIcon,
  CornerDownLeftIcon,
  FileTextIcon,
  LoaderCircleIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'

import type { IScopedSearchResult, SearchScope } from '@/lib/guides/search'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { clsx } from '@/lib/clsx'

const searchScopes: SearchScope[] = ['all', 'guides', 'server', 'ai', 'reference', 'blog']

export function GuidesSearch({ lang, defaultScope = 'all' }: { lang: string; defaultScope?: SearchScope }) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<SearchScope>(defaultScope)
  const [activeIndex, setActiveIndex] = useState(0)
  const [retry, setRetry] = useState(0)
  const [response, setResponse] = useState<{
    key: string
    status: 'loading' | 'success' | 'error'
    results: IScopedSearchResult[]
  }>({ key: '', status: 'success', results: [] })
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const trimmedQuery = query.trim()
  const requestKey = `${lang}:${scope}:${trimmedQuery}:${retry}`
  const results = trimmedQuery && response.key === requestKey ? response.results : []
  const isLoading = Boolean(trimmedQuery) && (response.key !== requestKey || response.status === 'loading')
  const hasError = response.key === requestKey && response.status === 'error'
  const activeResult = results[activeIndex]

  function changeOpen(value: boolean) {
    setOpen(value)
    if (value && !trimmedQuery) {
      setScope(pathname.startsWith('/server') ? 'server' : pathname.startsWith('/ai') ? 'ai' : defaultScope)
    }
  }

  function highlight(text: string) {
    if (!trimmedQuery) return text
    const index = text.toLocaleLowerCase().indexOf(trimmedQuery.toLocaleLowerCase())
    if (index < 0) return text
    return (
      <>
        {text.slice(0, index)}
        <mark className="text-foreground decoration-primary/50 bg-transparent font-semibold underline underline-offset-2">
          {text.slice(index, index + trimmedQuery.length)}
        </mark>
        {text.slice(index + trimmedQuery.length)}
      </>
    )
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !event.repeat) {
        event.preventDefault()
        triggerRef.current?.click()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open || !trimmedQuery) return
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setResponse({ key: requestKey, status: 'loading', results: [] })
      try {
        const params = new URLSearchParams({ query: trimmedQuery, scope, locale: lang })
        const result = await fetch(`/api/search?${params}`, { signal: controller.signal })
        if (!result.ok) throw new Error(`Search returned ${result.status}`)
        const data: IScopedSearchResult[] = await result.json()
        if (!controller.signal.aborted) {
          setResponse({ key: requestKey, status: 'success', results: data })
          setActiveIndex(0)
        }
      } catch {
        if (!controller.signal.aborted) setResponse({ key: requestKey, status: 'error', results: [] })
      }
    }, 180)
    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [lang, open, requestKey, scope, trimmedQuery])

  useEffect(() => {
    if (open && activeResult) document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, activeResult, listId, open])

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <Button
        ref={triggerRef}
        className="text-muted-foreground hover:text-foreground md:bg-muted/40 size-8 shrink-0 gap-2 shadow-none md:w-52 md:justify-start md:border md:px-3"
        aria-label={t('search.label')}
        aria-keyshortcuts="Meta+K Control+K"
        size="sm"
        type="button"
        variant="ghost"
        onClick={() => changeOpen(!open)}
      >
        <SearchIcon aria-hidden="true" className="size-4" />
        <span className="hidden min-w-0 flex-1 truncate text-left md:block">{t('search.label')}</span>
        <kbd className="text-muted-foreground hidden rounded border px-1 text-[10px] md:block">
          <span className="[[data-platform=mac]_&]:hidden">Ctrl K</span>
          <span className="hidden [[data-platform=mac]_&]:inline">⌘ K</span>
        </kbd>
      </Button>
      <DialogContent
        className="top-4 flex max-h-[calc(100dvh-2rem)] max-w-2xl translate-y-0 flex-col gap-0 overflow-hidden rounded-xl p-0 shadow-2xl sm:top-[12vh] sm:max-h-[76dvh]"
        showCloseButton={false}
        initialFocus={inputRef}
        finalFocus={triggerRef}
      >
        <DialogTitle className="sr-only">{t('search.label')}</DialogTitle>
        <DialogDescription className="sr-only">{t('search.description')}</DialogDescription>
        <div className="flex shrink-0 items-center gap-3 px-4 py-4 sm:px-5">
          {isLoading ? (
            <LoaderCircleIcon
              aria-hidden="true"
              className="text-muted-foreground size-5 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <SearchIcon aria-hidden="true" className="text-muted-foreground size-5" />
          )}
          <input
            ref={inputRef}
            aria-label={t('search.label')}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={true}
            aria-controls={listId}
            aria-activedescendant={activeResult ? `${listId}-${activeIndex}` : undefined}
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-base outline-none"
            value={query}
            maxLength={200}
            placeholder={t('search.description')}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={(event) => {
              if (results.length && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                event.preventDefault()
                setActiveIndex(
                  (index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length,
                )
              }
              if (event.key === 'Enter' && activeResult) {
                event.preventDefault()
                setOpen(false)
                router.push(activeResult.url)
              }
            }}
          />
          {query && (
            <button
              type="button"
              aria-label={t('search.clear')}
              className="text-muted-foreground hover:text-foreground rounded p-1 focus-visible:outline-2"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
          )}
          <button
            type="button"
            aria-label={t('search.close')}
            className="text-muted-foreground hover:text-foreground rounded border px-1.5 py-1 text-xs focus-visible:outline-2"
            onClick={() => setOpen(false)}
          >
            Esc
          </button>
        </div>
        <div
          aria-label={t('search.scope-label')}
          className="flex shrink-0 gap-1 overflow-x-auto border-b px-3 pb-3 sm:px-4"
          role="group"
        >
          {searchScopes.map((item) => (
            <button
              aria-pressed={scope === item}
              className={clsx(
                'shrink-0 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 sm:px-3',
                scope === item
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              key={item}
              type="button"
              onClick={() => {
                setScope(item)
                setActiveIndex(0)
                inputRef.current?.focus()
              }}
            >
              {t(`search.scope.${item}`)}
            </button>
          ))}
        </div>
        <div className="min-h-52 min-w-0 overflow-y-auto overscroll-contain p-2 sm:min-h-64">
          <div
            role="status"
            className={results.length ? 'sr-only' : 'text-muted-foreground px-5 py-12 text-center text-sm'}
          >
            {isLoading
              ? t('search.loading')
              : hasError
                ? t('search.error')
                : trimmedQuery
                  ? results.length
                    ? t('search.result-count', { count: results.length })
                    : t('search.no-result')
                  : t('search.type-to-search')}
          </div>
          {hasError && (
            <div className="-mt-8 mb-6 text-center">
              <Button size="sm" variant="outline" onClick={() => setRetry((value) => value + 1)}>
                {t('search.retry')}
              </Button>
            </div>
          )}
          {!isLoading && !hasError && trimmedQuery && !results.length && (
            <div className="text-muted-foreground -mt-8 mb-6 text-center text-xs">{t('search.no-result-hint')}</div>
          )}
          <ul id={listId} role="listbox" aria-label={t('search.label')}>
            {results.map((result, index) => (
              <li key={result.id} role="presentation">
                <Link
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={activeIndex === index}
                  tabIndex={-1}
                  className={clsx(
                    'group flex items-start gap-3 rounded-lg px-3 py-3 outline-none',
                    activeIndex === index ? 'bg-muted' : 'hover:bg-muted/60',
                  )}
                  href={result.url}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <FileTextIcon aria-hidden="true" className="text-muted-foreground mt-1 size-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="text-muted-foreground mb-1 flex gap-2 text-[11px]">
                      <span className="shrink-0 font-medium">{t(`search.scope.${result.source}`)}</span>
                      <span className="truncate">
                        {result.breadcrumbs
                          .slice(0, -1)
                          .filter((part) => part !== t(`search.scope.${result.source}`))
                          .join(' / ')}
                      </span>
                    </span>
                    <span className="block text-sm font-medium">{highlight(result.title)}</span>
                    {result.content && (
                      <span className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed">
                        {highlight(result.content)}
                      </span>
                    )}
                  </span>
                  <ArrowRightIcon
                    aria-hidden="true"
                    className={clsx('text-muted-foreground mt-2 size-4 shrink-0', activeIndex !== index && 'invisible')}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-muted-foreground flex shrink-0 items-center justify-between gap-3 border-t px-4 py-2.5 text-[11px]">
          <span>
            {results.length > 0 ? t('search.result-count', { count: results.length }) : t('search.description')}
          </span>
          <span className="hidden items-center gap-3 sm:flex">
            <span className="flex items-center gap-1">
              <ArrowDownIcon aria-hidden="true" className="size-3" />
              {t('search.navigate')}
            </span>
            <span className="flex items-center gap-1">
              <CornerDownLeftIcon aria-hidden="true" className="size-3" />
              {t('search.open')}
            </span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
