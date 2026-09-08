import type { IDisposable, IWorkbookData } from '@univerjs/presets'
import type { FWorkbook } from '@univerjs/sheets/facade'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createInventory } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

import '@univerjs/sheets/facade'
import '@univerjs/engine-formula/facade'

export function validateSnapshot(data: Partial<IWorkbookData>) {
  if (
    !data ||
    data.id !== 'kestrel-inventory' ||
    !Array.isArray(data.sheetOrder) ||
    !data.sheetOrder.length ||
    !data.sheets ||
    new Set(data.sheetOrder).size !== data.sheetOrder.length ||
    data.sheetOrder.some((id) => !data.sheets?.[id] || data.sheets[id].id !== id)
  )
    throw new Error('Invalid Kestrel workbook snapshot. Current owner retained.')
  return structuredClone(data)
}

function cleanupError(phase: string, failures: unknown[]) {
  return new AggregateError(
    failures,
    `${phase}: ${failures.map((cause) => (cause instanceof Error ? cause.message : String(cause))).join('; ')}`,
  )
}

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  _locale: LocaleType = LocaleType.EN_US,
  saved: Partial<IWorkbookData> = createInventory('default'),
) {
  const initial = validateSnapshot(saved)
  const hostWindow = window as Window & { univerAPI?: ReturnType<typeof createUniver>['univerAPI'] }
  const labels = [
    'Mount',
    'Dispose editor',
    'Remount content',
    'Save checkpoint',
    'Restore checkpoint',
    'Download JSON',
  ]
  const root = document.createElement('div')
  root.className = 'embed-lifecycle'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML = `<div class="embed-lifecycle-controls" role="group" aria-label="Editor lifecycle">${['mount', 'dispose', 'remount', 'checkpoint', 'restore', 'download'].map((action, i) => `<button type="button" data-action="${action}">${labels[i]}</button>`).join('')}<span class="mount-status" role="status"></span></div><p class="mount-error" role="alert" hidden></p><section class="inventory-card" aria-label="Inventory editor"><p class="mount-placeholder" hidden>Editor disposed. Mount fresh inventory or restore a checkpoint.</p><div class="mount-slot"></div></section>`
  container.append(root)
  const controls = root.querySelector<HTMLElement>('.embed-lifecycle-controls')!
  const slot = root.querySelector<HTMLElement>('.mount-slot')!
  const placeholder = root.querySelector<HTMLElement>('.mount-placeholder')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const alert = root.querySelector<HTMLElement>('[role="alert"]')!
  const events = new AbortController()
  let active: (ReturnType<typeof createUniver> & { workbook: FWorkbook; handles: IDisposable[] }) | undefined
  let checkpoint: IWorkbookData | undefined
  let busy = false
  let closed = false
  let error = ''
  let downloadUrl = ''
  let operation = Promise.resolve()

  function render() {
    if (closed) return
    const mounted = !!active
    placeholder.hidden = mounted || busy
    slot.hidden = !mounted && !busy
    root.dataset.ready = String(!busy)
    root.dataset.state = busy ? 'busy' : error ? 'error' : mounted ? 'mounted' : 'disposed'
    for (const button of controls.querySelectorAll<HTMLButtonElement>('button')) {
      const action = button.dataset.action!
      button.disabled =
        busy ||
        (action === 'mount' && mounted) ||
        (['dispose', 'remount', 'checkpoint', 'download'].includes(action) && !mounted) ||
        (action === 'restore' && !checkpoint)
    }
    status.textContent = busy
      ? 'Working…'
      : mounted
        ? checkpoint
          ? 'Mounted · checkpoint saved'
          : 'Mounted'
        : 'Disposed'
    alert.hidden = !error
    alert.textContent = error
  }
  async function waitFor(pending: Promise<void>, phase: string, cancelOnClose = false) {
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancel: (() => void) | undefined
    const interrupted = new Promise<void>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${phase} did not settle within 10000 ms.`)), 10000)
      cancel = () => reject(new DOMException('The inventory host was disposed.', 'AbortError'))
      if (cancelOnClose) {
        if (events.signal.aborted) cancel()
        else events.signal.addEventListener('abort', cancel, { once: true })
      }
    })
    try {
      await Promise.race([pending, interrupted])
    } finally {
      clearTimeout(timer)
      if (cancel) events.signal.removeEventListener('abort', cancel)
    }
  }
  function release(instance: ReturnType<typeof createUniver>, handles: IDisposable[]) {
    const failures: unknown[] = []
    for (const handle of handles) {
      try {
        handle.dispose()
      } catch (cause) {
        failures.push(cause)
      }
    }
    try {
      instance.univer.dispose()
      if (hostWindow.univerAPI === instance.univerAPI) delete hostWindow.univerAPI
      if (active?.univer === instance.univer) active = undefined
    } catch (cause) {
      failures.push(cause)
    }
    return failures
  }
  async function mount(data: Partial<IWorkbookData>) {
    if (active) throw new Error('Dispose the current owner before mounting another editor.')
    const instance = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: sheetsCoreEnUS },
      presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: slot })],
    })
    const handles: IDisposable[] = []
    let markRendered!: () => void
    const rendered = new Promise<void>((resolve) => {
      markRendered = resolve
    })
    try {
      handles.push(
        instance.univerAPI.addEvent(instance.univerAPI.Event.LifeCycleChanged, ({ stage }) => {
          if (stage >= instance.univerAPI.Enum.LifecycleStages.Rendered) markRendered()
        }),
      )
      const workbook = instance.univerAPI.createWorkbook(structuredClone(data))
      active = { ...instance, workbook, handles }
      hostWindow.univerAPI = instance.univerAPI
      await waitFor(rendered, 'Rendered', true)
      await waitFor(instance.univerAPI.getFormula().onCalculationResultApplied(10000), 'Initial calculation', true)
    } catch (cause) {
      if (active?.univer === instance.univer) {
        try {
          await unmount()
        } catch (cleanup) {
          throw cleanupError('Mount and cleanup failed', [cause, cleanup])
        }
      } else {
        const failures = release(instance, handles)
        if (failures.length) throw cleanupError('Mount and cleanup failed', [cause, ...failures])
      }
      throw cause
    }
  }
  async function unmount() {
    const owner = active
    if (!owner) return
    const canvases = [...slot.querySelectorAll('canvas')]
    const unitId = owner.workbook.getId()
    const failures: unknown[] = []
    try {
      await waitFor(owner.univerAPI.getFormula().onCalculationResultApplied(10000), 'Teardown calculation')
    } catch (cause) {
      failures.push(cause)
      try {
        owner.univerAPI.getFormula().stopCalculation()
      } catch (stop) {
        failures.push(stop)
      }
    }
    let unloaded = false
    try {
      unloaded = owner.univerAPI.disposeUnit(unitId) && owner.univerAPI.getWorkbook(unitId) === null
    } catch (cause) {
      failures.push(cause)
    }
    failures.push(...release(owner, owner.handles))
    if (failures.length) throw cleanupError('Editor cleanup reported errors', failures)
    if (!unloaded || canvases.some((canvas) => canvas.isConnected))
      throw new Error('SDK disposal did not fully unload the workbook and canvases.')
  }
  function run(action: () => Promise<void>) {
    if (closed || busy)
      return Promise.reject(new Error(closed ? 'The host is disposed.' : 'A lifecycle operation is pending.'))
    busy = true
    error = ''
    render()
    const pending = action()
      .catch((cause) => {
        error = cause instanceof Error ? cause.message : String(cause)
        throw cause
      })
      .finally(() => {
        busy = false
        render()
      })
    // Drain failed UI operations before final host cleanup; callers still receive the rejection.
    operation = pending.catch(() => {})
    return pending
  }
  function replace(data: Partial<IWorkbookData>) {
    const next = validateSnapshot(data)
    return run(async () => {
      await unmount()
      if (!closed) await mount(next)
    })
  }
  async function act(action: string) {
    if (action === 'mount') await mount(createInventory('default'))
    else if (action === 'dispose') await unmount()
    else if (action === 'remount') {
      if (!active) throw new Error('Mount a workbook first.')
      const data = active.workbook.save()
      await unmount()
      if (!closed) await mount(data)
    } else if (action === 'checkpoint') {
      if (!active) throw new Error('Mount a workbook first.')
      checkpoint = structuredClone(active.workbook.save())
    } else if (action === 'restore') {
      if (!checkpoint) throw new Error('Save a checkpoint first.')
      await unmount()
      if (!closed) await mount(checkpoint)
    } else if (action === 'download') {
      if (!active) throw new Error('Mount a workbook first.')
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      downloadUrl = URL.createObjectURL(
        new Blob([JSON.stringify(active.workbook.save(), null, 2)], { type: 'application/json' }),
      )
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = 'kestrel-inventory.json'
      link.click()
    }
  }
  controls.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')
      if (!button || button.disabled) return
      void run(() => act(button.dataset.action!)).catch(() => {})
    },
    { signal: events.signal },
  )
  const ready = run(() => mount(initial))
  void ready.catch(() => {})
  return {
    ready,
    get univerAPI() {
      return active?.univerAPI
    },
    replace,
    setDarkMode(value: boolean) {
      darkMode = value
      root.dataset.theme = value ? 'dark' : 'light'
      active?.univerAPI.toggleDarkMode(value)
    },
    dispose() {
      if (closed) return operation
      closed = true
      events.abort()
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      root.remove()
      operation = operation.then(unmount)
      return operation
    },
  }
}
