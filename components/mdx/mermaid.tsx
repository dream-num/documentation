'use client'

import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useId, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

interface IMermaidProps {
  chart: string
}

export function Mermaid({ chart }: IMermaidProps) {
  const t = useTranslations('common')
  const [zoom, setZoom] = useState(1)
  const [naturalWidth, setNaturalWidth] = useState<number>()
  const id = useId()
  const [svg, setSvg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const bindFunctionsRef = useRef<((element: Element) => void) | undefined>(undefined)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme || !containerRef.current) return
    const container = containerRef.current
    let cancelled = false

    async function renderChart() {
      const { default: mermaid } = await import('mermaid')

      try {
        if (cancelled) return
        const dark = resolvedTheme === 'dark'
        const foreground = dark ? '#dedede' : '#292929'
        const muted = dark ? '#9e9e9e' : '#666666'
        const border = dark ? '#505050' : '#cccccc'
        const surface = dark ? '#242424' : '#f4f4f4'
        const background = dark ? '#101010' : '#fafafa'
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          fontFamily: getComputedStyle(container).fontFamily,
          theme: 'base',
          flowchart: { nodeSpacing: 24, rankSpacing: 32, padding: 16, curve: 'monotoneX' },
          themeVariables: {
            darkMode: dark,
            fontSize: '14px',
            background,
            primaryColor: surface,
            primaryTextColor: foreground,
            primaryBorderColor: border,
            secondaryColor: surface,
            secondaryTextColor: foreground,
            secondaryBorderColor: border,
            tertiaryColor: background,
            tertiaryTextColor: foreground,
            tertiaryBorderColor: border,
            lineColor: muted,
            textColor: foreground,
            mainBkg: surface,
            nodeBorder: border,
            clusterBkg: background,
            clusterBorder: border,
            edgeLabelBackground: background,
          },
        })

        const result = await mermaid.render(id, chart.replaceAll('\\n', '\n'))

        if (cancelled) return
        const document = new DOMParser().parseFromString(result.svg, 'image/svg+xml')
        const width = Number(document.documentElement.getAttribute('viewBox')?.split(/\s+/)[2])
        setNaturalWidth(Number.isFinite(width) && width > 0 ? width : undefined)
        document.documentElement.setAttribute('style', 'width:100%;max-width:none;height:auto')
        bindFunctionsRef.current = result.bindFunctions
        setSvg(document.documentElement.outerHTML)
      } catch (error) {
        console.error('Error while rendering mermaid', error)
      }
    }

    renderChart().catch(console.error)
    return () => {
      cancelled = true
    }
  }, [chart, id, resolvedTheme])

  useEffect(() => {
    if (containerRef.current && svg) bindFunctionsRef.current?.(containerRef.current)
  }, [svg])

  return (
    <div className="not-prose border-border/60 my-5 overflow-hidden rounded-lg border" data-mermaid>
      <div className="border-border/60 text-muted-foreground flex h-9 items-center justify-end gap-0.5 border-b px-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t('zoom-out')}
          title={t('zoom-out')}
          disabled={zoom <= 0.5}
          onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
        >
          <Minus className="size-3.5" />
        </Button>
        <output className="w-11 text-center text-xs tabular-nums" aria-live="polite">
          {Math.round(zoom * 100)}%
        </output>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t('zoom-in')}
          title={t('zoom-in')}
          disabled={zoom >= 3}
          onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
        >
          <Plus className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-1 size-7"
          aria-label={t('reset-zoom')}
          title={t('reset-zoom')}
          disabled={zoom === 1}
          onClick={() => setZoom(1)}
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
      <div
        className="focus-visible:ring-ring max-h-[70vh] overflow-auto p-4 outline-none focus-visible:ring-2"
        tabIndex={0}
        role="region"
        aria-label={t('diagram')}
      >
        <div
          ref={containerRef}
          className="mx-auto [&>svg]:h-auto [&>svg]:w-full [&>svg]:max-w-none"
          style={{ width: `${zoom * 100}%`, maxWidth: naturalWidth ? naturalWidth * zoom : undefined }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  )
}
