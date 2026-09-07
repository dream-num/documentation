/* eslint-disable no-await-in-loop -- Cell image layout follows the active cell and is seeded sequentially. */
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import coreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import drawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import drawingZhCN from '@univerjs/preset-sheets-drawing/locales/zh-CN'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { ASSETS, WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'sheet-images-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, drawingEnUS),
      [LocaleType.ZH_CN]: mergeLocales(coreZhCN, drawingZhCN),
    },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: root }), UniverSheetsDrawingPreset()],
  })
  const ownerWindow = window as Window & { univerAPI?: typeof univerAPI }
  ownerWindow.univerAPI = univerAPI
  let disposed = false
  let finish!: () => void
  const steady = new Promise<void>((resolve) => {
    finish = resolve
  })
  const subscription = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage >= LifecycleStages.Steady) finish()
  })
  const workbook = univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  if (univerAPI.getCurrentLifecycleStage() >= LifecycleStages.Steady) finish()
  const ready = steady
    .then(async () => {
      if (disposed) return
      const sheet = workbook.getSheetBySheetId('inventory')!
      for (const [index, asset] of ASSETS.entries()) {
        if (disposed) return
        const cell = sheet.getRange(index + 3, 0, 1, 1)
        cell.activate()
        if (!(await cell.insertCellImageAsync(asset.source))) throw new Error('Cell image initialization rejected')
      }
      for (const [index, [column, row, width, height]] of [
        [4, 3, 240, 120],
        [5, 4, 110, 110],
        [8, 3, 96, 160],
      ].entries()) {
        if (disposed) return
        const image = await sheet
          .newOverGridImage()
          .setSource(ASSETS[index].source, univerAPI.Enum.ImageSourceType.BASE64)
          .setColumn(column)
          .setRow(row)
          .setColumnOffset(12)
          .setRowOffset(12)
          .setWidth(width)
          .setHeight(height)
          .setAnchorType(univerAPI.Enum.SheetDrawingAnchorType.Position)
          .buildAsync()
        if (disposed) return
        image.drawingId = 'cedar-' + ASSETS[index].id
        sheet.insertImages([image])
        if (!sheet.getImageById(image.drawingId)) throw new Error('Floating image initialization rejected')
      }
      sheet.getRange('A1').activate()
      sheet.scrollToCell(0, 0)
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      if (disposed) return
      root.dataset.ready = 'true'
    })
    .catch((error) => {
      if (disposed) return
      root.dataset.error = String(error)
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent =
        document.documentElement.lang === 'zh-CN'
          ? '图片清单加载失败，请重新加载；详细信息见控制台。'
          : 'The image inventory could not load. Reload to retry; details are in the console.'
      root.prepend(alert)
      console.error(error)
    })
  return {
    univerAPI,
    ready,
    async dispose() {
      if (disposed) return
      disposed = true
      finish()
      subscription.dispose()
      // Image decoders/commands cannot be cancelled midway; keep their owner until pending work settles.
      await ready
      univer.dispose()
      if (ownerWindow.univerAPI === univerAPI) delete ownerWindow.univerAPI
      root.remove()
    },
  }
}
