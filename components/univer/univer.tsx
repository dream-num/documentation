'use client'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { createBoardContainerElement, createBoardStickyElement, createBoardTextBoxShapeElement, UniverBoardsPlugin } from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorUIEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { UniverSlidesUIPlugin } from '@univerjs-pro/slides-ui'
import SlidesUIEnUS from '@univerjs-pro/slides-ui/locale/en-US'
import { LocaleType as CoreLocaleType, mergeLocales as mergeCoreLocales, Univer as UniverCore, UniverInstanceType } from '@univerjs/core'
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
import { BookTextIcon, DatabaseIcon, PresentationIcon, ShapesIcon, SheetIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/animata/spinner'
import { BorderBeam } from '@/components/magicui/border-beam'
import { clsx } from '@/lib/clsx'
import { SLIDE_DATA } from '@/showcase/slides/basic-via-plugin/code/data'
import { documentData, workbookData } from './data'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'
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

type UniverType = 'sheets' | 'docs' | 'slides' | 'bases' | 'boards'

const showcaseCopy: Record<UniverType, {
  eyebrow: string
  title: string
  summary: string
  stats: Array<{ label: string, value: string }>
  capabilities: string[]
}> = {
  sheets: {
    eyebrow: 'Spreadsheet ops cockpit',
    title: 'Structured launch tracker with validation, progress and conditional signals.',
    summary: 'A dense workbook view that shows formulas, typed cells, list validation, date columns and color-coded progress in the same grid.',
    stats: [
      { label: 'Rows', value: '20' },
      { label: 'Rules', value: '6' },
      { label: 'Signals', value: '3' },
    ],
    capabilities: ['Data validation', 'Conditional formatting', 'Currency/date formats', 'Task operations'],
  },
  docs: {
    eyebrow: 'Document authoring',
    title: 'Long-form document canvas with styled text and page layout.',
    summary: 'A paginated document surface for rich text, editorial structure and precise page rendering inside the same Univer runtime.',
    stats: [
      { label: 'Pages', value: '1' },
      { label: 'Text runs', value: '8' },
      { label: 'Layout', value: 'A4' },
    ],
    capabilities: ['Rich text runs', 'Page margins', 'Document styling', 'Editor chrome'],
  },
  slides: {
    eyebrow: 'Presentation design',
    title: 'A real slide deck surface, not a static thumbnail.',
    summary: 'The example loads a slide unit with shapes, text layers, page order and the Slides Pro canvas controls.',
    stats: [
      { label: 'Slides', value: '2' },
      { label: 'Layers', value: '9' },
      { label: 'Mode', value: 'Pro' },
    ],
    capabilities: ['Shape layers', 'Slide page model', 'Themeable canvas', 'Plugin mode'],
  },
  bases: {
    eyebrow: 'No-code database',
    title: 'A base workspace for records, typed fields, views and operational status.',
    summary: 'The seed data creates a product launch base with status, owners, progress and roadmap views through the Facade API.',
    stats: [
      { label: 'Records', value: '4' },
      { label: 'Fields', value: '6' },
      { label: 'Views', value: '2' },
    ],
    capabilities: ['Typed fields', 'Grid views', 'Single-select status', 'Facade mutations'],
  },
  boards: {
    eyebrow: 'Visual collaboration',
    title: 'A whiteboard made from containers, sticky notes and structured groups.',
    summary: 'The board example creates a live board unit from Facade APIs and renders a planning map for product workflows.',
    stats: [
      { label: 'Objects', value: '10' },
      { label: 'Frames', value: '2' },
      { label: 'Canvas', value: 'Live' },
    ],
    capabilities: ['Canvas objects', 'Sticky notes', 'Containers', 'Board facade'],
  },
}

function seedBase(univerAPI: ReturnType<typeof FUniver.newAPI>) {
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
  const table = base.createTable({ id: 'tasks', name: 'Launch Tasks', primaryFieldName: 'Task' })
  const status = table.addField({
    id: 'status',
    name: 'Status',
    type: 'singleSelect',
    config: {
      options: [
        { id: 'todo', name: 'Todo', color: 'blue' },
        { id: 'doing', name: 'Doing', color: 'yellow' },
        { id: 'done', name: 'Done', color: 'green' },
      ],
    },
    defaultValue: 'todo',
  })
  const owner = table.addField({ id: 'owner', name: 'Owner', type: 'text', config: {} })
  const progress = table.addField({ id: 'progress', name: 'Progress', type: 'progress', config: {} })
  const channel = table.addField({ id: 'channel', name: 'Channel', type: 'singleSelect', config: { options: [{ id: 'web', name: 'Web', color: 'blue' }, { id: 'sdk', name: 'SDK', color: 'purple' }, { id: 'docs', name: 'Docs', color: 'green' }] } })
  const risk = table.addField({ id: 'risk', name: 'Risk', type: 'singleSelect', config: { options: [{ id: 'low', name: 'Low', color: 'green' }, { id: 'medium', name: 'Medium', color: 'yellow' }, { id: 'high', name: 'High', color: 'red' }] } })

  table.addRecords([
    {
      id: 'task-positioning',
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
      id: 'task-demo',
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
      id: 'task-examples',
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
      id: 'task-feedback',
      values: {
        [table.getPrimaryFieldId()]: 'Route beta feedback into release notes',
        [status.getId()]: 'doing',
        [owner.getId()]: 'Product',
        [progress.getId()]: 50,
        [channel.getId()]: 'web',
        [risk.getId()]: 'medium',
      },
    },
  ])

  table.createView({ id: 'grid-main', name: 'Roadmap', type: 'grid' })
  table.createView({ id: 'grid-risk', name: 'Risk Queue', type: 'grid' })
}

function seedBoard(univerAPI: ReturnType<typeof FUniver.newAPI>) {
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
      text: 'Sheets',
      textStyle: { fontSize: 20, bold: true, color: '#166534' },
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
      text: 'Docs',
      textStyle: { fontSize: 20, bold: true, color: '#1E40AF' },
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
      text: 'Slides',
      textStyle: { fontSize: 20, bold: true, color: '#991B1B' },
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
      text: 'Bases',
      textStyle: { fontSize: 20, bold: true, color: '#0F766E' },
    }),
  ])
}

export default function Univer() {
  const divRef = useRef<HTMLDivElement>(null!)

  const [type, setType] = useState<UniverType>('sheets')
  const [steady, setSteady] = useState(false)

  const { theme } = useTheme()

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
        ),
      },
    })

    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverFormulaEnginePlugin)
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
      univer.createUnit(UniverInstanceType.UNIVER_SLIDE, SLIDE_DATA)
    } else if (type === 'bases') {
      univer.registerPlugin(UniverBasesPlugin)
      univer.registerPlugin(UniverBasesUIPlugin)
    } else if (type === 'boards') {
      univer.registerPlugin(UniverBoardsPlugin)
      univer.registerPlugin(UniverBoardsUIPlugin)
    }

    const univerAPI = FUniver.newAPI(univer)

    if (type === 'bases') {
      seedBase(univerAPI)
    } else if (type === 'boards') {
      seedBoard(univerAPI)
    }

    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, (event) => {
      if (event.stage === univerAPI.Enum.LifecycleStages.Rendered) {
        setSteady(true)
      }
    })

    return () => {
      univerAPI.dispose()
    }
  }, [theme, type])

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
  ]

  const activeIndex = tabs.findIndex(tab => tab.key === type)
  const activeShowcase = showcaseCopy[type]

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <header className="mb-5 flex flex-col items-center gap-4">
        <div
          className={`
            relative inline-flex items-center rounded-full bg-neutral-100 p-0.5
            dark:bg-neutral-800
          `}
        >
          {tabs.map((tab) => {
            const isActive = type === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleChangeType(tab.key)}
                className={clsx(
                  `
                    relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition-colors duration-200
                    md:px-4
                  `,
                  isActive
                    ? clsx('font-semibold', tab.activeClass)
                    : `
                      font-medium text-neutral-500
                      hover:text-neutral-700
                      dark:text-neutral-400
                      dark:hover:text-neutral-300
                    `,
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="univer-active-tab"
                    className={`
                      absolute inset-0 rounded-full bg-white shadow-xs
                      dark:bg-neutral-700
                    `}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="size-3.5" />
                  <span
                    className="
                      hidden
                      md:inline
                    "
                  >
                    {tab.fullLabel}
                  </span>
                  <span className="md:hidden">{tab.label}</span>
                </span>
              </button>
            )
          })}
        </div>

        <section
          className="
            grid w-7xl max-w-full grid-cols-1 gap-4 rounded-xl border border-neutral-200 bg-white/85 p-4 shadow-sm
            md:grid-cols-[1.3fr_0.7fr]
            dark:border-neutral-800 dark:bg-neutral-950/70
          "
        >
          <div className="min-w-0">
            <div className={clsx('mb-2 text-xs font-semibold tracking-wide uppercase', tabs[activeIndex].activeClass)}>
              {activeShowcase.eyebrow}
            </div>
            <h3
              className="
                text-lg font-semibold text-balance text-neutral-950
                dark:text-neutral-50
              "
            >
              {activeShowcase.title}
            </h3>
            <p
              className="
                mt-2 max-w-3xl text-sm/6 text-neutral-600
                dark:text-neutral-400
              "
            >
              {activeShowcase.summary}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeShowcase.capabilities.map(capability => (
                <span
                  key={capability}
                  className="
                    rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium
                    text-neutral-700
                    dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300
                  "
                >
                  {capability}
                </span>
              ))}
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {activeShowcase.stats.map(stat => (
              <div
                key={stat.label}
                className="
                  rounded-lg border border-neutral-200 bg-neutral-50 p-3
                  dark:border-neutral-800 dark:bg-neutral-900
                "
              >
                <dt
                  className="
                    text-xs font-medium text-neutral-500
                    dark:text-neutral-400
                  "
                >
                  {stat.label}
                </dt>
                <dd
                  className="
                    mt-1 text-xl font-semibold text-neutral-950
                    dark:text-neutral-50
                  "
                >
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </header>

      {/* Playground Container */}
      <div
        className="relative mx-auto h-160 w-7xl max-w-full overflow-hidden rounded-xl p-0.5 shadow-xl"
      >
        {/* Mask / Loading */}
        <AnimatePresence>
          {!steady && (
            <motion.div
              className={`
                pointer-events-auto absolute inset-0 z-10 flex size-full items-center justify-center bg-white/30
                backdrop-blur-sm
                dark:bg-neutral-900/30
              `}
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
          <div ref={divRef} className="h-full" />
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
