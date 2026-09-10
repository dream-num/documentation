'use client'

import { useTheme } from 'next-themes'
import { useEffect, useId, useRef, useState } from 'react'

export function Mermaid({ chart }: { chart: string }) {
  const id = useId()
  const [svg, setSvg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
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
          themeVariables: {
            darkMode: dark,
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
        container.innerHTML = result.svg
        result.bindFunctions?.(container)
        setSvg(result.svg)
      } catch (error) {
        console.error('Error while rendering mermaid', error)
      }
    }

    renderChart().catch(console.error)
    return () => {
      cancelled = true
    }
  }, [chart, id, resolvedTheme])

  return <div ref={containerRef} className="my-5 overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} />
}
