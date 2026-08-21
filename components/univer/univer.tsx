'use client'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import {
  createBoardConnectorElement,
  createBoardContainerElement,
  createBoardStickyElement,
  createBoardTextBoxShapeElement,
  UniverBoardsPlugin,
} from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
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
  LocaleType as CoreLocaleType,
  mergeLocales as mergeCoreLocales,
  Univer as UniverCore,
  UniverInstanceType,
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
import { BookTextIcon, DatabaseIcon, FileTextIcon, PresentationIcon, ShapesIcon, SheetIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

import Spinner from '@/components/animata/spinner'
import { BorderBeam } from '@/components/magicui/border-beam'
import { clsx } from '@/lib/clsx'

import { documentData, workbookData } from './data'
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

export interface IUniverProps {
  tablistLabel: string
}

export default function Univer({ tablistLabel }: IUniverProps) {
  const divRef = useRef<HTMLDivElement>(null!)

  const [type, setType] = useState<UniverType>('sheets')
  const [steady, setSteady] = useState(false)

  const { theme } = useTheme()

  const seedBase = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const now = Date.now()
    const base = univerAPI.createBase({
      id: 'bases-home-demo',
      name: 'Product Launch',
      schemaVersion: 1,
      createdAt: now,
      updatedAt: now,
      tables: {},
      tableOrder: [],
    })
    const table = base.insertTable('Launch Tasks', { primaryFieldName: 'Task' })
    const status = table.addField('Status', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'todo', name: 'Todo', color: 'blue' },
            { id: 'doing', name: 'Doing', color: 'yellow' },
            { id: 'done', name: 'Done', color: 'green' },
          ],
        },
        defaultValue: 'todo',
      },
    })
    const owner = table.addField('Owner', univerAPI.Enum.BaseFieldType.Text)
    const progress = table.addField('Progress', univerAPI.Enum.BaseFieldType.Progress)
    const channel = table.addField('Channel', univerAPI.Enum.BaseFieldType.SingleSelect, {
      field: {
        config: {
          options: [
            { id: 'web', name: 'Web', color: 'blue' },
            { id: 'sdk', name: 'SDK', color: 'purple' },
            { id: 'docs', name: 'Docs', color: 'green' },
          ],
        },
      },
    })
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
          [table.getPrimaryFieldId()]: 'Align launch positioning',
          [status.getId()]: 'done',
          [owner.getId()]: 'Docs',
          [progress.getId()]: 100,
          [channel.getId()]: 'docs',
          [risk.getId()]: 'low',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Publish homepage demo',
          [status.getId()]: 'doing',
          [owner.getId()]: 'Website',
          [progress.getId()]: 65,
          [channel.getId()]: 'web',
          [risk.getId()]: 'medium',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Connect example datasets',
          [status.getId()]: 'todo',
          [owner.getId()]: 'Platform',
          [progress.getId()]: 30,
          [channel.getId()]: 'sdk',
          [risk.getId()]: 'high',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Route beta feedback into release notes',
          [status.getId()]: 'doing',
          [owner.getId()]: 'Product',
          [progress.getId()]: 50,
          [channel.getId()]: 'web',
          [risk.getId()]: 'medium',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Validate PDF editing workflow',
          [status.getId()]: 'doing',
          [owner.getId()]: 'Platform',
          [progress.getId()]: 75,
          [channel.getId()]: 'sdk',
          [risk.getId()]: 'low',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Localize launch campaign',
          [status.getId()]: 'doing',
          [owner.getId()]: 'Growth',
          [progress.getId()]: 58,
          [channel.getId()]: 'web',
          [risk.getId()]: 'medium',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Complete partner enablement',
          [status.getId()]: 'todo',
          [owner.getId()]: 'Sales',
          [progress.getId()]: 42,
          [channel.getId()]: 'docs',
          [risk.getId()]: 'high',
        },
      },
      {
        values: {
          [table.getPrimaryFieldId()]: 'Run go-live review',
          [status.getId()]: 'todo',
          [owner.getId()]: 'Product',
          [progress.getId()]: 20,
          [channel.getId()]: 'web',
          [risk.getId()]: 'medium',
        },
      },
    ])

    table.createView('Roadmap', univerAPI.Enum.BaseViewType.Grid)
    table.createView('Risk Queue', univerAPI.Enum.BaseViewType.Grid)
  }, [])

  const seedBoard = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const board = univerAPI.createBoard({
      id: 'boards-home-demo',
      name: 'Homepage Planning Board',
    })

    board.addElements([
      createBoardContainerElement({
        id: 'container-homepage',
        left: 64,
        top: 52,
        width: 900,
        height: 360,
        title: 'Product workflow map',
        fillColor: '#F8FAFC',
        strokeColor: '#94A3B8',
        strokeWidth: 1,
      }),
      createBoardContainerElement({
        id: 'container-release',
        parentId: 'container-homepage',
        left: 112,
        top: 116,
        width: 760,
        height: 216,
        title: 'Release readiness',
        fillColor: '#FFFFFF',
        strokeColor: '#CBD5E1',
        strokeWidth: 1,
      }),
      createBoardStickyElement({
        id: 'sticky-sheets',
        parentId: 'container-release',
        left: 148,
        top: 170,
        width: 152,
        height: 112,
        fillColor: '#DCFCE7',
      }),
      createBoardTextBoxShapeElement({
        id: 'text-sheets',
        parentId: 'container-release',
        left: 170,
        top: 204,
        width: 112,
        height: 36,
        text: 'Research\n12 signals',
        textStyle: { fs: 20, bl: BooleanNumber.TRUE, cl: { rgb: '#166534' } },
      }),
      createBoardStickyElement({
        id: 'sticky-docs',
        parentId: 'container-release',
        left: 324,
        top: 170,
        width: 152,
        height: 112,
        fillColor: '#DBEAFE',
      }),
      createBoardTextBoxShapeElement({
        id: 'text-docs',
        parentId: 'container-release',
        left: 352,
        top: 204,
        width: 96,
        height: 36,
        text: 'Build\n6 surfaces',
        textStyle: { fs: 20, bl: BooleanNumber.TRUE, cl: { rgb: '#1E40AF' } },
      }),
      createBoardStickyElement({
        id: 'sticky-slides',
        parentId: 'container-release',
        left: 500,
        top: 170,
        width: 152,
        height: 112,
        fillColor: '#FEE2E2',
      }),
      createBoardTextBoxShapeElement({
        id: 'text-slides',
        parentId: 'container-release',
        left: 522,
        top: 204,
        width: 112,
        height: 36,
        text: 'Validate\n3 regions',
        textStyle: { fs: 20, bl: BooleanNumber.TRUE, cl: { rgb: '#991B1B' } },
      }),
      createBoardStickyElement({
        id: 'sticky-bases',
        parentId: 'container-release',
        left: 676,
        top: 170,
        width: 152,
        height: 112,
        fillColor: '#CCFBF1',
      }),
      createBoardTextBoxShapeElement({
        id: 'text-bases',
        parentId: 'container-release',
        left: 698,
        top: 204,
        width: 112,
        height: 36,
        text: 'Launch\nSep 2',
        textStyle: { fs: 20, bl: BooleanNumber.TRUE, cl: { rgb: '#0F766E' } },
      }),
      createBoardConnectorElement({
        id: 'connector-research-build',
        start: { kind: 'free', x: 300, y: 226 },
        end: { kind: 'free', x: 324, y: 226 },
        routing: 'straight',
        style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
      }),
      createBoardConnectorElement({
        id: 'connector-build-validate',
        start: { kind: 'free', x: 476, y: 226 },
        end: { kind: 'free', x: 500, y: 226 },
        routing: 'straight',
        style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
      }),
      createBoardConnectorElement({
        id: 'connector-validate-launch',
        start: { kind: 'free', x: 652, y: 226 },
        end: { kind: 'free', x: 676, y: 226 },
        routing: 'straight',
        style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
      }),
      createBoardTextBoxShapeElement({
        id: 'workflow-note',
        parentId: 'container-homepage',
        left: 150,
        top: 352,
        width: 674,
        height: 42,
        text: 'One launch story, connected across every Univer workspace',
        textStyle: { fs: 16, cl: { rgb: '#475569' } },
      }),
    ])
  }, [])

  const seedPdf = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const pdf = univerAPI.createPdf({
      id: 'pdfs-home-demo',
      name: 'Q3 Launch Brief',
    })
    const cover = pdf.getPageByIndex(0)
    if (!cover) return

    cover
      .insertTextBox({
        text: 'Q3 PRODUCT LAUNCH',
        left: 52,
        top: 48,
        width: 240,
        height: 28,
        fontSize: 12,
        fill: '#0284C7',
      })
      .setTextStyle({ bold: true, charSpacing: 1.4 })
    cover
      .insertTextBox({
        text: 'Launch readiness brief',
        left: 52,
        top: 92,
        width: 490,
        height: 54,
        fontSize: 30,
        fill: '#0F172A',
      })
      .setTextStyle({ bold: true })
    cover.insertParagraph({
      text: 'A concise operating view of product readiness, regional enablement, and the decisions required before go-live.',
      left: 52,
      top: 158,
      width: 490,
      height: 58,
      fontSize: 12,
      fill: '#475569',
    })
    cover.insertDivider({
      left: 52,
      top: 232,
      width: 490,
      strokeColor: '#CBD5E1',
      strokeWidth: 1,
    })
    const metrics = cover.insertTable({
      rowCount: 4,
      columnCount: 3,
      cellTexts: [
        'Signal',
        'Current',
        'Target',
        'Product readiness',
        '82%',
        '90%',
        'Content coverage',
        '68%',
        '85%',
        'Regional enablement',
        '54%',
        '75%',
      ],
      left: 52,
      top: 258,
      width: 490,
      height: 176,
    })
    const tablePreset = univerAPI.getPdfTableThemePresets()[3]
    if (tablePreset) {
      metrics.setTheme({ styleId: tablePreset.id, options: { firstRow: true, bandRow: true } })
    }
    cover.insertAnnotation({
      annotationType: univerAPI.Enum.PdfAnnotationType.HIGHLIGHT,
      left: 48,
      top: 466,
      width: 500,
      height: 54,
      markup: { color: '#FDE047', opacity: 0.28 },
    })
    cover
      .insertTextBox({
        text: 'DECISION  ·  Keep the September 2 launch date and close regional gaps in parallel.',
        left: 60,
        top: 478,
        width: 470,
        height: 28,
        fontSize: 11,
        fill: '#713F12',
      })
      .setTextStyle({ bold: true })

    const checklist = pdf.insertPage()
    checklist
      .insertTextBox({
        text: 'Launch control checklist',
        left: 52,
        top: 52,
        width: 480,
        height: 46,
        fontSize: 26,
        fill: '#0F172A',
      })
      .setTextStyle({ bold: true })
    checklist.insertParagraph({
      text: 'Owners update this page during the daily launch stand-up.',
      left: 52,
      top: 112,
      width: 460,
      height: 36,
      fontSize: 11,
      fill: '#64748B',
    })
    const list = checklist.insertList({
      text: 'Resolve release-blocking defects',
      kind: univerAPI.Enum.PdfListKind.UNORDERED,
      preset: univerAPI.Enum.PdfListPresetId.UNORDERED_CHECK,
      left: 52,
      top: 170,
      width: 490,
      height: 180,
      fontSize: 13,
      fill: '#1E293B',
    })
    list
      .insertItem(1, { text: 'Approve launch messaging' })
      .insertItem(2, { text: 'Verify analytics and dashboards' })
      .insertItem(3, { text: 'Complete partner enablement' })
      .insertItem(4, { text: 'Confirm rollback owner and channel' })
    checklist.insertDivider({
      left: 52,
      top: 388,
      width: 490,
      strokeColor: '#0EA5E9',
      strokeWidth: 2,
    })
    checklist.insertParagraph({
      text: 'Next review: Monday, 09:30\nLaunch owner: Product Operations\nStatus: On track with open regional risk',
      left: 52,
      top: 420,
      width: 490,
      height: 110,
      fontSize: 12,
      fill: '#334155',
    })
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
    })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverLicensePlugin)

    if (type === 'docs') {
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

    if (type === 'bases') {
      seedBase(univerAPI)
    } else if (type === 'boards') {
      seedBoard(univerAPI)
    } else if (type === 'pdfs') {
      seedPdf(univerAPI)
    }

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (event) => {
      if (event.stage === univerAPI.Enum.LifecycleStages.Rendered) {
        setSteady(true)
      }
    })

    return () => {
      univerAPI.dispose()
    }
  }, [seedBase, seedBoard, seedPdf, theme, type])

  function handleChangeType(newType: UniverType) {
    if (newType === type) return
    setSteady(false)
    setType(newType)
  }

  const tabs = [
    {
      key: 'sheets' as const,
      label: 'Sheets',
      fullLabel: 'Univer Sheets',
      icon: SheetIcon,
      activeClass: 'text-green-700 dark:text-green-300',
      beamColor: '#22c55e',
    },
    {
      key: 'docs' as const,
      label: 'Docs',
      fullLabel: 'Univer Docs',
      icon: BookTextIcon,
      activeClass: 'text-blue-700 dark:text-blue-300',
      beamColor: '#3b82f6',
    },
    {
      key: 'slides' as const,
      label: 'Slides',
      fullLabel: 'Univer Slides',
      icon: PresentationIcon,
      activeClass: 'text-red-700 dark:text-red-300',
      beamColor: '#ef4444',
    },
    {
      key: 'bases' as const,
      label: 'Bases',
      fullLabel: 'Univer Bases',
      icon: DatabaseIcon,
      activeClass: 'text-teal-700 dark:text-teal-300',
      beamColor: '#14b8a6',
    },
    {
      key: 'boards' as const,
      label: 'Boards',
      fullLabel: 'Univer Boards',
      icon: ShapesIcon,
      activeClass: 'text-violet-700 dark:text-violet-300',
      beamColor: '#8b5cf6',
    },
    {
      key: 'pdfs' as const,
      label: 'PDFs',
      fullLabel: 'Univer PDFs',
      icon: FileTextIcon,
      activeClass: 'text-amber-700 dark:text-amber-300',
      beamColor: '#f59e0b',
    },
  ]

  const activeIndex = tabs.findIndex((tab) => tab.key === type)

  return (
    <div className="w-full">
      <div className="mb-7 flex justify-center px-4">
        <div
          role="tablist"
          aria-label={tablistLabel}
          className="relative grid w-full max-w-xl grid-cols-3 gap-1 rounded-2xl border border-white/80 bg-white/75 p-1 shadow-lg shadow-sky-950/5 backdrop-blur-md md:w-auto md:max-w-none md:grid-cols-6 md:rounded-full dark:border-neutral-700/80 dark:bg-neutral-900/75"
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
                aria-controls="univer-product-demo"
                aria-selected={isActive}
                onClick={() => handleChangeType(tab.key)}
                className={clsx(
                  `relative flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs transition-colors duration-200 md:rounded-full md:px-4`,
                  isActive
                    ? clsx('font-semibold', tab.activeClass)
                    : `font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 hover:dark:text-neutral-300`,
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="univer-active-tab"
                    className={`absolute inset-0 rounded-full bg-white shadow-xs dark:bg-neutral-700`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  <span className="hidden md:inline">{tab.fullLabel}</span>
                  <span className="md:hidden">{tab.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div
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
          key={type}
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
