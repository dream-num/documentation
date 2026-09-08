import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { DOCS_BIG_DATA } from './data'

import './styles.css'
import '@univerjs/preset-docs-core/lib/index.css'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  container.dataset.ready = 'false'
  container.classList.add('big-doc-demo')
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(docsCoreEnUS) },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container })],
  })

  const debugWindow = window as Window & { univerAPI?: typeof univerAPI }
  debugWindow.univerAPI = univerAPI
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) container.dataset.ready = 'true'
  })
  // Retain the full large fixture, but enable native editing and layout updates.
  const snapshot = structuredClone(DOCS_BIG_DATA)
  snapshot.disabled = false
  // The legacy fixture predates the section identity required by current Docs.
  snapshot.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId ??= `large-document-section-${index + 1}`
  })
  univerAPI.createDocument(snapshot)

  return {
    univerAPI,
    dispose() {
      lifecycle.dispose()
      univer.dispose()
      if (debugWindow.univerAPI === univerAPI) delete debugWindow.univerAPI
      delete container.dataset.ready
      container.classList.remove('big-doc-demo')
    },
  }
}
