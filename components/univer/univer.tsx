'use client'

import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import {
  createBoardContainerElement,
  createBoardStickyElement,
  createBoardTextBoxShapeElement,
  UniverBoardsPlugin,
} from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
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
import { BookTextIcon, DatabaseIcon, PresentationIcon, ShapesIcon, SheetIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

import Spinner from '@/components/animata/spinner'
import { BorderBeam } from '@/components/magicui/border-beam'
import { clsx } from '@/lib/clsx'
import { SLIDE_DATA } from '@/showcase/slides/basic-via-plugin/code/data'

import { documentData, workbookData } from './data'

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

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs-pro/boards/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'

type UniverType = 'sheets' | 'docs' | 'slides' | 'bases' | 'boards'

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
  ])

  table.createView('Roadmap', univerAPI.Enum.BaseViewType.Grid)
  table.createView('Risk Queue', univerAPI.Enum.BaseViewType.Grid)
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
      text: 'Docs',
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
      text: 'Slides',
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
      text: 'Bases',
      textStyle: { fs: 20, bl: BooleanNumber.TRUE, cl: { rgb: '#0F766E' } },
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

  const activeIndex = tabs.findIndex((tab) => tab.key === type)

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <header className="mb-5 flex flex-col items-center gap-4">
        <div className={`relative inline-flex items-center rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800`}>
          {tabs.map((tab) => {
            const isActive = type === tab.key
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleChangeType(tab.key)}
                className={clsx(
                  `relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition-colors duration-200 md:px-4`,
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
                  <span
                    className="hidden md:inline"
                  >
                    {tab.fullLabel}
                  </span>
                  <span className="md:hidden">{tab.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Playground Container */}
      <div className="relative mx-auto h-160 w-7xl max-w-full overflow-hidden rounded-xl p-0.5 shadow-xl">
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
