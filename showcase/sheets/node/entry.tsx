'use client'

import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsNodeCoreEnUS from '@univerjs/presets/preset-sheets-node-core/locales/en-US'
import sheetsNodeCoreZhCN from '@univerjs/presets/preset-sheets-node-core/locales/zh-CN'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useRef } from 'react'
import { WORKBOOK_DATA } from './data'

const code = `
const { createUniver, LocaleType, merge } = require('@univerjs/presets')
const { UniverSheetsNodeCorePreset } = require('@univerjs/presets/preset-sheets-node-core')
const sheetsNodeCoreZhCN = require('@univerjs/presets/preset-sheets-node-core/locales/zh-CN')

async function run() {
  const { univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: merge(
        {},
        sheetsNodeCoreZhCN,
      ),
    },
    presets: [
      UniverSheetsNodeCorePreset({}),
    ],
  })

  univerAPI.createWorkbook(WORKBOOK_DATA)

  const snapshot = univerAPI.getActiveWorkbook().save()

  console.log('snapshot:\n\n',snapshot)
}

run()
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
      sheetsNodeCoreZhCN,
    ),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge(
      {},
      sheetsNodeCoreEnUS,
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
      presets: [
        UniverSheetsCorePreset({}),
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)

    const snapshot = univerAPI.getActiveWorkbook()?.save()

    const pre = document.createElement('pre')
    pre.style.fontSize = '12px'
    pre.style.maxHeight = '100%'
    pre.style.overflow = 'auto'
    pre.textContent = JSON.stringify(snapshot, null, 2) ?? ''
    function stopPropagation(e: WheelEvent) {
      e.stopPropagation()
    }
    pre.addEventListener('wheel', stopPropagation)

    containerRef.current.appendChild(pre)

    return () => {
      pre.removeEventListener('wheel', stopPropagation)
      containerRef.current?.removeChild(pre)
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
