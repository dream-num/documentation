import { UniverLicensePlugin } from '@univerjs-pro/license'
import { DimensionOutlineAxis, UniverSheetsOutlinePlugin } from '@univerjs-pro/sheets-outline'
import { UniverSheetsOutlineUIPlugin } from '@univerjs-pro/sheets-outline-ui'
import outlineEnUS from '@univerjs-pro/sheets-outline-ui/locale/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createFixture, FIXTURE_CLOCK, QUARTERS, SHEET_ID } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs-pro/sheets-outline-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/sheets-outline/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'outline-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<section aria-label="Demo controls"><p><strong>Alder seasonal equipment</strong> · 120 fictional orders, native row and column outlines.</p>
    <details class="outline-controls" open><summary>Example controls and API boundaries</summary>
      <fieldset><label>Apply row view <select aria-label="Detail level"><option value="" disabled>Choose view…</option><option value="quarters">Quarter summary</option><option value="months">Monthly summary</option><option value="q2">Q2 detail</option><option value="all">All detail</option></select></label>
      <label>Group <select aria-label="Outline target"></select></label><button data-action="toggle">Toggle selected</button><button data-action="remove">Remove selected</button><button data-action="clear">Clear Q2 months</button></fieldset>
      <fieldset><label>Axis <select aria-label="Group axis"><option value="row">Rows</option><option value="column">Columns</option></select></label><label>Start (1-based) <input aria-label="Group start" type="number" value="4" min="1" step="1"></label><label>Count <input aria-label="Group count" type="number" value="5" min="1" step="1"></label><button data-action="add">Group custom range</button></fieldset>
      <fieldset><label>Boundary <select aria-label="Boundary request"><option value="crossing">Crossing Q1 / Q2</option><option value="bounds">Beyond last row</option><option value="zero">Zero rows</option></select></label><button data-action="reject">Try boundary request</button><button data-action="empty">Empty table</button><button data-action="reload">Save & reload</button><button data-action="reset">Reset orders</button></fieldset>
      <p>Facade operations return the worksheet, not a success flag. Inspect actual groups and hidden dimensions. Removing a group is not an unhide action. Clear uses inclusive [37, 68] zero-based rows, retaining Q2's enclosing group. Adjacent groups may merge. Native Undo/Redo works per operation; detail presets are not one transaction. Reload clears history; empty/reset/theme changes discard edits.</p>
    </details><p role="status" aria-live="polite">Waiting for outline plugins…</p><p aria-label="Visible dimension counts"></p><details><summary>SDK outlines, visibility and values</summary><pre aria-label="Outline readback"></pre></details></section><div class="outline-editor"></div>`
  container.append(root)
  root.querySelector<HTMLDetailsElement>('.outline-controls')!.open = container.clientWidth >= 600
  const view = root.querySelector<HTMLSelectElement>('[aria-label="Detail level"]')!
  const target = root.querySelector<HTMLSelectElement>('[aria-label="Outline target"]')!
  const axis = root.querySelector<HTMLSelectElement>('[aria-label="Group axis"]')!
  const start = root.querySelector<HTMLInputElement>('[aria-label="Group start"]')!
  const count = root.querySelector<HTMLInputElement>('[aria-label="Group count"]')!
  const boundary = root.querySelector<HTMLSelectElement>('[aria-label="Boundary request"]')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const counts = root.querySelector<HTMLElement>('[aria-label="Visible dimension counts"]')!
  const output = root.querySelector<HTMLElement>('pre')!
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-action]')]
  let disposed = false,
    initialized = false,
    frame = 0,
    generation = 0
  let lastOperation: { action: string; changed: boolean } | null = null
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, outlineEnUS) },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: root.querySelector<HTMLElement>('.outline-editor')! }),
    ],
    plugins: [UniverLicensePlugin, UniverSheetsOutlinePlugin, UniverSheetsOutlineUIPlugin],
  })
  let workbook = univerAPI.createWorkbook(createFixture())
  const sheet = () => workbook.getSheetBySheetId(SHEET_ID)!
  const outlines = () => sheet().getDimensionOutlines()
  function signature() {
    const snapshot = workbook.save().sheets[SHEET_ID]
    return JSON.stringify([outlines(), snapshot.rowData, snapshot.columnData])
  }
  function applyView(mode: string) {
    // Expand parents before children, then collapse the requested summary levels.
    for (const group of outlines()
      .filter((g) => g.axis === DimensionOutlineAxis.ROW)
      .toSorted((a, b) => b.end - b.start - (a.end - a.start)))
      if (group.collapsed) sheet().setDimensionOutlineCollapsed(group.id, false)
    for (const quarter of QUARTERS) {
      for (const group of outlines().filter((g) => g.axis === DimensionOutlineAxis.ROW)) {
        const parent = group.start === quarter.start && group.end === quarter.end
        const month = quarter.months.some((m) => group.start === m.start && group.end === m.end)
        if (
          (parent && (mode === 'quarters' || (mode === 'q2' && quarter.label !== 'Q2'))) ||
          (month && mode === 'months')
        )
          sheet().setDimensionOutlineCollapsed(group.id, true)
      }
    }
  }
  function seed() {
    for (const quarter of QUARTERS) {
      sheet().addRowOutline(quarter.start, quarter.end - quarter.start + 1)
      for (const month of quarter.months) sheet().addRowOutline(month.start, 10)
    }
    sheet().addColumnOutline(3, 3).addColumnOutline(4, 2)
    applyView('quarters')
  }
  function readback() {
    if (disposed) return
    const ready = univerAPI.getCurrentLifecycleStage() >= LifecycleStages.Steady
    if (ready && !initialized) {
      initialized = true
      seed()
      status.textContent = 'Quarter groups collapsed. Choose a detail level or a native outline control.'
    }
    root.dataset.ready = String(ready)
    const groups = outlines().toSorted((a, b) => a.axis.localeCompare(b.axis) || a.start - b.start || b.end - a.end)
    const selected = target.value
    // Depth is derived from Facade ranges, not fetched from a private model or DOM.
    const parents: typeof groups = []
    const derived = groups.map((group) => {
      while (parents.length && (parents.at(-1)!.axis !== group.axis || group.start > parents.at(-1)!.end)) parents.pop()
      const depth = parents.length + 1
      parents.push(group)
      return { ...group, depth }
    })
    const choices = derived.map((group) => {
      const range =
        group.axis === 'row'
          ? `${group.start + 1}:${group.end + 1}`
          : sheet()
              .getRange(0, group.start, 1, group.end - group.start + 1)
              .getA1Notation()
              .replace(/\d+/g, '')
      return new Option(
        `${group.axis} ${range} · level ${group.depth} · ${group.collapsed ? 'collapsed' : 'expanded'}`,
        group.id,
      )
    })
    target.replaceChildren(...choices)
    if (groups.some((g) => g.id === selected)) target.value = selected
    const snapshot = workbook.save().sheets[SHEET_ID]
    const rowCount = sheet().getMaxRows(),
      columnCount = sheet().getMaxColumns()
    const hiddenRows = Array.from({ length: rowCount }, (_, i) => i).filter((i) => snapshot.rowData?.[i]?.hd === 1)
    const hiddenColumns = Array.from({ length: columnCount }, (_, i) => i).filter(
      (i) => snapshot.columnData?.[i]?.hd === 1,
    )
    const populatedRows = Object.keys(snapshot.cellData ?? {}).map(Number)
    const visiblePopulatedRows = populatedRows.filter((i) => !hiddenRows.includes(i)).length
    const values = sheet().getRange(0, 0, rowCount, columnCount).getValues()
    counts.textContent = `${visiblePopulatedRows} / ${populatedRows.length} populated rows visible · ${rowCount - hiddenRows.length} / ${rowCount} total rows · ${columnCount - hiddenColumns.length} / ${columnCount} columns · ${groups.length} groups`
    output.textContent = JSON.stringify(
      {
        fixtureClock: FIXTURE_CLOCK,
        target: target.value,
        outlines: derived,
        lastOperation,
        visiblePopulatedRows,
        populatedRows: populatedRows.length,
        rowCount,
        columnCount,
        hiddenRows,
        hiddenColumns,
        values,
        outlineResource:
          workbook.save().resources?.find((resource) => resource.name === 'SHEET_OUTLINE_PLUGIN') ?? null,
      },
      null,
      2,
    )
    const from = Number(start.value) - 1,
      size = Number(count.value)
    const duplicate = groups.some((g) => g.axis === axis.value && g.start === from && g.end === from + size - 1)
    for (const button of buttons)
      button.disabled =
        !ready ||
        (['toggle', 'remove'].includes(button.dataset.action!) && !groups.length) ||
        (button.dataset.action === 'clear' && !groups.some((g) => g.axis === 'row' && g.start >= 37 && g.end <= 68)) ||
        (button.dataset.action === 'add' &&
          (duplicate || !Number.isInteger(from) || !Number.isInteger(size) || from < 0 || size < 1)) ||
        (button.dataset.action === 'reject' &&
          boundary.value === 'crossing' &&
          !groups.some((g) => g.axis === 'row' && g.start < 33 && g.end >= 33 && g.end < 36))
    target.disabled = !ready || !groups.length
    view.disabled = !ready || !groups.some((g) => g.axis === 'row')
    for (const field of [axis, start, count, boundary]) field.disabled = !ready
  }
  function schedule() {
    if (disposed) return
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(readback)
  }
  function recreate(mode: string) {
    const snapshot = mode === 'reload' ? workbook.save() : createFixture(mode === 'empty')
    univerAPI.disposeUnit(workbook.getId())
    workbook = univerAPI.createWorkbook({ ...snapshot, id: `alder-orders-${++generation}` })
    view.value = ''
    if (mode === 'reset') seed()
    lastOperation = null
  }
  function perform(action: string) {
    const before = signature()
    try {
      const group = outlines().find((g) => g.id === target.value)
      if (action === 'view') {
        applyView(view.value)
        // This is a command picker, not a claim about current native outline state.
        view.value = ''
      }
      if (action === 'toggle' && group) sheet().setDimensionOutlineCollapsed(group.id, !group.collapsed)
      if (action === 'remove' && group) sheet().removeDimensionOutline(group.id)
      if (action === 'clear') sheet().clearDimensionOutlines(DimensionOutlineAxis.ROW, 37, 68)
      if (action === 'add') {
        if (axis.value === 'row') sheet().addRowOutline(Number(start.value) - 1, Number(count.value))
        else sheet().addColumnOutline(Number(start.value) - 1, Number(count.value))
      }
      if (action === 'reject') {
        const rowCount = sheet().getMaxRows()
        const [from, size] =
          boundary.value === 'zero' ? [0, 0] : boundary.value === 'bounds' ? [rowCount - 1, 2] : [33, 4]
        sheet().addRowOutline(from, size)
      }
      if (['reload', 'empty', 'reset'].includes(action)) recreate(action)
      lastOperation = { action, changed: signature() !== before }
      status.textContent = `${action}: ${lastOperation.changed ? 'SDK group / visibility state changed' : 'no SDK group / visibility change observed'}. Inspect native rows, columns and readback.${['reload', 'empty', 'reset'].includes(action) ? ' Workbook recreated; Undo history cleared.' : ''}`
    } catch (error) {
      lastOperation = { action, changed: signature() !== before }
      status.textContent = `Action failed: ${error instanceof Error ? error.message : String(error)}. State changed: ${lastOperation.changed}.`
    }
    schedule()
  }
  const listeners = new AbortController()
  for (const button of buttons)
    button.addEventListener(
      'click',
      () => {
        if (!disposed && root.dataset.ready === 'true') perform(button.dataset.action!)
      },
      { signal: listeners.signal },
    )
  view.addEventListener('change', () => perform('view'), { signal: listeners.signal })
  for (const field of [target, axis, start, count, boundary])
    field.addEventListener('input', schedule, { signal: listeners.signal })
  const subscriptions = [univerAPI.Event.CommandExecuted, univerAPI.Event.LifeCycleChanged].map((event) =>
    univerAPI.addEvent(event, schedule),
  )
  schedule()
  return {
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      listeners.abort()
      subscriptions.forEach((subscription) => subscription.dispose())
      root.remove()
      univer.dispose()
    },
  }
}
