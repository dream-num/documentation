import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { DOCUMENT_DATA } from './data'

import './styles.css'
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'

import '@univerjs/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  container.dataset.ready = 'false'
  container.classList.add('slim-doc-demo')
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS),
    },
  })

  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverFormulaEnginePlugin)
  // This deliberately slim plugin set uses the compact single-row ribbon.
  univer.registerPlugin(UniverUIPlugin, { ribbonType: 'classic', container })
  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverDocsUIPlugin)
  const univerAPI = FUniver.newAPI(univer)
  const debugWindow = window as Window & { univerAPI?: typeof univerAPI }
  debugWindow.univerAPI = univerAPI
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) container.dataset.ready = 'true'
  })
  univer.createUnit(UniverInstanceType.UNIVER_DOC, structuredClone(DOCUMENT_DATA))

  return {
    univerAPI,
    dispose() {
      lifecycle.dispose()
      univer.dispose()
      if (debugWindow.univerAPI === univerAPI) delete debugWindow.univerAPI
      delete container.dataset.ready
      container.classList.remove('slim-doc-demo')
    },
  }
}
