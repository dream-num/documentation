import type { ICellData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import coreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createFixture, createRows } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const zh = document.documentElement.lang.toLowerCase().startsWith('zh')
  const root = document.createElement('div')
  root.className = 'big-data-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<section aria-label="Demo controls">
    <div class="big-data-controls">
      <fieldset><label>Worksheet capacity <select aria-label="Worksheet capacity"><option value="10000">10,000 rows</option><option value="100000">100,000 rows</option><option value="1000000" selected>1,000,000 rows</option></select></label><button data-action="capacity">Apply capacity</button>
      <label>Window <select aria-label="Window position"><option value="top">Top</option><option value="middle">Middle</option><option value="bottom">Bottom</option><option value="custom">Custom row</option></select></label><label>Start row <input aria-label="Start row" type="number" min="2" max="1000000" step="1" value="2"></label><label>Rows <select aria-label="Chunk size"><option value="250">250</option><option value="1000" selected>1,000</option><option value="5000">5,000</option></select></label><button data-action="load">Load window</button><button data-action="jump">Jump to window</button></fieldset>
      <fieldset><button data-action="json">Download sparse JSON</button></fieldset>
    </div><p role="status" aria-live="polite"></p>
  </section><div class="big-data-editor"></div>`
  container.append(root)
  const capacity = root.querySelector<HTMLSelectElement>('[aria-label="Worksheet capacity"]')!
  const position = root.querySelector<HTMLSelectElement>('[aria-label="Window position"]')!
  const startInput = root.querySelector<HTMLInputElement>('[aria-label="Start row"]')!
  const chunkInput = root.querySelector<HTMLSelectElement>('[aria-label="Chunk size"]')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const editor = root.querySelector<HTMLElement>('.big-data-editor')!
  if (zh) {
    root.querySelector('section')!.setAttribute('aria-label', '演示控件')
    const labels = ['工作表容量 ', '窗口 ', '起始行 ', '行数 ']
    root.querySelectorAll('label').forEach((label, i) => {
      label.firstChild!.textContent = labels[i]
    })
    for (const [element, name] of [
      [capacity, '工作表容量'],
      [position, '窗口位置'],
      [startInput, '起始行'],
      [chunkInput, '分块大小'],
    ] as const)
      element.setAttribute('aria-label', name)
    capacity.querySelectorAll('option').forEach((option) => {
      option.textContent = Number(option.value).toLocaleString('zh-CN') + ' 行'
    })
    position.querySelectorAll('option').forEach((option, i) => {
      option.textContent = ['顶部', '中部', '底部', '自定义行'][i]
    })
    for (const [action, text] of [
      ['capacity', '应用容量'],
      ['load', '载入窗口'],
      ['jump', '跳转到窗口'],
      ['json', '下载稀疏 JSON'],
    ])
      root.querySelector('[data-action="' + action + '"]')!.textContent = text
  }
  const listeners = new AbortController()
  let disposed = false,
    initialized = false,
    busy = false,
    initFrame = 0,
    readFrame = 0
  let pending = Promise.resolve()
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: zh ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS), [LocaleType.ZH_CN]: mergeLocales(coreZhCN) },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: editor })],
  })
  const workbook = api.createWorkbook(createFixture())
  const demoWindow = window as Window & { univerAPI?: typeof api; marlowDemo?: ReturnType<typeof createDemo> }
  demoWindow.univerAPI = api
  const sheet = () => workbook.getActiveSheet()
  const selectedStart = () => {
    const count = Number(chunkInput.value),
      max = sheet().getMaxRows()
    if (![250, 1000, 5000].includes(count))
      throw new Error(zh ? '分块大小必须为 250、1,000 或 5,000。' : 'Choose 250, 1,000 or 5,000 rows.')
    const requested =
      position.value === 'top'
        ? 1
        : position.value === 'middle'
          ? Math.floor(max / 2)
          : position.value === 'bottom'
            ? max - count
            : startInput.valueAsNumber - 1
    if (!Number.isSafeInteger(requested))
      throw new Error(zh ? '起始行必须为整数。' : 'Start row must be a whole number.')
    if (position.value === 'custom' && (requested < 1 || requested >= max))
      throw new Error(zh ? '起始行必须在 2 至 ' + max + ' 之间。' : 'Start row must be between 2 and ' + max + '.')
    return Math.max(1, Math.min(requested, Math.max(1, max - count)))
  }
  function updateControls() {
    if (disposed) return
    const ready = api.getCurrentLifecycleStage() >= LifecycleStages.Steady
    root.dataset.ready = String(ready && initialized && !busy)
    root.dataset.busy = String(busy)
    root.querySelectorAll<HTMLFieldSetElement>('fieldset').forEach((field) => {
      field.disabled = !ready || !initialized || busy
    })
  }
  function schedule() {
    if (disposed) return
    cancelAnimationFrame(readFrame)
    readFrame = requestAnimationFrame(updateControls)
  }
  function run(operation: () => void | Promise<void>) {
    if (disposed || busy || !initialized) return
    busy = true
    updateControls()
    pending = (async () => {
      try {
        await operation()
      } catch (error) {
        if (!disposed)
          status.textContent =
            (zh ? '操作被拒绝：' : 'Action rejected: ') + (error instanceof Error ? error.message : String(error))
      } finally {
        busy = false
        if (!disposed) {
          updateControls()
          schedule()
        }
      }
    })()
  }
  for (const name of ['pointerdown', 'keydown', 'beforeinput', 'paste', 'drop'])
    editor.addEventListener(
      name,
      (event) => {
        if (busy) {
          event.preventDefault()
          event.stopImmediatePropagation()
        }
      },
      { capture: true, signal: listeners.signal },
    )
  function jump(row: number) {
    const range = sheet().getRange(row, 0)
    sheet().setActiveRange(range).scrollToCell(row, 0)
  }
  function download(snapshot: unknown) {
    const href = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = href
    link.download = 'marlow-sparse-million-grid.json'
    root.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
  }
  root.querySelector('section')!.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action) return
      run(async () => {
        const started = performance.now()
        switch (action) {
          case 'capacity': {
            const rows = Number(capacity.value)
            if (![10000, 100000, 1000000].includes(rows))
              throw new Error(zh ? '请选择有效容量。' : 'Choose a valid worksheet capacity.')
            // Keep the active Facade range valid when shrinking below the current viewport.
            if (rows < sheet().getMaxRows()) {
              jump(0)
              // Read actual sparse rows, not a load-history cache: smaller reloads,
              // overlapping windows and native edits must not hide populated tails.
              const overflow = Object.entries(workbook.save().sheets[sheet().getSheetId()].cellData ?? {})
                .filter(
                  ([row, cells]) =>
                    Number(row) >= rows &&
                    Object.values(cells as Record<string, ICellData>).some(
                      (cell) => cell?.v != null || cell?.f || cell?.p || cell?.si != null,
                    ),
                )
                .map(([row]) => Number(row))
                .toSorted((a, b) => a - b)
              for (let i = 0; i < overflow.length; i++) {
                const first = overflow[i]
                let end = first
                while (overflow[i + 1] === end + 1) end = overflow[++i]
                sheet()
                  .getRange(first, 0, end - first + 1, sheet().getMaxColumns())
                  .clearContent()
              }
            }
            sheet().setRowCount(rows)
            startInput.max = String(rows)
            break
          }
          case 'load': {
            const start = selectedStart(),
              count = Math.min(Number(chunkInput.value), sheet().getMaxRows() - start)
            sheet().getRange(start, 0, count, 10).setValues(createRows(start, count))
            jump(start)
            break
          }
          case 'jump':
            jump(selectedStart())
            break
          case 'json':
            download(workbook.save())
            break
        }
        if (!disposed)
          status.textContent = zh
            ? '已完成；宿主 API 调用耗时 ' + (performance.now() - started).toFixed(1) + ' 毫秒，不代表渲染耗时。'
            : 'Completed: ' +
              action +
              ' in ' +
              (performance.now() - started).toFixed(1) +
              ' ms of host API time, not rendering time.'
      })
    },
    { signal: listeners.signal },
  )
  position.addEventListener(
    'change',
    () => {
      startInput.disabled = position.value !== 'custom'
      schedule()
    },
    { signal: listeners.signal },
  )
  startInput.disabled = true
  const subscription = api.addEvent(api.Event.CommandExecuted, schedule)
  function initialize() {
    if (disposed) return
    if (api.getCurrentLifecycleStage() < LifecycleStages.Steady) {
      initFrame = requestAnimationFrame(initialize)
      return
    }
    initialized = true
    jump(0)
    status.textContent = ''
    updateControls()
  }
  initFrame = requestAnimationFrame(initialize)
  updateControls()
  const controller = {
    univerAPI: api,
    container,
    createDemo,
    createRows,
    setDarkMode(value: boolean) {
      if (disposed) return
      root.dataset.theme = value ? 'dark' : 'light'
      api.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(initFrame)
      cancelAnimationFrame(readFrame)
      listeners.abort()
      subscription.dispose()
      if (demoWindow.univerAPI === api) delete demoWindow.univerAPI
      if (demoWindow.marlowDemo === controller) delete demoWindow.marlowDemo
      root.remove()
      void pending.finally(() => univer.dispose())
    },
  }
  demoWindow.marlowDemo = controller
  return controller
}
