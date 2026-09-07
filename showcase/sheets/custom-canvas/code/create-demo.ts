import type { IDisposable, IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
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
  const zh = document.documentElement.lang === 'zh-CN'
  const t = (en: string, cn: string) => (zh ? cn : en)
  const root = document.createElement('div')
  root.className = 'seed-canvas-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<div class="seed-canvas-controls">
    <label>${t('Style', '样式')} <select data-control="style" aria-label="${t('Render style', '绘制样式')}" disabled><option value="bar">${t('Continuous bars', '连续进度条')}</option><option value="dots">${t('Dots · nearest 10%', '圆点 · 舍入到 10%')}</option></select></label>
    <label>${t('Layers', '绘制层')} <select data-control="layers" aria-label="${t('Render layers', '绘制层')}" disabled><option value="all">${t('All three layers', '全部三层')}</option><option value="main">${t('Cells only', '仅单元格')}</option><option value="headers">${t('Headers only', '仅表头')}</option><option value="none">${t('Native only', '仅原生')}</option></select></label>
    <button data-action="apply" disabled>${t('Apply renderers', '应用绘制扩展')}</button><span role="status" aria-live="polite"></span>
  </div><div class="seed-canvas-editor"></div>`
  container.append(root)
  const style = root.querySelector<HTMLSelectElement>('[data-control="style"]')!
  const layers = root.querySelector<HTMLSelectElement>('[data-control="layers"]')!
  const button = root.querySelector<HTMLButtonElement>('[data-action="apply"]')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: zh ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN },
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
        status.textContent =
          t('Renderer registration failed: ', '绘制扩展注册失败：') +
          (error instanceof Error ? error.message : String(error))
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
