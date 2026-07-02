'use client'

import type { TOCItemType } from 'fumadocs-core/toc'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { clsx } from '@/lib/clsx'

function getHeadingId(url: string) {
  return decodeURIComponent(url.replace(/^#/, ''))
}

function getTocDepth(item: TOCItemType) {
  return Math.max(item.depth - 2, 0)
}

export function TocList({
  items,
  compact = false,
}: {
  items?: TOCItemType[]
  lang: string
  compact?: boolean
}) {
  const t = useTranslations()
  const headings = useMemo(() => items ?? [], [items])
  const [activeId, setActiveId] = useState<string | undefined>(() => headings[0]?.url)

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map(item => document.getElementById(getHeadingId(item.url)))
      .filter((element): element is HTMLElement => Boolean(element))

    if (elements.length === 0) return

    const scrollContainer = elements[0].closest<HTMLElement>('[data-doc-scroll-container]')
    const scrollTarget: HTMLElement | Window = scrollContainer ?? window
    let frame = 0

    function updateActiveHeading() {
      frame = 0

      const anchorOffset = scrollContainer
        ? scrollContainer.getBoundingClientRect().top + 32
        : 112
      let activeElement = elements[0]

      for (const element of elements) {
        if (element.getBoundingClientRect().top <= anchorOffset) {
          activeElement = element
        } else {
          break
        }
      }

      setActiveId(`#${activeElement.id}`)
    }

    function scheduleActiveUpdate() {
      if (frame) return
      frame = window.requestAnimationFrame(updateActiveHeading)
    }

    scheduleActiveUpdate()
    scrollTarget.addEventListener('scroll', scheduleActiveUpdate, { passive: true })
    window.addEventListener('resize', scheduleActiveUpdate)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      scrollTarget.removeEventListener('scroll', scheduleActiveUpdate)
      window.removeEventListener('resize', scheduleActiveUpdate)
    }
  }, [headings])

  return (
    <nav aria-label={t('docs.toc.title')} className="text-sm">
      <div className="mb-3">
        <p className="text-xs font-medium text-muted-foreground">
          {t('docs.toc.title')}
        </p>
      </div>
      {headings.length > 0
        ? (
            <div>
              <ol className="space-y-0.5">
                {headings.map((item) => {
                  const depth = getTocDepth(item)
                  const active = activeId === item.url

                  return (
                    <li
                      key={item.url}
                    >
                      <a
                        className={clsx(
                          `
                            block rounded-md py-1.5 pr-2 leading-snug text-muted-foreground
                            transition-[background-color,color,transform]
                            hover:text-foreground
                            [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono
                            [&_code]:text-[0.92em] [&_code]:font-normal [&_code]:text-muted-foreground
                            hover:[&_code]:text-foreground
                          `,
                          active && `
                            bg-accent/35 font-medium text-foreground
                            [&_code]:bg-background/80 [&_code]:text-foreground
                          `,
                        )}
                        href={item.url}
                        style={{
                          paddingInlineStart: compact ? `${depth * 0.75}rem` : `${depth * 0.85}rem`,
                        }}
                      >
                        {item.title}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </div>
          )
        : (
            <p className="text-sm text-muted-foreground">
              {t('docs.toc.no-headings')}
            </p>
          )}
    </nav>
  )
}
