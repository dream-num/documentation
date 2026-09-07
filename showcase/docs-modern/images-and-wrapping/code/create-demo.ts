import type { JSONXActions } from '@univerjs/core'
import type { IDocImage } from '@univerjs/preset-docs-drawing'
import { InsertDocChartCommand, UniverDocsChartPlugin } from '@univerjs-pro/docs-chart'
import { UniverDocsChartUIPlugin } from '@univerjs-pro/docs-chart-ui'
import ChartEnUS from '@univerjs-pro/docs-chart-ui/locale/en-US'
import { UniverDocsColumnPlugin } from '@univerjs-pro/docs-column'
import { UniverDocsColumnUIPlugin } from '@univerjs-pro/docs-column-ui'
import ColumnEnUS from '@univerjs-pro/docs-column-ui/locale/en-US'
import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { UniverDocsTableUIPlugin } from '@univerjs-pro/docs-table-ui'
import TableEnUS from '@univerjs-pro/docs-table-ui/locale/en-US'
import { ChartTypeBits } from '@univerjs-pro/engine-chart'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import {
  AlignTypeH,
  BooleanNumber,
  CommandType,
  ColumnResponsiveType,
  DrawingTypeEnum,
  ImageSourceType,
  ICommandService,
  IConfigService,
  IUndoRedoService,
  JSONX,
  MODERN_DOCUMENT_DEFAULT_MARGIN,
  ObjectRelativeFromH,
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
import {
  DOCS_UI_PLUGIN_CONFIG_KEY,
  DocBackScrollRenderController,
  DocViewScaleService,
  SetDocZoomRatioOperation,
} from '@univerjs/docs-ui'
import { Image as RenderImage, IRenderManagerService } from '@univerjs/engine-render'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import {
  InsertDocDrawingCommand,
  getDrawingShapeKeyByDrawingSearch,
  TextWrappingStyle,
  UniverDocsDrawingPreset,
  UpdateDrawingDocTransformCommand,
} from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { ALT_TEXT, CHART_VALUES, COAST_SVG, createData, IMAGE_ID, SCHEDULE } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import '@univerjs-pro/docs-column-ui/lib/index.css'
import '@univerjs-pro/docs-table-ui/lib/index.css'
import '@univerjs-pro/docs-chart-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-column/facade'
import '@univerjs-pro/docs-chart/facade'
import '@univerjs-pro/docs-table/facade'

function requireSuccess(value: unknown, message: string) {
  if (!value) throw new Error(message)
}

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'images-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML =
    '<fieldset disabled>' +
    '<label>Document layout<select aria-label="Document layout"><option value="reflow">Responsive reflow</option><option value="fixed">Fixed-width zoom</option></select></label>' +
    '<button data-action="insert">Insert image</button><label>Wrapping<select aria-label="Wrapping"><option value="INLINE">Inline</option><option value="WRAP_SQUARE">Square</option><option value="WRAP_TOP_AND_BOTTOM">Top and bottom</option><option value="BEHIND_TEXT">Behind text</option><option value="IN_FRONT_OF_TEXT">In front of text</option></select></label><button data-action="wrap">Apply wrapping</button>' +
    '<label>Width<input aria-label="Width" type="number" min="40" max="600" value="240"></label><label>Height<input aria-label="Height" type="number" min="40" max="400" value="150"></label><button data-action="resize">Resize</button>' +
    '<label>Alignment<select aria-label="Alignment"><option value="LEFT">Left</option><option value="CENTER">Center</option><option value="RIGHT">Right</option></select></label><button data-action="align">Align floating image</button>' +
    '<label>Crop<select aria-label="Crop"><option value="full">Full illustration</option><option value="recorder">Recorder portrait</option><option value="horizon">Horizon panorama</option></select></label><button data-action="crop">Apply crop</button>' +
    '<label>Alt text<input aria-label="Alt text" maxlength="300"></label><button data-action="alt">Set alt text</button><button data-action="rotate">Rotate 15°</button><button data-action="delete">Delete image</button>' +
    '<button data-action="show">Show image</button><button data-action="chart">Show chart</button><button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="inspect">Inspect</button><button data-action="roundtrip">Reload snapshot</button><button data-action="empty">Empty document</button><button data-action="reset">Reset</button></fieldset>' +
    '<p role="status">Starting Kestrel memo…</p><p role="alert" hidden></p><p class="hint">Responsive reflow changes actual document, table and chart widths without adding Undo steps; columns stack below their minimum width. Images retain explicitly requested dimensions. Fixed-width zoom scales the original layout. Known beta.2 crop issue: render offsets are scaled again. Alt text is metadata, not canvas screen-reader certification. Trial watermarks remain.</p>' +
    '<details><summary>SDK image metadata and text layout</summary><pre><output aria-label="SDK readback"></output></pre></details><div class="images-editor"></div>'
  container.append(root)
  const controls = root.querySelector('fieldset')!,
    editor = root.querySelector<HTMLElement>('.images-editor')!,
    output = root.querySelector('output')!,
    status = root.querySelector<HTMLElement>('[role="status"]')!,
    error = root.querySelector<HTMLElement>('[role="alert"]')!
  const field = (name: string) =>
    root.querySelector<HTMLInputElement | HTMLSelectElement>('[aria-label="' + name + '"]')!
  field('Alt text').value = ALT_TEXT
  const events = new AbortController()
  let disposed = false,
    ready = false,
    busy = false,
    generation = 0
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS, ColumnEnUS, TableEnUS, ChartEnUS) },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: editor, header: false, toolbar: false, footer: false }),
      UniverDocsDrawingPreset(),
    ],
    plugins: [
      UniverLicensePlugin,
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
  let resolveRendered: (() => void) | undefined
  const rendered = new Promise<void>((resolve) => {
    resolveRendered = resolve
  })
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === api.Enum.LifecycleStages.Rendered) resolveRendered?.()
  })
  let doc = api.createDocument(createData()),
    baseline = structuredClone(doc.save())
  // SDK history records mutations inside commands. A direct mutation has no command trigger.
  const setDescriptionId = 'showcase.command.set-image-description'
  const descriptionCommand = injector.get(ICommandService).registerCommand({
    id: setDescriptionId,
    type: CommandType.COMMAND,
    handler: (_accessor, params?: { description: string }) => {
      const description = params?.description.trim()
      if (!description || description.length > 300)
        throw new Error('Enter descriptive alt text from 1 to 300 characters.')
      const old = currentImage().getImageData()!.description
      if (old === description) return true
      const jsonX = JSONX.getInstance(),
        path = ['drawings', IMAGE_ID, 'description']
      return Boolean(
        api.syncExecuteCommand(RichTextEditingMutation.id, {
          unitId: doc.getId(),
          actions: old === undefined ? jsonX.insertOp(path, description) : jsonX.replaceOp(path, old, description),
          textRanges: null,
          debounce: false,
        }),
      )
    },
  })
  function clearHistory() {
    injector.get(DocStateChangeManagerService).clearHistory(doc.getId())
    injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
  }
  function paragraph(marker: string) {
    const matches = doc.getParagraphs().filter((p) => p.getText().includes(marker))
    if (matches.length !== 1) throw new Error('Expected one ' + marker + ' paragraph. Reset restores the memo.')
    return matches[0]
  }
  function currentImage() {
    const image = doc.getImage(IMAGE_ID)
    if (!image) throw new Error('Image is absent. Insert image or Reset.')
    return image
  }
  function insertImage() {
    if (doc.getImage(IMAGE_ID)) return 'Image already exists; no duplicate'
    const offset = doc.getParagraphs().some((p) => p.getText().includes('The orange recorder'))
      ? paragraph('The orange recorder').getRange().startOffset
      : 0
    const docTransform = buildDocTransform(240, 150)
    const image: IDocImage = {
      unitId: doc.getId(),
      subUnitId: doc.getId(),
      drawingId: IMAGE_ID,
      drawingType: DrawingTypeEnum.DRAWING_IMAGE,
      imageSourceType: ImageSourceType.BASE64,
      source: 'data:image/svg+xml;base64,' + btoa(COAST_SVG),
      docTransform,
      transform: docDrawingPositionToTransform(docTransform),
      title: 'Coastal listening station',
      description: '',
      behindDoc: BooleanNumber.FALSE,
      layoutType: PositionedObjectLayoutType.INLINE,
      wrapText: WrapTextType.BOTH_SIDES,
      distT: 8,
      distB: 8,
      distL: 12,
      distR: 12,
    }
    requireSuccess(
      api.syncExecuteCommand(InsertDocDrawingCommand.id, {
        unitId: doc.getId(),
        drawings: [image],
        textRange: { startOffset: offset, endOffset: offset, collapsed: true },
      }),
      'Image insertion failed.',
    )
    return 'Inserted the original illustration; add descriptive alt text with Set alt text'
  }
  function initialize() {
    insertImage()
    const group = doc.insertColumnGroup(2, {
      columnGroupId: 'kestrel-methods',
      columnIds: ['kestrel-fixed', 'kestrel-walking'],
      offset: paragraph('Compare a fixed station').getRange().startOffset,
      widthRatios: [1, 1],
      gap: 16,
    })
    requireSuccess(group, 'Could not insert method comparison.')
    requireSuccess(
      group!
        .getColumn(0)
        ?.setText(
          'Fixed station\rKeep the recorder still for three minutes. Compare repeated sounds from the same position.',
        ),
      'Could not fill fixed method.',
    )
    requireSuccess(
      group!
        .getColumn(1)
        ?.setText('Walking survey\rWalk slowly on open paths. Mark changes in surface and stop before speaking.'),
      'Could not fill walking method.',
    )
    requireSuccess(
      doc.insertTableFromData(
        SCHEDULE.map((row) => Array.from(row)),
        {
          tableId: 'kestrel-schedule',
          offset: paragraph('Use this small table').getRange().startOffset,
          width: 520,
          columnWidths: [260, 130, 130],
          headerRowCount: 1,
        },
      ),
      'Could not insert schedule.',
    )
    const offset =
      paragraph('Usable clips').getRange().startOffset + 'Usable clips from the fictional rehearsal'.length + 1
    requireSuccess(
      api.syncExecuteCommand(InsertDocChartCommand.id, {
        unitId: doc.getId(),
        chart: { id: 'kestrel-clips', chartType: ChartTypeBits.Column },
        dataSource: { id: 'kestrel-counts', values: CHART_VALUES.map((row) => Array.from<string | number>(row)) },
        drawing: { drawingId: 'kestrel-chart', layoutType: PositionedObjectLayoutType.INLINE },
        textRange: { startOffset: offset, endOffset: offset, collapsed: true },
        width: 560,
        height: 240,
        focus: false,
      }),
      'Could not insert chart.',
    )
    clearHistory()
    const groupIndex = doc.save().body!.columnGroups!.findIndex((g) => g.columnGroupId === 'kestrel-methods')
    const oldGroup = doc.save().body!.columnGroups![groupIndex]
    requireSuccess(
      api.syncExecuteCommand(RichTextEditingMutation.id, {
        unitId: doc.getId(),
        noHistory: true,
        textRanges: null,
        actions: JSONX.getInstance().replaceOp(['body', 'columnGroups', groupIndex], oldGroup, {
          ...oldGroup,
          responsive: ColumnResponsiveType.STACK,
          columns: oldGroup.columns!.map((column) => Object.assign({}, column, { minWidth: { v: 220 } })),
        }),
      }),
      'Could not configure SDK responsive columns.',
    )
  }
  function scrollTo(offset: number) {
    injector
      .get(IRenderManagerService)
      .getRenderUnitById(doc.getId())
      ?.with(DocBackScrollRenderController)
      .scrollToRange({ startOffset: offset, endOffset: offset, collapsed: true })
  }
  let layoutMode = '',
    containerWidth = 0,
    resizeFrame = 0
  function applyViewportLayout() {
    if (!ready || disposed || editor.clientWidth === 0) return
    const mode = field('Document layout').value
    const modeChanged = layoutMode !== mode
    containerWidth = editor.clientWidth
    if (modeChanged) {
      layoutMode = mode
      config.setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, {
        ...config.getConfig<Record<string, unknown>>(DOCS_UI_PLUGIN_CONFIG_KEY),
        container: editor,
        fitToWidth: {
          mode: mode === 'reflow' ? 'none' : 'fit-width',
          target: 'container',
          paddingX: 16,
          minScale: 0.1,
          maxScale: 1,
        },
      })
    }
    const snapshot = doc.save()
    const pageWidth = mode === 'reflow' ? Math.min(820, Math.max(240, Math.floor(containerWidth) - 8)) : 820
    const contentWidth = Math.max(80, pageWidth - MODERN_DOCUMENT_DEFAULT_MARGIN * 2)
    const jsonX = JSONX.getInstance(),
      actions: NonNullable<JSONXActions> = []
    const put = (path: (string | number)[], old: unknown, value: unknown) => {
      if (JSON.stringify(old) === JSON.stringify(value)) return
      const operation = old === undefined ? jsonX.insertOp(path, value) : jsonX.replaceOp(path, old, value)
      if (operation) actions.push(operation)
    }
    put(['documentStyle', 'pageSize', 'width'], snapshot.documentStyle.pageSize?.width, pageWidth)
    const table = snapshot.tableSource?.['kestrel-schedule']
    if (table) {
      const width = Math.min(520, contentWidth)
      put(['tableSource', 'kestrel-schedule', 'size', 'width', 'v'], table.size.width.v, width)
      table.tableColumns.forEach((column, index) =>
        put(
          ['tableSource', 'kestrel-schedule', 'tableColumns', index, 'size', 'width', 'v'],
          column.size.width.v,
          width * (index === 0 ? 0.5 : 0.25),
        ),
      )
    }
    const chart = snapshot.drawings?.['kestrel-chart']
    if (chart)
      put(['drawings', 'kestrel-chart', 'docTransform', 'size'], chart.docTransform.size, {
        width: Math.min(560, contentWidth),
        height: 240,
      })
    // This demo's viewport policy changes real layout data, not text or user-selected image dimensions.
    // noHistory keeps window resizing out of editing history and preserves Undo/Redo across resize.
    if (actions.length)
      requireSuccess(
        api.syncExecuteCommand(RichTextEditingMutation.id, {
          unitId: doc.getId(),
          noHistory: true,
          textRanges: null,
          actions: actions.reduce((all, action) => JSONX.compose(all, action as JSONXActions), null as JSONXActions),
        }),
        'Responsive document layout update failed.',
      )
    if (modeChanged || (snapshot.settings?.zoomRatio ?? 1) !== 1)
      api.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId: doc.getId(), zoomRatio: 1 })
  }
  const resize = new ResizeObserver(() => {
    if (editor.clientWidth === containerWidth || !ready || disposed) return
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      if (!busy) void run(() => 'Viewport layout updated without changing editing history')
    })
  })
  resize.observe(editor)
  async function inspect() {
    applyViewportLayout()
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (disposed) return
    const pages =
      injector
        .get(IRenderManagerService)
        .getRenderUnitById(doc.getId())
        ?.with(DocSkeletonManagerService)
        .getSkeleton()
        .getSkeletonData()?.pages ?? []
    output.textContent = JSON.stringify(
      {
        viewport: {
          mode: layoutMode,
          containerWidth,
          pageWidth: doc.save().documentStyle.pageSize?.width,
          viewScale: injector
            .get(IRenderManagerService)
            .getRenderUnitById(doc.getId())
            ?.with(DocViewScaleService)
            .getViewScale(),
        },
        renderedImages: doc.getImages().map((image) => {
          const shape = injector
            .get(IRenderManagerService)
            .getRenderUnitById(doc.getId())
            ?.scene.getObject(
              getDrawingShapeKeyByDrawingSearch({
                unitId: doc.getId(),
                subUnitId: doc.getId(),
                drawingId: image.getId(),
              }),
            )
          return {
            id: image.getId(),
            exists: shape instanceof RenderImage,
            crop: shape instanceof RenderImage ? (shape.srcRect ?? null) : null,
          }
        }),
        images: doc.getImages().map((image) => ({
          id: image.getId(),
          size: image.getSize(),
          angle: image.getAngle(),
          positionH: image.getPositionH(),
          positionV: image.getPositionV(),
          data: image.getImageData(),
        })),
        blocks: doc.save().body?.customBlocks ?? [],
        paragraphs: doc.getParagraphs().map((p) => ({ text: p.getText(), range: p.getRange() })),
        groups: doc.getColumnGroups().map((g) => g.describe()),
        groupRanges: doc.getColumnGroups().map((g) => ({ id: g.getId(), range: g.getRange() })),
        tables: doc.getTables().map((t) => ({
          id: t.getId(),
          values: Array.from({ length: t.getRowCount() }, (_, r) =>
            Array.from({ length: t.getColumnCount() }, (_c, c) => t.getCellText(r, c)),
          ),
        })),
        charts: doc.getCharts().map((chart) => ({ id: chart.getId(), info: chart.getInfo() })),
        layout: pages.map((p) => ({
          pageWidth: p.pageWidth,
          contentWidth: p.width,
          tables: Array.from(p.skeTables.values()).map((table) => ({
            id: table.tableId,
            width: table.width,
            height: table.height,
          })),
          groups: Array.from(p.skeColumnGroups.values()).map((group) => ({
            id: group.columnGroupId,
            width: group.width,
            height: group.height,
            columns: group.columns.map((column) => ({
              id: column.columnId,
              left: column.left,
              top: column.top,
              width: column.width,
              height: column.height,
            })),
          })),
          drawings: Array.from(p.skeDrawings.values()).map((d) => ({
            id: d.drawingId,
            left: d.aLeft,
            top: d.aTop,
            width: d.width,
            height: d.height,
          })),
          sections: p.sections.map((s) => ({
            columns: s.columns.map((c) => ({
              lines: c.lines.map((l) => ({
                top: l.top,
                height: l.lineHeight,
                divides: l.divides.map((d) => ({ left: d.left, width: d.width, start: d.st, end: d.ed })),
              })),
            })),
          })),
        })),
        zoomRatio: doc.save().settings?.zoomRatio ?? 1,
      },
      null,
      2,
    )
  }
  async function run(action: () => string | Promise<string>) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    error.hidden = true
    try {
      const message = await action()
      await inspect()
      if (!disposed) {
        const image = doc.getImage(IMAGE_ID),
          data = image?.getImageData(),
          size = image?.getSize()
        if (size) {
          field('Width').value = String(size.width)
          field('Height').value = String(size.height)
        }
        if (data)
          field('Wrapping').value =
            data.layoutType === PositionedObjectLayoutType.WRAP_NONE
              ? data.behindDoc === BooleanNumber.TRUE
                ? 'BEHIND_TEXT'
                : 'IN_FRONT_OF_TEXT'
              : PositionedObjectLayoutType[data.layoutType]
        status.textContent = message
      }
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
    'change',
    (event) => {
      if (event.target === field('Document layout'))
        void run(() => 'Applied ' + field('Document layout').value + ' layout')
    },
    { signal: events.signal },
  )
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action) return
      void run(async () => {
        if (['reset', 'empty', 'roundtrip'].includes(action)) {
          const snapshot = structuredClone(
            action === 'reset' ? baseline : action === 'roundtrip' ? doc.save() : createData(true),
          )
          snapshot.id = 'kestrel-images-' + ++generation
          clearHistory()
          api.disposeUnit(doc.getId())
          doc = api.createDocument(snapshot)
          if (action !== 'roundtrip') {
            field('Document layout').value = 'reflow'
            field('Wrapping').value = 'INLINE'
            field('Width').value = '240'
            field('Height').value = '150'
            field('Alignment').value = 'LEFT'
            field('Crop').value = 'full'
            field('Alt text').value = ALT_TEXT
          }
          scrollTo(0)
          return action === 'empty'
            ? 'Empty document ready; insert an image at the start'
            : action === 'reset'
              ? 'Original Kestrel memo restored'
              : 'Current image and mixed content reloaded from SDK snapshot'
        }
        if (action === 'insert') return insertImage()
        if (action === 'inspect') return 'Read current SDK image and text layout'
        if (action === 'chart') {
          const anchor = doc.save().body?.customBlocks?.find((block) => block.blockId === 'kestrel-chart')
          if (!anchor) throw new Error('Chart is absent. Reset restores the memo.')
          scrollTo(anchor.startIndex + 1)
          return 'Showing the independent chart'
        }
        if (action === 'undo' || action === 'redo') {
          requireSuccess(
            await api.executeCommand(action === 'undo' ? 'univer.command.undo' : 'univer.command.redo'),
            action + ' returned false.',
          )
          return action + ' completed through SDK history'
        }
        const image = currentImage()
        if (action === 'wrap') {
          requireSuccess(
            image.setWrappingStyle(TextWrappingStyle[field('Wrapping').value as keyof typeof TextWrappingStyle]),
            'Wrapping update failed.',
          )
          return 'Applied ' + field('Wrapping').value
        }
        if (action === 'resize') {
          const width = Number(field('Width').value),
            height = Number(field('Height').value)
          if (
            !Number.isFinite(width) ||
            !Number.isFinite(height) ||
            width < 40 ||
            width > 600 ||
            height < 40 ||
            height > 400
          )
            throw new Error('Width must be 40–600 and height 40–400 pixels.')
          requireSuccess(image.setSize(width, height), 'Resize failed.')
          return 'Resized to ' + width + ' × ' + height
        }
        if (action === 'align') {
          if (image.getImageData()?.layoutType === PositionedObjectLayoutType.INLINE)
            throw new Error('Choose a floating wrapping style before horizontal alignment.')
          requireSuccess(
            image.setPositionH({
              relativeFrom: ObjectRelativeFromH.MARGIN,
              align: AlignTypeH[field('Alignment').value as keyof typeof AlignTypeH],
            }),
            'Alignment failed.',
          )
          return 'Aligned floating image ' + field('Alignment').value
        }
        if (action === 'crop') {
          const crop = field('Crop').value
          const rect =
            crop === 'recorder'
              ? { left: 60, right: 60, top: 0, bottom: 0 }
              : crop === 'horizon'
                ? { left: 0, right: 0, top: 30, bottom: 45 }
                : null
          const size =
            crop === 'recorder'
              ? { width: 120, height: 150 }
              : crop === 'horizon'
                ? { width: 240, height: 75 }
                : { width: 240, height: 150 }
          requireSuccess(
            api.syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
              unitId: doc.getId(),
              subUnitId: doc.getId(),
              drawings: [
                { drawingId: IMAGE_ID, key: 'srcRect', value: rect },
                { drawingId: IMAGE_ID, key: 'size', value: size },
              ],
            }),
            'Crop update failed.',
          )
          return 'Applied ' + crop + ' crop to SDK source rectangle and image size'
        }
        if (action === 'alt') {
          const description = field('Alt text').value.trim()
          if (!description || description.length > 300)
            throw new Error('Enter descriptive alt text from 1 to 300 characters.')
          const old = image.getImageData()!.description
          if (old === description) return 'Alt text already matches; no duplicate history entry'
          // No image Facade setter exists for alt text in beta.2. Use the SDK document mutation, not host-only state.
          requireSuccess(api.syncExecuteCommand(setDescriptionId, { description }), 'Alt text mutation failed.')
          return 'Stored descriptive alt text in the real document image metadata'
        }
        if (action === 'rotate') {
          requireSuccess(image.setRotate((image.getAngle() ?? 0) + 15), 'Rotation failed.')
          return 'Rotated image by 15 degrees'
        }
        if (action === 'delete') {
          requireSuccess(image.remove(), 'Image removal failed.')
          return 'Removed image and its document anchor'
        }
        const anchor = doc.save().body?.customBlocks?.find((block) => block.blockId === IMAGE_ID)
        if (!anchor) throw new Error('Image has no document anchor.')
        scrollTo(Math.max(0, anchor.startIndex - 1))
        return 'Showing the image anchor in the SDK editor'
      })
    },
    { signal: events.signal },
  )
  void rendered.then(async () => {
    if (disposed) return
    ready = true
    await run(() => {
      initialize()
      baseline = structuredClone(doc.save())
      return 'Kestrel mixed-content memo ready'
    })
    if (!disposed) {
      scrollTo(0)
      root.dataset.ready = 'true'
    }
  })
  return {
    dispose() {
      disposed = true
      resize.disconnect()
      cancelAnimationFrame(resizeFrame)
      events.abort()
      lifecycle.dispose()
      descriptionCommand.dispose()
      univer.dispose()
      root.remove()
    },
  }
}
