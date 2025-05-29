'use client'

import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverDocsCorePreset } from '@univerjs/presets/preset-docs-core'
import docsCoreEnUS from '@univerjs/presets/preset-docs-core/locales/en-US'
import docsCoreZhCN from '@univerjs/presets/preset-docs-core/locales/zh-CN'
import { UniverDocsDrawingPreset } from '@univerjs/presets/preset-docs-drawing'
import docsDrawingEnUS from '@univerjs/presets/preset-docs-drawing/locales/en-US'
import docsDrawingZhCN from '@univerjs/presets/preset-docs-drawing/locales/zh-CN'
import { UniverDocsHyperLinkPreset } from '@univerjs/presets/preset-docs-hyper-link'
import docsHyperLinkEnUS from '@univerjs/presets/preset-docs-hyper-link/locales/en-US'
import docsHyperLinkZhCN from '@univerjs/presets/preset-docs-hyper-link/locales/zh-CN'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'
import { DOCUMENT_DATA } from './data'

const code = `
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverDocsCorePreset } from '@univerjs/presets/preset-docs-core'
import docsCoreEnUS from '@univerjs/presets/preset-docs-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-docs-core.css'

import { UniverDocsDrawingPreset } from '@univerjs/presets/preset-docs-drawing'
import docsDrawingEnUS from '@univerjs/presets/preset-docs-drawing/locales/en-US'
import '@univerjs/presets/lib/styles/preset-docs-drawing.css'

import { UniverDocsHyperLinkPreset } from '@univerjs/presets/preset-docs-hyper-link'
import docsHyperLinkEnUS from '@univerjs/presets/preset-docs-hyper-link/locales/en-US'
import '@univerjs/presets/lib/styles/preset-docs-hyper-link.css'

import { DOCUMENT_DATA } from './data'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      docsCoreEnUS,
      docsDrawingEnUS,
      docsHyperLinkEnUS,
    ),
  },
  theme: defaultTheme,
  presets: [
    UniverDocsCorePreset(),
    UniverDocsDrawingPreset(),
    UniverDocsHyperLinkPreset(),
  ],
})

univerAPI.createUniverDoc(DOCUMENT_DATA)
`

interface IDemoProps {
  lang: 'zh-CN' | 'en-US'
}

const localesMap = {
  'zh-CN': {
    name: 'ZH_CN',
    locale: LocaleType.ZH_CN,
    locales: merge(
      {},
      docsCoreZhCN,
      docsDrawingZhCN,
      docsHyperLinkZhCN,
    ),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge(
      {},
      docsCoreEnUS,
      docsDrawingEnUS,
      docsHyperLinkEnUS,
    ),
  },
}

export default function Demo(props: IDemoProps) {
  const { lang } = props

  const containerRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  const { locale, locales } = localesMap[lang]

  useEffect(() => {
    const { univerAPI } = createUniver({
      darkMode: theme === 'dark',
      locale,
      locales: {
        [locale]: locales,
      },
      theme: defaultTheme,
      presets: [
        UniverDocsCorePreset({
          container: containerRef.current,
        }),
        UniverDocsDrawingPreset(),
        UniverDocsHyperLinkPreset(),
      ],
    })

    univerAPI.createUniverDoc(DOCUMENT_DATA)

    return () => {
      univerAPI.dispose()
    }
  }, [])

  const codeWithHighlight = useCodeHighlight({
    code,
    lang,
  })

  return (
    <Preview ref={containerRef} code={codeWithHighlight} />
  )
}
