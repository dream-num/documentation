import { IShortcutService, KeyCode, UniverSheetsCorePreset, whenSheetEditorFocused } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { CommandType, createUniver, ICommandService, LocaleType, type IWorkbookData } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

// Registration uses existing SDK services, not an invented Facade registration API.
export function installClearShortcut(
  univer: ReturnType<typeof createUniver>['univer'],
  univerAPI: ReturnType<typeof createUniver>['univerAPI'],
  report: (message: string) => void = () => {},
  _legacyChinese = false,
) {
  const injector = univer.__getInjector()
  const id = 'sheet.command.swift-clear-selection'
  const command = injector.get(ICommandService).registerCommand({
    id,
    type: CommandType.COMMAND,
    handler: () => {
      const sheet = univerAPI.getActiveWorkbook()?.getActiveSheet()
      const selected = sheet?.getActiveRange()
      if (!sheet || !selected) return false
      const target =
        selected.getRow() === 2 &&
        selected.getLastRow() === 2 &&
        selected.getColumn() === 2 &&
        selected.getLastColumn() === 2
          ? sheet.getRange(2, 0, 1, sheet.getMaxColumns())
          : selected
      const hasContent = () =>
        target
          .getRawValues()
          .flat()
          .some((v) => v !== null && v !== undefined && v !== '') || target.getFormulas().flat().some(Boolean)
      if (!hasContent()) {
        report('Selection already empty.')
        return true
      }
      try {
        target.clearContent()
        if (hasContent()) throw new Error('SDK did not clear all selected contents.')
        report('Contents cleared; formatting retained.')
        return true
      } catch (error) {
        report('Clear failed: ' + (error instanceof Error ? error.message : String(error)))
        return false
      }
    },
  })
  const shortcut = injector.get(IShortcutService).registerShortcut({
    id,
    priority: 9999,
    preconditions: whenSheetEditorFocused,
    binding: KeyCode.DELETE,
    mac: KeyCode.BACKSPACE,
  })
  let disposed = false
  return {
    dispose() {
      if (disposed) return
      disposed = true
      shortcut.dispose()
      command.dispose()
    },
  }
}

export function createDemo(container: HTMLElement, darkMode = false, saved: Partial<IWorkbookData> = WORKBOOK_DATA) {
  if (
    !saved.id ||
    !saved.sheets ||
    !saved.sheetOrder?.length ||
    new Set(saved.sheetOrder).size !== saved.sheetOrder.length ||
    saved.sheetOrder.some((id) => saved.sheets?.[id]?.id !== id)
  )
    throw new Error('A saved workbook with its original ID and matching sheets is required.')
  const root = document.createElement('div')
  root.className = 'custom-shortcuts-demo'
  root.dataset.ready = 'false'
  root.innerHTML =
    '<div class="shortcut-context"><span>Delete (macOS: Backspace): C3 alone clears its row; other selections clear only selected contents.</span><label>Host input <input aria-label="Host input" value="Keep this text" /></label><span role="status" aria-live="polite"></span></div><div class="shortcuts-editor"></div>'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root.querySelector<HTMLElement>('.shortcuts-editor')! }),
    ],
  })
  const registration = installClearShortcut(univer, univerAPI, (message) => {
    root.querySelector('[role="status"]')!.textContent = message
  })
  let disposed = false
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage === univerAPI.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  })
  const controller = {
    univer,
    univerAPI,
    container,
    createDemo,
    registration,
    installClearShortcut,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      registration.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      if (owner.swiftDemo === controller) delete owner.swiftDemo
      univer.dispose()
      root.remove()
    },
  }
  const owner = window as typeof window & { univerAPI?: typeof univerAPI; swiftDemo?: typeof controller }
  owner.univerAPI = univerAPI
  owner.swiftDemo = controller
  try {
    univerAPI.createWorkbook(structuredClone(saved))
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  } catch (error) {
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent = 'Workbook startup failed: ' + String(error)
    root.append(alert)
    console.error(error)
  }
  return controller
}
