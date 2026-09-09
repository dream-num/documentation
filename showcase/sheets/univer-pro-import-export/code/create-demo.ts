import type { IWorkbookData } from '@univerjs/core'
import ExchangeClientEnUS from '@univerjs-pro/exchange-client/locale/en-US'
import SheetsExchangeClientEnUS from '@univerjs-pro/sheets-exchange-client/locale/en-US'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import EngineFormulaEnUS from '@univerjs/engine-formula/locale/en-US'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { WORKBOOK_DATA } from './data'
import { registerCorePlugins, registerExchangePlugins } from './function'

import './styles.css'
import '@univerjs/design/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/exchange-client/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'

import '@univerjs/sheets/facade'
import '@univerjs-pro/exchange-client/facade'
import '@univerjs-pro/sheets-exchange-client/facade'
import '@univerjs/ui/facade'

export function createImportExportDemo(
  container: HTMLElement,
  darkMode = false,
  _legacyLocale: LocaleType = LocaleType.EN_US,
  saved?: Partial<IWorkbookData>,
) {
  const data = structuredClone(saved ?? WORKBOOK_DATA)
  if (!data.id || !data.sheetOrder?.length || !data.sheetOrder.every((id) => data.sheets?.[id]?.id === id))
    throw new Error('Restore a workbook ID and every ordered worksheet.')
  const root = document.createElement('div')
  root.className = 'exchange-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        EngineFormulaEnUS,
        SheetsFormulaEnUS,
        DesignEnUS,
        ExchangeClientEnUS,
        SheetsExchangeClientEnUS,
        UIEnUS,
        DocsUIEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        SheetsFormulaUIEnUS,
        SheetsNumfmtUIEnUS,
      ),
    },
  })
  let api: ReturnType<typeof FUniver.newAPI> | undefined
  const owner = window as Window & { univerAPI?: typeof api }
  let disposed = false,
    frame = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  const cleanup: Array<() => void> = []
  function dispose() {
    if (disposed) return
    disposed = true
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    finish()
    const errors: unknown[] = []
    for (const release of [
      ...cleanup.toReversed(),
      () => unmount(root),
      () => api?.disposeUnit(data.id!),
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
    if (errors.length) throw new AggregateError(errors, 'Regional sales cleanup failed')
  }
  try {
    registerCorePlugins(univer, root)
    registerExchangePlugins(univer)
    api = FUniver.newAPI(univer)
    const univerAPI = api
    owner.univerAPI = univerAPI
    function waitForCanvas() {
      if (disposed) return
      const canvas = root.querySelector<HTMLCanvasElement>('canvas[id^="univer-sheet-main-canvas"]')
      if (!canvas?.width || !canvas.height || root.querySelector('[data-u-comp="workbench-skeleton-content"]')) {
        frame = requestAnimationFrame(waitForCanvas)
        return
      }
      clearTimeout(timer)
      root.dataset.ready = 'true'
      finish()
    }
    const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) frame = requestAnimationFrame(waitForCanvas)
    })
    cleanup.push(() => lifecycle.dispose())
    timer = setTimeout(() => {
      if (disposed) return
      cancelAnimationFrame(frame)
      root.dataset.error = 'startup'
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'The regional sales workbook could not load. Reload to retry.'
      root.prepend(alert)
      finish()
    }, 20000)
    univerAPI.createWorkbook(data)
    return { univerAPI, ready, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
