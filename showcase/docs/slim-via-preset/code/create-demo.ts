import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { DOCUMENT_DATA } from './data'

import '@univerjs/preset-docs-core/lib/index.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(docsCoreEnUS),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container })],
  })

  univerAPI.createDocument(structuredClone(DOCUMENT_DATA))
  return { dispose: () => univer.dispose() }
}
