import type { IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function validateHeaderSnapshot(snapshot: IWorkbookData) {
  if (
    snapshot?.id !== 'lumen-equipment' ||
    !Array.isArray(snapshot.sheetOrder) ||
    snapshot.sheetOrder.length !== 2 ||
    !['bookings', 'returns'].every((id) => snapshot.sheetOrder.includes(id)) ||
    snapshot.sheetOrder.some((id) => {
      const sheet = snapshot.sheets?.[id]
      return (
        !sheet ||
        sheet.id !== id ||
        !sheet.cellData ||
        ![sheet.rowCount, sheet.columnCount, sheet.rowHeader?.width, sheet.columnHeader?.height].every(
          (value) => typeof value === 'number' && Number.isFinite(value) && value > 0,
        )
      )
    })
  )
    throw new Error(
      'Restore the complete lumen-equipment snapshot with both original sheet IDs and positive dimensions',
    )
}

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  _legacyLocale?: LocaleType,
  saved?: IWorkbookData,
) {
  if (saved !== undefined) validateHeaderSnapshot(saved)
  const root = document.createElement('div')
  root.className = 'custom-header-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<fieldset disabled><label>Appearance <select data-control="appearance" aria-label="Header appearance"><option value="labels">Labels only</option><option value="styled" selected>Styled labels</option></select></label>
    <label>Scope <select data-control="scope" aria-label="Header scope"><option value="sheet">Active worksheet override</option><option value="workbook">Workbook default</option></select></label>
    <button data-action="apply">Apply headers</button><button data-action="clear-sheet">Clear active override</button><button data-action="clear-all">Clear all headers</button><button data-action="size">Compact active headers</button></fieldset>
    <p role="status" aria-live="polite"></p><div class="header-editor"></div>`
  container.append(root)
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const appearance = root.querySelector<HTMLSelectElement>('[data-control="appearance"]')!
  const scope = root.querySelector<HTMLSelectElement>('[data-control="scope"]')!
  const sizeButton = root.querySelector<HTMLButtonElement>('[data-action="size"]')!
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root.querySelector<HTMLElement>('.header-editor')! }),
    ],
  })
  let workbook = univerAPI.createWorkbook(structuredClone(saved ?? WORKBOOK_DATA))
  let disposed = false
  let initialized = false
  let frame = 0
  let finish!: () => void
  let fail!: (error: unknown) => void
  const ready = new Promise<void>((resolve, reject) => {
    finish = resolve
    fail = reject
  })
  void ready.catch(() => {
    /* The native host status retains startup errors. */
  })
  const timeout = setTimeout(() => {
    if (disposed || initialized) return
    root.dataset.ready = 'error'
    const error = new Error('Native header startup timed out')
    status.textContent = error.message
    fail(error)
  }, 20000)
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  const refresh = () => {
    if (disposed) return
    const sheet = workbook.getActiveSheet()!
    for (const button of root.querySelectorAll<HTMLButtonElement>('[data-action]')) button.disabled = !initialized
    const snapshot = workbook.save().sheets[sheet.getSheetId()]
    sizeButton.textContent = snapshot.rowHeader!.width > 46 ? 'Compact active headers' : 'Roomy active headers'
    root.querySelector<HTMLFieldSetElement>('fieldset')!.disabled = !initialized
  }

  const schedule = () => {
    cancelAnimationFrame(frame)
    if (!disposed) frame = requestAnimationFrame(refresh)
  }
  const applyHeaders = (styled: boolean, allSheets: boolean) => {
    const target = allSheets ? workbook : workbook.getActiveSheet()!
    const columnConfig: Parameters<typeof workbook.customizeColumnHeader>[0] = {
      columnsCfg: { 0: 'Equipment', 1: 'Asset tag', 2: 'Checked out', 3: 'Due back', 4: 'Status', 5: 'Deposit' },
    }
    const rowConfig: Parameters<typeof workbook.customizeRowHeader>[0] = {
      rowsCfg: { 0: 'Slot 1', 1: 'Slot 2', 2: 'Slot 3', 3: 'Slot 4', 4: 'Slot 5' },
    }
    if (styled) {
      columnConfig.headerStyle = { backgroundColor: '#1e3a8a', fontColor: '#ffffff', fontSize: 13 }
      columnConfig.columnsCfg![5] = {
        text: 'Deposit',
        textAlign: 'right',
        fontColor: '#fde68a',
        backgroundColor: '#5b21b6',
      }
      rowConfig.headerStyle = { backgroundColor: '#e0f2fe', fontColor: '#0c4a6e', fontSize: 12 }
      rowConfig.rowsCfg![2] = { text: 'Slot 3', textAlign: 'left', fontColor: '#991b1b', backgroundColor: '#fee2e2' }
    }
    target.customizeColumnHeader(columnConfig)
    target.customizeRowHeader(rowConfig)
  }
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Rendered)
      return
    try {
      // Header rendering configuration can survive unit replacement in beta.2.
      // Reset both levels explicitly, separately from restoring the cell snapshot.
      clearHeaders()
      if (saved === undefined) applyHeaders(true, false)
      initialized = true
      root.dataset.ready = 'true'
      status.textContent = ''
      clearTimeout(timeout)
      finish()
    } catch (error) {
      clearTimeout(timeout)
      root.dataset.ready = 'error'
      status.textContent = `Header setup failed: ${String(error)}`
      fail(error)
    }
    refresh()
  }
  const clearHeaders = () => {
    workbook.customizeColumnHeader({})
    workbook.customizeRowHeader({})
    for (const item of workbook.getSheets()) {
      item.customizeColumnHeader({})
      item.customizeRowHeader({})
    }
  }
  const subscriptions = [
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize),
    univerAPI.addEvent(univerAPI.Event.SelectionChanged, schedule),
    univerAPI.addEvent(univerAPI.Event.SheetValueChanged, schedule),
    univerAPI.addEvent(univerAPI.Event.CommandExecuted, schedule),
  ]
  const events = new AbortController()
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-action]')) {
    button.addEventListener(
      'click',
      () => {
        if (disposed || !initialized) return
        try {
          const sheet = workbook.getActiveSheet()!
          switch (button.dataset.action) {
            case 'apply':
              applyHeaders(appearance.value === 'styled', scope.value === 'workbook')
              status.textContent =
                scope.value === 'workbook' ? 'Workbook default applied.' : 'Worksheet override applied.'
              break
            case 'clear-sheet':
              sheet.customizeColumnHeader({})
              sheet.customizeRowHeader({})
              status.textContent = 'Worksheet override cleared.'
              break
            case 'clear-all':
              clearHeaders()
              status.textContent = 'Native labels restored.'
              break
            case 'size': {
              const compact = workbook.save().sheets[sheet.getSheetId()].rowHeader!.width > 46
              sheet.setRowHeaderWidth(compact ? 46 : 88)
              sheet.setColumnHeaderHeight(compact ? 24 : 36)
              status.textContent = 'Header dimensions changed.'
              break
            }
          }
        } catch (error) {
          status.textContent = `Action failed: ${error instanceof Error ? error.message : String(error)}`
        }
        schedule()
      },
      { signal: events.signal },
    )
  }
  initialize()
  return {
    univerAPI,
    ready,
    restore(snapshot: IWorkbookData) {
      validateHeaderSnapshot(snapshot)
      if (disposed || !initialized) throw new Error('The native header owner is not ready')
      const copy = structuredClone(snapshot)
      clearHeaders()
      univerAPI.disposeUnit(workbook.getId())
      workbook = univerAPI.createWorkbook(copy)
      clearHeaders()
      status.textContent = 'Cells restored. Reapply header configuration explicitly.'
      schedule()
    },
    setDarkMode(dark: boolean) {
      if (disposed) return
      root.dataset.theme = dark ? 'dark' : 'light'
      univerAPI.toggleDarkMode(dark)
    },
    dispose() {
      if (disposed) return
      disposed = true
      clearTimeout(timeout)
      if (!initialized) fail(new DOMException('Header owner removed before ready', 'AbortError'))
      cancelAnimationFrame(frame)
      events.abort()
      subscriptions.forEach((handle) => handle.dispose())
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
