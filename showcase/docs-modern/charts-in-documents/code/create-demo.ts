import type { JSONXActions } from '@univerjs/core'
import { DocChartInsertAnchorKind, DocChartModelService, UniverDocsChartPlugin } from '@univerjs-pro/docs-chart'
import {
  DocChartRenderService,
  DocChartSnapshotRenderService,
  UniverDocsChartUIPlugin,
} from '@univerjs-pro/docs-chart-ui'
import ChartEnUS from '@univerjs-pro/docs-chart-ui/locale/en-US'
import { UniverDocsColumnPlugin } from '@univerjs-pro/docs-column'
import { UniverDocsColumnUIPlugin } from '@univerjs-pro/docs-column-ui'
import ColumnEnUS from '@univerjs-pro/docs-column-ui/locale/en-US'
import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { UniverDocsTableUIPlugin } from '@univerjs-pro/docs-table-ui'
import TableEnUS from '@univerjs-pro/docs-table-ui/locale/en-US'
import { ChartImageExportFormat, ChartTypeString, LegendPositionEnum } from '@univerjs-pro/engine-chart'
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
import { DOCS_UI_PLUGIN_CONFIG_KEY, DocBackScrollRenderController } from '@univerjs/docs-ui'
import { IRenderManagerService } from '@univerjs/engine-render'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import {
  getDrawingShapeKeyByDrawingSearch,
  InsertDocDrawingCommand,
  UpdateDrawingDocTransformCommand,
  UniverDocsDrawingPreset,
} from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { filter, firstValueFrom, timeout } from 'rxjs'

import { createData, DATASETS, TASKS, WORKSHOP_SVG } from './data'

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

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'charts-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML =
    '<fieldset disabled>' +
    '<button data-action="insert">Insert chart</button><label>Chart type<select aria-label="Chart type"><option value="column">Column</option><option value="line">Line</option><option value="area">Area</option><option value="bar">Bar</option><option value="columnStacked">Stacked column</option><option value="pie">Pie</option><option value="donut">Donut</option></select></label><button data-action="type">Apply type</button>' +
    '<label>Dataset<select aria-label="Dataset"><option value="quarter">Q1 baseline</option><option value="corrected">February correction</option><option value="pause">Q2 planned closure</option></select></label><button data-action="data">Load dataset</button>' +
    '<label>Month<select aria-label="Month"><option value="1">First month</option><option value="2" selected>Second month</option><option value="3">Third month</option></select></label><label>Repairs<input aria-label="Repairs" type="number" min="0" max="500" step="1" value="71"></label><button data-action="value">Update month</button>' +
    '<label>Series<select aria-label="Series"><option value="all">Both measures</option><option value="repairs">Repairs only</option><option value="workshops">Workshops only</option></select></label><button data-action="series">Apply series</button>' +
    '<label>Title<input aria-label="Title" value="Repair hub outcomes" maxlength="80"></label><button data-action="title">Set title</button>' +
    '<label>Legend<select aria-label="Legend"><option value="bottom">Bottom</option><option value="right">Right</option><option value="hidden">Hidden</option></select></label><button data-action="legend">Apply legend</button>' +
    '<label>Palette<select aria-label="Palette"><option value="copper">Copper and teal</option><option value="violet">Violet and blue</option></select></label><button data-action="palette">Apply palette</button>' +
    '<label>Width<input aria-label="Width" type="number" min="160" max="680" value="560"></label><label>Height<input aria-label="Height" type="number" min="160" max="500" value="300"></label><label>Resize API<select aria-label="Resize API"><option value="drawing">Drawing size command</option><option value="facade">Chart facade · known gap</option></select></label><button data-action="size">Resize</button>' +
    '<button data-action="note">Insert note before chart</button><button data-action="show">Show chart</button><button data-action="png">Export PNG</button><button data-action="delete">Delete chart</button><button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="inspect">Inspect</button><button data-action="reload">Reload snapshot</button><button data-action="empty">Empty document</button><button data-action="reset">Reset</button></fieldset>' +
    '<p role="status">Starting Saffron review…</p><p role="alert" hidden></p><p class="hint">Native chart, local data and frontend PNG export. Width is capped to the text area. Resize uses the SDK drawing-size command. Known beta.2 gaps: Undo of drawing-size changes and the optional Chart facade resize can update model/layout while the visible frame keeps its old size. Inspect exposes both. Pie/Donut work best with one measure. Theme changes restore the fixture. Trial watermarks remain.</p>' +
    '<details><summary>Chart values, checksum and actual SDK layout</summary><pre><output aria-label="SDK readback"></output></pre></details><div class="charts-editor"></div>'
  container.append(root)
  const controls = root.querySelector('fieldset')!,
    editor = root.querySelector<HTMLElement>('.charts-editor')!,
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
    layoutFailure = '',
    desiredWidth = 560
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS, ChartEnUS, ColumnEnUS, TableEnUS) },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: editor, header: false, toolbar: false, footer: false }),
      UniverDocsDrawingPreset(),
    ],
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
  let doc = api.createDocument(createData()),
    baseline = structuredClone(doc.save())
  const paragraph = (marker: string) => {
    const found = doc.getParagraphs().filter((p) => p.getText().includes(marker))
    if (found.length !== 1) throw new Error('Chart anchor is absent or ambiguous. Reset the fixture.')
    return found[0]
  }
  const current = () => {
    const chart = doc.getCharts()[0]
    if (!chart) throw new Error('Chart is absent. Insert chart or Reset.')
    return chart
  }
  const number = (name: string, min: number, max: number) => {
    const raw = field(name).value,
      value = Number(raw)
    if (!raw.trim() || !Number.isInteger(value) || value < min || value > max)
      throw new Error(name + ' must be an integer from ' + min + ' to ' + max + '.')
    return value
  }
  const clearHistory = () => {
    injector.get(DocStateChangeManagerService).clearHistory(doc.getId())
    injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
  }
  async function insertChart() {
    if (doc.getCharts().length) return 'Chart already exists; no duplicate'
    const offset =
      doc.getParagraphs().length === 1 ? 0 : paragraph('Completed repairs and workshop attendance').getRange().endOffset
    const info = doc
      .newChart(ChartTypeString.Column)
      .setSource(structuredClone(DATASETS.quarter))
      .setPosition({ kind: DocChartInsertAnchorKind.BodyOffset, offset })
      .setInline()
      .setSize(560, 300)
      .setTitle('Repair hub outcomes')
      .setLegend({ position: LegendPositionEnum.Bottom })
      .setPalette(['#c2410c', '#0f766e'])
      .build()
    await doc.insertChart(info)
    return 'Inserted native chart from local Q1 data'
  }
  async function initialize() {
    await insertChart()
    const group = doc.insertColumnGroup(2, {
      columnGroupId: 'saffron-plans',
      columnIds: ['saffron-weekday', 'saffron-weekend'],
      offset: paragraph('Compare the weekday bench').getRange().startOffset,
      gap: 16,
      widthRatios: [1, 1],
    })
    requireSuccess(group, 'Could not insert the plan comparison.')
    requireSuccess(
      group!
        .getColumn(0)
        ?.setText(
          'Weekday bench\rExperienced volunteers handle bearing and brake work. Keep one stand available for quick safety checks.',
        ),
      'Weekday plan failed.',
    )
    requireSuccess(
      group!
        .getColumn(1)
        ?.setText(
          'Weekend pop-up\rNew volunteers teach puncture repair. Bring spare tubes and a portable pump to the market stall.',
        ),
      'Weekend plan failed.',
    )
    requireSuccess(
      doc.insertTableFromData(TASKS, {
        tableId: 'saffron-tasks',
        offset: paragraph('The follow-up table').getRange().startOffset,
        width: 520,
        columnWidths: [260, 130, 130],
        headerRowCount: 1,
      }),
      'Follow-up table failed.',
    )
    const transform = buildDocTransform(144, 72),
      offset = paragraph('The orange storage bench').getRange().startOffset
    requireSuccess(
      api.syncExecuteCommand(InsertDocDrawingCommand.id, {
        unitId: doc.getId(),
        drawings: [
          {
            unitId: doc.getId(),
            subUnitId: doc.getId(),
            drawingId: 'saffron-workshop',
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: 'data:image/svg+xml;base64,' + btoa(WORKSHOP_SVG),
            docTransform: transform,
            transform: docDrawingPositionToTransform(transform),
            behindDoc: BooleanNumber.FALSE,
            title: 'Repair hub layout',
            description: 'Orange storage, teal service desk and violet teaching area.',
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
      'Workshop sketch failed.',
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
      'Responsive columns failed.',
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
    const table = snapshot.tableSource?.['saffron-tasks'],
      tableWidth = Math.min(520, contentWidth)
    if (table) {
      put(['tableSource', 'saffron-tasks', 'size', 'width', 'v'], table.size.width.v, tableWidth)
      table.tableColumns.forEach((c, i) =>
        put(
          ['tableSource', 'saffron-tasks', 'tableColumns', i, 'size', 'width', 'v'],
          c.size.width.v,
          tableWidth * (i === 0 ? 0.5 : 0.25),
        ),
      )
    }
    const chart = doc.getCharts()[0],
      drawingId = chart?.getDrawingId(),
      drawing = drawingId && snapshot.drawings?.[drawingId]
    if (drawing)
      put(
        ['drawings', drawingId!, 'docTransform', 'size', 'width'],
        drawing.docTransform.size.width,
        Math.min(desiredWidth, contentWidth),
      )
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
          '. Widen the window to recover.'
      }
    }
  }
  async function inspect() {
    reflow()
    // Chart render configuration is emitted asynchronously, including after first model creation.
    await Promise.all(
      doc.getCharts().map((chart) => {
        const runtime = injector.get(DocChartModelService).ensureChartModel(doc.getId(), chart.getId())
        if (!runtime) throw new Error('Chart runtime is absent.')
        return firstValueFrom(
          runtime.model.config$.pipe(
            filter((chartConfig) => chartConfig !== null),
            timeout(5000),
          ),
        )
      }),
    )
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (disposed) return
    const snapshot = doc.save(),
      render = injector.get(IRenderManagerService).getRenderUnitById(doc.getId())
    output.textContent = JSON.stringify(
      {
        unitId: doc.getId(),
        pageWidth: snapshot.documentStyle.pageSize?.width,
        layoutFailure: layoutFailure || null,
        charts: doc.getCharts().map((chart) => {
          const info = chart.getInfo(),
            values = info.dataSource.values ?? [],
            block = snapshot.body?.customBlocks?.find((b) => b.blockId === chart.getDrawingId())
          const anchor =
            block &&
            doc
              .getParagraphs()
              .find((p) => block.startIndex >= p.getRange().startOffset && block.startIndex < p.getRange().endOffset)
          const object = render?.scene.getObjectIncludeInGroup(
            getDrawingShapeKeyByDrawingSearch({
              unitId: doc.getId(),
              subUnitId: doc.getId(),
              drawingId: chart.getDrawingId(),
            }),
          )
          const runtime = injector.get(DocChartModelService).ensureChartModel(doc.getId(), chart.getId())
          return {
            id: chart.getId(),
            drawingId: chart.getDrawingId(),
            type: chart.getType(),
            info,
            totals: values[0]
              ?.slice(1)
              .map((_label, i) =>
                values
                  .slice(1)
                  .reduce((sum, row) => sum + (typeof row[i + 1] === 'number' ? (row[i + 1] as number) : 0), 0),
              ),
            checksum: values
              .slice(1)
              .reduce(
                (sum, row) =>
                  sum + row.slice(1).reduce<number>((n, value) => n + (typeof value === 'number' ? value : 0), 0),
                0,
              ),
            anchor: anchor ? { id: anchor.getId(), text: anchor.getText(), offset: block!.startIndex } : null,
            rendered: object
              ? {
                  visible: object.visible,
                  width: object.width,
                  height: object.height,
                  scaleX: object.scaleX,
                  scaleY: object.scaleY,
                  left: object.left,
                  top: object.top,
                }
              : null,
            renderSpec:
              runtime && info.size
                ? injector
                    .get(DocChartRenderService)
                    .createRenderSpec(runtime, { width: info.size.width, height: info.size.height }).spec
                : null,
          }
        }),
        paragraphs: doc.getParagraphs().map((p) => ({ id: p.getId(), text: p.getText() })),
        tables: doc.getTables().map((t) => ({
          id: t.getId(),
          values: Array.from({ length: t.getRowCount() }, (_, r) =>
            Array.from({ length: t.getColumnCount() }, (_cell, c) => t.getCellText(r, c)),
          ),
        })),
        columns: doc.getColumnGroups().map((g) => g.describe()),
        images: doc.getImages().map((i) => i.getImageData()),
        layout: render
          ?.with(DocSkeletonManagerService)
          .getSkeleton()
          .getSkeletonData()
          ?.pages.map((p) => ({
            width: p.pageWidth,
            tables: Array.from(p.skeTables.values()).map((t) => ({ id: t.tableId, width: t.width })),
            groups: Array.from(p.skeColumnGroups.values()).map((g) => ({
              id: g.columnGroupId,
              columns: g.columns.map((c) => ({ left: c.left, top: c.top, width: c.width, height: c.height })),
            })),
            drawings: Array.from(p.skeDrawings.values()).map((d) => ({
              id: d.drawingId,
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
  function showChart() {
    const block = doc.save().body?.customBlocks?.find((b) => b.blockId === current().getDrawingId())
    if (!block) throw new Error('Chart anchor is absent.')
    injector
      .get(IRenderManagerService)
      .getRenderUnitById(doc.getId())
      ?.with(DocBackScrollRenderController)
      .scrollToRange({ startOffset: block.startIndex + 1, endOffset: block.startIndex + 1, collapsed: true })
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
          snapshot.id = 'saffron-charts-' + ++generation
          clearHistory()
          api.disposeUnit(doc.getId())
          doc = api.createDocument(snapshot)
          clearHistory()
          if (action !== 'reload') {
            desiredWidth = 560
            for (const [name, value] of Object.entries({
              'Chart type': 'column',
              Dataset: 'quarter',
              Month: '2',
              Repairs: '71',
              Series: 'all',
              Title: 'Repair hub outcomes',
              Legend: 'bottom',
              Palette: 'copper',
              Width: '560',
              Height: '300',
              'Resize API': 'drawing',
            }))
              field(name).value = value
          }
          return 'Restored ' + action + ' state'
        }
        if (action === 'insert') return insertChart()
        if (action === 'inspect') return 'Read actual chart data and renderer'
        if (action === 'undo' || action === 'redo') {
          requireSuccess(await api.executeCommand('univer.command.' + action), 'Nothing to ' + action + '.')
          desiredWidth = doc.getCharts()[0]?.getInfo().size?.width ?? desiredWidth
          return 'Applied ' + action
        }
        const chart = current()
        if (action === 'type') chart.setType(field('Chart type').value as ChartTypeString)
        if (action === 'data')
          await chart.setDataSource(structuredClone(DATASETS[field('Dataset').value as keyof typeof DATASETS]))
        if (action === 'value') {
          const values = chart.getInfo().dataSource.values?.map((row) => row.slice())
          if (!values) throw new Error('This case requires inline local chart data.')
          values[number('Month', 1, 3)][1] = number('Repairs', 0, 500)
          await chart.setDataSource(values)
        }
        if (action === 'series')
          chart.setValueFields(
            field('Series').value === 'all' ? [1, 2] : field('Series').value === 'repairs' ? [1] : [2],
          )
        if (action === 'title') {
          const title = field('Title').value.trim()
          if (!title || title.length > 80) throw new Error('Enter a title from 1 to 80 characters.')
          chart.setTitle(title)
        }
        if (action === 'legend')
          chart.setLegend(
            field('Legend').value === 'hidden'
              ? false
              : {
                  visible: true,
                  position: field('Legend').value === 'right' ? LegendPositionEnum.Right : LegendPositionEnum.Bottom,
                },
          )
        if (action === 'palette')
          chart.setPalette(field('Palette').value === 'violet' ? ['#7c3aed', '#2563eb'] : ['#c2410c', '#0f766e'])
        if (action === 'size') {
          const w = number('Width', 160, 680),
            h = number('Height', 160, 500)
          if (field('Resize API').value === 'facade') chart.setSize(w, h)
          else
            requireSuccess(
              api.syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
                unitId: doc.getId(),
                subUnitId: doc.getId(),
                drawings: [{ drawingId: chart.getDrawingId(), key: 'size', value: { width: w, height: h } }],
              }),
              'Drawing-size command failed.',
            )
          desiredWidth = w
        }
        if (action === 'note')
          requireSuccess(
            doc.insertText(
              paragraph('01 · Monthly').getRange().startOffset,
              'Audit note: February repair count corrected after review.\r',
            ),
            'Note insertion failed.',
          )
        if (action === 'show') showChart()
        if (action === 'delete') requireSuccess(await chart.remove(), 'Chart removal failed.')
        if (action === 'png') {
          const size = chart.getInfo().size!
          const dataUrl = await injector.get(DocChartSnapshotRenderService).exportImage({
            unitId: doc.getId(),
            chartId: chart.getId(),
            width: size.width,
            height: size.height,
            format: ChartImageExportFormat.PNG,
            mode: 'export',
          })
          if (!dataUrl?.startsWith('data:image/png')) throw new Error('SDK did not return a PNG image.')
          const link = document.createElement('a')
          link.href = dataUrl
          link.download = 'saffron-repair-chart.png'
          link.click()
        }
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
    await initialize()
    baseline = structuredClone(doc.save())
    ready = true
    root.dataset.ready = 'true'
    await inspect()
    showChart()
    return 'Ready — correct February from 57 to 71'
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
