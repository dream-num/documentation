import type { IDisposable, IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { customRegisterEvent } from './custom-register-event'
import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, saved?: IWorkbookData) {
  if (
    saved !== undefined &&
    (saved?.id !== 'aster-lab' ||
      !Array.isArray(saved.sheetOrder) ||
      saved.sheetOrder.length !== 2 ||
      !['samples', 'archive'].every((id) => saved.sheetOrder.includes(id)) ||
      saved.sheetOrder.some((id) => {
        const sheet = saved.sheets?.[id]
        return (
          !sheet ||
          sheet.id !== id ||
          !sheet.cellData ||
          typeof sheet.cellData !== 'object' ||
          Array.isArray(sheet.cellData) ||
          ![sheet.rowCount, sheet.columnCount].every(
            (value) => typeof value === 'number' && Number.isInteger(value) && value > 0,
          )
        )
      }))
  )
    throw new Error('Restore an Aster snapshot with both original sheet IDs and positive dimensions')
  const root = document.createElement('div')
  root.className = 'custom-event-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<div class="event-controls"><button data-action="listener" disabled></button><span>C–E deletion guard · event policy, not security</span></div><ol aria-label="Recent events" aria-live="polite" class="event-log"></ol><div class="event-editor"></div>`
  container.append(root)
  const toggle = root.querySelector<HTMLButtonElement>('[data-action="listener"]')!
  const log = root.querySelector<HTMLOListElement>('.event-log')!
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root.querySelector<HTMLElement>('.event-editor')! }),
    ],
  })
  // Custom event sources must be registered before workbook render creation.
  const registrations = customRegisterEvent(univer, univerAPI)
  let disposed = false
  let guard: IDisposable | undefined
  const record = (message: string) => {
    if (disposed) return
    const item = document.createElement('li')
    item.textContent = message
    log.append(item)
    while (log.children.length > 12) log.firstElementChild!.remove()
    log.scrollTop = log.scrollHeight
  }
  const arm = () => {
    guard = univerAPI.addEvent('BeforeRemoveColumnEvent', (params) => {
      if (params.startColumn <= 4 && params.endColumn >= 2) {
        params.cancel = true
        record('Blocked: deletion overlaps C–E.')
      }
    })
    toggle.textContent = 'Remove guard listener'
  }
  const ready = () => {
    if (!disposed && univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) {
      root.dataset.ready = 'true'
      toggle.disabled = false
    }
  }
  const subscriptions = [
    univerAPI.addEvent('MainRightClickEvent', (params) => {
      if (params.row === undefined || params.column === undefined) return
      params.cancel = params.row === 0 && params.column === 0
      const address = `${univerAPI.Util.tools.chatAtABC(params.column)}${params.row + 1}`
      record(`${address}: ${params.cancel ? 'menu suppressed' : 'menu allowed'}`)
    }),
    univerAPI.addEvent('BeforeRemoveColumnEvent', (params) => {
      record(`Before: ${params.worksheet.getSheetName()} ${params.startColumn + 1}–${params.endColumn + 1}`)
    }),
    univerAPI.addEvent('RemoveColumnEvent', (params) => {
      record(`After: ${params.worksheet.getSheetName()} ${params.startColumn + 1}–${params.endColumn + 1}`)
    }),
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ready),
  ]
  arm()
  const events = new AbortController()
  toggle.addEventListener(
    'click',
    () => {
      if (disposed) return
      if (guard) {
        guard.dispose()
        guard = undefined
        toggle.textContent = 'Restore guard listener'
        record('Guard removed; before/after listeners remain.')
      } else {
        arm()
        record('Guard restored.')
      }
    },
    { signal: events.signal },
  )
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  univerAPI.createWorkbook(structuredClone(saved ?? WORKBOOK_DATA))
  ready()
  return {
    univerAPI,
    setDarkMode(dark: boolean) {
      if (disposed) return
      root.dataset.theme = dark ? 'dark' : 'light'
      univerAPI.toggleDarkMode(dark)
    },
    dispose() {
      if (disposed) return
      disposed = true
      events.abort()
      guard?.dispose()
      subscriptions.forEach((subscription) => subscription.dispose())
      registrations.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
