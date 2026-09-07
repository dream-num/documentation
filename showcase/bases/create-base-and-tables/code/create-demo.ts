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

import { createData, PEOPLE } from './data'

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
  saved: IBaseSnapshot = createData(),
) {
  if (
    saved?.id !== 'lumen-base-lifecycle' ||
    !Array.isArray(saved.tableOrder) ||
    !saved.tableOrder.length ||
    saved.tableOrder.some((id) => !saved.tables?.[id])
  )
    throw new Error('Restore the original Lumen Base with at least one existing ordered table.')
  const root = document.createElement('div')
  root.className = 'base-lifecycle'
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
    if (errors.length) throw new AggregateError(errors, 'Lumen cleanup failed')
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
    let readyTimer: ReturnType<typeof setTimeout>
    const rendered = new Promise<void>((resolve, reject) => {
      finish = () => {
        clearTimeout(readyTimer)
        resolve()
      }
      readyTimer = setTimeout(() => reject(new Error('Base renderer did not become ready within 15 seconds.')), 15000)
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
        owner.getBaseUI().setPersonOptions(PEOPLE)
        const first = base.getTableById(saved.tableOrder[0])!
        await owner.getBaseUI().activateTable(first.getId())
        if (disposed) return
        const view = first.getViews()[0]
        if (view) await owner.getBaseUI().activateView(view.getId())
        if (disposed) return
        univer.__getInjector().get(IUniverInstanceService).focusUnit(base.getId())
        owner.getBaseUI().openLeftSidebar()
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        if (!disposed) root.dataset.ready = 'true'
      })
      .catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The theatre renewal could not load. Reload to retry; details are in the console.'
        root.prepend(alert)
        console.error(error)
      })
    return { univerAPI: owner, ready, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
