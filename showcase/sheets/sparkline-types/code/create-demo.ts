import { SparklineTypeEnum, UniverSheetSparklinePlugin } from '@univerjs-pro/sheets-sparkline'
import { UniverSheetSparklineUIPlugin } from '@univerjs-pro/sheets-sparkline-ui'
import sparklineEnUS from '@univerjs-pro/sheets-sparkline-ui/locale/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs-pro/sheets-sparkline-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/sheets-sparkline/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'sparkline-gallery'
  container.append(root)
  let instance: ReturnType<typeof createUniver>
  try {
    instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, sparklineEnUS) },
      presets: [UniverSheetsCorePreset({ container: root, ribbonType: 'grid' })],
      plugins: [UniverSheetSparklinePlugin, UniverSheetSparklineUIPlugin],
    })
  } catch (error) {
    root.remove()
    throw error
  }
  const { univer, univerAPI } = instance
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  let disposed = false
  let initialized = false
  let lifecycle: { dispose(): void } | undefined
  const dispose = () => {
    if (disposed) {
      root.remove()
      return
    }
    disposed = true
    const errors: unknown[] = []
    try {
      lifecycle?.dispose()
    } catch (error) {
      errors.push(error)
    }
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } catch (error) {
      errors.push(error)
    }
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Sparkline demo cleanup failed')
  }
  const cleanupFailure = (error: unknown) => {
    try {
      dispose()
    } catch (cleanupError) {
      return new AggregateError([error, cleanupError], 'Sparkline initialization and cleanup failed', { cause: error })
    }
    return error
  }
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Steady) return
    initialized = true
    try {
      const workbook = univerAPI.getWorkbook('workshop-sparklines')!
      for (const [id, type, color] of [
        ['line', SparklineTypeEnum.LINE_CHART, '#0891B2'],
        ['column', SparklineTypeEnum.BAR_CHART, '#7C3AED'],
        ['winloss', SparklineTypeEnum.PROFIT_AND_LOSS_CHART, '#059669'],
      ] as const) {
        const sheet = workbook.getSheetBySheetId(id)!
        workbook.setActiveSheet(id)
        for (let row = 5; row <= 10; row++) {
          const sparkline = sheet.addSparkline(
            [sheet.getRange(`B${row}:G${row}`).getRange()],
            [sheet.getRange(`H${row}`).getRange()],
            SparklineTypeEnum.LINE_CHART,
          )
          if (!sparkline) throw new Error(`Could not create sparkline ${id}:H${row}`)
          sheet.getRange(`H${row}`).activate()
          sheet.getSparklineGroupByCell(row - 1, 7)!.setConfig({
            type,
            seriesColor: color,
            lineWidth: 2,
            axis: { visible: id === 'winloss', color: '#64748B' },
            points: {
              negativePoint: { visible: true, color: '#DB2777' },
              highPoint: { visible: id === 'line', color: '#D97706' },
            },
          })
        }
      }
      workbook.setActiveSheet('line')
      workbook.getActiveSheet()!.getRange('B5').activate()
      root.dataset.ready = 'true'
    } catch (error) {
      console.error(cleanupFailure(error))
      root.setAttribute('role', 'alert')
      root.textContent = 'The native sparkline demo could not initialize. See the console for the original error.'
      container.append(root)
    }
  }
  try {
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize)
    univerAPI.createWorkbook(createWorkbookData())
    owner.univerAPI = univerAPI
    initialize()
    return { univerAPI, dispose }
  } catch (error) {
    throw cleanupFailure(error)
  }
}
