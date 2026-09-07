import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverWatermarkPlugin } from '@univerjs/watermark'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'

import '@univerjs/watermark/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: document.documentElement.lang.toLowerCase().startsWith('zh') ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(sheetsCoreEnUS),
      [LocaleType.ZH_CN]: mergeLocales(sheetsCoreZhCN),
    },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container })],
    plugins: [
      [
        UniverWatermarkPlugin,
        {
          textWatermarkSettings: {
            content: 'Hello, Univer!',
            fontSize: 16,
            color: 'rgb(0,0,0)',
            bold: false,
            italic: false,
            direction: 'ltr',
            x: 60,
            y: 36,
            repeat: true,
            spacingX: 200,
            spacingY: 100,
            rotate: 0,
            opacity: 0.15,
          },
        },
      ],
    ],
  })

  univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  let disposed = false
  return {
    univerAPI,
    setDarkMode(value: boolean) {
      if (!disposed) univerAPI.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      univer.dispose()
    },
  }
}
