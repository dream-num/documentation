'use client'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import {
  createBoardConnectorElement,
  createBoardContainerElement,
  createBoardTextBoxShapeElement,
  UniverBoardsPlugin,
} from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { UniverPdfsPlugin } from '@univerjs-pro/pdfs'
import { UniverPdfEditorPlugin } from '@univerjs-pro/pdfs-editor'
import { UniverPdfsUIPlugin } from '@univerjs-pro/pdfs-ui'
import PdfsUIEnUS from '@univerjs-pro/pdfs-ui/locale/en-US'
import ShapeEditorUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesUIEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import {
  BooleanNumber,
  HorizontalAlign,
  LocaleType as CoreLocaleType,
  mergeLocales as mergeCoreLocales,
  Univer as UniverCore,
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
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

import Spinner from '@/components/animata/spinner'
import { BorderBeam } from '@/components/magicui/border-beam'
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
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/slides-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/pdfs-ui/lib/index.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs-pro/pdfs/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'

type UniverType = 'sheets' | 'docs' | 'slides' | 'bases' | 'boards' | 'pdfs'
type DocumentMode = 'modern' | 'traditional'

export interface IUniverProps {
  tablistLabel: string
}

export default function Univer({ tablistLabel }: IUniverProps) {
  const divRef = useRef<HTMLDivElement>(null!)
  const frameRef = useRef<HTMLDivElement>(null!)

  const [type, setType] = useState<UniverType>('sheets')
  const [documentMode, setDocumentMode] = useState<DocumentMode>('modern')
  const [steady, setSteady] = useState(false)

  const { theme } = useTheme()

  const seedBase = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const now = Date.now()
    const base = univerAPI.createBase({
      id: 'bases-home-demo',
      name: 'Northstar Launch Operations',
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      tables: {},
      tableOrder: [],
    })
    const table = base.insertTable('Launch Portfolio', { primaryFieldName: 'Workstream' })
    const status = table.addField('Status', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'planned', name: 'Planned', color: 'purple' },
            { id: 'progress', name: 'In progress', color: 'blue' },
            { id: 'review', name: 'In review', color: 'yellow' },
            { id: 'blocked', name: 'Blocked', color: 'red' },
            { id: 'done', name: 'Done', color: 'green' },
          ],
        },
        defaultValue: 'planned',
      },
    })
    const owner = table.addField('Owner', univerAPI.Enum.BaseFieldType.Text)
    const region = table.addField('Geo', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'global', name: 'Global', color: 'blue' },
            { id: 'americas', name: 'Americas', color: 'green' },
            { id: 'emea', name: 'EMEA', color: 'yellow' },
            { id: 'apac', name: 'APAC', color: 'purple' },
          ],
        },
      },
    })
    const readiness = table.addField('Readiness', univerAPI.Enum.BaseFieldType.Progress)
    const startDate = table.addField('Start', univerAPI.Enum.BaseFieldType.Date)
    const targetDate = table.addField('Target', univerAPI.Enum.BaseFieldType.Date)
    const risk = table.addField('Risk', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'low', name: 'Low', color: 'green' },
            { id: 'medium', name: 'Medium', color: 'yellow' },
            { id: 'high', name: 'High', color: 'red' },
          ],
        },
      },
    })

    table.addRecords([
      {
        values: {
          [table.getPrimaryFieldId()]: 'Release approval',
          [status.getId()]: 'done',
          [owner.getId()]: 'Maya Chen',
          [region.getId()]: 'global',
          [readiness.getId()]: 100,
          [startDate.getId()]: Date.UTC(2026, 7, 11),
          [targetDate.getId()]: Date.UTC(2026, 8, 5),
          [risk.getId()]: 'low',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Enterprise onboarding',
          [status.getId()]: 'review',
          [owner.getId()]: 'Jon Bell',
          [region.getId()]: 'americas',
          [readiness.getId()]: 88,
          [startDate.getId()]: Date.UTC(2026, 7, 18),
          [targetDate.getId()]: Date.UTC(2026, 8, 12),
          [risk.getId()]: 'medium',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Partner certification',
          [status.getId()]: 'progress',
          [owner.getId()]: 'Priya Shah',
          [region.getId()]: 'emea',
          [readiness.getId()]: 76,
          [startDate.getId()]: Date.UTC(2026, 7, 20),
          [targetDate.getId()]: Date.UTC(2026, 8, 16),
          [risk.getId()]: 'medium',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Localized launch kits',
          [status.getId()]: 'progress',
          [owner.getId()]: 'Noah Martin',
          [region.getId()]: 'apac',
          [readiness.getId()]: 64,
          [startDate.getId()]: Date.UTC(2026, 7, 25),
          [targetDate.getId()]: Date.UTC(2026, 8, 18),
          [risk.getId()]: 'high',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Billing migration',
          [status.getId()]: 'blocked',
          [owner.getId()]: 'Elena Rossi',
          [region.getId()]: 'global',
          [readiness.getId()]: 52,
          [startDate.getId()]: Date.UTC(2026, 7, 15),
          [targetDate.getId()]: Date.UTC(2026, 8, 14),
          [risk.getId()]: 'high',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Support readiness',
          [status.getId()]: 'review',
          [owner.getId()]: 'Andre Lewis',
          [region.getId()]: 'global',
          [readiness.getId()]: 82,
          [startDate.getId()]: Date.UTC(2026, 7, 22),
          [targetDate.getId()]: Date.UTC(2026, 8, 17),
          [risk.getId()]: 'low',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Executive roadshow',
          [status.getId()]: 'progress',
          [owner.getId()]: 'Sofia Park',
          [region.getId()]: 'americas',
          [readiness.getId()]: 70,
          [startDate.getId()]: Date.UTC(2026, 7, 26),
          [targetDate.getId()]: Date.UTC(2026, 8, 19),
          [risk.getId()]: 'medium',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Analytics validation',
          [status.getId()]: 'done',
          [owner.getId()]: 'Owen Davis',
          [region.getId()]: 'global',
          [readiness.getId()]: 100,
          [startDate.getId()]: Date.UTC(2026, 7, 12),
          [targetDate.getId()]: Date.UTC(2026, 8, 9),
          [risk.getId()]: 'low',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Go-live command center',
          [status.getId()]: 'planned',
          [owner.getId()]: 'Amara Okafor',
          [region.getId()]: 'global',
          [readiness.getId()]: 35,
          [startDate.getId()]: Date.UTC(2026, 8, 8),
          [targetDate.getId()]: Date.UTC(2026, 8, 22),
          [risk.getId()]: 'medium',
        },
      },
    ])

    const grid = table.getViewByName('Grid')
    grid?.setName('Portfolio grid')
    grid?.setFieldWidth(table.getPrimaryFieldId(), 230)
    grid?.setFieldWidth(status.getId(), 112)
    grid?.setFieldWidth(owner.getId(), 124)
    grid?.setFieldWidth(region.getId(), 98)
    grid?.setFieldWidth(readiness.getId(), 126)
    grid?.setFieldWidth(startDate.getId(), 108)
    grid?.setFieldWidth(targetDate.getId(), 108)
    grid?.setFieldWidth(risk.getId(), 88)

    const launchBoard = table.createView('Launch board', univerAPI.Enum.BaseViewType.Kanban, {
      view: {
        config: {
          groupFieldId: status.getId(),
          cardLayout: 'compose',
          showFieldNames: true,
          card: {
            titleFieldId: table.getPrimaryFieldId(),
            coverFieldId: null,
            fieldIds: [owner.getId(), region.getId(), readiness.getId(), targetDate.getId(), risk.getId()],
          },
        },
      },
    })
    table.createView('Milestones', univerAPI.Enum.BaseViewType.Calendar, {
      view: {
        config: {
          startDateFieldId: startDate.getId(),
          endDateFieldId: targetDate.getId(),
          titleFieldId: table.getPrimaryFieldId(),
          colorFieldId: status.getId(),
          mode: 'month',
          displayColor: { type: 'selectField', fieldId: status.getId() },
        },
      },
    })
    table.createView('Delivery timeline', univerAPI.Enum.BaseViewType.Gantt, {
      view: {
        config: {
          startDateFieldId: startDate.getId(),
          endDateFieldId: targetDate.getId(),
          titleFieldId: table.getPrimaryFieldId(),
          progressFieldId: readiness.getId(),
          scale: 'week',
          leftPaneWidth: 300,
          showTodayLine: true,
          showWeekend: false,
          displayColor: { type: 'selectField', fieldId: status.getId() },
        },
      },
    })
    table.createView('Workstream gallery', univerAPI.Enum.BaseViewType.Gallery, {
      view: {
        config: {
          coverFieldId: null,
          cardLayout: 'compose',
          showFieldNames: true,
          cardSize: 'medium',
          card: {
            titleFieldId: table.getPrimaryFieldId(),
            coverFieldId: null,
            fieldIds: [status.getId(), owner.getId(), region.getId(), readiness.getId(), risk.getId()],
          },
        },
      },
    })

    const decisionTable = base.insertTable('Decision Register', { primaryFieldName: 'Decision' })
    const decisionStatus = decisionTable.addField('Gate', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'approved', name: 'Approved', color: 'green' },
            { id: 'pending', name: 'Pending', color: 'yellow' },
            { id: 'escalated', name: 'Escalated', color: 'red' },
          ],
        },
      },
    })
    const decisionOwner = decisionTable.addField('Decision owner', univerAPI.Enum.BaseFieldType.Text)
    const decisionDue = decisionTable.addField('Due', univerAPI.Enum.BaseFieldType.Date)
    decisionTable.addRecords([
      {
        values: {
          [decisionTable.getPrimaryFieldId()]: 'Cap billing contingency at $15K',
          [decisionStatus.getId()]: 'pending',
          [decisionOwner.getId()]: 'Finance',
          [decisionDue.getId()]: Date.UTC(2026, 7, 25),
        },
      },
      {
        values: {
          [decisionTable.getPrimaryFieldId()]: 'Approve September 22 go-live',
          [decisionStatus.getId()]: 'approved',
          [decisionOwner.getId()]: 'Executive team',
          [decisionDue.getId()]: Date.UTC(2026, 7, 22),
        },
      },
      {
        values: {
          [decisionTable.getPrimaryFieldId()]: 'Fund APAC localization review',
          [decisionStatus.getId()]: 'escalated',
          [decisionOwner.getId()]: 'Regional GM',
          [decisionDue.getId()]: Date.UTC(2026, 7, 27),
        },
      },
    ])

    return { tableId: table.getId(), viewId: launchBoard.getId() }
  }, [])

  const seedBoard = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const board = univerAPI.createBoard({
      id: 'boards-home-demo',
      name: 'Northstar Launch Command Center',
    })

    function createBoardCard(options: {
      fillColor: string
      fontSize?: number
      height: number
      id: string
      left: number
      strokeColor?: string
      text: string
      textColor: string
      top: number
      width: number
    }) {
      const card = createBoardTextBoxShapeElement({
        id: options.id,
        left: options.left,
        top: options.top,
        width: options.width,
        height: options.height,
        horizontalAlign: HorizontalAlign.CENTER,
        verticalAlign: VerticalAlign.MIDDLE,
        text: options.text,
        textStyle: {
          fs: options.fontSize ?? 14,
          bl: BooleanNumber.TRUE,
          cl: { rgb: options.textColor },
        },
        textWrap: ShapeTextWrapType.Square,
      })
      card.shapeData.shapeType = ShapeTypeEnum.RoundRect
      card.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: options.fillColor }
      card.shapeData.stroke = {
        lineStrokeType: ShapeLineTypeEnum.SolidLine,
        color: options.strokeColor ?? options.textColor,
        width: 1,
      }
      card.shapeData.textRectPadding = { left: 14, top: 12, right: 14, bottom: 12 }
      return card
    }

    board.addElements([
      createBoardContainerElement({
        id: 'container-homepage',
        left: 56,
        top: 44,
        width: 1104,
        height: 510,
        title: 'NORTHSTAR GLOBAL LAUNCH  ·  COMMAND CENTER',
        fillColor: '#F6F8FA',
        strokeColor: '#94A3B8',
        strokeWidth: 1,
      }),
      createBoardContainerElement({
        id: 'container-pulse',
        left: 80,
        top: 100,
        width: 240,
        height: 340,
        title: 'EXECUTIVE PULSE',
        fillColor: '#FFFFFF',
        strokeColor: '#CBD5E1',
        strokeWidth: 1,
      }),
      createBoardContainerElement({
        id: 'container-decision-path',
        left: 340,
        top: 100,
        width: 510,
        height: 340,
        title: 'DECISION PATH  ·  SEP 22',
        fillColor: '#FFFFFF',
        strokeColor: '#CBD5E1',
        strokeWidth: 1,
      }),
      createBoardContainerElement({
        id: 'container-risks',
        left: 870,
        top: 100,
        width: 266,
        height: 340,
        title: 'RISKS & OWNERS',
        fillColor: '#FFFFFF',
        strokeColor: '#CBD5E1',
        strokeWidth: 1,
      }),
      createBoardConnectorElement({
        id: 'connector-evidence-control',
        start: { kind: 'free', x: 554, y: 198 },
        end: { kind: 'free', x: 608, y: 198 },
        routing: 'straight',
        style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
      }),
      createBoardConnectorElement({
        id: 'connector-evidence-signoff',
        start: { kind: 'free', x: 461, y: 242 },
        end: { kind: 'free', x: 461, y: 284 },
        routing: 'straight',
        style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
      }),
      createBoardConnectorElement({
        id: 'connector-control-launch',
        start: { kind: 'free', x: 701, y: 242 },
        end: { kind: 'free', x: 701, y: 274 },
        routing: 'straight',
        style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
      }),
      createBoardConnectorElement({
        id: 'connector-signoff-launch',
        start: { kind: 'free', x: 554, y: 330 },
        end: { kind: 'free', x: 608, y: 330 },
        routing: 'straight',
        style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
      }),
      createBoardCard({
        id: 'card-readiness',
        left: 102,
        top: 148,
        width: 196,
        height: 94,
        fillColor: '#DDF4EF',
        strokeColor: '#5BA69A',
        textColor: '#0F5B52',
        fontSize: 22,
        text: '86%\nVERIFIED READY',
      }),
      createBoardCard({
        id: 'card-workstreams',
        left: 102,
        top: 264,
        width: 92,
        height: 74,
        fillColor: '#EEF2F6',
        strokeColor: '#AAB7C4',
        textColor: '#334155',
        fontSize: 12,
        text: '2 / 9\nCLOSED',
      }),
      createBoardCard({
        id: 'card-contingency',
        left: 206,
        top: 264,
        width: 92,
        height: 74,
        fillColor: '#FFF3D6',
        strokeColor: '#D5A84B',
        textColor: '#7A4A08',
        fontSize: 12,
        text: '$15K\nBUFFER',
      }),
      createBoardCard({
        id: 'card-pulse-note',
        left: 102,
        top: 360,
        width: 196,
        height: 54,
        fillColor: '#F8FAFC',
        strokeColor: '#CBD5E1',
        textColor: '#475569',
        fontSize: 11,
        text: 'TREND  +7 pts / 7 days\nCONFIDENCE  0.82',
      }),
      createBoardCard({
        id: 'card-evidence',
        left: 368,
        top: 154,
        width: 186,
        height: 88,
        fillColor: '#E8F1FA',
        strokeColor: '#7CA5C9',
        textColor: '#174A7E',
        text: 'EVIDENCE REVIEW\nT−14 · 42 controls',
      }),
      createBoardCard({
        id: 'card-control',
        left: 608,
        top: 154,
        width: 186,
        height: 88,
        fillColor: '#FFF3D6',
        strokeColor: '#D5A84B',
        textColor: '#7A4A08',
        text: 'COMMERCIAL CONTROL\nBilling variance ≤ 2%',
      }),
      createBoardCard({
        id: 'card-signoff',
        left: 368,
        top: 284,
        width: 186,
        height: 92,
        fillColor: '#EDF5EF',
        strokeColor: '#85A98C',
        textColor: '#2F6338',
        text: 'REGIONAL SIGN-OFF\nAmericas · EMEA · APAC',
      }),
      createBoardCard({
        id: 'card-launch-decision',
        left: 608,
        top: 274,
        width: 186,
        height: 112,
        fillColor: '#17324D',
        strokeColor: '#17324D',
        textColor: '#FFFFFF',
        fontSize: 17,
        text: 'GO / NO-GO\nSEP 22 · 17:00 UTC',
      }),
      createBoardCard({
        id: 'card-risk-billing',
        left: 894,
        top: 150,
        width: 218,
        height: 82,
        fillColor: '#FDE8E7',
        strokeColor: '#C87069',
        textColor: '#8A2D27',
        fontSize: 12,
        text: 'HIGH  ·  BILLING MIGRATION\nElena Rossi · review Tuesday',
      }),
      createBoardCard({
        id: 'card-risk-localization',
        left: 894,
        top: 250,
        width: 218,
        height: 82,
        fillColor: '#FFF3D6',
        strokeColor: '#D5A84B',
        textColor: '#7A4A08',
        fontSize: 12,
        text: 'HIGH  ·  APAC LAUNCH KITS\nNoah Martin · daily check',
      }),
      createBoardCard({
        id: 'card-next-decision',
        left: 894,
        top: 350,
        width: 218,
        height: 64,
        fillColor: '#EEF2F6',
        strokeColor: '#AAB7C4',
        textColor: '#334155',
        fontSize: 11,
        text: 'NEXT DECISION\nRelease buffer after variance review',
      }),
      createBoardTextBoxShapeElement({
        id: 'launch-timeline',
        left: 80,
        top: 470,
        width: 1056,
        height: 48,
        horizontalAlign: HorizontalAlign.CENTER,
        verticalAlign: VerticalAlign.MIDDLE,
        text: 'T−14  EVIDENCE REVIEW    →    T−7  REGIONAL SIGN-OFF    →    T−1  COMMAND CENTER    →    DAY 0  LAUNCH',
        textStyle: { fs: 12, bl: BooleanNumber.TRUE, cl: { rgb: '#334155' } },
        textWrap: ShapeTextWrapType.Square,
      }),
    ])
  }, [])

  const seedPdf = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const pdf = univerAPI.createPdf({
      id: 'pdfs-home-demo',
      name: 'Operational Readiness Research Paper',
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
          text: `FIELD NOTES IN PRODUCT SYSTEMS  /  ${section}`,
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
        text: 'doi:10.2481/fnps.2026.018  ·  © 2026 Northstar Research Collective',
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

    addPageFrame(cover, 1, 'RESEARCH ARTICLE')
    cover
      .insertTextBox({
        text: 'EMPIRICAL STUDY  ·  RELEASE ENGINEERING',
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
        text: 'Operational readiness as a leading indicator',
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
        text: 'of global launch reliability',
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
      text: 'Evidence from 186 enterprise software releases across fourteen international markets',
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
        text: 'Maya Chen¹  ·  Priya Shah²  ·  Owen Davis¹',
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
      text: '¹ Northstar Research Collective, Singapore  ·  ² Institute for Product Systems, London\nCorrespondence: research@northstar.example',
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
        text: 'ABSTRACT',
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
      text: 'Global software launches fail less often when teams measure operational readiness early, but evidence on the timing and composition of that signal remains limited. We analyze 186 enterprise releases delivered across fourteen markets between 2022 and 2026. A preregistered readiness index combines release quality, localization, support capacity, rollback design, and commercial controls. Readiness measured fourteen days before launch predicts incident-free delivery after controlling for release size, market count, and organizational maturity. A ten-point increase is associated with an 18.4% reduction in severe launch incidents. Cross-functional verification, rather than self-reported completion, explains most of the effect.',
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
        text: 'KEYWORDS',
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
      text: 'operational readiness  ·  release engineering  ·  launch reliability  ·  cross-functional coordination  ·  enterprise software',
      left: 128,
      top: 462,
      width: 425,
      height: 28,
      fontSize: labelFontSize,
      fontFamily: serif,
      fill: muted,
    })
    const headlineFindings = cover.insertTable({
      rowCount: 2,
      columnCount: 3,
      cellTexts: [
        '186 RELEASES',
        '14 MARKETS',
        '−18.4% INCIDENT RISK',
        'Longitudinal sample',
        'Three operating regions',
        'Per +10 readiness points',
      ],
      left: 42,
      top: 508,
      width: 511,
      height: 74,
    })
    if (softTablePreset) {
      headlineFindings.setTheme({ styleId: softTablePreset.id, options: { firstRow: true } })
    }
    for (let column = 0; column < 3; column += 1) {
      headlineFindings.getCell(0, column).setStyle({
        fill: { color: blue },
        fontColor: '#FFFFFF',
        horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
        verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
      })
      headlineFindings.getCell(1, column).setStyle({
        fill: { color: soft },
        fontColor: ink,
        horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
        verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
      })
    }
    cover
      .insertTextBox({
        text: '1  INTRODUCTION',
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
      text: 'Launch readiness is often treated as a final checklist. This framing obscures its value as an early operational signal. We test whether a compact, verified index can identify failure exposure while teams still have time to intervene.',
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
        text: 'CONTRIBUTION',
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
      text: 'The study separates completion from verification, estimates when readiness becomes predictive, and translates the result into an operating threshold that product, engineering, and go-to-market leaders can use.',
      left: 311,
      top: 636,
      width: 242,
      height: 116,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })

    const methods = pdf.insertPage()
    addPageFrame(methods, 2, 'METHODS & DATA')
    methods
      .insertTextBox({
        text: '2  Study design and evidence base',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    methods.insertParagraph({
      text: 'A longitudinal design links readiness signals recorded before launch to operating outcomes observed during the first thirty production days.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    methods
      .insertTextBox({
        text: '2.1  SAMPLE & PROTOCOL',
        left: 42,
        top: 174,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    methods.insertParagraph({
      text: 'We assembled release records from six product groups in financial services, collaboration software, analytics, and developer infrastructure. Eligible launches introduced a material customer-facing capability in at least one production market. Routine patches and experiments below 5% traffic were excluded.\n\nTwo independent reviewers scored each launch at T−28, T−14, T−7, and T−1 days. Disagreements above five points triggered an evidence review. Outcome assessors were blinded to readiness scores.',
      left: 42,
      top: 200,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    methods
      .insertTextBox({
        text: 'SAMPLE PROFILE',
        left: 311,
        top: 174,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    const sampleProfile = methods.insertTable({
      rowCount: 6,
      columnCount: 2,
      cellTexts: [
        'Characteristic',
        'Observed',
        'Releases',
        '186',
        'Median launch team',
        '34 people',
        'Median markets',
        '5',
        'Regulated releases',
        '41%',
        'Incident-free at day 30',
        '78%',
      ],
      left: 311,
      top: 200,
      width: 242,
      height: 174,
    })
    if (horizontalTablePreset) {
      sampleProfile.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    methods.insertDivider({
      left: 42,
      top: 398,
      width: 511,
      strokeColor: rule,
      strokeWidth: 0.8,
    })
    methods
      .insertTextBox({
        text: '2.2  MODEL SPECIFICATION',
        left: 42,
        top: 420,
        width: 260,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    methods
      .insertTextBox({
        text: 'logit(incident-free) = β₀ + β₁ readinessₜ₋₁₄ + β₂ scope + β₃ market count + uₚ',
        left: 66,
        top: 454,
        width: 463,
        height: 30,
        fontSize: 11,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ italic: true })
    methods.insertAnnotation({
      annotationType: univerAPI.Enum.PdfAnnotationType.UNDERLINE,
      left: 64,
      top: 473,
      width: 466,
      height: 12,
      markup: { color: cyan, opacity: 0.7 },
    })
    methods
      .insertTextBox({
        text: 'TABLE 1  ·  CONSTRUCTS AND MEASUREMENT',
        left: 42,
        top: 510,
        width: 350,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const variableTable = methods.insertTable({
      rowCount: 5,
      columnCount: 3,
      cellTexts: [
        'Construct',
        'Operational definition',
        'Scale',
        'Readiness',
        'Verified evidence across five domains',
        '0–100',
        'Reliability',
        'No severity 1–2 launch incident',
        'Binary',
        'Scope',
        'Changed services and customer paths',
        'Count',
        'Maturity',
        'Prior twelve-month release performance',
        'Index',
      ],
      left: 42,
      top: 536,
      width: 511,
      height: 174,
    })
    if (horizontalTablePreset) {
      variableTable.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    methods.insertParagraph({
      text: 'Notes. Product-group random intercepts are included in all models. Standard errors are clustered by release train. Missing item-level evidence (2.1%) is multiply imputed.',
      left: 42,
      top: 726,
      width: 511,
      height: 38,
      fontSize: captionFontSize,
      fontFamily: serif,
      fill: muted,
    })

    const results = pdf.insertPage()
    addPageFrame(results, 3, 'RESULTS')
    results
      .insertTextBox({
        text: '3  Readiness predicts reliable delivery',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    results.insertParagraph({
      text: 'The signal strengthens sharply between T−28 and T−14 days, then plateaus. Verification produces a materially larger effect than self-reported completion.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    results
      .insertTextBox({
        text: 'FIGURE 1  ·  INCIDENT-FREE RELEASES BY READINESS STAGE',
        left: 42,
        top: 174,
        width: 400,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const chartRows = [
      { label: 'Baseline planning', value: '58%', width: 180, color: '#93A4B5' },
      { label: 'Owner-confirmed', value: '76%', width: 236, color: '#4E86A4' },
      { label: 'Evidence-verified', value: '91%', width: 282, color: cyan },
      { label: 'Post-launch day 30', value: '96%', width: 298, color: blue },
    ]
    chartRows.forEach((row, index) => {
      const top = 216 + index * 40
      results.insertTextBox({
        text: row.label,
        left: 42,
        top: top - 7,
        width: 120,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: ink,
      })
      results.insertDivider({
        left: 170,
        top,
        width: 310,
        strokeColor: soft,
        strokeWidth: 10,
      })
      results.insertDivider({
        left: 170,
        top,
        width: row.width,
        strokeColor: row.color,
        strokeWidth: 10,
      })
      results
        .insertTextBox({
          text: row.value,
          left: 494,
          top: top - 8,
          width: 54,
          height: 20,
          fontSize: 10,
          fontFamily: sans,
          fill: row.color,
        })
        .setTextStyle({ bold: true })
    })
    results.insertParagraph({
      text: 'Share of releases with no severity 1–2 incident during the first thirty production days. Bars are descriptive; adjusted estimates appear below.',
      left: 170,
      top: 374,
      width: 378,
      height: 30,
      fontSize: captionFontSize,
      fontFamily: serif,
      fill: muted,
    })
    results
      .insertTextBox({
        text: 'TABLE 2  ·  ADJUSTED ASSOCIATION WITH INCIDENT-FREE DELIVERY',
        left: 42,
        top: 420,
        width: 430,
        height: 18,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    const coefficientTable = results.insertTable({
      rowCount: 6,
      columnCount: 5,
      cellTexts: [
        'Predictor',
        'β',
        'SE',
        'p',
        'Risk Δ',
        'Readiness, +10',
        '0.42',
        '0.09',
        '<.001',
        '−18.4%',
        'Verified evidence',
        '0.31',
        '0.08',
        '<.001',
        '−11.2%',
        'Market count',
        '−0.08',
        '0.03',
        '.012',
        '+3.1%',
        'Changed services',
        '−0.05',
        '0.02',
        '.021',
        '+2.4%',
        'Team maturity',
        '0.19',
        '0.07',
        '.006',
        '−6.8%',
      ],
      left: 42,
      top: 446,
      width: 511,
      height: 202,
    })
    if (horizontalTablePreset) {
      coefficientTable.setTheme({ styleId: horizontalTablePreset.id, options: { firstRow: true } })
    }
    for (let row = 0; row < 6; row += 1) {
      for (let column = 1; column < 5; column += 1) {
        coefficientTable.getCell(row, column).setStyle({
          horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER,
          verticalAlign: univerAPI.Enum.PdfTableCellVerticalAlign.MIDDLE,
        })
      }
    }
    results.insertAnnotation({
      annotationType: univerAPI.Enum.PdfAnnotationType.HIGHLIGHT,
      left: 40,
      top: 680,
      width: 515,
      height: 54,
      markup: { color: '#F4D97A', opacity: 0.24 },
    })
    results
      .insertTextBox({
        text: 'KEY RESULT  ·  At T−14, verified readiness is already decision-useful; later scoring adds precision but little additional lead time.',
        left: 54,
        top: 693,
        width: 485,
        height: 32,
        fontSize: bodyFontSize,
        fontFamily: serif,
        fill: '#65420E',
      })
      .setTextStyle({ bold: true })

    const discussion = pdf.insertPage()
    addPageFrame(discussion, 4, 'DISCUSSION')
    discussion
      .insertTextBox({
        text: '4  From measurement to operating practice',
        left: 42,
        top: 72,
        width: 511,
        height: 34,
        fontSize: 20,
        fontFamily: serif,
        fill: ink,
      })
      .setTextStyle({ bold: true })
    discussion.insertParagraph({
      text: 'Readiness is most valuable when it changes the timing and quality of a decision—not when it merely documents that work occurred.',
      left: 42,
      top: 116,
      width: 500,
      height: 40,
      fontSize: leadFontSize,
      fontFamily: serif,
      fill: muted,
    })
    discussion
      .insertTextBox({
        text: '4.1  INTERPRETATION',
        left: 42,
        top: 176,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    discussion.insertParagraph({
      text: 'The observed effect is not driven by checklist volume. Teams with strong outcomes produced fewer, better-evidenced signals and resolved ownership ambiguity earlier. The T−14 threshold appears to balance information quality with remaining intervention capacity.\n\nVerification also changes the social function of readiness reviews: evidence makes dependencies discussable across product, engineering, commercial, support, and regional teams.',
      left: 42,
      top: 202,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    discussion
      .insertTextBox({
        text: '4.2  LIMITATIONS',
        left: 311,
        top: 176,
        width: 242,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    discussion.insertParagraph({
      text: 'The sample overrepresents enterprise software and mature release organizations. Readiness may behave differently in consumer products, continuous deployment settings, or small teams with highly shared context. Residual confounding is possible because disciplined teams may both score higher and respond more effectively.\n\nFuture work should test the index prospectively and estimate category-specific weights.',
      left: 311,
      top: 202,
      width: 242,
      height: 174,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    discussion.insertDivider({
      left: 42,
      top: 400,
      width: 511,
      strokeColor: rule,
      strokeWidth: 0.8,
    })
    discussion
      .insertTextBox({
        text: 'PRACTICE IMPLICATIONS',
        left: 42,
        top: 422,
        width: 280,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    const practiceImplications = [
      'Set a formal evidence review fourteen days before launch.',
      'Separate owner-reported completion from independently verified evidence.',
      'Escalate missing controls and ambiguous ownership, not low aggregate scores alone.',
      'Track score movement alongside intervention capacity and residual exposure.',
    ]
    practiceImplications.forEach((text, index) => {
      discussion
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
    discussion
      .insertTextBox({
        text: 'CONCLUSION',
        left: 42,
        top: 596,
        width: 180,
        height: 18,
        fontSize: labelFontSize,
        fontFamily: sans,
        fill: blue,
      })
      .setTextStyle({ bold: true, charSpacing: 0.6 })
    discussion.insertParagraph({
      text: 'A concise readiness index can function as an early-warning system for global software launches. Its predictive value comes from verified cross-functional evidence and from measuring soon enough to act. Organizations should treat readiness as a decision instrument rather than a ceremonial gate.',
      left: 42,
      top: 622,
      width: 511,
      height: 68,
      fontSize: bodyFontSize,
      fontFamily: serif,
      fill: ink,
    })
    discussion
      .insertTextBox({
        text: 'SELECTED REFERENCES',
        left: 42,
        top: 708,
        width: 220,
        height: 16,
        fontSize: captionFontSize,
        fontFamily: sans,
        fill: muted,
      })
      .setTextStyle({ bold: true, charSpacing: 0.5 })
    discussion.insertParagraph({
      text: 'Forsgren N, Humble J, Kim G. Accelerate. IT Revolution; 2018.  ·  Edmondson AC. The Fearless Organization. Wiley; 2019.  ·  Kerzner H. Project Management Metrics, KPIs, and Dashboards. Wiley; 2022.  ·  Shah P, Chen M. Evidence quality in distributed release decisions. J Prod Syst. 2025;17(2):44–61.',
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
    const frame = frameRef.current

    function containDemoWheel(event: WheelEvent) {
      let element = event.target instanceof Element ? event.target : null

      while (element && element !== frame) {
        if (element instanceof HTMLElement) {
          const style = window.getComputedStyle(element)
          const canScrollVertically =
            /auto|scroll|overlay/.test(style.overflowY) &&
            element.scrollHeight > element.clientHeight &&
            ((event.deltaY < 0 && element.scrollTop > 0) ||
              (event.deltaY > 0 && element.scrollTop + element.clientHeight < element.scrollHeight))
          const canScrollHorizontally =
            /auto|scroll|overlay/.test(style.overflowX) &&
            element.scrollWidth > element.clientWidth &&
            ((event.deltaX < 0 && element.scrollLeft > 0) ||
              (event.deltaX > 0 && element.scrollLeft + element.clientWidth < element.scrollWidth))

          if (canScrollVertically || canScrollHorizontally) return
        }
        element = element.parentElement
      }

      event.preventDefault()
    }

    frame.addEventListener('wheel', containDemoWheel, { passive: false })
    return () => frame.removeEventListener('wheel', containDemoWheel)
  }, [])

  useEffect(() => {
    const univer = new UniverCore({
      darkMode: theme === 'dark',
      locale: CoreLocaleType.EN_US,
      locales: {
        [CoreLocaleType.EN_US]: mergeCoreLocales(
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
          ShapeEditorUIEnUS,
          SlidesUIEnUS,
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
    univer.registerPlugin(UniverLicensePlugin)

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
      univer.createUnit(UniverInstanceType.UNIVER_SHEET, workbookData)
    } else if (type === 'slides') {
      univer.registerPlugin(UniverSlidesPlugin)
      univer.registerPlugin(UniverSlidesUIPlugin)
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
  }, [documentMode, seedBase, seedBoard, seedPdf, theme, type])

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
      activeClass: 'text-green-700 dark:text-green-300',
      beamColor: '#35BD4B',
    },
    {
      key: 'docs' as const,
      label: 'Docs',
      fullLabel: 'Univer Docs',
      icon: DocsMultiIcon,
      activeClass: 'text-blue-700 dark:text-blue-300',
      beamColor: '#4B7DFF',
    },
    {
      key: 'slides' as const,
      label: 'Slides',
      fullLabel: 'Univer Slides',
      icon: SlidesMultiIcon,
      activeClass: 'text-orange-700 dark:text-orange-300',
      beamColor: '#FF6B4B',
    },
    {
      key: 'bases' as const,
      label: 'Bases',
      fullLabel: 'Univer Bases',
      icon: BasesMultiIcon,
      activeClass: 'text-teal-700 dark:text-teal-300',
      beamColor: '#14B8A6',
    },
    {
      key: 'boards' as const,
      label: 'Boards',
      fullLabel: 'Univer Boards',
      icon: BoardsMultiIcon,
      activeClass: 'text-violet-700 dark:text-violet-300',
      beamColor: '#8B5CF6',
    },
    {
      key: 'pdfs' as const,
      label: 'PDFs',
      fullLabel: 'Univer PDFs',
      icon: PdfMultiIcon,
      activeClass: 'text-red-700 dark:text-red-300',
      beamColor: '#E5484D',
    },
  ]

  const activeIndex = tabs.findIndex((tab) => tab.key === type)

  return (
    <div className="w-full">
      <div className={clsx('flex justify-center px-4', type === 'docs' ? 'mb-2.5' : 'mb-5')}>
        <div
          role="tablist"
          aria-label={tablistLabel}
          className="relative grid w-full max-w-sm grid-cols-3 gap-0.5 rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-0.5 sm:inline-flex sm:w-auto sm:max-w-none dark:border-neutral-700/80 dark:bg-neutral-800/80"
        >
          {tabs.map((tab) => {
            const isActive = type === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                id={`univer-tab-${tab.key}`}
                role="tab"
                type="button"
                aria-label={tab.fullLabel}
                aria-controls="univer-product-demo"
                aria-selected={isActive}
                onClick={() => handleChangeType(tab.key)}
                className={clsx(
                  'relative flex min-h-8.5 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] leading-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none sm:px-3 sm:text-xs',
                  isActive
                    ? clsx('font-semibold', tab.activeClass)
                    : `font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 hover:dark:text-neutral-300`,
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="univer-active-tab"
                    className="absolute inset-0 rounded-lg border border-neutral-200/90 bg-white shadow-xs dark:border-neutral-600 dark:bg-neutral-700"
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon aria-hidden className="size-4 shrink-0" />
                  <span>{tab.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {type === 'docs' && (
        <motion.div
          className="mb-4 flex justify-center px-4"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            role="tablist"
            aria-label="Document layout mode"
            className="inline-grid grid-cols-2 rounded-xl border border-neutral-200 bg-white/80 p-1 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80"
          >
            {(['modern', 'traditional'] as const).map((mode) => {
              const isActive = documentMode === mode
              return (
                <button
                  key={mode}
                  role="tab"
                  type="button"
                  aria-controls="univer-product-demo"
                  aria-selected={isActive}
                  onClick={() => handleChangeDocumentMode(mode)}
                  className={clsx(
                    'rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 hover:dark:bg-neutral-800 hover:dark:text-neutral-100',
                  )}
                >
                  {mode === 'modern' ? 'Modern' : 'Traditional'}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      <div
        ref={frameRef}
        id="univer-product-demo"
        role="tabpanel"
        aria-labelledby={`univer-tab-${type}`}
        className="relative mx-auto h-[34rem] w-7xl max-w-full overflow-hidden rounded-2xl border border-white/80 bg-white/50 p-0.5 shadow-2xl shadow-sky-950/10 sm:h-160 dark:border-neutral-800 dark:bg-neutral-950/50"
      >
        {/* Mask / Loading */}
        <AnimatePresence>
          {!steady && (
            <motion.div
              className={`pointer-events-auto absolute inset-0 z-10 flex size-full items-center justify-center bg-white/30 backdrop-blur-sm dark:bg-neutral-900/30`}
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
          className={clsx('relative z-1 size-full blur-3xl transition-all duration-300', {
            'blur-none': steady,
          })}
        >
          <div ref={divRef} className="home-univer-demo h-full" />
        </div>

        {/* Border Beam */}
        <BorderBeam
          key={type === 'docs' ? `${type}-${documentMode}` : type}
          delay={0}
          size={600}
          borderWidth={2}
          colorFrom={tabs[activeIndex].beamColor}
          colorTo={tabs[activeIndex].beamColor}
          className="opacity-40"
        />
      </div>
    </div>
  )
}
