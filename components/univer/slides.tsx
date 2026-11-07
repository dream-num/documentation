'use client'

import ChartUIEnUS from '@univerjs-pro/chart-ui/locale/en-US'
import { replaceSmartArtTextContent } from '@univerjs-pro/engine-shape'
import ShapeEditorUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { UniverSlidesChartPlugin } from '@univerjs-pro/slides-chart'
import { UniverSlidesChartUIPlugin } from '@univerjs-pro/slides-chart-ui'
import SlidesChartUIEnUS from '@univerjs-pro/slides-chart-ui/locale/en-US'
import { UniverSlidesTablePlugin } from '@univerjs-pro/slides-table'
import { UniverSlidesTableUIPlugin } from '@univerjs-pro/slides-table-ui'
import SlidesTableUIEnUS from '@univerjs-pro/slides-table-ui/locale/en-US'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesUIEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import { BooleanNumber, mergeLocales, UniverInstanceType } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { useCallback } from 'react'
import type { IUniverCanvasProps } from './canvas'
import { UniverCanvas } from './canvas'
import { homeSlideData } from './slides-data'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/chart-ui/lib/index.css'
import '@univerjs-pro/slides-chart-ui/lib/index.css'
import '@univerjs-pro/slides-table-ui/lib/index.css'
import '@univerjs-pro/engine-shape/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs-pro/slides-chart/facade'
import '@univerjs-pro/slides-table/facade'

const locales = mergeLocales(ShapeEditorUIEnUS, SlidesUIEnUS, ChartUIEnUS, SlidesChartUIEnUS, SlidesTableUIEnUS)

export default function SlidesDemo() {
  const seedSlides = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const presentation = univerAPI.getActivePresentation()!
    const chartSlide = presentation.getSlideById('visuals')!
    chartSlide.setSpeakerNotes(
      'These are illustrative template counts, not product benchmarks. Select the chart and edit its embedded data to change the visualization.',
    )

    const tableSlide = presentation.getSlideById('comparison')!
    const table = tableSlide.insertTable(
      tableSlide
        .newTable()
        .setValues([
          ['UNIVER SLIDES · A toolkit for your story', '', ''],
          ['Element', 'Use it for', 'Try it here'],
          ['Rich text', 'Headlines, labels, speaker notes', 'Change a font or emphasis'],
          ['Shapes', 'Cards, callouts, visual hierarchy', 'Resize, rotate, recolor'],
          ['Charts', 'Compare values and show trends', 'Edit the source data'],
          ['Tables', 'Keep a comparison structured', 'Merge, style, insert rows'],
          ['SmartArt', 'Explain relationships and steps', 'Edit nodes and layouts'],
        ])
        .setAbsolutePosition(54, 146)
        .setSize(732, 266)
        .build(),
    )!
    table.mergeCells({ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 })
    table.setColumnWidth(0, 136)
    table.setColumnWidth(1, 298)
    table.setColumnWidth(2, 298)
    table.setCellTextStyle(table.getTableRange(), { fs: 12, ff: 'Arial' })
    table.setCellBackground(table.getRowsRange(0, 2), '#102A43')
    table.setCellTextColor(table.getRowsRange(0, 2), '#FFFFFF')
    table.setCellTextStyle(table.getRowsRange(0, 2), { bl: BooleanNumber.TRUE })
    for (const row of [2, 4, 6]) table.setCellBackground(table.getRowsRange(row), '#EAF5F2')

    const diagramSlide = presentation.getSlideById('sequence')!
    const diagram = diagramSlide.insertSmartArt('urn:microsoft.com/office/officeart/2005/8/layout/process1', {
      left: 68,
      top: 178,
      width: 704,
      height: 111,
    })!
    const data = diagram.getSmartArtData()!
    const nodeLabels = ['Create', 'Visualize', 'Present']
    Object.keys(data.nodes).forEach((nodeId, index) => {
      diagram.updateSmartArtNode(nodeId, {
        text: replaceSmartArtTextContent(data.nodes[nodeId].text, nodeLabels[index]),
      })
    })
    diagramSlide.setSpeakerNotes(
      'Use the SmartArt text pane to extend this outline. The layout follows the content tree; each node remains editable.',
    )
  }, [])

  const initialize = useCallback<IUniverCanvasProps['initialize']>(
    (univer) => {
      univer.registerPlugin(UniverSlidesPlugin)
      univer.registerPlugin(UniverSlidesUIPlugin)
      univer.registerPlugin(UniverSlidesChartPlugin)
      univer.registerPlugin(UniverSlidesChartUIPlugin)
      univer.registerPlugin(UniverSlidesTablePlugin)
      univer.registerPlugin(UniverSlidesTableUIPlugin)
      univer.createUnit(UniverInstanceType.UNIVER_SLIDE, homeSlideData)

      const univerAPI = FUniver.newAPI(univer)
      return { api: univerAPI, onRendered: () => seedSlides(univerAPI) }
    },
    [seedSlides],
  )

  return <UniverCanvas initialize={initialize} locales={locales} />
}
