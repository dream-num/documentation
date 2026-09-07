import type { JSONXActions } from '@univerjs/core'
import { InsertDocChartCommand, UniverDocsChartPlugin } from '@univerjs-pro/docs-chart'
import { UniverDocsChartUIPlugin } from '@univerjs-pro/docs-chart-ui'
import ChartEnUS from '@univerjs-pro/docs-chart-ui/locale/en-US'
import { UniverDocsColumnPlugin } from '@univerjs-pro/docs-column'
import { UniverDocsColumnUIPlugin } from '@univerjs-pro/docs-column-ui'
import ColumnEnUS from '@univerjs-pro/docs-column-ui/locale/en-US'
import { InsertDocShapeCommand, UniverDocsShapePlugin } from '@univerjs-pro/docs-shape'
import { UniverDocsShapeUIPlugin } from '@univerjs-pro/docs-shape-ui'
import ShapeEnUS from '@univerjs-pro/docs-shape-ui/locale/en-US'
import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { UniverDocsTableUIPlugin } from '@univerjs-pro/docs-table-ui'
import TableEnUS from '@univerjs-pro/docs-table-ui/locale/en-US'
import { ChartTypeBits } from '@univerjs-pro/engine-chart'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import {
  BooleanNumber,
  ColumnResponsiveType,
  DrawingTypeEnum,
  ImageSourceType,
  IConfigService,
  IUndoRedoService,
  JSONX,
  MODERN_DOCUMENT_DEFAULT_MARGIN,
  PositionedObjectLayoutType,
  WrapTextType,
} from '@univerjs/core'
import {
  buildDocTransform,
  docDrawingPositionToTransform,
  DocSkeletonManagerService,
  DocStateChangeManagerService,
  RichTextEditingMutation,
} from '@univerjs/docs'
import { DOCS_UI_PLUGIN_CONFIG_KEY, DocBackScrollRenderController, DocViewScaleService } from '@univerjs/docs-ui'
import { IRenderManagerService } from '@univerjs/engine-render'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import {
  getDrawingShapeKeyByDrawingSearch,
  InsertDocDrawingCommand,
  TextWrappingStyle,
  UniverDocsDrawingPreset,
  UpdateDocDrawingWrappingStyleCommand,
} from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { BACKDROP_ID, BADGE_ID, COUNTS, createData, MAP_SVG, TASKS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import '@univerjs-pro/docs-shape-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/docs-column-ui/lib/index.css'
import '@univerjs-pro/docs-table-ui/lib/index.css'
import '@univerjs-pro/docs-chart-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-shape/facade'
import '@univerjs-pro/docs-column/facade'
import '@univerjs-pro/docs-table/facade'
import '@univerjs-pro/docs-chart/facade'

function requireSuccess(value: unknown, message: string) {
  if (!value) throw new Error(message)
}

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'shapes-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML =
    '<fieldset disabled>' +
    '<label>Target<select aria-label="Target"><option value="' +
    BADGE_ID +
    '">Decision badge</option><option value="' +
    BACKDROP_ID +
    '">Review window</option></select></label>' +
    '<label>Shape<select aria-label="Shape"><option value="RoundRect">Rounded rectangle</option><option value="Rect">Rectangle</option><option value="Ellipse">Ellipse</option><option value="Diamond">Diamond</option></select></label><button data-action="insert">Insert shape</button><button data-action="type">Change shape</button>' +
    '<label>Anchor for insertion<select aria-label="Anchor"><option value="decision">Decision heading</option><option value="review">Review checkpoint</option></select></label>' +
    '<label>Wrapping<select aria-label="Wrapping"><option value="IN_FRONT_OF_TEXT">In front of text</option><option value="BEHIND_TEXT">Behind text</option><option value="WRAP_SQUARE">Square</option><option value="WRAP_TOP_AND_BOTTOM">Top and bottom</option><option value="INLINE">Inline</option></select></label><button data-action="wrap">Apply wrapping</button>' +
    '<label>X<input aria-label="X" type="number" value="450" min="0" max="700"></label><label>Y<input aria-label="Y" type="number" value="0" min="0" max="300"></label><button data-action="move">Move</button>' +
    '<label>Width<input aria-label="Width" type="number" value="160" min="40" max="600"></label><label>Height<input aria-label="Height" type="number" value="64" min="30" max="300"></label><button data-action="size">Resize</button><button data-action="rotate">Rotate 15°</button>' +
    '<label>Style<select aria-label="Style"><option value="approved">Approved · green</option><option value="review">Review · amber</option><option value="outline">Outline · violet</option></select></label><button data-action="style">Apply style</button>' +
    '<label>Label<input aria-label="Label" value="APPROVED" maxlength="80"></label><button data-action="text">Set label</button>' +
    '<label>Drawing order<select aria-label="Drawing order"><option value="bringToFront">Bring to front</option><option value="bringForward">Bring forward</option><option value="sendBackward">Send backward</option><option value="sendToBack">Send to back</option></select></label><button data-action="order">Arrange</button>' +
    '<button data-action="prepend">Insert note before anchor</button><button data-action="show">Show target</button><button data-action="chart">Show chart</button><button data-action="delete">Delete shape</button><button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="inspect">Inspect</button><button data-action="reload">Reload snapshot</button><button data-action="empty">Empty document</button><button data-action="reset">Reset</button></fieldset>' +
    '<p role="status">Starting Aster memo…</p><p role="alert" hidden></p><p class="hint">Native editable Shapes. Drawing order is separate from Behind text. X is page-relative; Y is anchor-relative. Insert uses the selected anchor; changing the selector does not move an existing anchor. Known SDK defect: narrow text layout can throw a breakType error, leaving the rendered page at its previous width, even without shapes. Inspect keeps the error visible; widen the window to recover. Explicit shape dimensions and positions are retained. Trial watermarks remain.</p>' +
    '<details><summary>SDK shapes, anchors and render objects</summary><pre><output aria-label="SDK readback"></output></pre></details><div class="shapes-editor"></div>'
  container.append(root)
  const controls = root.querySelector('fieldset')!,
    editor = root.querySelector<HTMLElement>('.shapes-editor')!,
    output = root.querySelector('output')!,
    status = root.querySelector<HTMLElement>('[role=status]')!,
    error = root.querySelector<HTMLElement>('[role=alert]')!
  const field = (name: string) =>
    root.querySelector<HTMLInputElement | HTMLSelectElement>('[aria-label="' + name + '"]')!
  const events = new AbortController()
  let disposed = false,
    busy = false,
    ready = false,
    generation = 0,
    width = 0,
    resizeFrame = 0,
    layoutFailure = ''
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS, ShapeEnUS, ColumnEnUS, TableEnUS, ChartEnUS) },
    // Shape UI requires Pro formula services. Replace the core preset's formula plugin by name.
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: editor, header: false, toolbar: false, footer: false }),
      UniverDocsDrawingPreset(),
      { plugins: [UniverLicensePlugin, UniverProFormulaEnginePlugin] },
    ],
    plugins: [
      UniverDocsShapePlugin,
      UniverDocsShapeUIPlugin,
      UniverDocsColumnPlugin,
      UniverDocsColumnUIPlugin,
      UniverDocsTablePlugin,
      UniverDocsTableUIPlugin,
      UniverDocsChartPlugin,
      UniverDocsChartUIPlugin,
    ],
  })
  const injector = univer.__getInjector()
  const config = injector.get(IConfigService)
  config.setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, {
    ...config.getConfig<Record<string, unknown>>(DOCS_UI_PLUGIN_CONFIG_KEY),
    container: editor,
    fitToWidth: { mode: 'none' },
  })
  let resolveRendered: (() => void) | undefined
  const rendered = new Promise<void>((resolve) => {
    resolveRendered = resolve
  })
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === api.Enum.LifecycleStages.Rendered) resolveRendered?.()
  })
  let doc = api.createDocument(createData()),
    baseline = structuredClone(doc.save())
  const paragraph = (marker: string) => {
    const match = doc.getParagraphs().filter((p) => p.getText().includes(marker))
    if (match.length !== 1) throw new Error('Anchor is absent or ambiguous. Reset restores ' + marker + '.')
    return match[0]
  }
  const current = () => {
    const shape = doc.getShape(field('Target').value)
    if (!shape) throw new Error('Shape is absent. Insert shape or Reset.')
    return shape
  }
  const number = (name: string, min: number, max: number) => {
    const raw = field(name).value,
      value = Number(raw)
    if (!raw.trim() || !Number.isFinite(value) || value < min || value > max)
      throw new Error(name + ' must be from ' + min + ' to ' + max + '.')
    return value
  }
  function clearHistory() {
    injector.get(DocStateChangeManagerService).clearHistory(doc.getId())
    injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
  }
  function insertShape(id = field('Target').value, backdrop = false) {
    if (doc.getShape(id)) return 'Shape already exists; no duplicate'
    const anchor =
      doc.getParagraphs().length === 1 && !doc.getParagraphs()[0].getText().trim()
        ? doc.getParagraphs()[0]
        : paragraph(field('Anchor').value === 'review' ? '05 · Review checkpoint' : '01 · Decision:')
    const wrappingStyle = TextWrappingStyle[field('Wrapping').value as keyof typeof TextWrappingStyle]
    const placement =
      wrappingStyle === TextWrappingStyle.INLINE
        ? { wrappingStyle, anchor: { paragraphId: anchor.getId() } }
        : {
            wrappingStyle,
            anchor: { paragraphId: anchor.getId() },
            position: {
              horizontalOffset: backdrop ? 430 : number('X', 0, 700),
              verticalOffset: backdrop ? 12 : number('Y', 0, 300),
            },
          }
    requireSuccess(
      api.syncExecuteCommand(InsertDocShapeCommand.id, {
        unitId: doc.getId(),
        shapeId: id,
        name: backdrop ? 'Review window' : 'Decision badge',
        shapeType: backdrop ? ShapeTypeEnum.Rect : ShapeTypeEnum[field('Shape').value as keyof typeof ShapeTypeEnum],
        placement,
        transform: {
          width: backdrop ? 190 : number('Width', 40, 600),
          height: backdrop ? 80 : number('Height', 30, 300),
        },
        shapeData: {
          fill: { fillType: ShapeFillEnum.SolidFill, color: backdrop ? '#fef3c7' : '#d1fae5' },
          stroke: { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: backdrop ? '#d97706' : '#047857', width: 2 },
        },
      }),
      'Native shape insertion failed.',
    )
    doc
      .getShape(id)!
      .getText()
      .setText(backdrop ? 'REVIEW WINDOW' : field('Label').value)
    return 'Inserted native shape at the selected paragraph'
  }
  function initialize() {
    insertShape(BACKDROP_ID, true)
    insertShape(BADGE_ID)
    const group = doc.insertColumnGroup(2, {
      columnGroupId: 'aster-plans',
      columnIds: ['aster-garden', 'aster-north'],
      offset: paragraph('Compare the garden').getRange().startOffset,
      widthRatios: [1, 1],
      gap: 16,
    })
    requireSuccess(group, 'Comparison insertion failed.')
    requireSuccess(
      group!
        .getColumn(0)
        ?.setText(
          'Garden entrance\rShorter step-free route. Test wet-weather signs and the turn beside the sculpture court.',
        ),
      'Garden plan failed.',
    )
    requireSuccess(
      group!
        .getColumn(1)
        ?.setText(
          'North entrance\rExisting welcome desk. Longer indoor route with a quiet waiting space near the gallery.',
        ),
      'North plan failed.',
    )
    requireSuccess(
      doc.insertTableFromData(TASKS, {
        tableId: 'aster-tasks',
        offset: paragraph('Independent workstream').getRange().startOffset,
        width: 520,
        columnWidths: [260, 130, 130],
        headerRowCount: 1,
      }),
      'Table insertion failed.',
    )
    const imageTransform = buildDocTransform(144, 72),
      imageOffset = paragraph('The green route').getRange().startOffset
    requireSuccess(
      api.syncExecuteCommand(InsertDocDrawingCommand.id, {
        unitId: doc.getId(),
        drawings: [
          {
            unitId: doc.getId(),
            subUnitId: doc.getId(),
            drawingId: 'aster-map',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: 'data:image/svg+xml;base64,' + btoa(MAP_SVG),
            docTransform: imageTransform,
            transform: docDrawingPositionToTransform(imageTransform),
            behindDoc: BooleanNumber.FALSE,
            title: 'Garden access route',
            description: 'Green path from an amber entrance to a violet gallery.',
            layoutType: PositionedObjectLayoutType.INLINE,
            wrapText: WrapTextType.BOTH_SIDES,
            distT: 0,
            distB: 0,
            distL: 0,
            distR: 0,
          },
        ],
        textRange: { startOffset: imageOffset, endOffset: imageOffset, collapsed: true },
      }),
      'Map insertion failed.',
    )
    const offset =
      paragraph('Trial visitors by entrance').getRange().startOffset + 'Trial visitors by entrance'.length + 1
    requireSuccess(
      api.syncExecuteCommand(InsertDocChartCommand.id, {
        unitId: doc.getId(),
        chart: { id: 'aster-visitors', chartType: ChartTypeBits.Column },
        dataSource: { id: 'aster-counts', values: COUNTS },
        drawing: { drawingId: 'aster-chart', layoutType: PositionedObjectLayoutType.INLINE },
        textRange: { startOffset: offset, endOffset: offset, collapsed: true },
        width: 520,
        height: 220,
        focus: false,
      }),
      'Chart insertion failed.',
    )
    const old = doc.save().body!.columnGroups![0]
    requireSuccess(
      api.syncExecuteCommand(RichTextEditingMutation.id, {
        unitId: doc.getId(),
        noHistory: true,
        textRanges: null,
        actions: JSONX.getInstance().replaceOp(['body', 'columnGroups', 0], old, {
          ...old,
          responsive: ColumnResponsiveType.STACK,
          columns: old.columns!.map((c) => Object.assign({}, c, { minWidth: { v: 220 } })),
        }),
      }),
      'Responsive column setup failed.',
    )
    clearHistory()
  }
  function reflow() {
    if (!ready || !editor.clientWidth) return
    width = editor.clientWidth
    const snapshot = doc.save(),
      pageWidth = Math.min(820, Math.max(240, width - 8)),
      contentWidth = Math.max(80, pageWidth - MODERN_DOCUMENT_DEFAULT_MARGIN * 2),
      actions: NonNullable<JSONXActions> = []
    const put = (path: (string | number)[], old: unknown, value: unknown) => {
      if (JSON.stringify(old) === JSON.stringify(value)) return
      const op =
        old === undefined ? JSONX.getInstance().insertOp(path, value) : JSONX.getInstance().replaceOp(path, old, value)
      if (op) actions.push(op)
    }
    put(['documentStyle', 'pageSize', 'width'], snapshot.documentStyle.pageSize?.width, pageWidth)
    const table = snapshot.tableSource?.['aster-tasks'],
      tableWidth = Math.min(520, contentWidth)
    if (table) {
      put(['tableSource', 'aster-tasks', 'size', 'width', 'v'], table.size.width.v, tableWidth)
      table.tableColumns.forEach((c, i) =>
        put(
          ['tableSource', 'aster-tasks', 'tableColumns', i, 'size', 'width', 'v'],
          c.size.width.v,
          tableWidth * (i === 0 ? 0.5 : 0.25),
        ),
      )
    }
    const chart = snapshot.drawings?.['aster-chart']
    if (chart)
      put(['drawings', 'aster-chart', 'docTransform', 'size'], chart.docTransform.size, {
        width: Math.min(520, contentWidth),
        height: 220,
      })
    if (actions.length) {
      try {
        requireSuccess(
          api.syncExecuteCommand(RichTextEditingMutation.id, {
            unitId: doc.getId(),
            noHistory: true,
            textRanges: null,
            actions: actions.reduce((all, op) => JSONX.compose(all, op as JSONXActions), null as JSONXActions),
          }),
          'Document reflow failed.',
        )
        layoutFailure = ''
      } catch (cause) {
        // A mutation can update the model before the SDK layout throws. Keep the failure visible on Inspect.
        layoutFailure =
          'SDK layout failed: ' +
          (cause instanceof Error ? cause.message : String(cause)) +
          '. Widen the window to recover; Inspect does not repair layout.'
      }
    }
  }
  async function inspect() {
    reflow()
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (disposed) return
    const snapshot = doc.save(),
      render = injector.get(IRenderManagerService).getRenderUnitById(doc.getId()),
      pages = render?.with(DocSkeletonManagerService).getSkeleton().getSkeletonData()?.pages ?? []
    output.textContent = JSON.stringify(
      {
        unitId: doc.getId(),
        pageWidth: snapshot.documentStyle.pageSize?.width,
        modelTableWidth: snapshot.tableSource?.['aster-tasks']?.size.width.v,
        layoutFailure: layoutFailure || null,
        viewScale: render?.with(DocViewScaleService).getViewScale(),
        shapes: doc.getShapes().map((shape) => {
          const id = shape.getId(),
            block = snapshot.body?.customBlocks?.find((b) => b.blockId === id),
            anchor =
              block &&
              doc.getParagraphs().find((p) => {
                const r = p.getRange()
                return block.startIndex >= r.startOffset && block.startIndex < r.endOffset
              }),
            object = render?.scene.getObjectIncludeInGroup(
              getDrawingShapeKeyByDrawingSearch({ unitId: doc.getId(), subUnitId: doc.getId(), drawingId: id }),
            )
          return {
            id,
            type: shape.getShapeType(),
            adjustHandles: shape.getAdjustHandles(),
            text: shape.getText().getPlainText(),
            data: shape.getShapeData(),
            transform: shape.getTransform(),
            drawing: snapshot.drawings?.[id],
            anchor: anchor ? { id: anchor.getId(), text: anchor.getText(), offset: block!.startIndex } : null,
            rendered: object
              ? {
                  class: object.constructor.name,
                  visible: object.visible,
                  left: object.left,
                  top: object.top,
                  width: object.width,
                  height: object.height,
                  zIndex: object.zIndex,
                  layer: object.getLayerIndex(),
                }
              : null,
          }
        }),
        order: snapshot.drawingsOrder,
        paragraphs: doc.getParagraphs().map((p) => ({ id: p.getId(), text: p.getText() })),
        blocks: snapshot.body?.customBlocks,
        tables: doc.getTables().map((t) => ({
          id: t.getId(),
          values: Array.from({ length: t.getRowCount() }, (_, r) =>
            Array.from({ length: t.getColumnCount() }, (_cell, c) => t.getCellText(r, c)),
          ),
        })),
        columns: doc.getColumnGroups().map((g) => g.describe()),
        charts: doc.getCharts().map((c) => c.getInfo()),
        images: doc.getImages().map((i) => i.getImageData()),
        layout: pages.map((p) => ({
          width: p.pageWidth,
          groups: Array.from(p.skeColumnGroups.values()).map((g) => ({
            id: g.columnGroupId,
            columns: g.columns.map((c) => ({ left: c.left, top: c.top, width: c.width, height: c.height })),
          })),
          tables: Array.from(p.skeTables.values()).map((t) => ({ id: t.tableId, width: t.width })),
          drawings: Array.from(p.skeDrawings.values()).map((d) => ({
            id: d.drawingId,
            left: d.aLeft,
            top: d.aTop,
            width: d.width,
            height: d.height,
          })),
        })),
      },
      null,
      2,
    )
    if (layoutFailure) throw new Error(layoutFailure)
  }
  function scrollTo(id: string) {
    const block = doc.save().body?.customBlocks?.find((b) => b.blockId === id)
    if (!block) throw new Error('Target is absent.')
    const offset = block.startIndex + 1
    injector
      .get(IRenderManagerService)
      .getRenderUnitById(doc.getId())
      ?.with(DocBackScrollRenderController)
      .scrollToRange({ startOffset: offset, endOffset: offset, collapsed: true })
  }
  async function run(action: () => string | Promise<string>) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    error.hidden = true
    try {
      const message = await action()
      await inspect()
      if (!disposed) status.textContent = message
    } catch (cause) {
      if (!disposed) {
        error.textContent = cause instanceof Error ? cause.message : String(cause)
        error.hidden = false
      }
    } finally {
      busy = false
      if (!disposed) controls.disabled = !ready
    }
  }
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action) return
      void run(async () => {
        if (['reset', 'empty', 'reload'].includes(action)) {
          const snapshot = structuredClone(
            action === 'reset' ? baseline : action === 'empty' ? createData(true) : doc.save(),
          )
          snapshot.id = 'aster-shapes-' + ++generation
          clearHistory()
          api.disposeUnit(doc.getId())
          doc = api.createDocument(snapshot)
          if (action !== 'reload') {
            for (const [name, value] of Object.entries({
              Target: BADGE_ID,
              Shape: 'RoundRect',
              Anchor: 'decision',
              Wrapping: 'IN_FRONT_OF_TEXT',
              X: '450',
              Y: '0',
              Width: '160',
              Height: '64',
              Style: 'approved',
              Label: 'APPROVED',
              'Drawing order': 'bringToFront',
            }))
              field(name).value = value
          }
          clearHistory()
          return action === 'reload' ? 'Reloaded actual SDK snapshot' : 'Restored ' + action + ' state'
        }
        if (action === 'inspect') return 'Read actual SDK model and renderer'
        if (action === 'chart') {
          scrollTo('aster-chart')
          return 'Showing visitor chart'
        }
        if (action === 'insert') return insertShape()
        if (action === 'prepend') {
          requireSuccess(
            doc.insertText(
              paragraph('01 · Decision:').getRange().startOffset,
              'Access review note: confirm the trial date.\r',
            ),
            'Note insertion failed.',
          )
          return 'Inserted content before the stable anchor'
        }
        if (action === 'undo' || action === 'redo') {
          requireSuccess(await api.executeCommand('univer.command.' + action), 'Nothing to ' + action + '.')
          return 'Applied ' + action
        }
        const shape = current()
        if (action === 'type') shape.setShapeType(ShapeTypeEnum[field('Shape').value as keyof typeof ShapeTypeEnum])
        if (action === 'size') shape.setSize(number('Width', 40, 600), number('Height', 30, 300))
        if (action === 'rotate') shape.setRotation(((shape.getTransform()?.rotation ?? 0) + 15) % 360)
        if (action === 'move') {
          if (doc.save().drawings?.[shape.getId()]?.layoutType === PositionedObjectLayoutType.INLINE)
            throw new Error('Inline position follows text. Choose a floating wrapping style first.')
          shape.setAbsolutePosition(number('X', 0, 700), number('Y', 0, 300))
        }
        if (action === 'style') {
          const style = field('Style').value,
            old = shape.getShapeData()!
          shape.setShapeData({
            ...old,
            fill:
              style === 'outline'
                ? { fillType: ShapeFillEnum.NoFill }
                : { fillType: ShapeFillEnum.SolidFill, color: style === 'review' ? '#fef3c7' : '#d1fae5' },
            stroke: {
              lineStrokeType: ShapeLineTypeEnum.SolidLine,
              color: style === 'outline' ? '#7c3aed' : style === 'review' ? '#d97706' : '#047857',
              width: style === 'outline' ? 4 : 2,
            },
          })
        }
        if (action === 'text') {
          const text = field('Label').value.trim()
          if (!text || text.length > 80) throw new Error('Enter a label from 1 to 80 characters.')
          shape.getText().setText(text)
        }
        if (action === 'wrap')
          requireSuccess(
            api.syncExecuteCommand(UpdateDocDrawingWrappingStyleCommand.id, {
              unitId: doc.getId(),
              subUnitId: doc.getId(),
              drawings: [doc.save().drawings![shape.getId()]],
              wrappingStyle: TextWrappingStyle[field('Wrapping').value as keyof typeof TextWrappingStyle],
            }),
            'Wrapping update failed.',
          )
        if (action === 'order') {
          const order = field('Drawing order').value
          if (order === 'bringToFront') shape.bringToFront()
          else if (order === 'bringForward') shape.bringForward()
          else if (order === 'sendBackward') shape.sendBackward()
          else shape.sendToBack()
        }
        if (action === 'delete') requireSuccess(shape.remove(), 'Shape removal failed.')
        if (action === 'show') scrollTo(shape.getId())
        return 'Applied ' + action + ' using the SDK'
      })
    },
    { signal: events.signal },
  )
  const resize = new ResizeObserver(() => {
    if (!ready || disposed || editor.clientWidth === width) return
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      if (!busy) void run(() => 'Reflowed without adding Undo history')
    })
  })
  resize.observe(editor)
  void run(async () => {
    await rendered
    if (disposed) return ''
    initialize()
    baseline = structuredClone(doc.save())
    ready = true
    root.dataset.ready = 'true'
    await inspect()
    scrollTo(BADGE_ID)
    return 'Ready — edit the decision badge'
  })
  return {
    dispose() {
      disposed = true
      events.abort()
      resize.disconnect()
      cancelAnimationFrame(resizeFrame)
      lifecycle.dispose()
      clearHistory()
      univer.dispose()
      root.remove()
    },
  }
}
