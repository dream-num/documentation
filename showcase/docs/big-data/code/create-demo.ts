import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { DOCS_BIG_DATA } from './data'

import './styles.css'
import '@univerjs/preset-docs-core/lib/index.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  container.dataset.ready = 'false'
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(docsCoreEnUS),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container })],
  })

  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) container.dataset.ready = 'true'
  })
  univerAPI.createDocument(structuredClone(DOCS_BIG_DATA))

  return {
    dispose() {
      lifecycle.dispose()
      univer.dispose()
      delete container.dataset.ready
    },
  }
}
