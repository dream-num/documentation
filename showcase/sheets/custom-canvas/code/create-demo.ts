import type { IDisposable, IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LifecycleStages, LocaleType } from '@univerjs/presets'

import type { RenderMode } from './extensions'
import { WORKBOOK_DATA } from './data'
import { SeedCanvasExtension } from './extensions'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, saved?: IWorkbookData) {
  if (
    saved !== undefined &&
    (saved?.id !== 'mossbrook-seed-bank' ||
      !Array.isArray(saved.sheetOrder) ||
      saved.sheetOrder.length !== 2 ||
      !['lots', 'reference'].every((id) => saved.sheetOrder.includes(id)) ||
      saved.sheetOrder.some((id) => {
        const sheet = saved.sheets?.[id]
        return (
          !sheet ||
          sheet.id !== id ||
          !sheet.cellData ||
          typeof sheet.cellData !== 'object' ||
          Array.isArray(sheet.cellData) ||
          ![sheet.rowCount, sheet.columnCount].every(
            (value) => typeof value === 'number' && Number.isInteger(value) && value > 0,
          )
        )
      }))
  )
    throw new Error('Restore a Mossbrook snapshot with both original sheet IDs and positive dimensions')

  const root = document.createElement('div')
  root.className = 'seed-canvas-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<div class="seed-canvas-controls">
    <label>Style <select data-control="style" aria-label="Render style" disabled><option value="bar">Continuous bars</option><option value="dots">Dots · nearest 10%</option></select></label>
    <label>Layers <select data-control="layers" aria-label="Render layers" disabled><option value="all">All three layers</option><option value="main">Cells only</option><option value="headers">Headers only</option><option value="none">Native only</option></select></label>
    <button data-action="apply" disabled>Apply renderers</button><span role="status" aria-live="polite"></span>
  </div><div class="seed-canvas-editor"></div>`
  container.append(root)
  const style = root.querySelector<HTMLSelectElement>('[data-control="style"]')!
  const layers = root.querySelector<HTMLSelectElement>('[data-control="layers"]')!
  const button = root.querySelector<HTMLButtonElement>('[data-action="apply"]')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [
      UniverSheetsCorePreset({
        ribbonType: 'grid',
        container: root.querySelector<HTMLElement>('.seed-canvas-editor')!,
      }),
    ],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  let initialized = false
  let mode: RenderMode = 'bar'
  let handles: IDisposable[] = []
  univerAPI.createWorkbook(structuredClone(saved ?? WORKBOOK_DATA))
  const workbook = () => univerAPI.getWorkbook('mossbrook-seed-bank')!
  const sheet = () => workbook().getSheetBySheetId('lots')!
  const readDrawing = () => ({
    active: workbook().getActiveSheet()?.getSheetId() === 'lots',
    values: sheet().getRange('C4:C27').getRawValues().flat(),
    mode,
  })
  const apply = () => {
    handles.forEach((handle) => handle.dispose())
    handles = []
    mode = style.value as RenderMode
    if (layers.value === 'all' || layers.value === 'main')
      handles.push(
        univerAPI.registerSheetMainExtension(workbook().getId(), new SeedCanvasExtension('main', readDrawing)),
      )
    if (layers.value === 'all' || layers.value === 'headers') {
      handles.push(
        univerAPI.registerSheetRowHeaderExtension(workbook().getId(), new SeedCanvasExtension('row', readDrawing)),
      )
      handles.push(
        univerAPI.registerSheetColumnHeaderExtension(
          workbook().getId(),
          new SeedCanvasExtension('column', readDrawing),
        ),
      )
    }
    workbook().getActiveSheet()?.refreshCanvas()
  }
  const initialize = () => {
    if (disposed || initialized || univerAPI.getCurrentLifecycleStage() < LifecycleStages.Steady) return
    apply()
    initialized = true
    root.dataset.ready = 'true'
    style.disabled = layers.disabled = button.disabled = false
  }
  const repaint = () => {
    if (!disposed && initialized) workbook()?.getActiveSheet()?.refreshCanvas()
  }
  const subscriptions = [
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize),
    univerAPI.addEvent(univerAPI.Event.SheetValueChanged, repaint),
    univerAPI.getFormula().calculationResultApplied(repaint),
  ]
  initialize()
  const dom = new AbortController()
  button.addEventListener(
    'click',
    () => {
      if (disposed || !initialized) return
      try {
        apply()
        status.textContent = ''
      } catch (error) {
        status.textContent = 'Renderer registration failed: ' + (error instanceof Error ? error.message : String(error))
      }
    },
    { signal: dom.signal },
  )
  return {
    univerAPI,
    setDarkMode(value: boolean) {
      if (disposed) return
      root.dataset.theme = value ? 'dark' : 'light'
      univerAPI.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      dom.abort()
      handles.forEach((handle) => handle.dispose())
      subscriptions.forEach((handle) => handle.dispose())
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
