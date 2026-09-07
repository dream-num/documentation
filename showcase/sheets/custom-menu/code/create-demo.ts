import type { IWorkbookData } from '@univerjs/core'
import { MessageType, UniverSheetsCorePreset, unmount } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'
import '@univerjs/ui/facade'

export function validateSnapshot(data: Partial<IWorkbookData>) {
  if (
    data.id !== 'harbor-orders' ||
    !data.sheetOrder?.includes('orders') ||
    !data.sheetOrder.every((id) => data.sheets?.[id]?.id === id)
  )
    throw new Error('Restore the complete Harbor workbook and every ordered worksheet.')
}

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved?: Partial<IWorkbookData>,
  ribbonType: 'grid' | 'classic' = 'grid',
  initialSelection = 'A4:E4',
) {
  const snapshot = structuredClone(saved ?? WORKBOOK_DATA)
  validateSnapshot(snapshot)
  const root = document.createElement('div')
  root.className = 'custom-menu-demo'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN },
    presets: [UniverSheetsCorePreset({ container: root, ribbonType })],
  })
  const workbook = univerAPI.createWorkbook(snapshot)
  const sheet = workbook.getSheetBySheetId('orders')!
  const zh = locale === LocaleType.ZH_CN
  const t = (en: string, cn: string) => (zh ? cn : en)
  let disposed = false
  const target = () => {
    if (disposed) throw new Error('The menu owner has been disposed.')
    if (
      univerAPI.getActiveWorkbook()?.getId() !== workbook.getId() ||
      workbook.getActiveSheet()?.getSheetId() !== sheet.getSheetId()
    )
      throw new Error(t('Return to the Orders sheet.', '请返回 Orders 工作表。'))
    if (!workbook.getWorkbookPermission().canEdit())
      throw new Error(t('This workbook is read-only.', '当前工作簿为只读。'))
    const ranges = sheet.getSelection()?.getActiveRangeList() ?? []
    const range = ranges[0]
    if (
      ranges.length !== 1 ||
      !range ||
      range.getRow() < 3 ||
      range.getLastRow() > 6 ||
      range.getColumn() < 0 ||
      range.getLastColumn() > 4
    )
      throw new Error(t('Select one contiguous range inside A4:E7.', '请选择 A4:E7 内的一个连续区域。'))
    return range
  }
  const run = (action: () => void) => {
    if (disposed) return
    try {
      action()
    } catch (error) {
      univerAPI.showMessage({
        type: MessageType.Error,
        content: error instanceof Error ? error.message : String(error),
        duration: 3500,
      })
    }
  }
  const highlight = univerAPI.createMenu({
    id: 'harbor.review-highlight',
    title: t('Review highlight', '复核标记'),
    tooltip: t('Toggle pale-yellow fill on selected order cells', '切换所选订单单元格的淡黄色填充'),
    action: () =>
      run(() => {
        const range = target()
        const color = range
          .getBackgrounds()
          .flat()
          .every((value) => value.toUpperCase() === '#FFF3BF')
          ? '#FFFFFF'
          : '#FFF3BF'
        range.setBackground(color)
        if (
          !range
            .getBackgrounds()
            .flat()
            .every((value) => value.toUpperCase() === color)
        )
          throw new Error(t('The SDK did not apply the requested fill.', 'SDK 未应用请求的填充。'))
      }),
  })
  const approval = univerAPI.createSubmenu({
    id: 'harbor.approval',
    title: t('Approval', '审批'),
    tooltip: t('Update column E for selected order rows', '更新所选订单行的 E 列'),
  })
  approval.appendTo(['contextMenu.mainArea', 'contextMenu.others'])
  // beta.2 ribbon submenus dispatch a leaf ID instead of the callback command.
  // Direct ribbon items and the real context submenu share the same FMenu.
  for (const value of ['Approved', 'Needs changes']) {
    const item = univerAPI.createMenu({
      id: 'harbor.approval.' + (value === 'Approved' ? 'approve' : 'changes'),
      title: value === 'Approved' ? t(value, '已批准') : t(value, '需要修改'),
      action: () =>
        run(() => {
          const selection = target()
          const range = sheet.getRange(selection.getRow(), 4, selection.getLastRow() - selection.getRow() + 1, 1)
          if (
            range
              .getRawValues()
              .flat()
              .every((current) => current === value)
          )
            return
          range.setValue(value)
          if (
            !range
              .getRawValues()
              .flat()
              .every((current) => current === value)
          )
            throw new Error(t('The SDK did not apply the requested approval state.', 'SDK 未应用请求的审批状态。'))
        }),
    })
    item.appendTo('ribbon.start.others')
    item.appendTo(['contextMenu.mainArea', 'contextMenu.others', 'harbor.approval'])
  }
  highlight.appendTo('ribbon.start.others')
  highlight.appendTo(['contextMenu.mainArea', 'contextMenu.others'])
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Rendered && !disposed) sheet.getRange(initialSelection).activate()
  })
  sheet.getRange(initialSelection).activate()
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      const errors: unknown[] = []
      for (const release of [
        () => unmount(root),
        () => univerAPI.disposeUnit(workbook.getId()),
        () => univer.dispose(),
      ]) {
        try {
          release()
        } catch (error) {
          errors.push(error)
        }
      }
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      root.remove()
      if (errors.length) throw new AggregateError(errors, 'Custom menu cleanup failed')
    },
  }
}
