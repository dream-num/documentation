'use client'

import type { TOCItemType } from 'fumadocs-core/toc'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { clsx } from '@/lib/clsx'

export function TocList({ items, compact = false }: { items?: TOCItemType[]; lang: string; compact?: boolean }) {
  const t = useTranslations()
  const headings = useMemo(() => items ?? [], [items])
  const listRef = useRef<HTMLOListElement>(null)
  const trackRef = useRef<SVGPathElement>(null)
  const markerRef = useRef<SVGPathElement>(null)
  const markerSvgRef = useRef<SVGSVGElement>(null)
  const [activeUrls, setActiveUrls] = useState<ReadonlySet<string>>(() => new Set(headings[0] ? [headings[0].url] : []))
  const currentUrl = activeUrls.values().next().value

  useEffect(() => {
    const list = listRef.current
    const track = trackRef.current
    const marker = markerRef.current
    const markerSvg = markerSvgRef.current
    if (!list || !track || !marker || !markerSvg) return
    if (headings.length === 0) return
    const tocList = list
    const tocTrack = track
    const tocMarker = marker
    const tocMarkerSvg = markerSvg

    const links = [...tocList.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')]
    const pathItems = headings.flatMap((item, index) => {
      const element = document.getElementById(decodeURIComponent(item.url.replace(/^#/, '')))
      const link = links[index]

      return element && link ? [{ element, link, pathEnd: 0, pathStart: 0, url: item.url }] : []
    })

    if (pathItems.length === 0) return

    const scrollContainer = pathItems[0].element.closest<HTMLElement>('[data-doc-scroll-container]')
    const scrollTarget: HTMLElement | Window = scrollContainer ?? window
    let frame = 0
    let pathLength = 0

    function updateActiveHeading() {
      frame = 0

      const scrollBounds = scrollContainer?.getBoundingClientRect()
      const viewportTop = scrollBounds?.top ?? 0
      const viewportHeight = scrollBounds?.height ?? window.innerHeight
      const visibleTop = viewportTop + viewportHeight * 0.1
      const visibleBottom = viewportTop + viewportHeight * 0.8
      let fallback = pathItems[0]
      const activeItems = []

      for (const item of pathItems) {
        const bounds = item.element.getBoundingClientRect()
        if (bounds.top <= visibleTop) fallback = item
        if (bounds.bottom > visibleTop && bounds.top < visibleBottom) activeItems.push(item)
        if (bounds.top >= visibleBottom) break
      }

      if (activeItems.length === 0) {
        activeItems.push(fallback)
      }

      const nextUrls = activeItems.map((item) => item.url)
      setActiveUrls((previous) => {
        if (previous.size === nextUrls.length && nextUrls.every((url) => previous.has(url))) return previous
        return new Set(nextUrls)
      })

      const pathStart = activeItems[0].pathStart
      const pathEnd = activeItems.at(-1)?.pathEnd ?? pathStart
      tocMarker.setAttribute('stroke-dasharray', `1 ${pathStart} ${pathEnd - pathStart} ${pathLength}`)
      tocMarker.setAttribute('stroke-dashoffset', '1')
    }

    function scheduleActiveUpdate() {
      if (frame) return
      frame = window.requestAnimationFrame(updateActiveHeading)
    }

    function drawPath() {
      const commands: string[] = []
      const pathPoints = pathItems.map((item) => {
        const padding = Number.parseFloat(window.getComputedStyle(item.link).paddingInlineStart)
        const x = item.link.offsetLeft + padding - 12
        const y = item.link.offsetTop

        return { bottom: y + item.link.offsetHeight, item, x, y }
      })

      commands.push('M', `${pathPoints[0].x}`, `${pathPoints[0].y}`)
      pathPoints.forEach((point, index) => {
        const next = pathPoints[index + 1]
        if (!next) {
          commands.push('L', `${point.x}`, `${point.bottom}`)
          return
        }

        if (next.x === point.x) {
          commands.push('L', `${point.x}`, `${next.y}`)
          return
        }

        const bendMiddle = (point.bottom + next.y) / 2
        const bendRadius = Math.min(6, (next.bottom - point.y) / 4)
        commands.push(
          'L',
          `${point.x}`,
          `${bendMiddle - bendRadius}`,
          'C',
          `${point.x} ${bendMiddle}`,
          `${next.x} ${bendMiddle}`,
          `${next.x} ${bendMiddle + bendRadius}`,
        )
      })

      tocMarkerSvg.setAttribute('viewBox', `0 0 ${tocList.clientWidth} ${tocList.scrollHeight}`)
      tocTrack.setAttribute('d', commands.join(' '))
      tocMarker.setAttribute('d', commands.join(' '))
      pathLength = tocMarker.getTotalLength()

      function getPathLengthAtY(targetY: number) {
        let start = 0
        let end = pathLength

        for (let index = 0; index < 12; index++) {
          const middle = (start + end) / 2
          if (tocMarker.getPointAtLength(middle).y < targetY) {
            start = middle
          } else {
            end = middle
          }
        }

        return (start + end) / 2
      }

      for (const point of pathPoints) {
        point.item.pathStart = getPathLengthAtY(point.y)
        point.item.pathEnd = getPathLengthAtY(point.bottom)
      }

      scheduleActiveUpdate()
    }

    drawPath()
    scrollTarget.addEventListener('scroll', scheduleActiveUpdate, { passive: true })
    window.addEventListener('resize', scheduleActiveUpdate)
    const resizeObserver = new ResizeObserver(drawPath)
    resizeObserver.observe(tocList)

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame)
      }

      resizeObserver.disconnect()
      scrollTarget.removeEventListener('scroll', scheduleActiveUpdate)
      window.removeEventListener('resize', scheduleActiveUpdate)
    }
  }, [compact, headings])

  return (
    <nav aria-label={t('docs.toc.title')} className="text-sm">
      <div className="mb-3">
        <p className={clsx('text-xs font-medium', 'text-muted-foreground')}>{t('docs.toc.title')}</p>
      </div>
      {headings.length > 0 ? (
        <div className="relative">
          <svg
            ref={markerSvgRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <path
              ref={trackRef}
              className="stroke-border"
              d=""
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <path
              ref={markerRef}
              className="stroke-foreground transition-[stroke-dasharray,stroke-dashoffset] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
              d=""
              fill="none"
              strokeDasharray="0 0 0 1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <ol ref={listRef} className="relative space-y-0.5">
            {headings.map((item) => {
              const depth = Math.max(item.depth - 2, 0)
              const active = activeUrls.has(item.url)

              return (
                <li key={item.url}>
                  <a
                    className={clsx(
                      'mr-1 block rounded-md py-1.5 pr-2 leading-snug transition-[color,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transform-none motion-reduce:transition-none',
                      'text-muted-foreground hover:text-foreground',
                      '[&_code]:rounded-sm [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.92em] [&_code]:font-normal',
                      '[&_code]:bg-muted [&_code]:text-muted-foreground hover:[&_code]:text-foreground',
                      active && 'translate-x-1 font-medium',
                      active && 'text-foreground [&_code]:bg-accent [&_code]:text-foreground',
                    )}
                    aria-current={item.url === currentUrl ? 'location' : undefined}
                    data-toc-link
                    href={item.url}
                    style={{
                      paddingInlineStart: `${1 + depth * (compact ? 0.75 : 0.85)}rem`,
                    }}
                  >
                    {item.title}
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      ) : (
        <p className={clsx('text-sm', 'text-muted-foreground')}>{t('docs.toc.no-headings')}</p>
      )}
    </nav>
  )
}
