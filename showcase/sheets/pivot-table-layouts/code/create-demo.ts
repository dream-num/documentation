import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverSheetsPivotTablePlugin } from '@univerjs-pro/sheets-pivot'
import { UniverSheetsPivotTableUIPlugin } from '@univerjs-pro/sheets-pivot-ui'
import PivotUIEnUS from '@univerjs-pro/sheets-pivot-ui/locale/en-US'
import PivotEnUS from '@univerjs-pro/sheets-pivot/locale/en-US'
import { mergeLocales } from '@univerjs/core'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs-pro/sheets-pivot-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/sheets-pivot/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'pivot-table-layouts'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, PivotEnUS, PivotUIEnUS) },
      presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' })],
      plugins: [UniverLicensePlugin, UniverSheetsPivotTablePlugin, UniverSheetsPivotTableUIPlugin],
    })
  } catch (error) {
    root.remove()
    throw error
  }
  const { univer, univerAPI } = instance
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  let disposed = false
  let lifecycle: { dispose(): void } | undefined
  let finish: (() => void) | undefined
  function dispose() {
    if (disposed) return
    disposed = true
    finish?.()
    lifecycle?.dispose()
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    const rendered = new Promise<void>((resolve) => {
      finish = resolve
    })
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage >= univerAPI.Enum.LifecycleStages.Rendered) finish?.()
    })
    const workbook = univerAPI.createWorkbook(createWorkbookData())
    owner.univerAPI = univerAPI
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) finish?.()
    const ready = rendered
      .then(async () => {
        const area = univerAPI.Enum.PivotTableFiledAreaEnum
        const sourceInfo = {
          unitId: workbook.getId(),
          subUnitId: 'source',
          sheetName: 'Sales source',
          range: { startRow: 3, endRow: 11, startColumn: 0, endColumn: 3 },
        }
        if (disposed) return
        const pivot = await workbook.addPivotTable(sourceInfo, univerAPI.Enum.PositionTypeEnum.Existing, {
          unitId: workbook.getId(),
          subUnitId: 'sales',
          row: 3,
          col: 0,
        })
        if (disposed) return
        if (!pivot) throw new Error('Pivot table creation failed')
        for (const [field, target, position] of [
          [0, area.Row, 0],
          [1, area.Row, 1],
          [2, area.Column, 0],
          [3, area.Value, 0],
        ] as const) {
          // eslint-disable-next-line no-await-in-loop -- Each field command depends on the previous pivot configuration.
          if (!(await pivot.addField(field, target, position))) throw new Error('Pivot field configuration rejected')
          if (disposed) return
        }
        const valueId = pivot.getFieldIdsByArea(area.Value)[0]
        if (!(await pivot.setSubtotalType(valueId, univerAPI.Enum.PivotSubtotalTypeEnum.sum)))
          throw new Error('Pivot aggregation rejected')
        if (!(await pivot.setLayout(univerAPI.Enum.PivotLayoutTypeEnum.compact)))
          throw new Error('Pivot layout rejected')
        if (!(await pivot.setOptions({ showRowGrandTotal: true, showColGrandTotal: true })))
          throw new Error('Pivot totals rejected')
        if (disposed) return
        workbook.setActiveSheet(workbook.getSheetBySheetId('sales')!)
        workbook.getActiveSheet()!.setColumnWidths(0, 5, 160)
        workbook.getActiveSheet()!.getRange('A4').activate()
        root.dataset.ready = 'true'
      })
      .catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'The pivot demo could not initialize. Reload to retry.'
        root.prepend(alert)
        console.error(error)
      })
    return { univerAPI, ready, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Both initialization and cleanup errors are retained.
      throw new AggregateError([error, cleanupError], 'Pivot initialization and cleanup failed', { cause: error })
    }
    throw error
  }
}
