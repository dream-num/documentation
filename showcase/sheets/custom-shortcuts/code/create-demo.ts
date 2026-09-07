import { IShortcutService, KeyCode, UniverSheetsCorePreset, whenSheetEditorFocused } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { CommandType, createUniver, ICommandService, LocaleType, type IWorkbookData } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

// Registration uses existing SDK services, not an invented Facade registration API.
export function installClearShortcut(
  univer: ReturnType<typeof createUniver>['univer'],
  univerAPI: ReturnType<typeof createUniver>['univerAPI'],
  report: (message: string) => void = () => {},
  zh = false,
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
        report(zh ? '所选区域已为空。' : 'Selection already empty.')
        return true
      }
      try {
        target.clearContent()
        if (hasContent()) throw new Error(zh ? 'SDK 未清除全部所选内容。' : 'SDK did not clear all selected contents.')
        report(zh ? '已清除内容，保留格式。' : 'Contents cleared; formatting retained.')
        return true
      } catch (error) {
        report((zh ? '清除失败：' : 'Clear failed: ') + (error instanceof Error ? error.message : String(error)))
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
  const zh = document.documentElement.lang === 'zh-CN'
  const root = document.createElement('div')
  root.className = 'custom-shortcuts-demo'
  root.dataset.ready = 'false'
  root.innerHTML =
    '<div class="shortcut-context"><span>' +
    (zh
      ? 'Delete（macOS：Backspace）：仅选 C3 清除整行；其他选择仅清除所选内容。'
      : 'Delete (macOS: Backspace): C3 alone clears its row; other selections clear only selected contents.') +
    '</span>' +
    '<label>' +
    (zh ? '宿主输入框' : 'Host input') +
    ' <input aria-label="' +
    (zh ? '宿主输入框' : 'Host input') +
    '" value="Keep this text" /></label><span role="status" aria-live="polite"></span></div><div class="shortcuts-editor"></div>'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: zh ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root.querySelector<HTMLElement>('.shortcuts-editor')! }),
    ],
  })
  const registration = installClearShortcut(
    univer,
    univerAPI,
    (message) => {
      root.querySelector('[role="status"]')!.textContent = message
    },
    zh,
  )
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
    alert.textContent = (zh ? '工作簿启动失败：' : 'Workbook startup failed: ') + String(error)
    root.append(alert)
    console.error(error)
  }
  return controller
}
