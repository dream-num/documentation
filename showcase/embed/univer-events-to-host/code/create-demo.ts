import type { IWorkbookData } from '@univerjs/core'
import { unmount } from '@univerjs/design'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createMilestones } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

import '@univerjs/sheets/facade'
import '@univerjs/sheets-ui/facade'
import '@univerjs/ui/facade'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved?: Partial<IWorkbookData>,
) {
  const data = structuredClone(saved ?? createMilestones('default'))
  if (!data.id || !data.sheetOrder?.length || !data.sheetOrder.every((id) => data.sheets?.[id]?.id === id))
    throw new Error('Restore a workbook ID and every ordered worksheet.')
  const root = document.createElement('div')
  root.className = 'host-events-demo'
  root.dataset.ready = 'false'
  root.innerHTML =
    '<div class="host-events-editor"></div><section class="host-events-panel"><div class="host-events-controls"><strong></strong><span role="status" aria-live="polite"></span><button data-action="subscription"></button><button data-action="clear"></button></div><ol></ol><p role="alert"></p></section>'
  container.append(root)
  let runtime: ReturnType<typeof createUniver> | undefined
  let api: ReturnType<typeof createUniver>['univerAPI'] | undefined
  let workbook: ReturnType<NonNullable<typeof api>['createWorkbook']> | undefined
  const owner = window as Window & { univerAPI?: typeof api }
  let subscriptions: { dispose(): void }[] = []
  let closed = false,
    isReady = false,
    frame = 0,
    readyFrame = 0,
    sequence = 0,
    error = ''
  let timer: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  const events = new AbortController()
  const activity: { sequence: number; source: string; detail: unknown }[] = []
  function refresh() {
    if (closed) return
    const zh = (api?.getCurrentLocale() ?? locale) === LocaleType.ZH_CN
    root.dataset.listening = String(!!subscriptions.length)
    root.querySelector('strong')!.textContent = zh ? '宿主事件 · 最近 12 条' : 'Host events · latest 12'
    root.querySelector('[role="status"]')!.textContent = zh
      ? subscriptions.length
        ? '正在监听'
        : '已取消订阅'
      : subscriptions.length
        ? 'Listening'
        : 'Unsubscribed'
    const toggle = root.querySelector<HTMLButtonElement>('[data-action="subscription"]')!
    toggle.textContent = zh
      ? subscriptions.length
        ? '取消订阅'
        : '恢复订阅'
      : subscriptions.length
        ? 'Unsubscribe'
        : 'Subscribe'
    toggle.disabled = !isReady
    const clear = root.querySelector<HTMLButtonElement>('[data-action="clear"]')!
    clear.textContent = zh ? '清空日志' : 'Clear log'
    clear.disabled = !activity.length || !isReady
    root.querySelector('[role="alert"]')!.textContent = error
    const list = root.querySelector('ol')!
    list.setAttribute('aria-label', zh ? '宿主活动' : 'Host activity')
    list.replaceChildren(
      ...activity.map((entry) => {
        const item = document.createElement('li')
        item.textContent = `${entry.sequence}. ${entry.source}: ${JSON.stringify(entry.detail)}`
        return item
      }),
    )
    list.scrollTop = list.scrollHeight
  }
  function schedule() {
    cancelAnimationFrame(frame)
    if (!closed) frame = requestAnimationFrame(refresh)
  }
  function record(source: string, detail: unknown) {
    if (closed) return
    activity.push({ sequence: ++sequence, source, detail: structuredClone(detail) })
    if (activity.length > 12) activity.shift()
    schedule()
  }
  function unsubscribe() {
    const failures: unknown[] = []
    for (const handle of subscriptions.splice(0)) {
      try {
        handle.dispose()
      } catch (cause) {
        failures.push(cause)
      }
    }
    if (failures.length) throw new AggregateError(failures, 'Host event listener cleanup failed')
  }
  function subscribe() {
    if (closed || subscriptions.length || !api || !workbook) return
    const univerAPI = api,
      current = workbook
    try {
      subscriptions.push(
        univerAPI.addEvent(univerAPI.Event.SheetValueChanged, ({ effectedRanges }) => {
          const ranges = effectedRanges.filter((range) => range.getUnitId() === current.getId())
          if (ranges.length)
            record(
              'SDK SheetValueChanged',
              ranges.map((range) => ({
                sheet: range.getSheetId(),
                range: range.getA1Notation(),
                values: range.getRawValues(),
              })),
            )
        }),
      )
      subscriptions.push(
        current.onSelectionChange((selections) => {
          if (univerAPI.getActiveWorkbook()?.getId() !== current.getId()) return
          record('SDK onSelectionChange', { sheet: current.getActiveSheet()?.getSheetId(), selections })
        }),
      )
    } catch (cause) {
      unsubscribe()
      throw cause
    }
  }
  function dispose() {
    if (closed) return
    closed = true
    events.abort()
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    cancelAnimationFrame(readyFrame)
    finish()
    const failures: unknown[] = []
    for (const release of [
      unsubscribe,
      () => unmount(root),
      () => api?.disposeUnit(data.id!),
      () => runtime?.univer.dispose(),
    ]) {
      try {
        release()
      } catch (cause) {
        failures.push(cause)
      }
    }
    if (owner.univerAPI === api) delete owner.univerAPI
    root.remove()
    if (failures.length) throw new AggregateError(failures, 'Host activity cleanup failed')
  }
  function setDarkMode(dark: boolean) {
    if (closed) return
    root.dataset.dark = String(dark)
    api?.toggleDarkMode(dark)
    refresh()
  }
  try {
    runtime = createUniver({
      darkMode,
      locale,
      locales: { [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN },
      presets: [
        UniverSheetsCorePreset({
          container: root.querySelector<HTMLElement>('.host-events-editor')!,
          ribbonType: 'grid',
        }),
      ],
    })
    api = runtime.univerAPI
    owner.univerAPI = api
    workbook = api.createWorkbook(data)
    subscribe()
    root.addEventListener(
      'click',
      (event) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
          '.host-events-controls button[data-action]',
        )
        if (!button || button.disabled || closed) return
        error = ''
        try {
          if (button.dataset.action === 'subscription') {
            if (subscriptions.length) unsubscribe()
            else subscribe()
          } else if (button.dataset.action === 'clear') activity.length = 0
        } catch (cause) {
          error = String(cause)
        }
        refresh()
      },
      { signal: events.signal },
    )
    function waitForCanvas() {
      if (closed) return
      const canvas = root.querySelector<HTMLCanvasElement>('canvas[id^="univer-sheet-main-canvas"]')
      if (!canvas?.width || !canvas.height || root.querySelector('[data-u-comp="workbench-skeleton-content"]')) {
        readyFrame = requestAnimationFrame(waitForCanvas)
        return
      }
      clearTimeout(timer)
      isReady = true
      root.dataset.ready = 'true'
      refresh()
      finish()
    }
    timer = setTimeout(() => {
      if (closed) return
      cancelAnimationFrame(readyFrame)
      error =
        locale === LocaleType.ZH_CN
          ? '里程碑表未能启动，请重新加载。'
          : 'The milestone workbook could not load. Reload to retry.'
      root.dataset.error = 'startup'
      refresh()
      finish()
    }, 20000)
    readyFrame = requestAnimationFrame(waitForCanvas)
    setDarkMode(darkMode)
    return { univerAPI: api, ready, setDarkMode, dispose }
  } catch (cause) {
    try {
      dispose()
    } catch (cleanup) {
      throw new AggregateError([cause, cleanup], 'Initialization and cleanup failed', { cause: cleanup })
    }
    throw cause
  }
}
