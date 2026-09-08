import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createData } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const locale = LocaleType.EN_US
  const root = document.createElement('div')
  root.className = 'base-kanban-cards'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, BasesEnUS, BasesUIEnUS),
    },
  })
  const owner = window as Window & { univerAPI?: FUniver }
  let api: FUniver | undefined
  let disposed = false
  let lifecycle: { dispose(): void } | undefined
  let finish: (() => void) | undefined
  function dispose() {
    if (disposed) return
    disposed = true
    finish?.()
    const errors: unknown[] = []
    for (const release of [
      () => lifecycle?.dispose(),
      () => unmount(root),
      () => api?.disposeUnit('repair-kanban'),
      () => univer.dispose(),
    ]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === api) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Kanban demo cleanup failed')
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    api = FUniver.newAPI(univer)
    const univerAPI = api
    owner.univerAPI = univerAPI
    const rendered = new Promise<void>((resolve) => {
      finish = resolve
    })
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) finish?.()
    })
    univerAPI.createBase(createData())
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) finish?.()
    const ready = rendered
      .then(async () => {
        if (disposed) return
        await univerAPI.getBaseUI().activateTable('jobs')
        if (disposed) return
        await univerAPI.getBaseUI().activateView('compact')
        if (disposed) return
        univerAPI.getBaseUI().openLeftSidebar()
        root.dataset.ready = 'true'
      })
      .catch((cause) => {
        if (disposed) return
        root.dataset.error = String(cause)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The Kanban demo could not load. Reload to retry.'
        root.prepend(alert)
        console.error(cause)
      })
    return { univerAPI, ready, dispose }
  } catch (cause) {
    try {
      dispose()
    } catch (cleanupError) {
      throw new AggregateError([cause, cleanupError], 'Kanban initialization and cleanup failed', {
        cause: cleanupError,
      })
    }
    throw cause
  }
}
