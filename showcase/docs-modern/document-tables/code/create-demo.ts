import type { IDocumentData } from '@univerjs/core'
import type { IDocImage } from '@univerjs/preset-docs-drawing'
import { InsertDocChartCommand, UniverDocsChartPlugin } from '@univerjs-pro/docs-chart'
import { UniverDocsChartUIPlugin } from '@univerjs-pro/docs-chart-ui'
import ChartEnUS from '@univerjs-pro/docs-chart-ui/locale/en-US'
import ChartZhCN from '@univerjs-pro/docs-chart-ui/locale/zh-CN'
import { UniverDocsColumnPlugin } from '@univerjs-pro/docs-column'
import { UniverDocsColumnUIPlugin } from '@univerjs-pro/docs-column-ui'
import ColumnEnUS from '@univerjs-pro/docs-column-ui/locale/en-US'
import ColumnZhCN from '@univerjs-pro/docs-column-ui/locale/zh-CN'
import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { UniverDocsTableUIPlugin } from '@univerjs-pro/docs-table-ui'
import TableEnUS from '@univerjs-pro/docs-table-ui/locale/en-US'
import TableZhCN from '@univerjs-pro/docs-table-ui/locale/zh-CN'
import { ChartTypeBits } from '@univerjs-pro/engine-chart'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import {
  BooleanNumber,
  DrawingTypeEnum,
  ImageSourceType,
  PositionedObjectLayoutType,
  WrapTextType,
} from '@univerjs/core'
import { buildDocTransform, docDrawingPositionToTransform } from '@univerjs/docs'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import DocsZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { InsertDocDrawingCommand, UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import DrawingZhCN from '@univerjs/preset-docs-drawing/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { COLLECTION, COMPARISON, createData, PACKAGING_SVG, PRIMARY_ID, SAMPLES } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs-pro/docs-table-ui/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import '@univerjs-pro/docs-chart-ui/lib/index.css'
import '@univerjs-pro/docs-column-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-table/facade'
import '@univerjs-pro/docs-chart/facade'
import '@univerjs-pro/docs-column/facade'

function requireSuccess(result: unknown, message: string) {
  if (!result) throw new Error(message)
}
export function createDemo(container: HTMLElement, darkMode = false, saved?: IDocumentData) {
  if (saved && (!saved.id || !saved.body?.dataStream?.endsWith('\r\n')))
    throw new Error('A complete document with its original ID and paragraph terminators is required.')
  const root = document.createElement('div')
  root.className = 'table-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, TableEnUS, DrawingEnUS, ChartEnUS, ColumnEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DocsZhCN, TableZhCN, DrawingZhCN, ChartZhCN, ColumnZhCN),
    },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: root, header: true, toolbar: true, footer: true }),
      UniverDocsDrawingPreset(),
    ],
    plugins: [
      UniverLicensePlugin,
      UniverDocsTablePlugin,
      UniverDocsTableUIPlugin,
      UniverDocsColumnPlugin,
      UniverDocsColumnUIPlugin,
      UniverDocsChartPlugin,
      UniverDocsChartUIPlugin,
    ],
  })
  const owner = window as typeof window & { univerAPI?: typeof api }
  owner.univerAPI = api
  let disposed = false
  let resolveRendered: (() => void) | undefined
  const rendered = new Promise<void>((resolve) => {
    resolveRendered = resolve
  })
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === api.Enum.LifecycleStages.Rendered) resolveRendered?.()
  })
  const doc = api.createDocument(structuredClone(saved ?? createData()))
  function paragraph(marker: string) {
    const matches = doc.getParagraphs().filter((p) => p.getText().includes(marker))
    if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
    return matches[0]
  }
  function initialize() {
    for (const [index, item] of SAMPLES.entries()) {
      const table = doc.insertTableFromData(
        item.rows.map((cells) => Array.from(cells)),
        {
          tableId: index === 0 ? PRIMARY_ID : 'cedar-' + item.id,
          offset: paragraph(SAMPLES[index + 1]?.label ?? '03 · Packaging comparison').getRange().startOffset,
          columnWidths: [220, 140, 120, 220],
          width: 700,
          headerRowCount: 1,
        },
      )
      requireSuccess(table, 'Could not insert ' + item.label)
      requireSuccess(
        table!.setCellBackground(table!.getRowRange(0), ['#DBEAFE', '#FEF3C7', '#FCE4DF'][index]),
        'Could not style ' + item.label,
      )
    }
    const comparison = doc.insertTableFromData(
      COMPARISON.map((cells) => Array.from(cells)),
      {
        tableId: 'cedar-comparison',
        offset: paragraph('04 · Review notes').getRange().startOffset,
        columnWidths: [350, 350],
        width: 700,
        headerRowCount: 1,
      },
    )
    requireSuccess(comparison, 'Could not insert comparison')
    requireSuccess(comparison!.setCellBackground(comparison!.getRowRange(0), '#D1FAE5'), 'Could not style comparison')
    const docTransform = buildDocTransform(640, 200)
    const illustration: IDocImage = {
      unitId: doc.getId(),
      subUnitId: doc.getId(),
      drawingId: 'cedar-packaging-image',
      drawingType: DrawingTypeEnum.DRAWING_IMAGE,
      imageSourceType: ImageSourceType.BASE64,
      source: 'data:image/svg+xml;base64,' + btoa(PACKAGING_SVG),
      docTransform,
      transform: docDrawingPositionToTransform(docTransform),
      behindDoc: BooleanNumber.FALSE,
      title: 'Cedar packaging study',
      description: 'Six-compartment seed tray beside a labeled reusable envelope. Original CC0 illustration.',
      layoutType: PositionedObjectLayoutType.INLINE,
      wrapText: WrapTextType.BOTH_SIDES,
      distB: 0,
      distL: 0,
      distR: 0,
      distT: 0,
    }
    const after = (marker: string) => paragraph(marker).getRange().endOffset + 1
    const imageOffset = after('Packaging illustration')
    requireSuccess(
      api.syncExecuteCommand(InsertDocDrawingCommand.id, {
        unitId: doc.getId(),
        drawings: [illustration],
        textRange: { startOffset: imageOffset, endOffset: imageOffset, collapsed: true },
      }),
      'Could not insert packaging illustration',
    )
    for (const [index, item] of SAMPLES.entries()) {
      const suffix = index === 0 ? '' : '-' + item.id
      const offset = after(['Collection readiness', 'Inventory packet counts', 'Weekend reservations'][index])
      requireSuccess(
        api.syncExecuteCommand(InsertDocChartCommand.id, {
          unitId: doc.getId(),
          chart: { id: 'cedar-collection-chart' + suffix, chartType: ChartTypeBits.Column },
          dataSource: {
            id: 'cedar-collection-data' + suffix,
            values: COLLECTION[item.id].map((cells) => Array.from<string | number>(cells)),
          },
          drawing: { drawingId: 'cedar-collection-drawing' + suffix, layoutType: PositionedObjectLayoutType.INLINE },
          textRange: { startOffset: offset, endOffset: offset, collapsed: true },
          width: 640,
          height: 280,
          focus: false,
        }),
        'Could not insert ' + item.label + ' chart',
      )
    }
  }
  if (api.getCurrentLifecycleStage() >= api.Enum.LifecycleStages.Rendered) resolveRendered?.()
  void rendered.then(() => {
    if (disposed) return
    try {
      if (!saved) initialize()
      root.dataset.ready = 'true'
    } catch (cause) {
      root.dataset.ready = 'error'
      const alert = document.createElement('p')
      alert.role = 'alert'
      alert.textContent =
        (locale === LocaleType.ZH_CN ? '文档启动失败：' : 'Document startup failed: ') +
        (cause instanceof Error ? cause.message : String(cause))
      root.append(alert)
      console.error(cause)
    }
  })
  return {
    univerAPI: api,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
