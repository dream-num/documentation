'use client'

import type { ReactNode } from 'react'
import { Check, ChevronRight, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'

export interface IConfigOption {
  name: string
  depth: number
  ancestors: number[]
  path: string
  type: ReactNode
  defaultValue?: ReactNode
  description: ReactNode
  end: number
}

interface IConfigOptionsProps {
  className?: string
  id?: string
  defaultLabel: string
  rows: IConfigOption[]
}

export function ConfigOptions({ defaultLabel, rows, className, id }: IConfigOptionsProps) {
  const t = useTranslations('config-options')
  const instanceId = useId()
  const listId = id ?? `config-${instanceId}`
  const listRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(
    () =>
      new Set(rows.flatMap((row, index) => (rows.length > 30 && row.depth > 0 && row.end - index > 8 ? [index] : []))),
  )
  const [copied, setCopied] = useState('')
  const [copyError, setCopyError] = useState(false)
  const parents = rows.flatMap((row, index) => (row.end > index + 1 ? [index] : []))

  function optionId(index: number) {
    return `${listId}-${rows[index].path}`
  }

  function toggle(index: number) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  useEffect(() => {
    const list = listRef.current
    if (!list) return

    function reveal(element: Element) {
      const children = element.closest<HTMLElement>('[data-config-children]')
      const option = element.closest<HTMLElement>('[data-config-option]')
      if (!option || !list?.contains(option)) return
      const index = Number(option.dataset.configOption)
      flushSync(() => {
        setCollapsed((current) => {
          const next = new Set(current)
          for (const ancestor of rows[index].ancestors) next.delete(ancestor)
          if (children) next.delete(Number(children.dataset.configChildren))
          return next
        })
      })
    }

    function beforeMatch(event: Event) {
      if (event.target instanceof Element) reveal(event.target)
    }

    function revealHash() {
      let hash: string
      try {
        hash = decodeURIComponent(window.location.hash.slice(1))
      } catch {
        return
      }
      const target = document.getElementById(hash)
      if (target && list?.contains(target)) {
        reveal(target)
        target.scrollIntoView({ block: 'center' })
      }
    }

    list.addEventListener('beforematch', beforeMatch)
    window.addEventListener('hashchange', revealHash)
    const frame = window.requestAnimationFrame(revealHash)
    return () => {
      list.removeEventListener('beforematch', beforeMatch)
      window.removeEventListener('hashchange', revealHash)
      window.cancelAnimationFrame(frame)
    }
  }, [rows, listId])

  function renderOptions(start: number, end: number) {
    const options: ReactNode[] = []
    for (let cursor = start; cursor < end; cursor = rows[cursor].end) {
      const index = cursor
      const row = rows[index]
      const parent = row.end > index + 1
      const open = !collapsed.has(index)
      options.push(
        <li key={row.path} id={optionId(index)} data-config-option={index} data-config-parent={parent || undefined}>
          <div data-config-entry data-config-open={open || undefined}>
            <div data-config-heading>
              <div data-config-name>
                {parent ? (
                  <button
                    type="button"
                    data-config-toggle
                    aria-label={t(open ? 'collapse' : 'expand', { path: row.path })}
                    aria-expanded={open}
                    aria-controls={`${optionId(index)}-children`}
                    onClick={() => toggle(index)}
                  >
                    <ChevronRight
                      aria-hidden="true"
                      className={clsx(
                        'size-3.5 transition-transform motion-reduce:transition-none',
                        open && 'rotate-90',
                      )}
                    />
                  </button>
                ) : (
                  <span aria-hidden="true" data-config-toggle-space />
                )}
                <code>{row.name}</code>
              </div>
              <span data-config-type>{row.type}</span>
              {row.defaultValue !== undefined && (
                <span data-config-default>
                  {defaultLabel}: {row.defaultValue}
                </span>
              )}
            </div>
            {row.description && <div data-config-description>{row.description}</div>}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              data-config-copy
              className="size-7 text-muted-foreground"
              aria-label={t('copy-path', { path: row.path })}
              title={t(copied === row.path ? 'copied-path' : 'copy-path', { path: row.path })}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(row.path)
                  setCopied(row.path)
                  setCopyError(false)
                } catch {
                  setCopied('')
                  setCopyError(true)
                }
              }}
            >
              {copied === row.path ? (
                <Check aria-hidden="true" className="size-3.5" />
              ) : (
                <Copy aria-hidden="true" className="size-3.5" />
              )}
            </Button>
          </div>
          {parent && (
            <ul
              hidden={!open}
              ref={(element) => {
                // React serializes hidden as a boolean. Native find needs its until-found value.
                if (element && !open) element.setAttribute('hidden', 'until-found')
              }}
              id={`${optionId(index)}-children`}
              data-config-children={index}
            >
              {renderOptions(index + 1, row.end)}
            </ul>
          )}
        </li>,
      )
    }
    return options
  }

  return (
    <div ref={listRef} id={listId} data-config-options-list className={clsx('my-5', className)}>
      {parents.length > 0 && (
        <div data-config-controls className="mb-1 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCollapsed(collapsed.size > 0 ? new Set() : new Set(parents))}
          >
            {t(collapsed.size > 0 ? 'expand-all' : 'collapse-all')}
          </Button>
        </div>
      )}
      <div data-config-scroll>
        <ul data-config-root>{renderOptions(0, rows.length)}</ul>
      </div>
      <span role="status" className="sr-only">
        {copyError ? t('copy-failed') : copied ? t('copied-path', { path: copied }) : ''}
      </span>
    </div>
  )
}
