import type { IBoardData } from '@univerjs-pro/boards'
import {
  createBoardConnectorElement,
  createBoardContainerElement,
  createBoardTextBoxShapeElement,
  UniverBoardsPlugin,
} from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import InkUIEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { BooleanNumber, HorizontalAlign, LocaleType, mergeLocales, Univer, VerticalAlign } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { unmount } from '@univerjs/design'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { INCIDENT_STAGES, RISK_NOTE } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/ink-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'
import '@univerjs-pro/shape-editor/facade'
import '@univerjs/ui/facade'

export function createIncidentResponseDemo(
  container: HTMLElement,
  darkMode = false,
  _locale: LocaleType = LocaleType.EN_US,
  saved?: IBoardData,
) {
  const data = saved ? structuredClone(saved) : undefined
  if (
    data &&
    (!data.id ||
      !data.pageOrder?.length ||
      !data.pageOrder.every((id) => data.pages?.[id]?.id === id) ||
      !data.activePageId ||
      !data.pages?.[data.activePageId])
  )
    throw new Error('Restore a Canvas ID and complete ordered pages with an active page.')
  const root = document.createElement('div')
  root.className = 'incident-board'
  root.dataset.ready = 'false'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        DrawingUIEnUS,
        BoardsUIEnUS,
        ShapeEditorEnUS,
        InkUIEnUS,
        EmbedUnitEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
          'boards-ui': {
            ...BoardsUIEnUS['boards-ui'],
            settings: { ...BoardsUIEnUS['boards-ui']['settings'], findBoardElements: 'Find canvas elements' },
          },
          'shape-editor-ui': {
            ...ShapeEditorEnUS['shape-editor-ui'],
            formulaBinding: { ...ShapeEditorEnUS['shape-editor-ui']['formulaBinding'], baseUnit: 'Relational Tables' },
            formulaShape: { ...ShapeEditorEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
          },
          'embed-unit-ui': {
            ...EmbedUnitEnUS['embed-unit-ui'],
            referencedUnitViewer: {
              ...EmbedUnitEnUS['embed-unit-ui']['referencedUnitViewer'],
              base: 'Relational Tables',
            },
          },
        },
      ),
    },
  })
  let api: ReturnType<typeof FUniver.newAPI> | undefined
  const owner = window as Window & { univerAPI?: typeof api }
  let disposed = false,
    frame = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  function dispose() {
    if (disposed) return
    disposed = true
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    finish()
    const errors: unknown[] = []
    for (const release of [
      () => unmount(root),
      () => api?.disposeUnit(data?.id ?? 'incident-response-board'),
      () => univer.dispose(),
    ]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === api) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Incident Canvas cleanup failed')
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverDrawingUIPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverBoardsPlugin)
    univer.registerPlugin(UniverBoardsUIPlugin)

    const univerAPI = FUniver.newAPI(univer)
    api = univerAPI
    owner.univerAPI = univerAPI
    const board = univerAPI.createBoard(data ?? { id: 'incident-response-board', name: 'Payments Incident Response' })
    if (!data)
      board.addElements([
        createBoardContainerElement({
          id: 'response-frame',
          left: 45,
          top: 55,
          width: 900,
          height: 490,
          title: 'SEV-1  ·  PAYMENT RETRY STORM  ·  03 SEP 2026',
          fillColor: '#F8FAFC',
          strokeColor: '#94A3B8',
          strokeWidth: 1,
        }),
        ...INCIDENT_STAGES.map(createCard),
        createCard(RISK_NOTE),
        createBoardConnectorElement({
          id: 'detect-contain',
          start: { kind: 'free', x: 310, y: 220 },
          end: { kind: 'free', x: 370, y: 220 },
          routing: 'straight',
          style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
        }),
        createBoardConnectorElement({
          id: 'contain-recover',
          start: { kind: 'free', x: 590, y: 220 },
          end: { kind: 'free', x: 650, y: 220 },
          routing: 'straight',
          style: { stroke: '#64748B', strokeWidth: 2, endMarker: { type: 'filledArrow' } },
        }),
      ])

    function waitForCanvas() {
      if (disposed) return
      const canvas = root.querySelector<HTMLCanvasElement>('[data-board-viewport-host] canvas')
      if (!canvas?.width || !canvas.height || root.querySelector('[data-u-comp="workbench-skeleton-content"]')) {
        frame = requestAnimationFrame(waitForCanvas)
        return
      }
      clearTimeout(timer)
      root.dataset.ready = 'true'
      finish()
    }
    timer = setTimeout(() => {
      if (disposed) return
      cancelAnimationFrame(frame)
      root.dataset.error = 'startup'
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'The incident Canvas could not load. Reload to retry.'
      root.prepend(alert)
      finish()
    }, 20000)
    frame = requestAnimationFrame(waitForCanvas)
    return { univerAPI, ready, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}

function createCard(item: typeof RISK_NOTE | (typeof INCIDENT_STAGES)[number]) {
  const card = createBoardTextBoxShapeElement({
    id: item.id,
    left: item.left,
    top: item.top,
    width: item.id === 'risk-note' ? 360 : 220,
    height: 140,
    horizontalAlign: HorizontalAlign.CENTER,
    verticalAlign: VerticalAlign.MIDDLE,
    text: item.text,
    textStyle: { fs: 14, bl: BooleanNumber.TRUE, cl: { rgb: '#172033' } },
    textWrap: ShapeTextWrapType.Square,
  })
  card.shapeData.shapeType = ShapeTypeEnum.RoundRect
  card.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: item.color }
  card.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: item.stroke, width: 2 }
  return card
}
