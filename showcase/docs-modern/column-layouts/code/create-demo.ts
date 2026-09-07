import type { IDocImage } from '@univerjs/preset-docs-drawing'
import { InsertDocChartCommand, UniverDocsChartPlugin } from '@univerjs-pro/docs-chart'
import { UniverDocsChartUIPlugin } from '@univerjs-pro/docs-chart-ui'
import ChartEnUS from '@univerjs-pro/docs-chart-ui/locale/en-US'
import { ColumnPosition, UniverDocsColumnPlugin } from '@univerjs-pro/docs-column'
import { UniverDocsColumnUIPlugin } from '@univerjs-pro/docs-column-ui'
import ColumnEnUS from '@univerjs-pro/docs-column-ui/locale/en-US'
import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { UniverDocsTableUIPlugin } from '@univerjs-pro/docs-table-ui'
import TableEnUS from '@univerjs-pro/docs-table-ui/locale/en-US'
import { ChartTypeBits } from '@univerjs-pro/engine-chart'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import {
  BooleanNumber,
  DrawingTypeEnum,
  ImageSourceType,
  IUndoRedoService,
  IUniverInstanceService,
  PositionedObjectLayoutType,
  WrapTextType,
} from '@univerjs/core'
import {
  buildDocTransform,
  docDrawingPositionToTransform,
  DocSelectionManagerService,
  DocSkeletonManagerService,
  DocStateChangeManagerService,
} from '@univerjs/docs'
import { DocBackScrollRenderController, SetDocZoomRatioOperation } from '@univerjs/docs-ui'
import { Documents, IRenderManagerService } from '@univerjs/engine-render'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { InsertDocDrawingCommand, UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { BOOKINGS, CHART_VALUES, COLUMN_TEXT, createData, GROUP_ID, TABLE_ID, TOOLS_SVG } from './data'

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
  root.className = 'columns-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML =
    '<fieldset disabled>' +
    '<label>Layout<select aria-label="Layout"><option value="2">Two — welcome and diagnosis</option><option value="3">Three — add parts bench</option><option value="4">Four — add repair station</option><option value="5">Five — full visitor journey</option></select></label><button data-action="load">Load layout</button><button data-action="insert">Insert column group</button>' +
    '<label>Column<select aria-label="Column"></select></label><label>Width ratios<input aria-label="Width ratios" value="2,1"></label><button data-action="ratios">Apply ratios</button><button data-action="equal">Equal widths</button>' +
    '<button data-action="add-left">Add left</button><button data-action="add-right">Add right</button><button data-action="delete-column">Delete column</button><button data-action="delete-group">Delete group</button>' +
    '<button data-action="table">Insert booking table</button><button data-action="image">Insert toolbox image</button><button data-action="paragraph">Append handoff note</button><button data-action="select">Select column heading</button>' +
    '<button data-action="show-layout">Show layout</button><button data-action="chart">Show chart</button><button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="missing">Try missing group</button><button data-action="inspect">Inspect</button><button data-action="roundtrip">Reload snapshot</button><button data-action="empty">Empty document</button><button data-action="reset">Reset</button></fieldset>' +
    '<p role="status">Starting Juniper memo…</p><p role="alert" hidden></p><p class="hint">Real SDK ColumnGroups with stable IDs and fresh insertion offsets. Known beta.2 issues: the nested toolbox image has layout bounds but is hidden by the drawing UI; deleting its group leaves orphan image and table resources. Reinsertion reports this conflict; Reset recovers the fixture. Column insertion and text filling are separate history steps. Fit-width zoom is not document reflow; trial watermarks remain.</p>' +
    '<details><summary>SDK columns, child ownership and rendered layout</summary><pre><output aria-label="SDK readback"></output></pre></details><div class="columns-editor"></div>'
  container.append(root)
  const controls = root.querySelector('fieldset')!,
    layout = root.querySelector<HTMLSelectElement>('[aria-label="Layout"]')!,
    target = root.querySelector<HTMLSelectElement>('[aria-label="Column"]')!,
    ratios = root.querySelector<HTMLInputElement>('[aria-label="Width ratios"]')!
  const editor = root.querySelector<HTMLElement>('.columns-editor')!,
    output = root.querySelector('output')!,
    status = root.querySelector<HTMLElement>('[role="status"]')!,
    error = root.querySelector<HTMLElement>('[role="alert"]')!
  const events = new AbortController()
  let disposed = false,
    ready = false,
    busy = false,
    generation = 0,
    added = 0
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
  let resolveRendered: (() => void) | undefined
  const rendered = new Promise<void>((resolve) => {
    resolveRendered = resolve
  })
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === api.Enum.LifecycleStages.Rendered) resolveRendered?.()
  })
  let doc = api.createDocument(createData()),
    baseline = structuredClone(doc.save())
  function clearHistory() {
    injector.get(DocStateChangeManagerService).clearHistory(doc.getId())
    injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
  }
  function paragraph(marker: string) {
    const found = doc.getParagraphs().filter((p) => p.getText().includes(marker))
    if (found.length !== 1) throw new Error('Expected one ' + marker + ' paragraph. Reset restores the memo.')
    return found[0]
  }
  function group() {
    const found = doc.getColumnGroup(GROUP_ID)
    if (!found) throw new Error('Workstation group is absent. Insert it or Reset.')
    return found
  }
  function column() {
    const found = group().getColumn(target.value)
    if (!found) throw new Error('Choose an existing workstation column.')
    return found
  }
  function insertGroup() {
    if (doc.getColumnGroup(GROUP_ID)) return 'Workstation group already exists; no duplicate'
    const count = Number(layout.value)
    if (!Number.isInteger(count) || count < 2 || count > 5) throw new Error('Column count must be from 2 to 5.')
    const created = doc.insertColumnGroup(count, {
      columnGroupId: GROUP_ID,
      columnIds: COLUMN_TEXT.slice(0, count).map((_text, i) => 'juniper-column-' + i),
      offset: paragraph('03 · Booking notes').getRange().startOffset,
      widthRatios: count === 2 ? [2, 1] : Array.from({ length: count }, () => 1),
      gap: 16,
    })
    requireSuccess(created, 'Could not insert column group.')
    COLUMN_TEXT.slice(0, count).forEach((text, index) =>
      requireSuccess(created!.getColumn(index)?.setText(text), 'Could not set initial column text.'),
    )
    return 'Inserted ' + count + ' real document columns'
  }
  function insertTable() {
    if (doc.getTable(TABLE_ID)) return 'Booking table already exists; no duplicate'
    if (doc.save().tableSource?.[TABLE_ID])
      throw new Error(
        'SDK retained an orphan booking table after column deletion. Reset recovers the fixture; no table was inserted.',
      )
    const current = group(),
      last = current.getColumn(current.getColumnCount() - 1)!
    const offset = last.appendParagraph('').getRange().startOffset
    requireSuccess(
      doc.insertTableFromData(
        BOOKINGS.map((cells) => Array.from(cells)),
        {
          tableId: TABLE_ID,
          offset,
          width: 100,
          columnWidths: [52, 48],
          headerRowCount: 1,
          cellMargin: { start: { v: 3 }, end: { v: 3 }, top: { v: 3 }, bottom: { v: 3 } },
        },
      ),
      'Could not insert booking table in final column.',
    )
    requireSuccess(
      doc.getTable(TABLE_ID)?.setCellBackground(doc.getTable(TABLE_ID)!.getRowRange(0), '#FEF3C7'),
      'Could not style booking header.',
    )
    return 'Inserted booking table in column ' + last.getId()
  }
  function insertImage() {
    if (doc.getImage('juniper-toolbox')) {
      if (!doc.save().body?.customBlocks?.some((block) => block.blockId === 'juniper-toolbox'))
        throw new Error(
          'SDK retained an orphan toolbox image after column deletion. Reset recovers the fixture; no anchored image was inserted.',
        )
      return 'Toolbox image already exists; no duplicate'
    }
    const first = group().getColumn(0)!,
      offset = first.appendParagraph('').getRange().startOffset
    const docTransform = buildDocTransform(100, 60)
    const image: IDocImage = {
      unitId: doc.getId(),
      subUnitId: doc.getId(),
      drawingId: 'juniper-toolbox',
      drawingType: DrawingTypeEnum.DRAWING_IMAGE,
      imageSourceType: ImageSourceType.BASE64,
      source: 'data:image/svg+xml;base64,' + btoa(TOOLS_SVG),
      docTransform,
      transform: docDrawingPositionToTransform(docTransform),
      behindDoc: BooleanNumber.FALSE,
      title: 'Shared repair tools',
      description: 'Original CC0 diagram of a mallet, spanner and spare washer.',
      layoutType: PositionedObjectLayoutType.INLINE,
      wrapText: WrapTextType.BOTH_SIDES,
      distB: 0,
      distT: 0,
      distL: 0,
      distR: 0,
    }
    requireSuccess(
      api.syncExecuteCommand(InsertDocDrawingCommand.id, {
        unitId: doc.getId(),
        drawings: [image],
        textRange: { startOffset: offset, endOffset: offset, collapsed: true },
      }),
      'Could not insert image in welcome column.',
    )
    return 'Inserted image in column ' + first.getId()
  }
  function initialize() {
    insertGroup()
    insertTable()
    insertImage()
    const reference = doc.insertColumnGroup(2, {
      columnGroupId: 'juniper-handoff',
      columnIds: ['juniper-opening', 'juniper-closing'],
      offset: paragraph('06 · Closeout').getRange().startOffset,
      gap: 16,
      widthRatios: [1, 1],
    })
    requireSuccess(reference, 'Could not insert reference group.')
    requireSuccess(
      reference!.getColumn(0)?.setText('Opening\rPriya checks the room and confirms eight volunteer places.'),
      'Could not set opening note.',
    )
    requireSuccess(
      reference!.getColumn(1)?.setText('Closing\rOscar counts returned tools and follows up on unresolved tickets.'),
      'Could not set closing note.',
    )
    const offset =
      paragraph('Completed repairs by work type').getRange().startOffset + 'Completed repairs by work type'.length + 1
    requireSuccess(
      api.syncExecuteCommand(InsertDocChartCommand.id, {
        unitId: doc.getId(),
        chart: { id: 'juniper-repairs', chartType: ChartTypeBits.Column },
        dataSource: {
          id: 'juniper-repair-counts',
          values: CHART_VALUES.map((cells) => Array.from<string | number>(cells)),
        },
        drawing: { drawingId: 'juniper-chart', layoutType: PositionedObjectLayoutType.INLINE },
        textRange: { startOffset: offset, endOffset: offset, collapsed: true },
        width: 560,
        height: 240,
        focus: false,
      }),
      'Could not insert repair chart.',
    )
    clearHistory()
  }
  function syncControls() {
    const previous = target.value,
      current = doc.getColumnGroup(GROUP_ID)
    target.replaceChildren()
    for (const col of current?.getColumns() ?? [])
      target.add(new Option(col.getIndex() + 1 + ' · ' + col.getId(), col.getId()))
    if (current?.getColumn(previous)) target.value = previous
    ratios.value = current?.getWidthRatios().join(',') ?? ''
  }
  function scrollTo(offset: number) {
    injector
      .get(IRenderManagerService)
      .getRenderUnitById(doc.getId())
      ?.with(DocBackScrollRenderController)
      .scrollToRange({ startOffset: offset, endOffset: offset, collapsed: true })
  }
  function showLayout() {
    const render = injector.get(IRenderManagerService).getRenderUnitById(doc.getId())
    const viewport = render?.scene.getViewport('viewMain')
    if (!(render?.mainComponent instanceof Documents) || !viewport) return
    const offsets = render.mainComponent.getOffsetConfig()
    let pageTop = offsets.docsTop
    for (const page of render.with(DocSkeletonManagerService).getSkeleton().getSkeletonData()?.pages ?? []) {
      const fragment = page.skeColumnGroups.get(GROUP_ID)
      if (fragment) {
        const deltaY = pageTop + page.marginTop + fragment.top - 56 - viewport.calcViewportInfo().viewBound.top
        viewport.scrollByBarDeltaValue(viewport.transViewportScroll2ScrollValue(0, deltaY))
        return
      }
      pageTop += page.pageHeight + offsets.pageMarginTop
    }
  }
  function fitWidth() {
    if (!ready || disposed) return
    const width = injector.get(IRenderManagerService).getRenderUnitById(doc.getId())?.mainComponent?.width
    if (!width) return
    const zoomRatio = Math.min(1, Math.max(0.1, (editor.clientWidth - 24) / (width + 80)))
    if (Math.abs((doc.save().settings?.zoomRatio ?? 1) - zoomRatio) > 0.001)
      api.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId: doc.getId(), zoomRatio })
  }
  const resize = new ResizeObserver(fitWidth)
  resize.observe(editor)
  async function inspect() {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (disposed) return
    fitWidth()
    const skeleton = injector
      .get(IRenderManagerService)
      .getRenderUnitById(doc.getId())
      ?.with(DocSkeletonManagerService)
      .getSkeleton()
    const pages = skeleton?.getSkeletonData()?.pages ?? []
    output.textContent = JSON.stringify(
      {
        groups: doc.getColumnGroups().map((g) => ({
          description: g.describe(),
          range: g.getRange(),
          columns: g.getColumns().map((col) => ({
            id: col.getId(),
            range: col.getContentRange(),
            insertOffset: col.getInsertOffset(),
            paragraphs: col.getParagraphs().map((p) => ({ text: p.getText(), range: p.getRange() })),
          })),
          layout: pages
            .flatMap((p) => Array.from(p.skeColumnGroups.values()))
            .filter((f) => f.columnGroupId === g.getId())
            .map((f) => ({
              width: f.width,
              height: f.height,
              columns: f.columns.map((c) => ({
                id: c.columnId,
                left: c.left,
                top: c.top,
                width: c.width,
                height: c.height,
                tables: Array.from(c.page.skeTables.values()).map((t) => ({
                  id: t.tableId,
                  width: t.width,
                  height: t.height,
                })),
                drawings: Array.from(c.page.skeDrawings.values()).map((d) => ({
                  id: d.drawingId,
                  width: d.width,
                  height: d.height,
                })),
              })),
            })),
        })),
        tables: doc.getTables().map((t) => ({
          id: t.getId(),
          range: t.getRange(),
          values: Array.from({ length: t.getRowCount() }, (_, r) =>
            Array.from({ length: t.getColumnCount() }, (_cell, c) => t.getCellText(r, c)),
          ),
        })),
        drawings: Object.values(doc.save().drawings ?? {}).map(
          ({ unitId: _unitId, subUnitId: _subUnitId, ...drawing }) => drawing,
        ),
        blocks: doc.save().body?.customBlocks ?? [],
        tableResources: Object.keys(doc.save().tableSource ?? {}),
        charts: doc.getCharts().map((chart) => ({ id: chart.getId(), info: chart.getInfo() })),
        paragraphs: doc.getParagraphs().map((p) => p.getText()),
        selection: injector.get(DocSelectionManagerService).getTextRanges(),
        zoomRatio: doc.save().settings?.zoomRatio ?? 1,
      },
      null,
      2,
    )
  }
  async function run(action: () => string) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    error.hidden = true
    try {
      const message = action()
      syncControls()
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
      void run(() => {
        if (['load', 'reset', 'empty', 'roundtrip'].includes(action)) {
          const snapshot = structuredClone(
            action === 'reset' ? baseline : action === 'roundtrip' ? doc.save() : createData(action === 'empty'),
          )
          snapshot.id = 'juniper-columns-demo-' + ++generation
          clearHistory()
          api.disposeUnit(doc.getId())
          doc = api.createDocument(snapshot)
          if (action === 'load') initialize()
          if (action === 'reset' || action === 'empty') {
            layout.value = '2'
            added = 0
          }
          if (action !== 'roundtrip') target.replaceChildren()
          scrollTo(0)
          return action === 'empty'
            ? 'Empty modern document'
            : action === 'roundtrip'
              ? 'Current SDK snapshot reloaded'
              : 'Juniper layout restored'
        }
        if (action === 'inspect') {
          root.querySelector('details')!.open = true
          return 'Read SDK column identity, offsets and geometry'
        }
        if (action === 'insert') return insertGroup()
        if (action === 'table') return insertTable()
        if (action === 'image') return insertImage()
        if (action === 'show-layout') {
          group()
          showLayout()
          return 'Showing workstation column content'
        }
        if (action === 'chart') {
          scrollTo(paragraph('These original fictional counts').getRange().startOffset)
          return 'Showing independent repair chart'
        }
        if (action === 'missing') {
          requireSuccess(doc.getColumnGroup('missing-group'), 'No group has ID missing-group; document unchanged.')
          return 'Found group'
        }
        if (action === 'undo' || action === 'redo') {
          requireSuccess(
            action === 'undo' ? doc.undo() : doc.redo(),
            'SDK ' + action + ' did not complete (or no history exists).',
          )
          return action + ' applied'
        }
        const current = group()
        if (action === 'delete-group') {
          requireSuccess(current.remove(), 'Could not remove column group.')
          return 'Removed workstation group and its content'
        }
        if (action === 'ratios' || action === 'equal') {
          const values =
            action === 'equal'
              ? Array.from({ length: current.getColumnCount() }, () => 1)
              : ratios.value.split(',').map((text) => (text.trim() ? Number(text) : NaN))
          if (values.length !== current.getColumnCount() || values.some((n) => !Number.isFinite(n) || n <= 0))
            throw new Error('Enter one positive finite ratio per column, separated by commas.')
          requireSuccess(current.setWidthRatios(values), 'Could not change column ratios.')
          return 'Updated real SDK column ratios'
        }
        const selected = column()
        if (action === 'add-left' || action === 'add-right') {
          if (current.getColumnCount() >= 5) throw new Error('Column groups support at most five columns.')
          const created = current.addColumn(
            selected.getId(),
            action === 'add-left' ? ColumnPosition.LEFT : ColumnPosition.RIGHT,
            'juniper-added-' + ++added,
          )
          requireSuccess(created, 'Could not add column.')
          requireSuccess(
            created!.setText('Volunteer handoff ' + added + '\rRecord open questions and the next person responsible.'),
            'Could not set handoff text.',
          )
          return 'Added a column using SDK insertion followed by its text edit; these are separate history steps'
        }
        if (action === 'delete-column') {
          if (current.getColumnCount() <= 2)
            throw new Error('Keep at least two columns; remove the group to delete both.')
          requireSuccess(current.deleteColumn(selected.getId()), 'Could not delete column.')
          return 'Deleted column and its contents'
        }
        if (action === 'paragraph') {
          selected.appendParagraph('Handoff: ask the coordinator before moving an unresolved item.')
          return 'Appended a real paragraph in ' + selected.getId()
        }
        const heading = selected.getParagraphs().find((p) => p.getText().trim())
        if (!heading) throw new Error('This column has no heading to select.')
        const offset = heading.getRange().startOffset
        injector.get(IUniverInstanceService).focusUnit(doc.getId())
        doc.setSelection(offset, offset + heading.getText().length)
        scrollTo(offset)
        return 'Selected native column heading'
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
      return 'Juniper 2:1 layout with real column children ready'
    })
    if (!disposed) {
      showLayout()
      root.dataset.ready = 'true'
    }
  })
  return {
    dispose() {
      disposed = true
      resize.disconnect()
      events.abort()
      lifecycle.dispose()
      univer.dispose()
      root.remove()
    },
  }
}
