import type { IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
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
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved?: IWorkbookData,
) {
  if (saved !== undefined) validateHeaderSnapshot(saved)
  const t = (en: string, zh: string) => (locale === LocaleType.ZH_CN ? zh : en)
  const root = document.createElement('div')
  root.className = 'custom-header-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<fieldset disabled><label>${t('Appearance', '外观')} <select data-control="appearance" aria-label="${t('Header appearance', '行列头外观')}"><option value="labels">${t('Labels only', '仅标签')}</option><option value="styled" selected>${t('Styled labels', '带样式标签')}</option></select></label>
    <label>${t('Scope', '范围')} <select data-control="scope" aria-label="${t('Header scope', '行列头范围')}"><option value="sheet">${t('Active worksheet override', '当前表覆盖')}</option><option value="workbook">${t('Workbook default', '工作簿默认')}</option></select></label>
    <button data-action="apply">${t('Apply headers', '应用行列头')}</button><button data-action="clear-sheet">${t('Clear active override', '清除当前覆盖')}</button><button data-action="clear-all">${t('Clear all headers', '清除全部行列头')}</button><button data-action="size">${t('Compact active headers', '紧凑行列头')}</button></fieldset>
    <p role="status" aria-live="polite"></p><div class="header-editor"></div>`
  container.append(root)
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const appearance = root.querySelector<HTMLSelectElement>('[data-control="appearance"]')!
  const scope = root.querySelector<HTMLSelectElement>('[data-control="scope"]')!
  const sizeButton = root.querySelector<HTMLButtonElement>('[data-action="size"]')!
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN },
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
    const error = new Error(t('Native header startup timed out', '原生行列头启动超时'))
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
    sizeButton.textContent =
      snapshot.rowHeader!.width > 46
        ? t('Compact active headers', '紧凑行列头')
        : t('Roomy active headers', '宽松行列头')
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
      status.textContent = `${t('Header setup failed', '行列头初始化失败')}: ${String(error)}`
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
                scope.value === 'workbook'
                  ? t('Workbook default applied.', '已应用工作簿默认配置。')
                  : t('Worksheet override applied.', '已应用工作表覆盖。')
              break
            case 'clear-sheet':
              sheet.customizeColumnHeader({})
              sheet.customizeRowHeader({})
              status.textContent = t('Worksheet override cleared.', '已清除工作表覆盖。')
              break
            case 'clear-all':
              clearHeaders()
              status.textContent = t('Native labels restored.', '已恢复原生标签。')
              break
            case 'size': {
              const compact = workbook.save().sheets[sheet.getSheetId()].rowHeader!.width > 46
              sheet.setRowHeaderWidth(compact ? 46 : 88)
              sheet.setColumnHeaderHeight(compact ? 24 : 36)
              status.textContent = t('Header dimensions changed.', '已调整行列头尺寸。')
              break
            }
          }
        } catch (error) {
          status.textContent = `${t('Action failed', '操作失败')}: ${error instanceof Error ? error.message : String(error)}`
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
      status.textContent = t(
        'Cells restored. Reapply header configuration explicitly.',
        '已恢复单元格，请显式重新应用行列头配置。',
      )
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
