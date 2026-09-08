import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import {
  SlideTableBorderDashEnum,
  SlideTableBorderPresetEnum,
  SlideTableVerticalAlignEnum,
  UniverSlidesTablePlugin,
} from '@univerjs-pro/slides-table'
import { UniverSlidesTableUIPlugin } from '@univerjs-pro/slides-table-ui'
import SlidesTableUIEnUS from '@univerjs-pro/slides-table-ui/locale/en-US'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesUIEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createData, TABLES } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/slides-table-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/slides/facade'
import '@univerjs-pro/slides-table/facade'
import '@univerjs/ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'slide-table-merge-borders'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        ShapeEditorUIEnUS,
        SlidesUIEnUS,
        SlidesTableUIEnUS,
      ),
    },
  })
  let api: FUniver | undefined
  let disposed = false
  const owner = window as typeof window & { univerAPI?: FUniver }
  const dispose = () => {
    if (disposed) return
    disposed = true
    if (owner.univerAPI === api) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesTablePlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)
    univer.registerPlugin(UniverSlidesTableUIPlugin)
    api = FUniver.newAPI(univer)
    const presentation = api.createPresentation(createData())
    for (const sample of TABLES) {
      const slide = presentation.getSlideByIndex(sample.page)
      if (!slide) throw new Error(`Missing slide for ${sample.name}`)
      const values = sample.values.map((row, r) =>
        row.map((value) =>
          api!.newRichText().span(value, { fontFamily: 'Arial', fontSize: 16, bold: r === 0, color: '#263D48' }),
        ),
      )
      const table = slide.insertTable(
        slide
          .newTable()
          .setName(sample.name)
          .setRichTextValues(values)
          .setAbsolutePosition(sample.left, sample.top)
          .setColumnWidth(sample.width / 3)
          .setRowHeight(sample.height / sample.values.length)
          .setSize(sample.width, sample.height)
          .setOptions({ firstRow: false, bandRow: false })
          .setCellStyles(
            sample.values.flatMap((row, r) =>
              row.map((_, c) => ({
                row: r,
                column: c,
                style: {
                  fill: { color: r === 0 ? '#E3EAE5' : '#FFFFFF' },
                  verticalAlign: SlideTableVerticalAlignEnum.Middle,
                  margins: { left: 8, right: 8, top: 6, bottom: 6 },
                },
              })),
            ),
          )
          .build(),
      )
      if (!table) throw new Error(`Could not create table: ${sample.name}`)
      table.setTableBorder({ dash: SlideTableBorderDashEnum.None }, SlideTableBorderPresetEnum.All)
      table.setTableBorder({ color: sample.color, width: sample.weight, dash: sample.dash }, sample.preset)
      if (sample.merge) {
        table.mergeCells(sample.merge)
        if (sample.split) table.unmergeCell(sample.merge.startRow, sample.merge.startColumn)
      }
    }
    owner.univerAPI = api
    root.dataset.ready = 'true'
    return { univerAPI: api, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Preserve both errors.
      throw new AggregateError([error, cleanupError], 'Native table demo initialization and cleanup failed', {
        cause: error,
      })
    }
    throw error
  }
}
