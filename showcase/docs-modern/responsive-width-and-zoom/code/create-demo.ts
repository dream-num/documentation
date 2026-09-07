import type { IDocumentData, JSONXActions } from '@univerjs/core'
import { DocChartInsertAnchorKind, UniverDocsChartPlugin } from '@univerjs-pro/docs-chart'
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
import { ChartTypeString } from '@univerjs-pro/engine-chart'
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
  DocStateChangeManagerService,
  RichTextEditingMutation,
} from '@univerjs/docs'
import {
  DOCS_UI_PLUGIN_CONFIG_KEY,
  DocBackScrollRenderController,
  DocSelectionRenderService,
  SetDocZoomRatioOperation,
} from '@univerjs/docs-ui'
import { IRenderManagerService, RegularPolygon, Vector2 } from '@univerjs/engine-render'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import DocsZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { InsertDocDrawingCommand, UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import DrawingZhCN from '@univerjs/preset-docs-drawing/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { COUNTS, createData, MAP_SVG, PLANS, TASKS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import '@univerjs-pro/docs-chart-ui/lib/index.css'
import '@univerjs-pro/docs-column-ui/lib/index.css'
import '@univerjs-pro/docs-table-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-chart/facade'
import '@univerjs-pro/docs-column/facade'
import '@univerjs-pro/docs-table/facade'

function requireSuccess(value: unknown, message: string) {
  if (!value) throw new Error(message)
}
const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

export function createDemo(container: HTMLElement, darkMode = false, saved?: IDocumentData) {
  if (saved && (!saved.id || !saved.documentStyle || !saved.body?.dataStream?.endsWith('\r\n')))
    throw new Error('A saved document needs its original ID, documentStyle and a body ending in CRLF.')
  const zh = document.documentElement.lang === 'zh-CN'
  const root = document.createElement('div')
  root.className = 'responsive-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML =
    '<fieldset disabled>' +
    '<label>Host width<select aria-label="Host width"><option value="fluid">Fluid</option><option value="960">Desktop · 960px</option><option value="600">Tablet · 600px</option><option value="390">Phone · 390px</option><option value="320">Compact · 320px</option></select></label><button data-action="host">Resize host</button>' +
    '<label>Reading width<select aria-label="Reading width"><option value="820">Comfortable · 820</option><option value="640">Focused · 640</option><option value="1040">Wide · 1040</option></select></label><button data-action="reading">Apply width</button>' +
    '</fieldset><p role="status">Starting Willow memo…</p><p role="alert" hidden></p>' +
    '<div class="responsive-host"><div class="responsive-editor"></div></div>'
  container.append(root)
  if (zh) {
    const labels = root.querySelectorAll('fieldset label')
    labels[0].firstChild!.textContent = '容器宽度'
    labels[1].firstChild!.textContent = '阅读宽度'
    const names = ['自适应', '桌面 · 960px', '平板 · 600px', '手机 · 390px', '紧凑 · 320px', '舒适 · 820', '专注 · 640', '宽屏 · 1040']
    root.querySelectorAll('option').forEach((option, i) => { option.textContent = names[i] })
    root.querySelector('[data-action=host]')!.textContent = '调整容器'
    root.querySelector('[data-action=reading]')!.textContent = '应用宽度'
    root.querySelector('[role=status]')!.textContent = '正在启动 Willow 备忘录…'
  }
  const controls = root.querySelector('fieldset')!,
    host = root.querySelector<HTMLElement>('.responsive-host')!,
    editor = root.querySelector<HTMLElement>('.responsive-editor')!,
    status = root.querySelector<HTMLElement>('[role=status]')!,
    error = root.querySelector<HTMLElement>('[role=alert]')!
  const field = (name: string) =>
    root.querySelector<HTMLInputElement | HTMLSelectElement>('[aria-label="' + name + '"]')!
  const events = new AbortController()
  let disposed = false,
    ready = false,
    busy = false,
    resizeFrame = 0,
    measuredWidth = 0,
    readingWidth = saved?.documentStyle.pageSize?.width ?? 820,
    layoutFailure = ''
  const readingSelect = field('Reading width') as HTMLSelectElement
  if (!Array.from(readingSelect.options).some(option => option.value === String(readingWidth)))
    readingSelect.add(new Option((zh ? '已保存 · ' : 'Saved · ') + readingWidth, String(readingWidth)))
  readingSelect.value = String(readingWidth)
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS, ChartEnUS, ColumnEnUS, TableEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DocsZhCN, DrawingZhCN, ChartZhCN, ColumnZhCN, TableZhCN),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: editor }), UniverDocsDrawingPreset()],
    plugins: [
      UniverLicensePlugin,
      UniverDocsChartPlugin,
      UniverDocsChartUIPlugin,
      UniverDocsColumnPlugin,
      UniverDocsColumnUIPlugin,
      UniverDocsTablePlugin,
      UniverDocsTableUIPlugin,
    ],
  })
  const injector = univer.__getInjector(),
    config = injector.get(IConfigService)
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
  const doc = api.createDocument(saved ? structuredClone(saved) : createData())
  const owner = window as typeof window & { univerAPI?: typeof api; willowDemo?: ReturnType<typeof createDemo> }
  owner.univerAPI = api
  const render = () => injector.get(IRenderManagerService).getRenderUnitById(doc.getId())!
  function getSelectionPolygons() {
    const unit = render(),
      viewport = unit.scene.getViewports()[0]
    return viewport
      ? unit.scene
          .getObjectsByLayer(3)
          .filter(
            (object): object is RegularPolygon =>
              object instanceof RegularPolygon && object.visible && object.oKey.startsWith('__TestSelectionRange__'),
          )
          .flatMap((object) =>
            object.pointsGroup.map((points) =>
              points.map((point) =>
                viewport.getAbsoluteVector(object.transform.applyPoint(new Vector2(point.x, point.y))),
              ),
            ),
          )
      : []
  }
  const paragraph = (marker: string) => {
    const matches = doc.getParagraphs().filter((p) => p.getText().includes(marker))
    if (matches.length !== 1)
      throw new Error(
        'The target paragraph is absent or ambiguous. Restore the original paragraph before running this initialization.',
      )
    return matches[0]
  }
  const clearHistory = () => {
    injector.get(DocStateChangeManagerService).clearHistory(doc.getId())
    injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
  }
  async function initialize() {
    const group = doc.insertColumnGroup(2, {
      columnGroupId: 'willow-shifts',
      columnIds: ['willow-morning', 'willow-evening'],
      offset: paragraph('Two teams share').getRange().startOffset,
      gap: 16,
      widthRatios: [1, 1],
    })
    requireSuccess(group, 'Could not insert shift comparison.')
    PLANS.forEach((text, i) => requireSuccess(group!.getColumn(i)?.setText(text), 'Could not set shift text.'))
    requireSuccess(
      doc.insertTableFromData(TASKS, {
        tableId: 'willow-supplies',
        offset: paragraph('Tray and water').getRange().startOffset,
        width: 480,
        columnWidths: [200, 120, 160],
        headerRowCount: 1,
      }),
      'Could not insert supplies table.',
    )
    await doc.insertChart(
      doc
        .newChart(ChartTypeString.Column)
        .setSource(structuredClone(COUNTS))
        .setPosition({
          kind: DocChartInsertAnchorKind.BodyOffset,
          offset: paragraph('The three stations').getRange().endOffset,
        })
        .setInline()
        .setSize(520, 240)
        .setTitle('Seedlings by station')
        .setLegend(false)
        .setPalette(['#059669'])
        .build(),
    )
    if (disposed) return
    const transform = buildDocTransform(160, 80),
      offset = paragraph('The original CC0 map').getRange().startOffset
    requireSuccess(
      api.syncExecuteCommand(InsertDocDrawingCommand.id, {
        unitId: doc.getId(),
        drawings: [
          {
            unitId: doc.getId(),
            subUnitId: doc.getId(),
            drawingId: 'willow-map',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: 'data:image/svg+xml;base64,' + btoa(MAP_SVG),
            docTransform: transform,
            transform: docDrawingPositionToTransform(transform),
            behindDoc: BooleanNumber.FALSE,
            title: 'Nursery station map',
            description: 'Dune, creek and ridge along the blue access path.',
            layoutType: PositionedObjectLayoutType.INLINE,
            wrapText: WrapTextType.BOTH_SIDES,
            distT: 0,
            distB: 0,
            distL: 0,
            distR: 0,
          },
        ],
        textRange: { startOffset: offset, endOffset: offset, collapsed: true },
      }),
      'Could not insert map.',
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
          columns: old.columns!.map((c) => Object.assign({}, c, { minWidth: { v: 200 } })),
        }),
      }),
      'Could not enable column stacking.',
    )
    clearHistory()
  }
  function reflow() {
    if (disposed || !ready || !editor.clientWidth) return
    measuredWidth = editor.clientWidth
    // Zoom really enlarges text; reflow reduces logical width so content still fits.
    const zoom = doc.getDocumentDataModel().getSettings()?.zoomRatio ?? 1
    const snapshot = doc.save(),
      pageWidth = Math.min(readingWidth, Math.max(160, (measuredWidth - 16) / zoom)),
      contentWidth = Math.max(24, pageWidth - 2 * MODERN_DOCUMENT_DEFAULT_MARGIN),
      actions: NonNullable<JSONXActions> = []
    const put = (path: (string | number)[], old: unknown, value: unknown) => {
      if (JSON.stringify(old) === JSON.stringify(value)) return
      const op =
        old === undefined ? JSONX.getInstance().insertOp(path, value) : JSONX.getInstance().replaceOp(path, old, value)
      if (op) actions.push(op)
    }
    put(['documentStyle', 'pageSize', 'width'], snapshot.documentStyle.pageSize?.width, pageWidth)
    const table = snapshot.tableSource?.['willow-supplies'],
      tableWidth = Math.min(480, contentWidth)
    if (table) {
      put(['tableSource', 'willow-supplies', 'size', 'width', 'v'], table.size.width.v, tableWidth)
      table.tableColumns.forEach((c, i) =>
        put(
          ['tableSource', 'willow-supplies', 'tableColumns', i, 'size', 'width', 'v'],
          c.size.width.v,
          tableWidth * [200 / 480, 120 / 480, 160 / 480][i],
        ),
      )
    }
    for (const drawing of Object.values(snapshot.drawings ?? {})) {
      const isMap = drawing.drawingId === 'willow-map',
        w = Math.min(isMap ? 160 : 520, contentWidth)
      put(['drawings', drawing.drawingId, 'docTransform', 'size', 'width'], drawing.docTransform.size.width, w)
      if (isMap)
        put(['drawings', drawing.drawingId, 'docTransform', 'size', 'height'], drawing.docTransform.size.height, w / 2)
    }
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
        layoutFailure =
          'SDK layout failed: ' +
          (cause instanceof Error ? cause.message : String(cause)) +
          '. Widen the host or reduce zoom to recover.'
      }
    }
  }
  function revealSelection() {
    const selection = render().with(DocSelectionRenderService).getActiveTextRange()
    if (selection?.startOffset == null || selection.endOffset == null) throw new Error('Select handover text first.')
    render().with(DocBackScrollRenderController).scrollToRange({
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      collapsed: selection.collapsed,
    })
    // The scroll controller reveals its start offset. Reveal the other endpoint too,
    // so a wrapped selection that fits the viewport is not clipped at the bottom.
    render().with(DocBackScrollRenderController).scrollToRange({
      startOffset: selection.endOffset,
      endOffset: selection.endOffset,
      collapsed: true,
    })
    // The native controller adds a 100-document-unit scrolling buffer. On a
    // short/high-zoom host this can push the other endpoint out of view. Use the
    // SDK viewport API to remove only that excess; never alter the selection.
    const ys = getSelectionPolygons()
      .flat()
      .map((point) => point.y)
    if (ys.length && Math.max(...ys) - Math.min(...ys) <= editor.clientHeight) {
      const delta = Math.min(...ys) < 0 ? Math.min(...ys) : Math.max(0, Math.max(...ys) - editor.clientHeight)
      const unit = render(),
        viewport = unit.scene.getViewports()[0]
      if (delta && viewport)
        viewport.scrollByBarDeltaValue(viewport.transViewportScroll2ScrollValue(0, delta / unit.scene.scaleY))
    }
  }
  async function settleLayout() {
    reflow()
    await paint()
    if (!disposed && layoutFailure) throw new Error(layoutFailure)
  }
  async function run(action: () => string | Promise<string>) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    error.hidden = true
    try {
      const message = await action()
      await settleLayout()
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
        if (action === 'host')
          host.style.width = field('Host width').value === 'fluid' ? '100%' : field('Host width').value + 'px'
        if (action === 'reading') readingWidth = Number(field('Reading width').value)
        if (['host', 'reading'].includes(action)) {
          reflow()
          await paint()
          if (!disposed && !layoutFailure && render().with(DocSelectionRenderService).getActiveTextRange()) revealSelection()
        }
        return zh ? '布局已更新' : 'Layout updated'
      })
    },
    { signal: events.signal },
  )
  const zoomChanged = api.addEvent(api.Event.CommandExecuted, ({ id, params }) => {
    if (id !== SetDocZoomRatioOperation.id || (params as { unitId?: string })?.unitId !== doc.getId() || disposed) return
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      if (busy) reflow()
      else void run(async () => {
        reflow()
        await paint()
        if (!disposed && !layoutFailure && render().with(DocSelectionRenderService).getActiveTextRange()) revealSelection()
        return zh ? '原生缩放已更新' : 'Native zoom updated'
      })
    })
  })
  const resize = new ResizeObserver(() => {
    if (!ready || disposed || editor.clientWidth === measuredWidth) return
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      if (!busy)
        void run(async () => {
          reflow()
          await paint()
          if (!disposed && !layoutFailure && render().with(DocSelectionRenderService).getActiveTextRange()) revealSelection()
          return zh ? '布局已更新' : 'Layout updated'
        })
    })
  })
  resize.observe(editor)
  void run(async () => {
    await rendered
    if (disposed) return ''
    if (!saved) await initialize()
    if (disposed) return ''
    ready = true
    root.dataset.ready = 'true'
    return zh ? '就绪' : 'Ready'
  })
  const controller = {
    univerAPI: api,
    univer,
    container,
    createDemo,
    setDarkMode(value: boolean) {
      if (disposed) return
      root.dataset.theme = value ? 'dark' : 'light'
      api.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      events.abort()
      resize.disconnect()
      cancelAnimationFrame(resizeFrame)
      resolveRendered?.()
      lifecycle.dispose()
      zoomChanged.dispose()
      clearHistory()
      if (owner.univerAPI === api) delete owner.univerAPI
      if (owner.willowDemo === controller) delete owner.willowDemo
      univer.dispose()
      root.remove()
    },
  }
  owner.willowDemo = controller
  return controller
}
