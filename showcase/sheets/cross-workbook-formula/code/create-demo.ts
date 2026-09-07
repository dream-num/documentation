import type { IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { CellValueType, createUniver, LocaleType } from '@univerjs/presets'

import type { Book } from './data'
import { createFixtures, FIELDS, IDS, NAMES, REFERENCES } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  let disposed = false
  let runtime: ReturnType<typeof createRuntime>
  const replace = async (data: Partial<IWorkbookData>[], cached?: IWorkbookData, lastEdited?: Book) => {
    await runtime.dispose()
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (!disposed) runtime = createRuntime(container, darkMode, data, replace, cached, lastEdited)
  }
  runtime = createRuntime(container, darkMode, createFixtures(), replace)
  return {
    dispose() {
      disposed = true
      void runtime.dispose()
    },
  }
}

function createRuntime(
  container: HTMLElement,
  darkMode: boolean,
  initialData: Partial<IWorkbookData>[],
  replace: (data: Partial<IWorkbookData>[], cached?: IWorkbookData, lastEdited?: Book) => Promise<void>,
  cachedCosts?: IWorkbookData,
  lastEdited: Book = 'income',
) {
  const root = document.createElement('div')
  root.className = 'cross-workbook-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.dataset.busy = 'false'
  root.innerHTML = `<section><p><strong>Tern touring theatre</strong> · Four local workbooks, one formula engine. Yellow cells are inputs; green cells are native formula results.</p>
    <details class="cross-workbook-controls" open><summary>Source inputs and reference variants</summary>
    <fieldset><label>View <select aria-label="Viewed workbook"></select></label>
    <label>Input <select aria-label="Source field"></select></label><label>Value <input aria-label="Source value" type="number" step="any" min="-1000000" max="1000000" value="180"></label><button data-action="write">Write source value</button><button data-action="clear">Clear source cell</button></fieldset>
    <fieldset><label>Reference in Summary B4 <select aria-label="Reference variant"><option value="single">Single cell · first performance</option><option value="range">Range · all ticket revenue</option><option value="multiple">Two workbooks · net</option><option value="local">Same workbook · Local Notes</option><option value="missing-workbook">Missing workbook · #REF!</option><option value="missing-sheet">Missing worksheet · #NAME?</option></select></label><button data-action="reference">Apply reference</button>
    <button data-action="invalid">Set FX to text</button><button data-action="restore-fx">Restore FX 1.25</button><button data-action="source">Unload costs workbook</button></fieldset>
    <fieldset><button data-action="undo">Undo last edited workbook</button><button data-action="redo">Redo last edited workbook</button><button data-action="recalculate">Recalculate all</button><button data-action="inspect">Inspect SDK values</button><button data-action="reload">Save & reload all</button><button data-action="download">Download all snapshots</button><button data-action="empty">Empty inputs</button><button data-action="reset">Reset theatre</button></fieldset>
    <p>References use workbook IDs and quoted sheet names, not filenames or URLs. Writes may target a background workbook. Undo/Redo targets the last workbook edited by a host button; native toolbar history targets its current workbook. Empty inputs, reload, Reset and theme changes clear history; Reset/theme changes discard edits. Unload/restore is not undoable. JSON contains all loaded workbook snapshots, not XLSX files or an external-link cache. No network source or custom async function is used.</p>
    </details><p role="status" aria-live="polite">Waiting for SDK calculation…</p><p class="cross-workbook-totals" aria-label="SDK totals"></p><details><summary>Actual values, formulas and loaded workbook IDs</summary><pre aria-label="Cross workbook readback"></pre></details></section><div class="cross-workbook-editor"></div>`
  container.append(root)
  root.querySelector<HTMLDetailsElement>('.cross-workbook-controls')!.open =
    container.clientWidth >= 600 && container.clientHeight >= 850
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const output = root.querySelector<HTMLElement>('pre')!
  const totals = root.querySelector<HTMLElement>('.cross-workbook-totals')!
  const view = root.querySelector<HTMLSelectElement>('[aria-label="Viewed workbook"]')!
  const field = root.querySelector<HTMLSelectElement>('[aria-label="Source field"]')!
  const value = root.querySelector<HTMLInputElement>('[aria-label="Source value"]')!
  const reference = root.querySelector<HTMLSelectElement>('[aria-label="Reference variant"]')!
  const sourceButton = root.querySelector<HTMLButtonElement>('[data-action="source"]')!
  for (const key of ['summary', 'income', 'costs', 'fx'] as Book[]) view.add(new Option(NAMES[key], key))
  for (const item of FIELDS) field.add(new Option(item.label, item.id))
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [
      UniverSheetsCorePreset({
        ribbonType: 'grid',
        container: root.querySelector<HTMLElement>('.cross-workbook-editor')!,
      }),
    ],
  })
  const engine = univerAPI.getFormula()
  let disposed = false,
    frame = 0,
    busy = false
  let calculation: string | number = 'initializing'
  let applied = 0
  let pending = Promise.resolve()
  let released: Promise<void> | undefined
  const book = (key: Book) => {
    const found = univerAPI.getWorkbook(IDS[key])
    if (!found) throw new Error(NAMES[key] + ' is not loaded. Restore it first.')
    return found
  }
  const cell = (key: Book, address: string) => book(key).getSheetBySheetId('main')!.getRange(address)
  const switchTo = (key: Book) => {
    if (univerAPI.getActiveWorkbook()?.getId() !== IDS[key]) univerAPI.setCurrent(book(key).getId())
  }
  const refresh = () => {
    if (disposed) return
    const activeId = univerAPI.getActiveWorkbook()?.getId()
    const active = (Object.keys(IDS) as Book[]).find((key) => IDS[key] === activeId)
    if (active) view.value = active
    const loaded = (Object.keys(IDS) as Book[]).filter((key) => univerAPI.getWorkbook(IDS[key]))
    for (const option of view.options) option.disabled = !loaded.includes(option.value as Book)
    sourceButton.textContent = loaded.includes('costs') ? 'Unload costs workbook' : 'Restore costs workbook'
    const data = Object.fromEntries(
      loaded.map((key) => [
        key,
        {
          id: book(key).getId(),
          name: book(key).getName(),
          activeSheet: book(key).getActiveSheet()?.getSheetName(),
          values: cell(key, 'A1:D16').getValues(),
          rawValues: cell(key, 'A1:D16').getRawValues(),
          formulas: cell(key, 'A1:D16').getFormulas(),
        },
      ]),
    )
    output.textContent = JSON.stringify({ active, lastEdited, calculation, applied, loaded, books: data }, null, 2)
    totals.textContent = loaded.includes('summary')
      ? 'SDK readback · Revenue: ' +
        cell('summary', 'B5').getValue() +
        ' · Net after reserve: ' +
        cell('summary', 'B10').getValue()
      : 'Summary is being recreated.'
  }
  const schedule = () => {
    cancelAnimationFrame(frame)
    if (!disposed) frame = requestAnimationFrame(refresh)
  }
  const subscriptions = [
    engine.calculationStart(() => {
      calculation = 'calculating'
      schedule()
    }),
    engine.calculationEnd((state) => {
      calculation = state
      schedule()
    }),
    engine.calculationResultApplied(() => {
      if (disposed) return
      applied++
      root.dataset.ready = 'true'
      status.textContent =
        'SDK results applied. Inspect the formula and its calculated value; error values are not replaced by host estimates.'
      schedule()
    }),
    univerAPI.addEvent(univerAPI.Event.SheetValueChanged, schedule),
    univerAPI.addEvent(univerAPI.Event.CommandExecuted, schedule),
  ]
  const create = (snapshots: Partial<IWorkbookData>[]) => {
    for (const snapshot of snapshots) univerAPI.createWorkbook(snapshot, { makeCurrent: snapshot.id === IDS.summary })
    switchTo('summary')
    engine.executeCalculation()
  }
  const snapshots = () =>
    (Object.keys(IDS) as Book[]).flatMap((key) => {
      const found = univerAPI.getWorkbook(IDS[key])
      return found ? [found.save()] : []
    })
  const edit = (key: Book, address: string, input?: number | string) => {
    if (input === undefined) cell(key, address).clearContent()
    else cell(key, address).setValue(typeof input === 'string' ? { v: input, t: CellValueType.STRING } : input)
    lastEdited = key
  }
  create(initialData)
  const dom = new AbortController()
  view.addEventListener(
    'change',
    () => {
      switchTo(view.value as Book)
      schedule()
    },
    { signal: dom.signal },
  )
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-action]'))
    button.addEventListener(
      'click',
      () => {
        if (disposed || busy) return
        busy = true
        root.dataset.busy = 'true'
        let replacement: Partial<IWorkbookData>[] | undefined
        pending = (async () => {
          try {
            status.textContent = 'Submitting ' + button.textContent + ' through the documented API…'
            const selected = FIELDS.find((entry) => entry.id === field.value)!
            switch (button.dataset.action) {
              case 'write':
                if (!value.value.trim() || !value.checkValidity() || !Number.isFinite(value.valueAsNumber))
                  throw new Error('Enter a finite number between -1000000 and 1000000.')
                edit(selected.book, selected.address, value.valueAsNumber)
                break
              case 'clear':
                edit(selected.book, selected.address)
                break
              case 'reference':
                cell('summary', 'B4').setValue({ f: REFERENCES[reference.value as keyof typeof REFERENCES] })
                lastEdited = 'summary'
                switchTo('summary')
                break
              case 'invalid':
                edit('fx', 'B4', 'pending')
                break
              case 'restore-fx':
                edit('fx', 'B4', 1.25)
                break
              case 'source':
                if (univerAPI.getWorkbook(IDS.costs)) {
                  cachedCosts = book('costs').save()
                  switchTo('summary')
                  univerAPI.disposeUnit(IDS.costs)
                } else
                  univerAPI.createWorkbook(cachedCosts ?? createFixtures().find((item) => item.id === IDS.costs)!, {
                    makeCurrent: false,
                  })
                engine.executeCalculation()
                break
              case 'undo':
                book(lastEdited).undo()
                break
              case 'redo':
                book(lastEdited).redo()
                break
              case 'recalculate':
                engine.executeCalculation()
                break
              case 'inspect':
                break
              case 'reload':
                replacement = snapshots()
                break
              case 'download': {
                const href = URL.createObjectURL(
                  new Blob([JSON.stringify(snapshots(), null, 2)], { type: 'application/json' }),
                )
                const anchor = document.createElement('a')
                anchor.href = href
                anchor.download = 'tern-workbooks.json'
                anchor.click()
                setTimeout(() => URL.revokeObjectURL(href), 1000)
                break
              }
              case 'empty':
              case 'reset': {
                const data = createFixtures()
                if (button.dataset.action === 'empty')
                  for (const snapshot of data) {
                    if (snapshot.id === IDS.summary) continue
                    const rows = snapshot.sheets!.main.cellData!
                    for (const row of [3, 4, 5])
                      for (const column of [1, 2])
                        if (rows[row]?.[column] && !rows[row][column].f) rows[row][column] = { s: rows[row][column].s }
                  }
                cachedCosts = undefined
                reference.value = 'single'
                lastEdited = 'income'
                field.value = 'tickets'
                value.value = '180'
                replacement = data
                break
              }
            }
            if (!disposed) {
              status.textContent =
                button.dataset.action === 'inspect'
                  ? 'Read fresh Facade values and formulas.'
                  : 'Action submitted. Readback shows actual SDK values; calculation can settle asynchronously.'
              refresh()
            }
          } catch (error) {
            if (!disposed)
              status.textContent = 'Action failed: ' + (error instanceof Error ? error.message : String(error))
          } finally {
            busy = false
            if (!disposed && !replacement) root.dataset.busy = 'false'
          }
        })()
        void pending.then(() => {
          if (replacement && !disposed) void replace(replacement, cachedCosts, lastEdited)
        })
      },
      { signal: dom.signal },
    )
  schedule()
  return {
    dispose() {
      if (released) return released
      disposed = true
      dom.abort()
      cancelAnimationFrame(frame)
      root.remove()
      subscriptions.forEach((subscription) => subscription.dispose())
      released = new Promise<void>((resolve) => {
        void pending.finally(() => {
          const release = () => {
            univer.dispose()
            resolve()
          }
          // Let an active native calculation finish before its owning services disappear.
          if (calculation === 'calculating' || calculation === 'initializing') {
            const ended = engine.calculationEnd(() => {
              ended.dispose()
              queueMicrotask(release)
            })
          } else release()
        })
      })
      return released
    },
  }
}
