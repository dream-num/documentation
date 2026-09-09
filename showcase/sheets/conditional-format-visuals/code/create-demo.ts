import {
  CFNumberOperator,
  CFValueType,
  IIconSetType,
  UniverSheetsConditionalFormattingPreset,
} from '@univerjs/preset-sheets-conditional-formatting'
import conditionalEnUS from '@univerjs/preset-sheets-conditional-formatting/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createWorkbookData } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-conditional-formatting/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'conditional-visuals-gallery'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, conditionalEnUS) },
    presets: [
      UniverSheetsCorePreset({ container: root, ribbonType: 'grid' }),
      UniverSheetsConditionalFormattingPreset(),
    ],
  })
  const workbook = univerAPI.createWorkbook(createWorkbookData())
  const scales = workbook.getSheetBySheetId('scales')!
  scales.addConditionalFormattingRule(
    scales
      .newConditionalFormattingRule()
      .setColorScale([
        { index: 0, color: '#FCE6BB', value: { type: CFValueType.num, value: 0 } },
        { index: 1, color: '#8CCABB', value: { type: CFValueType.num, value: 100 } },
      ])
      .setRanges([scales.getRange('B5:B10').getRange()])
      .build(),
  )
  scales.addConditionalFormattingRule(
    scales
      .newConditionalFormattingRule()
      .setColorScale([
        { index: 0, color: '#F4CED8', value: { type: CFValueType.num, value: 0 } },
        { index: 1, color: '#FFF3CE', value: { type: CFValueType.num, value: 50 } },
        { index: 2, color: '#A4DCC9', value: { type: CFValueType.num, value: 100 } },
      ])
      .setRanges([scales.getRange('C5:C10').getRange()])
      .build(),
  )
  const bars = workbook.getSheetBySheetId('bars')!
  const icons = workbook.getSheetBySheetId('icons')!
  for (const column of ['B', 'C']) {
    bars.addConditionalFormattingRule(
      bars
        .newConditionalFormattingRule()
        .setDataBar({
          min: { type: CFValueType.num, value: -100 },
          max: { type: CFValueType.num, value: 100 },
          positiveColor: '#277D80',
          nativeColor: '#BD546E',
          isGradient: column === 'C',
          isShowValue: true,
        })
        .setRanges([bars.getRange(`${column}5:${column}10`).getRange()])
        .build(),
    )
    icons.addConditionalFormattingRule(
      icons
        .newConditionalFormattingRule()
        .setIconSet({
          isShowValue: column === 'B',
          iconConfigs: [
            {
              iconType: IIconSetType.threeArrows,
              iconId: '0',
              operator: CFNumberOperator.greaterThanOrEqual,
              value: { type: CFValueType.num, value: 80 },
            },
            {
              iconType: IIconSetType.threeArrows,
              iconId: '1',
              operator: CFNumberOperator.greaterThanOrEqual,
              value: { type: CFValueType.num, value: 50 },
            },
            {
              iconType: IIconSetType.threeArrows,
              iconId: '2',
              operator: CFNumberOperator.lessThan,
              value: { type: CFValueType.num, value: 50 },
            },
          ],
        })
        .setRanges([icons.getRange(`${column}5:${column}10`).getRange()])
        .build(),
    )
  }
  workbook.getActiveSheet()!.getRange('B5').activate()
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      try {
        univer.dispose()
      } finally {
        root.remove()
      }
    },
  }
}
