import { UniverBasesPlugin } from '@univerjs-pro/bases'
import {
  buildBaseProjectedRowLayout,
  IBaseUIStateService,
  resolveGridRowHeight,
  UniverBasesUIPlugin,
} from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import {
  BaseViewType,
  IUndoRedoService,
  LocaleType,
  mergeLocales,
  Univer,
  type IGridViewConfig,
  type IProjectedGroup,
} from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createData, FROZEN_TIME, ROWS, STATUSES, VARIANTS } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

function requireSuccess(value: unknown, message: string) {
  if (!value) throw new Error(message)
}
const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
const flatten = (groups: IProjectedGroup[]): IProjectedGroup[] =>
  groups.flatMap((group) => [group, ...flatten(group.children ?? [])])

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'base-groups'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML =
    '<fieldset class="base-groups-controls" disabled><label>Grouping<select aria-label="Grouping"></select></label><button data-action="group">Apply grouping</button><label>View<select aria-label="View"><option value="working">Grouped review</option><option value="reference">Ungrouped reference</option></select></label><button data-action="view">Activate view</button>' +
    '<label>Group<select aria-label="Group"></select></label><button data-action="toggle">Toggle group</button><button data-action="show">Show group</button><button data-action="done">Collapse Done</button><button data-action="expand">Expand all</button>' +
    '<label>Return record<select aria-label="Return record"></select></label><label>Status<select aria-label="Record status"></select></label><button data-action="move">Change status</button><button data-action="reveal">Reveal record</button>' +
    '<button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="inspect">Inspect</button><button data-action="reload">Reload snapshot</button><button data-action="empty">Empty table</button><button data-action="reset">Reset</button></fieldset>' +
    '<p role="status">Starting Mistral returns…</p><p role="alert" hidden></p><p class="hint">Native SDK Grid grouping and collapse. Subtotals are host-computed from SDK membership, not native aggregate fields. Known beta.2 gaps: hideEmptyGroup=false does not create the zero-record Archived group; null estimates paint as 0.00 although numeric counts correctly exclude them. A populated blank-status group is not a zero-record group. Collapse is transient UI state; reload expands groups. Theme changes restore the fixture. Trial watermarks remain.</p>' +
    '<details class="totals"><summary>Group counts and host-computed subtotals</summary><div class="totals-scroll"><table><thead><tr><th scope="col">Group path</th><th scope="col">Records</th><th scope="col">Numeric estimates</th><th scope="col">Estimate subtotal / USD</th></tr></thead><tbody></tbody></table></div></details>' +
    '<details><summary>SDK projection, expanded records and source values</summary><pre><output aria-label="SDK readback"></output></pre></details><div class="base-groups-editor"></div>'
  container.append(root)
  const controls = root.querySelector('fieldset')!,
    output = root.querySelector('output')!,
    activity = root.querySelector<HTMLElement>('[role=status]')!,
    error = root.querySelector<HTMLElement>('[role=alert]')!,
    editor = root.querySelector<HTMLElement>('.base-groups-editor')!
  const select = (name: string) => root.querySelector<HTMLSelectElement>('[aria-label="' + name + '"]')!
  for (const variant of VARIANTS) select('Grouping').add(new Option(variant.label, variant.id))
  const custom = new Option('Custom SDK grouping', 'custom')
  custom.disabled = true
  select('Grouping').add(custom)
  select('Grouping').value = 'nested'
  for (const row of ROWS) select('Return record').add(new Option(row.id + ' · ' + row.item, row.id))
  select('Return record').value = 'r007'
  select('Record status').add(new Option('Unassigned / blank', ''))
  for (const status of STATUSES) select('Record status').add(new Option(status, status))
  select('Record status').value = 'Done'
  const events = new AbortController()
  let disposed = false,
    ready = false,
    busy = false,
    generation = 0,
    refreshFrame = 0,
    signature = ''
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, BasesEnUS, BasesUIEnUS) },
  })
  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverUIPlugin, { container: editor, ribbonType: 'grid' })
  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverDocsUIPlugin)
  univer.registerPlugin(UniverDrawingPlugin)
  univer.registerPlugin(UniverLicensePlugin)
  univer.registerPlugin(UniverBasesPlugin)
  univer.registerPlugin(UniverBasesUIPlugin)
  const api = FUniver.newAPI(univer),
    injector = univer.__getInjector(),
    uiState = () => injector.get(IBaseUIStateService)
  let base = api.createBase(createData())
  const table = () => {
    const current = base.getTableById('returns')
    if (!current) throw new Error('Equipment returns table is absent. Reset to restore it.')
    return current
  }
  const view = () => {
    const current = table().getViewById(api.getBaseUI().getActiveViewId() ?? 'working')
    if (!current || current.getType() !== BaseViewType.Grid) throw new Error('Choose one of the Grid views.')
    return current
  }
  function projection() {
    const current = view().getProjection()
    if (current.type !== BaseViewType.Grid) throw new Error('A valid Grid projection is required.')
    return current
  }
  const clearHistory = () => injector.get(IUndoRedoService).clearUndoRedo(base.getId())
  function expandAll() {
    for (const path of uiState().getCollapsedGroupPaths(view().getId()))
      uiState().toggleCollapsedGroupPath(view().getId(), path)
  }
  function layout() {
    return buildBaseProjectedRowLayout(
      projection(),
      uiState().getCollapsedGroupPaths(view().getId()),
      resolveGridRowHeight((view().getConfig() as IGridViewConfig).rowHeight),
    )
  }
  async function inspect() {
    await paint()
    if (disposed) return
    const current = view(),
      projected = projection(),
      groups = flatten(projected.groups ?? []),
      source = table().getRecords(),
      collapsed = [...uiState().getCollapsedGroupPaths(current.getId())],
      rowLayout = layout()
    const rowsById = new Map(projected.rows.map((row) => [row.recordId, row]))
    const totals = groups.map((group) => {
      const amounts = group.recordIds
        .map((id) => rowsById.get(id)?.values.amount)
        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
      return {
        path: group.path ?? group.fieldId + ':' + group.key,
        key: group.key,
        label: group.label,
        fieldId: group.fieldId,
        level: group.level ?? 0,
        count: group.recordIds.length,
        numericCount: amounts.length,
        subtotal: amounts.reduce((sum, amount) => sum + amount, 0),
        recordIds: group.recordIds,
      }
    })
    const previous = select('Group').value
    select('Group').replaceChildren()
    for (const group of totals)
      select('Group').add(
        new Option('  '.repeat(group.level) + (group.label || '(blank)') + ' · ' + group.count, group.path),
      )
    if (totals.some((group) => group.path === previous)) select('Group').value = previous
    const body = root.querySelector('tbody')!
    body.replaceChildren()
    for (const group of totals) {
      const row = document.createElement('tr')
      for (const value of [group.path, group.count, group.numericCount, group.subtotal]) {
        const cell = document.createElement('td')
        cell.textContent = String(value)
        row.append(cell)
      }
      body.append(row)
    }
    select('View').value = current.getId()
    select('Grouping').value =
      VARIANTS.find((variant) => JSON.stringify(variant.group) === JSON.stringify(current.getGroup()))?.id ?? 'custom'
    output.textContent = JSON.stringify(
      {
        baseId: base.getId(),
        frozenClock: FROZEN_TIME,
        activeViewId: current.getId(),
        rules: current.getGroup(),
        groups: projected.groups ?? [],
        totals,
        collapsedPaths: collapsed,
        expandedRecordIds: rowLayout.filter((row) => row.kind === 'record').map((row) => row.recordId),
        rowLayout,
        projectedRecordIds: projected.rows.map((row) => row.recordId),
        sourceRecordIds: source.map((record) => record.getId()),
        sourceValues: source.map((record) => ({ id: record.getId(), values: record.getValues() })),
        referenceRules: table().getViewById('reference')!.getGroup(),
        tableFieldOrder: table().getTable().fieldOrder,
      },
      null,
      2,
    )
    activity.textContent =
      source.length +
      ' source records · ' +
      projected.rows.length +
      ' projected · ' +
      rowLayout.filter((row) => row.kind === 'record').length +
      ' expanded · ' +
      totals.length +
      ' projected groups'
  }
  async function activate(viewId: string) {
    await api.getBaseUI().activateTable(table().getId())
    await api.getBaseUI().activateView(viewId)
    api.getBaseUI().closeLeftSidebar()
  }
  async function run(action: () => void | Promise<void>) {
    if (disposed || busy) return
    busy = true
    controls.disabled = true
    error.hidden = true
    try {
      await action()
      if (!disposed) await inspect()
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
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (stage !== api.Enum.LifecycleStages.Rendered || ready) return
    void run(async () => {
      await activate('working')
      requireSuccess(
        view().setGroup(structuredClone(VARIANTS.find((v) => v.id === 'nested')!.group)),
        'Initial grouping failed.',
      )
      clearHistory()
      ready = true
      root.dataset.ready = 'true'
      stateChanges = watchState()
    })
  })
  // Native group-header clicks and native view activation use the same UI state.
  let stateChanges: { unsubscribe(): void } | undefined
  const watchState = () =>
    uiState().state$.subscribe((state) => {
      const next = JSON.stringify([
        state.activeViewId,
        Array.from(state.collapsedGroupPaths[state.activeViewId ?? ''] ?? []),
      ])
      if (!ready || disposed || next === signature) return
      signature = next
      cancelAnimationFrame(refreshFrame)
      refreshFrame = requestAnimationFrame(() => {
        if (!busy) void run(() => {})
      })
    })
  const cellChanges = api.addEvent(api.Event.BaseTableCellValueChanged, () => {
    if (ready && !disposed && !busy) void run(() => {})
  })
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action) return
      void run(async () => {
        if (['reset', 'empty', 'reload'].includes(action)) {
          const snapshot = action === 'reload' ? structuredClone(base.save()) : createData(action === 'empty')
          snapshot.id = 'mistral-groups-' + ++generation
          for (const id of ['working', 'reference'])
            for (const path of uiState().getCollapsedGroupPaths(id)) uiState().toggleCollapsedGroupPath(id, path)
          clearHistory()
          api.disposeUnit(base.getId())
          base = api.createBase(snapshot)
          await activate('working')
          if (action !== 'reload') {
            select('Grouping').value = 'nested'
            requireSuccess(
              view().setGroup(structuredClone(VARIANTS.find((v) => v.id === 'nested')!.group)),
              'Grouping failed.',
            )
            select('Return record').value = 'r007'
            select('Record status').value = 'Done'
          }
          clearHistory()
          uiState().setScrollState(view().getId(), { x: 0, y: 0 })
          return
        }
        if (action === 'view') {
          await activate(select('View').value)
          return
        }
        if (action === 'group') {
          const variant = VARIANTS.find((v) => v.id === select('Grouping').value)
          if (!variant) throw new Error('Choose a supported grouping.')
          requireSuccess(view().setGroup(structuredClone(variant.group)), 'SDK rejected grouping.')
          expandAll()
          uiState().setScrollState(view().getId(), { x: 0, y: 0 })
        }
        if (action === 'toggle' || action === 'show' || action === 'done') {
          const groups = flatten(projection().groups ?? []),
            group =
              action === 'done'
                ? groups.find((g) => g.fieldId === 'status' && g.key === 'Done' && g.level === 0)
                : groups.find((g) => g.path === select('Group').value)
          if (!group?.path) throw new Error('Group is absent. Apply Status grouping or Reset.')
          if (
            action === 'toggle' ||
            (action === 'done' && !uiState().getCollapsedGroupPaths(view().getId()).has(group.path))
          )
            uiState().toggleCollapsedGroupPath(view().getId(), group.path)
          if (action === 'show') {
            const target = layout().find((row) => row.kind === 'group-header' && row.groupPath === group.path)
            if (!target) throw new Error('Expand the parent group first.')
            uiState().setScrollState(view().getId(), { x: 0, y: target.y })
          }
        }
        if (action === 'expand') expandAll()
        if (action === 'move') {
          const record = table().getRecordById(select('Return record').value)
          if (!record) throw new Error('Return record is absent. Reset to restore the fixture.')
          requireSuccess(
            record.setValue('status', select('Record status').value || null),
            'SDK rejected record status.',
          )
        }
        if (action === 'reveal') {
          const recordId = select('Return record').value
          if (!table().getRecordById(recordId))
            throw new Error('Return record is absent. Reset to restore the fixture.')
          for (const group of flatten(projection().groups ?? []))
            if (
              group.path &&
              group.recordIds.includes(recordId) &&
              uiState().getCollapsedGroupPaths(view().getId()).has(group.path)
            )
              uiState().toggleCollapsedGroupPath(view().getId(), group.path)
          const target = layout().find((row) => row.recordId === recordId)
          if (!target) throw new Error('The record is filtered out of this view.')
          uiState().setScrollState(view().getId(), { x: 0, y: target.y })
        }
        if (action === 'undo' || action === 'redo')
          requireSuccess(await api.executeCommand('univer.command.' + action), 'Nothing to ' + action + '.')
      })
    },
    { signal: events.signal },
  )
  return {
    dispose() {
      disposed = true
      events.abort()
      cancelAnimationFrame(refreshFrame)
      lifecycle.dispose()
      stateChanges?.unsubscribe()
      cellChanges.dispose()
      clearHistory()
      univer.dispose()
      root.remove()
    },
  }
}
