'use client'

import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { UniverUniscriptPlugin } from '@univerjs/uniscript'
import uniscriptEnUS from '@univerjs/uniscript/locale/en-US'
import uniscriptZhCN from '@univerjs/uniscript/locale/zh-CN'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'

const code = `
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import '@univerjs/presets/lib/styles/preset-sheets-core.css'

import { UniverUniscriptPlugin } from '@univerjs/uniscript'
import uniscriptEnUS from '@univerjs/uniscript/locale/en-US'
import '@univerjs/uniscript/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: {
    [LocaleType.EN_US]: merge(
      {},
      sheetsCoreEnUS,
      uniscriptEnUS,
    ),
  },
  theme: defaultTheme,
  presets: [
    UniverSheetsCorePreset(),
  ],
  plugins: [
    [UniverUniscriptPlugin, {
      getWorkerUrl(_: string, label: string) {
        if (label === 'json') {
          return '/vs/language/json/json.worker.js'
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return '/vs/language/css/css.worker.js'
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return '/vs/language/html/html.worker.js'
        }
        if (label === 'typescript' || label === 'javascript') {
          return '/vs/language/typescript/ts.worker.js'
        }
        return '/vs/editor/editor.worker.js'
      },
    }],
  ],
})

univerAPI.createWorkbook({})
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
      sheetsCoreZhCN,
      uniscriptZhCN,
    ),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge(
      {},
      sheetsCoreEnUS,
      uniscriptEnUS,
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
        UniverSheetsCorePreset({
          container: containerRef.current,
        }),
      ],
      plugins: [
        [UniverUniscriptPlugin, {
          getWorkerUrl(_: string, label: string) {
            if (label === 'json') {
              return '/vs/language/json/json.worker.js'
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
              return '/vs/language/css/css.worker.js'
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
              return '/vs/language/html/html.worker.js'
            }
            if (label === 'typescript' || label === 'javascript') {
              return '/vs/language/typescript/ts.worker.js'
            }
            return '/vs/editor/editor.worker.js'
          },
        }],
      ],
    })

    univerAPI.createWorkbook({})

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
