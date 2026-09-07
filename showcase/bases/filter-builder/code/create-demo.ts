import type { IBaseSnapshot } from '@univerjs/core'
import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesUIZhCN from '@univerjs-pro/bases-ui/locale/zh-CN'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import BasesZhCN from '@univerjs-pro/bases/locale/zh-CN'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import DesignZhCN from '@univerjs/design/locale/zh-CN'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import UIZhCN from '@univerjs/ui/locale/zh-CN'

import { DATA } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs/ui/facade'
import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved: IBaseSnapshot = DATA,
) {
  if (saved?.id !== 'filter-builder-base' || !saved.tables?.records?.views?.working)
    throw new Error('Restore the partner Base, records table and working view.')
  const root = document.createElement('div')
  root.className = 'base-filter'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, BasesEnUS, BasesUIEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DesignZhCN, UIZhCN, DocsUIZhCN, BasesZhCN, BasesUIZhCN),
    },
  })
  const demoWindow = window as Window & { univerAPI?: FUniver }
  let api: FUniver | undefined
  let disposed = false
  const cleanup: Array<() => void> = []
  function dispose() {
    if (disposed) return
    disposed = true
    const errors: unknown[] = []
    // Unmount this owned workbench before its scoped locale and model services.
    for (const release of [
      ...cleanup.toReversed(),
      () => unmount(root),
      () => api?.disposeUnit(saved.id),
      () => univer.dispose(),
    ]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (demoWindow.univerAPI === api) delete demoWindow.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Partner filter cleanup failed')
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
    const owner = api
    demoWindow.univerAPI = owner
    let finish!: () => void
    const rendered = new Promise<void>((resolve) => {
      finish = resolve
    })
    const lifecycle = owner.addEvent(owner.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === owner.Enum.LifecycleStages.Rendered) finish()
    })
    cleanup.push(() => {
      finish()
      lifecycle.dispose()
    })
    const base = owner.createBase(structuredClone(saved))
    const ready = rendered
      .then(async () => {
        if (disposed) return
        await owner.getBaseUI().activateTable('records')
        if (disposed) return
        await owner.getBaseUI().activateView('working')
        if (disposed) return
        univer.__getInjector().get(IUniverInstanceService).focusUnit(base.getId())
        owner.getBaseUI().closeLeftSidebar()
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (!disposed) root.dataset.ready = 'true'
      })
      .catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The partner pipeline could not load. Reload to retry; details are in the console.'
        root.prepend(alert)
        console.error(error)
      })
    return { univerAPI: owner, ready, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
