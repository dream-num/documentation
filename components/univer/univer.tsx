'use client'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import {
  BoardConnectorSite,
  createBoardConnectorElement,
  createBoardContainerElement,
  createBoardStickyElement,
  createBoardSwimlaneElement,
  createBoardTextBoxShapeElement,
  UniverBoardsPlugin,
} from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import ChartUIEnUS from '@univerjs-pro/chart-ui/locale/en-US'
import EmbedUnitUIEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import {
  replaceSmartArtTextContent,
  ShapeFillEnum,
  ShapeLineTypeEnum,
  ShapeTextWrapType,
  ShapeTypeEnum,
} from '@univerjs-pro/engine-shape'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverPdfsPlugin } from '@univerjs-pro/pdfs'
import { UniverPdfEditorPlugin } from '@univerjs-pro/pdfs-editor'
import { UniverPdfsUIPlugin } from '@univerjs-pro/pdfs-ui'
import PdfsUIEnUS from '@univerjs-pro/pdfs-ui/locale/en-US'
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
import {
  BooleanNumber,
  HorizontalAlign,
  LocaleType,
  mergeLocales,
  Univer,
  UniverInstanceType,
  VerticalAlign,
} from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import {
  BasesMultiIcon,
  BoardsMultiIcon,
  DocsMultiIcon,
  PdfMultiIcon,
  SheetsMultiIcon,
  SlidesMultiIcon,
} from '@univerjs/icons'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui'
import SheetsConditionalFormattingUIEnUS from '@univerjs/sheets-conditional-formatting-ui/locale/en-US'
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation'
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui'
import SheetsDataValidationUIEnUS from '@univerjs/sheets-data-validation-ui/locale/en-US'
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui'
import SheetsFilterUIEnUS from '@univerjs/sheets-filter-ui/locale/en-US'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui'
import SheetsSortUIEnUS from '@univerjs/sheets-sort-ui/locale/en-US'
import { UniverSheetsTableUIPlugin } from '@univerjs/sheets-table-ui'
import SheetsTableUIEnUS from '@univerjs/sheets-table-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

import Spinner from '@/components/animata/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'

import { modernDocumentData, traditionalDocumentData, workbookData } from './data'
import { homeSlideData } from './slides-data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-conditional-formatting-ui/lib/index.css'
import '@univerjs/sheets-data-validation-ui/lib/index.css'
import '@univerjs/sheets-filter-ui/lib/index.css'
import '@univerjs/sheets-sort-ui/lib/index.css'
import '@univerjs/sheets-table-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/chart-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/slides-chart-ui/lib/index.css'
import '@univerjs-pro/slides-table-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/pdfs-ui/lib/index.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/pdfs/facade'
import '@univerjs-pro/engine-shape/facade'
import '@univerjs-pro/slides/facade'
import '@univerjs-pro/slides-chart/facade'
import '@univerjs-pro/slides-table/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'
import '@univerjs/sheets/facade'
import '@univerjs/sheets-filter/facade'
import '@univerjs/sheets-table/facade'

type UniverType = 'sheets' | 'docs' | 'slides' | 'bases' | 'boards' | 'pdfs'
type DocumentMode = 'modern' | 'traditional'

export interface IUniverProps {
  tablistLabel: string
}

export default function UniverDemo({ tablistLabel }: IUniverProps) {
  const divRef = useRef<HTMLDivElement>(null!)

  const [type, setType] = useState<UniverType>('sheets')
  const [documentMode, setDocumentMode] = useState<DocumentMode>('modern')
  const [steady, setSteady] = useState(false)

  const { theme } = useTheme()

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

  const seedBase = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const now = Date.now()
    const today = new Date(now)
    const tourDate = (offset: number) =>
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + offset)
    const base = univerAPI.createBase({
      id: 'bases-home-demo',
      name: 'Univer Bases · Feature explorer',
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      tables: {},
      tableOrder: [],
    })
    const table = base.insertTable('Explore Bases', { primaryFieldName: 'Feature' })
    const status = table.addField('Your tour', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'explore', name: 'Explore', color: 'blue' },
            { id: 'trying', name: 'Trying it', color: 'yellow' },
            { id: 'done', name: 'Done', color: 'green' },
          ],
        },
        defaultValue: 'explore',
      },
    })
    const instruction = table.addField('Try this', univerAPI.Enum.BaseFieldType.Text)
    const category = table.addField('Category', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'fields', name: 'Typed fields', color: 'blue' },
            { id: 'views', name: 'Multiple views', color: 'purple' },
            { id: 'workspace', name: 'Your workspace', color: 'green' },
          ],
        },
      },
    })
    const progress = table.addField('Progress', univerAPI.Enum.BaseFieldType.Progress)
    const startDate = table.addField('Start', univerAPI.Enum.BaseFieldType.Date)
    const endDate = table.addField('Finish', univerAPI.Enum.BaseFieldType.Date)
    const tags = table.addField('Try with', univerAPI.Enum.BaseFieldType.MultiSelect, {
      field: {
        config: {
          options: [
            { id: 'edit', name: 'Edit a value', color: 'blue' },
            { id: 'drag', name: 'Drag & drop', color: 'orange' },
            { id: 'view', name: 'Switch views', color: 'purple' },
          ],
        },
      },
    })
    const minutes = table.addField('Minutes', univerAPI.Enum.BaseFieldType.Number, {
      field: { config: { pattern: '0', decimalPlaces: 0 } },
    })
    const rating = table.addField('Usefulness', univerAPI.Enum.BaseFieldType.Rating, {
      field: { config: { min: 1, max: 5 } },
    })
    const favorite = table.addField('Favorite', univerAPI.Enum.BaseFieldType.Checkbox)
    const reference = table.addField('Learn more', univerAPI.Enum.BaseFieldType.Link)
    const formulaName = table.getFormulaName()
    const remaining = table.addField('Minutes left', univerAPI.Enum.BaseFieldType.Formula, {
      field: {
        config: {
          formula: `=ROUND(${formulaName}[[#This Row],[Minutes]]*(1-${formulaName}[[#This Row],[Progress]]/100),0)`,
        },
      },
      externalReferences: [],
    })
    const records = [
      ['Single select', 'Choose a colored label in Your tour.', 'fields', 25],
      ['Progress fields', 'Edit this value to fill the progress bar.', 'fields', 65],
      ['Dates and text', 'Give this record a date and your own description.', 'fields', 40],
      ['Kanban view', 'Drag a card to another category.', 'views', 80],
      ['Calendar view', 'Open Tour calendar to see these dates.', 'views', 50],
      ['Timeline view', 'Open Tour timeline to compare date ranges.', 'views', 30],
      ['Gallery view', 'Open Feature gallery for a different card layout.', 'views', 70],
      ['Grid view', 'Open Feature grid and edit a cell.', 'workspace', 100],
      ['Multiple tables', 'Open Build your own to start another workflow.', 'workspace', 10],
      ['Multiple labels', 'Add or remove tags in Try with.', 'fields', 45],
      ['Ratings & checkboxes', 'Choose stars and save a favorite.', 'fields', 60],
      ['Computed fields', 'Change Minutes or Progress; Minutes left recalculates.', 'fields', 35],
      ['Saved filters', 'Open Still to explore: unfinished records, sorted by rating.', 'workspace', 20],
      ['Links', 'Edit the label and URL in Learn more.', 'fields', 90],
    ] as const
    table.addRecords(
      records.map(([feature, description, group, value], index) => ({
        values: {
          [table.getPrimaryFieldId()]: feature,
          [status.getId()]: index === 7 ? 'done' : 'explore',
          [instruction.getId()]: description,
          [category.getId()]: group,
          [progress.getId()]: value,
          [startDate.getId()]: tourDate(index - 6),
          [endDate.getId()]: tourDate(index - 2),
          [tags.getId()]: group === 'views' ? ['view', 'drag'] : ['edit'],
          [minutes.getId()]: 5 + (index % 4) * 5,
          [rating.getId()]: 3 + (index % 3),
          [favorite.getId()]: [0, 3, 11].includes(index),
          [reference.getId()]: { text: 'Univer documentation', url: 'https://docs.univer.ai' },
        },
      })),
    )
    const grid = table.getViewByName('Grid')
    grid?.setName('Feature grid')
    grid?.setFieldWidth(table.getPrimaryFieldId(), 180)
    grid?.setFieldWidth(instruction.getId(), 320)
    grid?.setFieldWidth(status.getId(), 120)
    grid?.setFieldWidth(category.getId(), 150)
    grid?.setFieldWidth(progress.getId(), 120)
    grid?.setFieldWidth(startDate.getId(), 110)
    grid?.setFieldWidth(endDate.getId(), 110)
    grid?.setFieldWidth(tags.getId(), 210)
    grid?.setFieldWidth(reference.getId(), 220)
    const unfinished = table.createView('Still to explore', univerAPI.Enum.BaseViewType.Grid)
    unfinished.setFilter({
      conjunction: univerAPI.Enum.BaseFilterConjunction.AND,
      conditions: [{ fieldId: status.getId(), operator: univerAPI.Enum.BaseFilterOperator.IS_NOT, operand: 'done' }],
    })
    unfinished.setSort([{ fieldId: rating.getId(), direction: univerAPI.Enum.BaseSortDirection.DESC }])

    const featureBoard = table.createView('Feature board', univerAPI.Enum.BaseViewType.Kanban, {
      view: {
        config: {
          groupFieldId: category.getId(),
          cardLayout: 'compose',
          showFieldNames: true,
          card: {
            titleFieldId: table.getPrimaryFieldId(),
            coverFieldId: null,
            fieldIds: [instruction.getId(), status.getId(), progress.getId(), remaining.getId()],
          },
        },
      },
    })
    table.createView('Tour calendar', univerAPI.Enum.BaseViewType.Calendar, {
      view: {
        config: {
          startDateFieldId: startDate.getId(),
          endDateFieldId: endDate.getId(),
          titleFieldId: table.getPrimaryFieldId(),
          colorFieldId: category.getId(),
          mode: 'month',
          displayColor: { type: 'selectField', fieldId: category.getId() },
        },
      },
    })
    table.createView('Tour timeline', univerAPI.Enum.BaseViewType.Gantt, {
      view: {
        config: {
          startDateFieldId: startDate.getId(),
          endDateFieldId: endDate.getId(),
          titleFieldId: table.getPrimaryFieldId(),
          progressFieldId: progress.getId(),
          scale: 'week',
          leftPaneWidth: 260,
          showTodayLine: true,
          showWeekend: true,
          displayColor: { type: 'selectField', fieldId: category.getId() },
        },
      },
    })
    table.createView('Feature gallery', univerAPI.Enum.BaseViewType.Gallery, {
      view: {
        config: {
          coverFieldId: null,
          cardLayout: 'compose',
          showFieldNames: true,
          cardSize: 'medium',
          card: {
            titleFieldId: table.getPrimaryFieldId(),
            coverFieldId: null,
            fieldIds: [instruction.getId(), tags.getId(), rating.getId(), favorite.getId()],
          },
        },
      },
    })
    const ideas = base.insertTable('Build your own', { primaryFieldName: 'Workflow' })
    const use = ideas.addField('Make it yours', univerAPI.Enum.BaseFieldType.Text)
    const budget = ideas.addField('Sample budget', univerAPI.Enum.BaseFieldType.Currency, {
      field: { config: { currencySymbol: '$', decimalPlaces: 2 } },
    })
    const ready = ideas.addField('Ready to try', univerAPI.Enum.BaseFieldType.Checkbox)
    const priority = ideas.addField('Priority', univerAPI.Enum.BaseFieldType.Rating, {
      field: { config: { min: 1, max: 5 } },
    })
    ideas.addRecords([
      {
        values: {
          [ideas.getPrimaryFieldId()]: 'Content calendar',
          [use.getId()]: 'Add a publishing date and switch to Calendar.',
          [budget.getId()]: 1200,
          [ready.getId()]: true,
          [priority.getId()]: 4,
        },
      },
      {
        values: {
          [ideas.getPrimaryFieldId()]: 'Project tracker',
          [use.getId()]: 'Add a status field and group cards in Kanban.',
          [budget.getId()]: 4500,
          [ready.getId()]: true,
          [priority.getId()]: 5,
        },
      },
      {
        values: {
          [ideas.getPrimaryFieldId()]: 'Resource library',
          [use.getId()]: 'Add descriptive fields and explore Gallery.',
          [budget.getId()]: 850,
          [ready.getId()]: false,
          [priority.getId()]: 3,
        },
      },
    ])
    return { tableId: table.getId(), viewId: featureBoard.getId() }
  }, [])

  const seedBoard = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const board = univerAPI.createBoard({ id: 'boards-home-demo', name: 'Univer Boards · Ideas become a system' })
    const frame = createBoardContainerElement({
      id: 'board-tour',
      left: 40,
      top: 40,
      width: 1112,
      height: 652,
      title: 'UNIVER BOARDS  /  IDEAS BECOME A SYSTEM',
      fillColor: '#F3F6FA',
      strokeColor: '#94A3B8',
      strokeWidth: 1,
    })
    const notes = createBoardContainerElement({
      id: 'notes',
      parentId: frame.id,
      left: 24,
      top: 56,
      width: 242,
      height: 562,
      title: '01  CAPTURE IDEAS',
      fillColor: '#FFFFFF',
      strokeColor: '#CBD5E1',
      strokeWidth: 1,
    })
    const flow = createBoardContainerElement({
      id: 'flow',
      parentId: frame.id,
      left: 286,
      top: 56,
      width: 802,
      height: 324,
      title: '02  CONNECT THE THINKING  ·  DRAG A NODE',
      fillColor: '#FFFFFF',
      strokeColor: '#CBD5E1',
      strokeWidth: 1,
    })
    const pipeline = createBoardSwimlaneElement({
      id: 'pipeline',
      parentId: frame.id,
      left: 286,
      top: 400,
      width: 802,
      height: 218,
      title: '03  ORGANIZE THE WORK  ·  NATIVE SWIMLANES',
      fillColor: '#FFFFFF',
      strokeColor: '#CBD5E1',
      strokeWidth: 1,
      orientation: 'vertical',
      headerSize: 40,
      lanes: [
        { id: 'capture', title: 'CAPTURE', size: 267 },
        { id: 'connect', title: 'CONNECT', size: 267 },
        { id: 'share', title: 'SHARE', size: 268 },
      ],
    })
    function createCard(
      id: string,
      text: string,
      left: number,
      top: number,
      width: number,
      height: number,
      fill: string,
      parentId: string,
      laneId?: string,
    ) {
      const card = createBoardTextBoxShapeElement({
        id,
        text,
        left: left - 326,
        top: top - (parentId === pipeline.id ? 440 : 96),
        width,
        height,
        parentId,
        laneId,
        horizontalAlign: HorizontalAlign.CENTER,
        verticalAlign: VerticalAlign.MIDDLE,
        textStyle: { fs: 14, bl: BooleanNumber.TRUE, cl: { rgb: '#123B50' } },
        textWrap: ShapeTextWrapType.Square,
      })
      card.shapeData.shapeType = ShapeTypeEnum.RoundRect
      card.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: fill }
      card.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#8FA8B5', width: 1 }
      card.shapeData.textRectPadding = { left: 10, right: 10, top: 10, bottom: 10 }
      return card
    }
    const stickies = [
      ['A SPACE TO THINK\n\nPlace ideas anywhere.\nPan and zoom to explore.', '#FEF3C7'],
      ['CONTEXT STAYS CLOSE\n\nGroup ideas in a frame.\nMove the frame as one.', '#DCFCE7'],
      ['YOUR NEXT IDEA\n\nDouble-click this note.\nWhat would you build?', '#FCE7F3'],
    ].map(([text, fillColor], index) => {
      const sticky = createBoardStickyElement({
        id: `note-${index}`,
        parentId: notes.id,
        left: 20,
        top: 56 + index * 158,
        width: 202,
        height: 138,
        fillColor,
      })
      sticky.shapeData.shapeText = {
        isRichText: false,
        isHorizontal: true,
        text,
        fontFamily: 'Arial',
        fontSize: 13,
        color: '#334155',
      }
      sticky.shapeData.textRectPadding = { left: 14, right: 14, top: 16, bottom: 12 }
      sticky.transform.rotation = index === 1 ? 2 : -2
      return sticky
    })
    const cards = [
      createCard('idea', 'Start with\nan idea', 352, 155, 142, 70, '#DBEAFE', flow.id),
      createCard('shape', 'Give it\na shape', 566, 155, 142, 70, '#DDF4EF', flow.id),
      createCard('decision', 'GO?', 780, 146, 126, 88, '#FEF3C7', flow.id),
      createCard('story', 'A clear\nvisual story', 972, 155, 132, 70, '#DDF4EF', flow.id),
      createCard('context', 'Add a note\nKeep the context', 352, 298, 194, 70, '#FCE7F3', flow.id),
      createCard('refine', 'Refine together\nMove · edit · reconnect', 686, 298, 218, 70, '#EDE9FE', flow.id),
      createCard(
        'capture-task',
        'STICKY NOTES\nCapture the raw idea',
        352,
        542,
        214,
        86,
        '#FEF3C7',
        pipeline.id,
        'capture',
      ),
      createCard(
        'connect-task',
        'BOUND CONNECTORS\nRelationships follow nodes',
        618,
        542,
        214,
        86,
        '#DBEAFE',
        pipeline.id,
        'connect',
      ),
      createCard(
        'share-task',
        'FRAMES & LANES\nTurn a canvas into a plan',
        886,
        542,
        214,
        86,
        '#DDF4EF',
        pipeline.id,
        'share',
      ),
    ]
    cards[2].shapeData.shapeType = ShapeTypeEnum.Diamond
    const connections = [
      ['idea', 'shape', BoardConnectorSite.Right, BoardConnectorSite.Left, 'shape it'],
      ['shape', 'decision', BoardConnectorSite.Right, BoardConnectorSite.Left, 'review'],
      ['decision', 'story', BoardConnectorSite.Right, BoardConnectorSite.Left, 'yes'],
      ['decision', 'refine', BoardConnectorSite.Bottom, BoardConnectorSite.Top, 'not yet'],
      ['refine', 'shape', BoardConnectorSite.Top, BoardConnectorSite.Bottom, 'iterate'],
      ['idea', 'context', BoardConnectorSite.Bottom, BoardConnectorSite.Top, 'explain'],
      ['context', 'refine', BoardConnectorSite.Right, BoardConnectorSite.Left, 'discuss'],
    ] as const
    board.addElements([
      frame,
      notes,
      flow,
      pipeline,
      ...stickies,
      ...cards,
      ...connections.map(([from, to, startSite, endSite, label], index) =>
        createBoardConnectorElement({
          id: `relationship-${index}`,
          start: { kind: 'shapeSite', shapeId: from, connectionSiteId: startSite },
          end: { kind: 'shapeSite', shapeId: to, connectionSiteId: endSite },
          routing: 'orthogonal',
          routingMode: 'auto',
          style: {
            stroke: index === 3 || index === 4 ? '#8B5CF6' : '#64748B',
            strokeWidth: 1.8,
            endMarker: { type: 'filledArrow' },
          },
          label: {
            id: `relationship-label-${index}`,
            content: label,
            style: { fill: { color: '#FFFFFF', opacity: 1 } },
          },
        }),
      ),
    ])
  }, [])

  const seedPdf = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const pdf = univerAPI.createPdf({
      id: 'pdfs-home-demo',
      name: 'Univer PDFs · An editable field guide',
    })
    const cover = pdf.getPageByIndex(0)
    if (!cover) return

    const ink = '#182433'
    const muted = '#5A6878'
    const blue = '#174A7E'
    const cyan = '#24748A'
    const accent = '#B45336'
    const rule = '#CBD3DC'
    const soft = '#EDF2F5'
    const serif = 'Times New Roman'
    const sans = 'Helvetica'
    const bodyFontSize = 10.5
    const leadFontSize = 11.5
    const captionFontSize = 8.5
    const labelFontSize = 9
    const tablePresets = univerAPI.getPdfTableThemePresets()
    const horizontalTablePreset = tablePresets.find(({ id }) => id === 'univerNeutralHorizontalLines')
    const softTablePreset = tablePresets.find(({ id }) => id === 'univerNeutralSoftGrid')

    const addPageFrame = (page: typeof cover, pageNumber: number, section: string) => {
      page
        .insertTextBox({
          text: `UNIVER PDFs  /  ${section}`,
          left: 42,
          top: 24,
          width: 420,
          height: 16,
          fontSize: 7.5,
          fontFamily: sans,
          fill: blue,
        })
        .setTextStyle({ bold: true, charSpacing: 1 })
      page
        .insertTextBox({
          text: String(pageNumber).padStart(2, '0'),
          left: 512,
          top: 22,
          width: 40,
          height: 18,
          fontSize: 9,
          fontFamily: sans,
          fill: muted,
        })
        .setTextStyle({ bold: true, charSpacing: 1 })
      page.insertDivider({
        left: 42,
        top: 48,
        width: 511,
        strokeColor: rule,
        strokeWidth: 0.7,
      })
      page.insertDivider({
        left: 42,
        top: 786,
        width: 511,
        strokeColor: rule,
        strokeWidth: 0.7,
      })
      page.insertTextBox({
        text: 'UNIVER PDFs  ·  An editable product guide  ·  docs.univer.ai',
        left: 42,
        top: 798,
        width: 390,
        height: 14,
        fontSize: 7,
        fontFamily: sans,
        fill: muted,
      })
      page.insertTextBox({
        text: `PAGE ${String(pageNumber).padStart(2, '0')}`,
        left: 492,
        top: 798,
        width: 60,
        height: 14,
        fontSize: 7,
        fontFamily: sans,
        fill: muted,
      })
    }

    addPageFrame(cover, 1, 'MEET UNIVER PDFs')
    cover
      .insertTextBox({
        text: 'UNIVER PDFs  ·  CREATE, EDIT & REVIEW',
        left: 42,
        top: 74,
        width: 360,
        height: 18,
        fontSize: 8,
        fontFamily: sans,
        fill: accent,
      })
      .setTextStyle({ bold: true, charSpacing: 1.1 })
    cover
      .insertTextBox({
        text: 'A PDF can be a workspace.',
        left: 42,
        top: 102,
        width: 511,
        height: 36,
        fontSize: 25,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    cover
      .insertTextBox({
        text: 'Meet Univer PDFs.',
        left: 42,
        top: 140,
        width: 511,
        height: 36,
        fontSize: 25,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    cover.insertParagraph({
      text: 'Text, tables, lists, and annotations — brought together on editable pages.',
      left: 42,
      top: 198,
      width: 500,
      height: 34,
      fontSize: 11,
      fontFamily: serif,
      fill: muted,
    })
    cover
      .insertTextBox({
        text: 'UNIVER PDFs  /  INTERACTIVE FIELD GUIDE',
        left: 42,
        top: 244,
        width: 430,
        height: 20,
        fontSize: 9,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true })
    cover.insertParagraph({
      text: 'This guide introduces the editor using its own page objects.\nSelect an object, edit its content, and explore the toolbar.',
      left: 42,
      top: 270,
      width: 500,
      height: 36,
      fontSize: 7.5,
      fontFamily: sans,
      fill: muted,
    })
    cover.insertDivider({
      left: 42,
      top: 320,
      width: 511,
      strokeColor: blue,
      strokeWidth: 1.5,
    })
    cover
      .insertTextBox({
        text: 'MEET PDFs',
        left: 42,
        top: 342,
        width: 72,
        height: 18,
        fontSize: 8,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 1.2 })
    cover.insertParagraph({
      text: 'I’m Univer PDFs, a PDF workspace inside your application. This introduction is built from text boxes, paragraphs, tables, and dividers. Select a title to restyle it, edit a table cell, or add your own annotation. Each page demonstrates a different way to work: compose content, give it structure, review a detail, and organize the result. Scroll through the guide to try it for yourself. The page is the demonstration, and every object is part of the tour.',
      left: 128,
      top: 337,
      width: 425,
      height: 112,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    cover
      .insertTextBox({
        text: 'EXPLORE',
        left: 42,
        top: 466,
        width: 72,
        height: 16,
        fontSize: 7.5,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 1 })
    cover.insertParagraph({
      text: 'editable text  ·  page layout  ·  tables and lists  ·  annotations  ·  page management',
      left: 128,
      top: 462,
      width: 425,
      height: 28,
      fontSize: labelFontSize,
      fontFamily: serif,
      fill: muted,
    })
    const featureSummary = cover.insertTable({
      rowCount: 2,
      columnCount: 3,
      cellTexts: [
        'EDIT TEXT',
        'STYLE TABLES',
        'REVIEW A PAGE',
        'Titles & paragraphs',
        'Cells & alignment',
        'Highlights & underlines',
      ],
      left: 42,
      top: 508,
      width: 511,
      height: 74,
    })
    if (softTablePreset) {
      featureSummary.setTheme({ styleId: softTablePreset.id, options: { firstRow: true } })
    }
    for (let column = 0; column < 3; column += 1) {
      featureSummary.getCell(0, column).setStyle({
        fill: { color: blue },
        fontColor: '#FFFFFF',
        horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
        verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
      })
      featureSummary.getCell(1, column).setStyle({
        fill: { color: soft },
        fontColor: ink,
        horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
        verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
      })
    }
    cover
      .insertTextBox({
        text: '1  START WITH CONTENT',
        left: 42,
        top: 610,
        width: 230,
        height: 18,
        fontSize: 9,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.7 })
    cover.insertParagraph({
      text: 'A title sets the reading order. A paragraph carries the detail. This column and the title above it are separate objects: select one and change its text, typography, or placement.',
      left: 42,
      top: 636,
      width: 242,
      height: 116,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    cover
      .insertTextBox({
        text: 'TRY IT YOURSELF',
        left: 311,
        top: 610,
        width: 230,
        height: 18,
        fontSize: 9,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.7 })
    cover.insertParagraph({
      text: 'Select the title, change its color, then edit a sentence in this paragraph. Use the toolbar to add another object. Scroll down to see tables, styled cells, annotations, and numbered lists.',
      left: 311,
      top: 636,
      width: 242,
      height: 116,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })

    const structure = pdf.insertPage()
    addPageFrame(structure, 2, 'COMPOSE & STRUCTURE')
    structure
      .insertTextBox({
        text: '2  Build a page from useful parts',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    structure.insertParagraph({
      text: 'Give content a structure with editable text, tables, rules, and carefully placed page objects.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    structure
      .insertTextBox({
        text: '2.1  TEXT THAT YOU CAN EDIT',
        left: 42,
        top: 174,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    structure.insertParagraph({
      text: 'Use a text box for a title, label, or short callout. Use a paragraph for longer content with its own position and width. Change the font, size, color, emphasis, or spacing to create a clear hierarchy.\n\nThis page combines two columns, a table, and a divider. Each part is an object you can select and move. Try changing the heading while keeping the body text in place.',
      left: 42,
      top: 200,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    structure
      .insertTextBox({
        text: 'OBJECT GUIDE',
        left: 311,
        top: 174,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    const objectGuide = structure.insertTable({
      rowCount: 6,
      columnCount: 2,
      cellTexts: [
        'Object',
        'Use it for',
        'Text box',
        'A title or a label',
        'Paragraph',
        'Longer content',
        'Table',
        'Structured details',
        'Divider',
        'Visual separation',
        'Annotation',
        'Review & emphasis',
      ],
      left: 311,
      top: 200,
      width: 242,
      height: 174,
    })
    if (horizontalTablePreset) {
      objectGuide.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    structure.insertDivider({
      left: 42,
      top: 398,
      width: 511,
      strokeColor: rule,
      strokeWidth: 0.8,
    })
    structure
      .insertTextBox({
        text: '2.2  STYLE A DETAIL',
        left: 42,
        top: 420,
        width: 260,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    structure
      .insertTextBox({
        text: 'Your content + editable objects + a clear layout = a useful PDF workspace',
        left: 66,
        top: 454,
        width: 463,
        height: 30,
        fontSize: 11,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ italic: true })
    structure.insertAnnotation({
      annotationType: univerAPI.Enum.PdfAnnotationType.UNDERLINE,
      left: 64,
      top: 473,
      width: 466,
      height: 12,
      markup: { color: cyan, opacity: 0.7 },
    })
    structure
      .insertTextBox({
        text: 'TABLE 1  ·  A TABLE THAT INTRODUCES TABLES',
        left: 42,
        top: 510,
        width: 350,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const editingGuide = structure.insertTable({
      rowCount: 5,
      columnCount: 3,
      cellTexts: [
        'Feature',
        'Try this',
        'Where',
        'Cell content',
        'Edit the words in this cell',
        'This table',
        'Alignment',
        'Align text within a cell',
        'Cell style',
        'Colors',
        'Choose a fill or text color',
        'Cell style',
        'Table theme',
        'Try another table style',
        'Table tools',
      ],
      left: 42,
      top: 536,
      width: 511,
      height: 174,
    })
    if (horizontalTablePreset) {
      editingGuide.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    structure.insertParagraph({
      text: 'Try it. Select a table cell to edit its content. Explore cell alignment, colors, borders, and the table style controls.',
      left: 42,
      top: 726,
      width: 511,
      height: 38,
      fontSize: captionFontSize,
      fontFamily: serif,
      fill: muted,
    })

    const review = pdf.insertPage()
    addPageFrame(review, 3, 'REVIEW & ANNOTATE')
    review
      .insertTextBox({
        text: '3  Review what matters',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    review.insertParagraph({
      text: 'Use a visual hierarchy and markup to guide attention to the right part of a page.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    review
      .insertTextBox({
        text: 'FIGURE 1  ·  THREE WAYS TO MARK UP A PAGE',
        left: 42,
        top: 174,
        width: 400,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const proofLines = [
      {
        label: 'REPLACE',
        text: 'A PDF is only for reading.',
        type: univerAPI.Enum.PdfAnnotationType.STRIKEOUT,
        color: '#DC2626',
        note: 'A PDF can be an editable workspace.',
      },
      {
        label: 'EMPHASIZE',
        text: 'Keep the important detail visible.',
        type: univerAPI.Enum.PdfAnnotationType.UNDERLINE,
        color: blue,
        note: 'Underline draws attention without hiding the text.',
      },
      {
        label: 'REVISIT',
        text: 'Review this paragraph with your team.',
        type: univerAPI.Enum.PdfAnnotationType.HIGHLIGHT,
        color: '#FBBF24',
        note: 'Highlights are separate objects you can move or remove.',
      },
    ] as const
    proofLines.forEach((line, index) => {
      const top = 208 + index * 64
      review
        .insertTextBox({
          text: line.label,
          left: 42,
          top,
          width: 108,
          height: 16,
          fontSize: 8,
          fontFamily: sans,
          fill: line.color,
        })
        .setTextStyle({ bold: true })
      review.insertTextBox({
        text: line.text,
        left: 170,
        top,
        width: 376,
        height: 20,
        fontSize: 11,
        fontFamily: serif,
        fill: ink,
      })
      review.insertAnnotation({
        annotationType: line.type,
        left: 168,
        top: top + 2,
        width: 292,
        height: 14,
        markup: { color: line.color, opacity: line.type === univerAPI.Enum.PdfAnnotationType.HIGHLIGHT ? 0.35 : 0.85 },
      })
      review.insertTextBox({
        text: line.note,
        left: 170,
        top: top + 25,
        width: 382,
        height: 23,
        fontSize: 8.5,
        fontFamily: sans,
        fill: muted,
      })
    })
    review
      .insertTextBox({
        text: 'TABLE 2  ·  YOUR INTERACTIVE REVIEW CHECKLIST',
        left: 42,
        top: 420,
        width: 430,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const reviewChecklist = review.insertTable({
      rowCount: 6,
      columnCount: 5,
      cellTexts: [
        'Try this',
        'Text',
        'Table',
        'Page',
        'Done?',
        'Edit a title',
        'Yes',
        '—',
        '—',
        'Try it',
        'Change a cell',
        '—',
        'Yes',
        '—',
        'Try it',
        'Add a highlight',
        '—',
        '—',
        'Yes',
        'Try it',
        'Move an object',
        'Yes',
        '—',
        'Yes',
        'Try it',
        'Add a page',
        '—',
        '—',
        'Yes',
        'Try it',
      ],
      left: 42,
      top: 446,
      width: 511,
      height: 202,
    })
    if (horizontalTablePreset) {
      reviewChecklist.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    for (let row = 0; row < 6; row += 1) {
      for (let column = 1; column < 5; column += 1) {
        reviewChecklist.getCell(row, column).setStyle({
          horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
          verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
        })
      }
    }
    review.insertAnnotation({
      annotationType: univerAPI.Enum.PdfAnnotationType.HIGHLIGHT,
      left: 40,
      top: 680,
      width: 515,
      height: 54,
      markup: { color: '#F4D97A', opacity: 0.24 },
    })
    review
      .insertTextBox({
        text: 'TRY IT  ·  This callout has a highlight annotation. Select it to explore markup, or add an annotation of your own.',
        left: 54,
        top: 693,
        width: 485,
        height: 32,
        fontSize: bodyFontSize,
        fontFamily: serif,
        fill: '#65420E',
      })
      .setTextStyle({ bold: true })

    const practice = pdf.insertPage()
    addPageFrame(practice, 4, 'YOUR TURN')
    practice
      .insertTextBox({
        text: '4  Make this guide your own',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    practice.insertParagraph({
      text: 'A useful PDF workspace lets you work with the page, from the first paragraph to the final review.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    practice
      .insertTextBox({
        text: '4.1  COMPOSE & REFINE',
        left: 42,
        top: 176,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    practice.insertParagraph({
      text: 'Start with a title and a paragraph. Add a table when information needs columns, and a list when it needs a sequence. Use dividers, alignment, and spacing to guide the reader.\n\nEvery example in this guide is made from the same objects available in the editor. Select one, change it, and see the page respond.',
      left: 42,
      top: 202,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    practice
      .insertTextBox({
        text: '4.2  ORGANIZE YOUR PAGES',
        left: 311,
        top: 176,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    practice.insertParagraph({
      text: 'Use the page controls to navigate the guide and explore page management. Add another page for your own content, duplicate a useful layout, or reorder pages to change the reading sequence.\n\nKeep a short introduction, a detailed reference, and a checklist together in one document.',
      left: 311,
      top: 202,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    practice.insertDivider({
      left: 42,
      top: 400,
      width: 511,
      strokeColor: rule,
      strokeWidth: 0.8,
    })
    practice
      .insertTextBox({
        text: 'A FOUR-STEP TOUR',
        left: 42,
        top: 422,
        width: 280,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    const tourSteps = [
      'Edit the cover title and write a short introduction.',
      'Change a table cell and try a different alignment.',
      'Add an annotation to a detail you want to revisit.',
      'Add a page and build a layout of your own.',
    ]
    tourSteps.forEach((text, index) => {
      practice
        .insertList({
          text,
          kind: univerAPI.Enum.PdfListKind.ORDERED,
          preset: univerAPI.Enum.PdfListPresetId.ORDERED_DECIMAL_DOT,
          left: 42,
          top: 454 + index * 29,
          width: 511,
          height: 27,
          fontSize: bodyFontSize,
          fontFamily: serif,
          fill: ink,
        })
        .setStartNumber(index + 1)
    })
    practice
      .insertTextBox({
        text: 'YOUR NEXT PAGE',
        left: 42,
        top: 596,
        width: 180,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    practice.insertParagraph({
      text: 'Turn this guide into a product sheet, a how-to document, or a review checklist. Keep the structure you like, replace the words, and use the editor to make the result your own.',
      left: 42,
      top: 622,
      width: 511,
      height: 68,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    practice
      .insertTextBox({
        text: 'KEEP EXPLORING',
        left: 42,
        top: 708,
        width: 220,
        height: 16,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    practice.insertParagraph({
      text: 'Univer PDFs · Create and edit pages, compose text, style tables, and review with annotations. Explore the other product tabs for spreadsheets, documents, presentations, structured data, and a visual canvas.',
      left: 42,
      top: 732,
      width: 511,
      height: 42,
      fontSize: captionFontSize,
      fontFamily: serif,
      fill: muted,
    })
  }, [])

  useEffect(() => {
    const univer = new Univer({
      darkMode: theme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(
          DesignEnUS,
          UIEnUS,
          DocsUIEnUS,
          DrawingUIEnUS,
          SheetsEnUS,
          SheetsUIEnUS,
          SheetsFormulaUIEnUS,
          SheetsNumfmtUIEnUS,
          SheetsConditionalFormattingUIEnUS,
          SheetsDataValidationUIEnUS,
          SheetsFilterUIEnUS,
          SheetsSortUIEnUS,
          SheetsTableUIEnUS,
          ShapeEditorUIEnUS,
          SlidesUIEnUS,
          ChartUIEnUS,
          EmbedUnitUIEnUS,
          SlidesChartUIEnUS,
          SlidesTableUIEnUS,
          BasesEnUS,
          BasesUIEnUS,
          BoardsUIEnUS,
          PdfsUIEnUS,
        ),
      },
    })

    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, {
      container: divRef.current,
      ribbonType: 'grid',
    })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverLicensePlugin, {
      license: process.env.NEXT_PUBLIC_CLIENT_LICENSE_TEXT,
    })

    if (type === 'docs') {
      const documentData = documentMode === 'modern' ? modernDocumentData : traditionalDocumentData
      univer.createUnit(UniverInstanceType.UNIVER_DOC, documentData)
    } else if (type === 'sheets') {
      univer.registerPlugin(UniverFormulaEnginePlugin)
      univer.registerPlugin(UniverSheetsPlugin)
      univer.registerPlugin(UniverSheetsUIPlugin)
      univer.registerPlugin(UniverSheetsFormulaUIPlugin)
      univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
      univer.registerPlugin(UniverSheetsDataValidationPlugin)
      univer.registerPlugin(UniverSheetsDataValidationUIPlugin)
      univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin)
      univer.registerPlugin(UniverSheetsFilterUIPlugin)
      univer.registerPlugin(UniverSheetsSortUIPlugin)
      univer.registerPlugin(UniverSheetsTableUIPlugin)
      univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData)
    } else if (type === 'slides') {
      univer.registerPlugin(UniverSlidesPlugin)
      univer.registerPlugin(UniverSlidesUIPlugin)
      univer.registerPlugin(UniverSlidesChartPlugin)
      univer.registerPlugin(UniverSlidesChartUIPlugin)
      univer.registerPlugin(UniverSlidesTablePlugin)
      univer.registerPlugin(UniverSlidesTableUIPlugin)
      univer.createUnit(UniverInstanceType.UNIVER_SLIDE, homeSlideData)
    } else if (type === 'bases') {
      univer.registerPlugin(UniverBasesPlugin)
      univer.registerPlugin(UniverBasesUIPlugin)
    } else if (type === 'boards') {
      univer.registerPlugin(UniverBoardsPlugin)
      univer.registerPlugin(UniverBoardsUIPlugin)
    } else if (type === 'pdfs') {
      univer.registerPlugin(UniverPdfsPlugin)
      univer.registerPlugin(UniverPdfEditorPlugin)
      univer.registerPlugin(UniverPdfsUIPlugin)
    }

    const univerAPI = FUniver.newAPI(univer)

    let baseSeedResult: ReturnType<typeof seedBase> | null = null
    if (type === 'bases') {
      baseSeedResult = seedBase(univerAPI)
    } else if (type === 'boards') {
      seedBoard(univerAPI)
    } else if (type === 'pdfs') {
      seedPdf(univerAPI)
    }

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, async (event) => {
      if (event.stage === univerAPI.Enum.LifecycleStages.Rendered) {
        if (type === 'sheets') {
          const workbook = univerAPI.getActiveWorkbook()!
          workbook.getSheetByName('Feature tour')!.getRange('A6:J15').createFilter()
          const practice = workbook.getSheetByName('Practice data')!
          await practice.addTable('FeaturePractice', practice.getRange('A4:I31').getRange(), 'feature-practice-table', {
            tableStyleId: 'table-default-4',
          })
        }
        if (type === 'slides') seedSlides(univerAPI)
        if (baseSeedResult) {
          const baseUI = univerAPI.getBaseUI()
          await baseUI.activateTable(baseSeedResult.tableId)
          await baseUI.activateView(baseSeedResult.viewId)
          baseUI.openLeftSidebar()
        }
        setSteady(true)
      }
    })

    return () => {
      univerAPI.dispose()
    }
  }, [documentMode, seedBase, seedBoard, seedPdf, seedSlides, theme, type])

  function handleChangeType(newType: UniverType) {
    if (newType === type) return
    setSteady(false)
    setType(newType)
  }

  function handleChangeDocumentMode(newMode: DocumentMode) {
    if (newMode === documentMode) return
    setSteady(false)
    setDocumentMode(newMode)
  }

  const tabs = [
    {
      key: 'sheets' as const,
      label: 'Sheets',
      fullLabel: 'Univer Sheets',
      icon: SheetsMultiIcon,
    },
    {
      key: 'docs' as const,
      label: 'Docs',
      fullLabel: 'Univer Docs',
      icon: DocsMultiIcon,
    },
    {
      key: 'slides' as const,
      label: 'Slides',
      fullLabel: 'Univer Slides',
      icon: SlidesMultiIcon,
    },
    {
      key: 'bases' as const,
      label: 'Bases',
      fullLabel: 'Univer Bases',
      icon: BasesMultiIcon,
    },
    {
      key: 'boards' as const,
      label: 'Boards',
      fullLabel: 'Univer Boards',
      icon: BoardsMultiIcon,
    },
    {
      key: 'pdfs' as const,
      label: 'PDFs',
      fullLabel: 'Univer PDFs',
      icon: PdfMultiIcon,
    },
  ]

  return (
    <Tabs
      value={type}
      onValueChange={(value) => {
        const nextTab = tabs.find((tab) => tab.key === value)
        if (nextTab) handleChangeType(nextTab.key)
      }}
      className="w-full gap-0"
    >
      <div className={clsx('flex justify-center px-4', type === 'docs' ? 'mb-2.5' : 'mb-5')}>
        <TabsList
          aria-label={tablistLabel}
          className="grid h-21 w-full max-w-sm grid-cols-3 gap-0.5 p-1 sm:inline-flex sm:h-11.5 sm:w-auto sm:max-w-none"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.key}
                id={`univer-tab-${tab.key}`}
                value={tab.key}
                aria-label={tab.fullLabel}
                className="h-9 px-2.5 text-xs sm:px-4 sm:text-sm"
              >
                <Icon aria-hidden className="size-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </div>

      {type === 'docs' && (
        <motion.div
          className="mb-4 flex justify-center px-4"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Tabs
            value={documentMode}
            onValueChange={(value) => {
              if (value === 'modern' || value === 'traditional') handleChangeDocumentMode(value)
            }}
          >
            <TabsList aria-label="Document layout mode">
              {(['modern', 'traditional'] as const).map((mode) => (
                <TabsTrigger key={mode} value={mode} aria-controls="univer-product-demo" className="px-4 text-xs">
                  {mode === 'modern' ? 'Modern' : 'Traditional'}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </motion.div>
      )}

      <TabsContent
        value={type}
        keepMounted
        id="univer-product-demo"
        aria-labelledby={`univer-tab-${type}`}
        aria-busy={!steady}
        className="border-border bg-card relative mx-auto h-160 w-7xl max-w-full flex-none overflow-hidden overscroll-contain rounded-lg border sm:h-200 dark:border-white/10 dark:shadow-[0_12px_36px_#00000026]"
      >
        {/* Mask / Loading */}
        <AnimatePresence>
          {!steady && (
            <motion.div
              className="pointer-events-auto absolute inset-0 z-10 flex size-full items-center justify-center bg-(--landing-surface)"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Spinner />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Univer Container */}
        <div
          className={clsx('relative z-1 size-full transition-opacity duration-200', {
            'opacity-35': !steady,
            'opacity-100': steady,
          })}
        >
          <div ref={divRef} className="home-univer-demo h-full" />
        </div>
      </TabsContent>
    </Tabs>
  )
}
