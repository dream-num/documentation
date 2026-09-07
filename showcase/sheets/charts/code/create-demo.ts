import { UniverSheetsAdvancedPreset } from '@univerjs/preset-sheets-advanced'
import advancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import drawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import type { SheetChart } from './function'
import { WORKBOOK_DATA } from './data'
import { buildChart, chartSource } from './function'
import themeJson from './theme.json'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'sheet-charts-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<section aria-label="Demo controls"><p><strong>Aster observatory</strong> · 24 original monthly energy readings. Negative = net grid export; blank is not zero.</p>
    <details class="chart-controls"><summary>Chart controls and API boundaries</summary>
    <fieldset><label>Chart target <select aria-label="Chart target"></select></label><label>Variant <select aria-label="Chart variant"><option value="column">Column</option><option value="line">Line</option><option value="bar">Bar</option><option value="area">Area</option><option value="theme">Column · custom theme</option><option value="multilevel">Column · station / quarter</option></select></label><button data-action="create">Create chart</button><button data-action="variant">Apply variant</button><button data-action="remove">Remove target</button></fieldset>
    <fieldset><label>Source period <select aria-label="Source period"><option value="all">All 24 months</option><option value="2025">2025 · explicit vectors</option><option value="2026">2026 · explicit vectors</option></select></label><button data-action="source">Apply monthly source</button><label>Style property <select aria-label="Style property"><option value="title">Title</option><option value="palette">Blue / cyan / amber palette</option><option value="legend">Legend at bottom</option></select></label><button data-action="style">Apply style property</button><button data-action="size">Size 480 × 280</button><button data-action="reveal">Reveal chart</button></fieldset>
    <fieldset><label>Source cell <select aria-label="Source cell"><option>B4</option><option>B8</option><option>B10</option><option>B11</option><option>B12</option><option>C23</option><option>C32</option></select></label><label>MWh <input aria-label="MWh" type="number" min="-500" max="500" step="0.25" value="210"></label><button data-action="write">Write source cell</button><button data-action="clear">Clear source cell</button><button data-action="empty">Empty monthly values</button></fieldset>
    <fieldset><button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="inspect">Inspect SDK state</button><button data-action="png">Download chart PNG</button><button data-action="json">Download workbook JSON</button><button data-action="reset">Reset observatory</button></fieldset>
    <p>Target is a host choice, not native drawing selection. Create adds a chart (up to four); Apply variant replaces target configuration/source/size while preserving its ID. Station/quarter uses A31:D39; Apply monthly source returns its mapping to Month + three values. Style and Size keep the current source. PNG uses the native chart UI renderer; JSON is a workbook snapshot, not XLSX. No upload or server is required by these controls. The Advanced preset also exposes unrelated native features; those are not this chart demo's acceptance scope.</p>
    <p>Use Inspect after native changes. Empty clears B4:D27 but retains month labels and station data. Reset creates a fresh workbook with a new ID and clears its history; theme changes discard edits. Chart insertion and export can be asynchronous; controls pause until the operation settles. Unlicensed SDK trial restrictions still apply.</p>
    <p>Known beta.2 limitation: full FChart.update (Apply variant / monthly source) stores separate configuration, source and layout history steps, despite its one-step contract. Undo may first revert unchanged layout. Single-property Style and Size use their direct public setters. Undo/Redo operate on the active workbook, including native edits.</p>
    </details><p role="status" aria-live="polite">Preparing native chart…</p><details><summary>Actual chart configuration and source cells</summary><pre aria-label="Chart readback"></pre></details></section><div class="charts-editor"></div>`
  container.append(root)
  root.querySelector<HTMLDetailsElement>('.chart-controls')!.open =
    container.clientWidth >= 700 && container.clientHeight >= 850
  const target = root.querySelector<HTMLSelectElement>('[aria-label="Chart target"]')!
  const variant = root.querySelector<HTMLSelectElement>('[aria-label="Chart variant"]')!
  const period = root.querySelector<HTMLSelectElement>('[aria-label="Source period"]')!
  const style = root.querySelector<HTMLSelectElement>('[aria-label="Style property"]')!
  const cell = root.querySelector<HTMLSelectElement>('[aria-label="Source cell"]')!
  const value = root.querySelector<HTMLInputElement>('[aria-label="MWh"]')!
  const output = root.querySelector<HTMLElement>('pre')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const editor = root.querySelector<HTMLElement>('.charts-editor')!
  const listeners = new AbortController()
  let disposed = false,
    busy = false,
    initialized = false,
    readFrame = 0,
    initFrame = 0,
    resets = 0
  let pending = Promise.resolve()
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, drawingEnUS, advancedEnUS) },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: editor }),
      UniverSheetsDrawingPreset(),
      UniverSheetsAdvancedPreset(),
    ],
  })
  let workbook = univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
  const sheet = () => workbook.getSheetBySheetId('energy')!
  const charts = (): SheetChart[] => sheet().getCharts()
  const selected = (): SheetChart | null => sheet().getChart(target.value)
  const activate = () => {
    if (workbook.getActiveSheet().getSheetId() !== 'energy') workbook.setActiveSheet('energy')
  }
  function readback() {
    if (disposed) return
    const items = charts(),
      previous = target.value
    target.replaceChildren(
      ...items.map((chart, i) => new Option(`${i + 1} · ${chart.getType()} · ${chart.getId()}`, chart.getId())),
    )
    if (items.some((chart) => chart.getId() === previous)) target.value = previous
    root.dataset.ready = String(initialized && !busy)
    root.dataset.busy = String(busy)
    root.querySelectorAll<HTMLFieldSetElement>('fieldset').forEach((field) => {
      field.disabled = busy || !initialized
    })
    for (const action of ['variant', 'remove', 'source', 'style', 'size', 'reveal', 'png'])
      root.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!.disabled = !selected()
    root.querySelector<HTMLButtonElement>('[data-action="create"]')!.disabled = items.length >= 4
    output.textContent = JSON.stringify(
      {
        unitId: workbook.getId(),
        activeSheet: workbook.getActiveSheet().getSheetName(),
        target: target.value || null,
        charts: items.map((chart) => ({ id: chart.getId(), type: chart.getType(), info: chart.getInfo() })),
        monthly: sheet().getRange('A3:D27').getRawValues(),
        quarters: sheet().getRange('A31:D39').getRawValues(),
        independent: workbook.getSheetBySheetId('notes')!.getRange('B4').getRawValues(),
        drawingLayout: sheet().getDrawingLayout(),
      },
      null,
      2,
    )
  }
  function schedule() {
    if (disposed) return
    cancelAnimationFrame(readFrame)
    readFrame = requestAnimationFrame(readback)
  }
  function run(action: () => Promise<void>) {
    if (busy || disposed) return
    busy = true
    readback()
    pending = (async () => {
      try {
        await action()
      } catch (error) {
        if (!disposed) status.textContent = `Action failed: ${error instanceof Error ? error.message : String(error)}`
      } finally {
        busy = false
        if (!disposed) {
          readback()
          schedule()
        }
      }
    })()
  }
  // Do not let native edits race asynchronous insert/update/reset/export. This
  // temporary gate does not style or replace any native editor component.
  const gate = (event: Event) => {
    if (busy) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  for (const event of ['pointerdown', 'keydown', 'beforeinput', 'paste', 'drop'])
    editor.addEventListener(event, gate, { capture: true, signal: listeners.signal })
  async function insert() {
    activate()
    const chart: SheetChart = await sheet().insertChart(
      buildChart(sheet(), univerAPI, variant.value, chartSource(univerAPI, period.value)),
    )
    if (disposed) return
    readback()
    target.value = chart.getId()
    status.textContent = `Created native ${chart.getType()} chart.`
  }
  function download(href: string, name: string) {
    const link = document.createElement('a')
    link.href = href
    link.download = name
    root.append(link)
    link.click()
    link.remove()
  }
  root.querySelector('section')!.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action || !initialized || busy) return
      run(async () => {
        const chart = selected()
        switch (action) {
          case 'create':
            if (charts().length < 4) await insert()
            break
          case 'variant':
            if (chart)
              await chart.update(buildChart(sheet(), univerAPI, variant.value, chartSource(univerAPI, period.value)))
            break
          case 'source':
            if (chart)
              await chart.update(
                chart
                  .toBuilder()
                  .setSource(chartSource(univerAPI, period.value))
                  .setCategoryFields([0])
                  .setMultiLevelCategoryAxis(false)
                  .setValueFields([1, 2, 3])
                  .build(),
              )
            break
          case 'style':
            if (style.value === 'palette') chart?.setPalette(['#2563eb', '#0891b2', '#f59e0b'])
            else if (style.value === 'legend')
              chart?.setLegend({ position: univerAPI.Enum.ChartLegendPositionEnum.Bottom })
            else chart?.setTitle('Aster · source-linked comparison')
            break
          case 'size':
            chart?.setSize(480, 280)
            break
          case 'reveal': {
            activate()
            const info = chart?.getInfo(),
              anchor = info?.anchor
            if (anchor && typeof anchor !== 'string') sheet().scrollToCell(anchor.row, anchor.column)
            else sheet().scrollToCell(2, 5)
            break
          }
          case 'remove':
            if (chart && !(await chart.remove())) throw new Error('SDK did not remove the target.')
            break
          case 'write': {
            const number = value.valueAsNumber
            if (!Number.isFinite(number) || number < -500 || number > 500)
              throw new Error('Enter a finite MWh value between -500 and 500.')
            activate()
            sheet().getRange(cell.value).setValue(number)
            break
          }
          case 'clear':
            activate()
            sheet().getRange(cell.value).clearContent()
            break
          case 'empty':
            activate()
            sheet().getRange('B4:D27').clearContent()
            break
          case 'undo':
          case 'redo': {
            const before = JSON.stringify(workbook.save())
            const applied = action === 'undo' ? await univerAPI.undo() : await univerAPI.redo()
            if (!disposed)
              status.textContent = !applied
                ? 'No SDK history step available.'
                : before === JSON.stringify(workbook.save())
                  ? 'SDK history step applied; snapshot unchanged. Full chart updates may contain unchanged layout/source steps in beta.2.'
                  : 'SDK history step applied; workbook snapshot changed.'
            return
          }
          case 'png': {
            const image = await chart?.exportImage({ format: 'png' })
            if (disposed) return
            if (!image?.startsWith('data:image/png'))
              throw new Error('Native chart renderer did not return a PNG. Reveal the chart and retry.')
            download(image, 'aster-energy-chart.png')
            break
          }
          case 'json': {
            const href = URL.createObjectURL(
              new Blob([JSON.stringify(workbook.save(), null, 2)], { type: 'application/json' }),
            )
            download(href, 'aster-observatory.json')
            setTimeout(() => URL.revokeObjectURL(href), 1000)
            break
          }
          case 'reset':
            univerAPI.disposeUnit(workbook.getId())
            workbook = univerAPI.createWorkbook({
              ...structuredClone(WORKBOOK_DATA),
              id: `aster-observatory-${++resets}`,
            })
            variant.value = 'column'
            period.value = 'all'
            cell.value = 'B4'
            value.value = '210'
            await insert()
            break
          case 'inspect':
            break
        }
        if (!disposed) status.textContent = `Completed: ${action}. Inspect shows current SDK state.`
      })
    },
    { signal: listeners.signal },
  )
  target.addEventListener('change', schedule, { signal: listeners.signal })
  const subscription = univerAPI.addEvent(univerAPI.Event.CommandExecuted, schedule)
  function initialize() {
    if (disposed) return
    if (univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) {
      initFrame = requestAnimationFrame(initialize)
      return
    }
    run(async () => {
      univerAPI.registerTheme('aster-warm', themeJson)
      await insert()
      if (!disposed) initialized = true
    })
  }
  initFrame = requestAnimationFrame(initialize)
  readback()
  return {
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(readFrame)
      cancelAnimationFrame(initFrame)
      listeners.abort()
      subscription.dispose()
      root.remove()
      // The SDK has no cancellation API for pending chart insertion/export.
      void pending.finally(() => univer.dispose())
    },
  }
}
