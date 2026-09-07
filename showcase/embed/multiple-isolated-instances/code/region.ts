import type { IWorkbookData } from '@univerjs/core'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType } from '@univerjs/presets'

import type { Fixture, Region } from './data'
import { createBudget } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'

import '@univerjs/sheets/facade'
import '@univerjs/engine-formula/facade'

async function bounded(pending: Promise<void>, label: string, signal?: AbortSignal) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let cancel: (() => void) | undefined
  try {
    await Promise.race([
      pending,
      new Promise<void>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} exceeded 10000 ms`)), 10000)
        cancel = () => reject(new DOMException('Regional host removed', 'AbortError'))
        if (signal?.aborted) cancel()
        else signal?.addEventListener('abort', cancel, { once: true })
      }),
    ])
  } finally {
    clearTimeout(timer)
    if (cancel) signal?.removeEventListener('abort', cancel)
  }
}

export function validateRegionalSnapshot(snapshot: IWorkbookData, region: Region) {
  if (
    snapshot?.id !== `regional-budget-${region}` ||
    !Array.isArray(snapshot.sheetOrder) ||
    !snapshot.sheetOrder.length ||
    !snapshot.sheetOrder.includes('budget') ||
    new Set(snapshot.sheetOrder).size !== snapshot.sheetOrder.length ||
    snapshot.sheetOrder.some((id) => {
      const sheet = snapshot.sheets?.[id]
      return (
        !sheet ||
        sheet.id !== id ||
        !sheet.cellData ||
        ![sheet.rowCount, sheet.columnCount].every(
          (value) => typeof value === 'number' && Number.isInteger(value) && value > 0,
        )
      )
    })
  )
    throw new Error(
      `Restore a complete regional-budget-${region} snapshot with its original sheet identities and positive dimensions`,
    )
}

export function createRegion(
  container: HTMLElement,
  region: Region,
  fixture: Fixture = 'default',
  saved?: IWorkbookData,
) {
  if (region !== 'north' && region !== 'south') throw new Error('Unknown isolated region')
  if (!['default', 'empty', 'boundary'].includes(fixture)) throw new Error('Unknown regional source variant')
  if (saved) validateRegionalSnapshot(saved, region)
  const zh = document.documentElement.lang === 'zh-CN'
  const t = (en: string, cn: string) => (zh ? cn : en)
  const root = document.createElement('div')
  root.className = 'isolated-region'
  root.dataset.region = region
  root.innerHTML = `<div class="region-controls"><strong>${region === 'north' ? t('North · light', '北区 · 浅色') : t('South · dark', '南区 · 深色')}</strong><button data-action="dispose">${t('Release', '释放')}</button><button data-action="mount">${t('Mount', '挂载')}</button><button data-action="download">${t('Download JSON', '下载 JSON')}</button><span role="alert"></span></div><div class="region-mount"></div>`
  container.append(root)
  const slot = root.querySelector<HTMLElement>('.region-mount')!
  const events = new AbortController()
  let owner: ReturnType<typeof createUniver> | undefined
  let book: ReturnType<ReturnType<typeof createUniver>['univerAPI']['createWorkbook']> | undefined
  let handles: { dispose(): void }[] = []
  let busy = false
  let closed = false
  let error = ''
  let downloadUrl = ''
  function render() {
    if (closed) return
    root.dataset.ready = String(!busy)
    root.dataset.mounted = String(!!owner)
    root.querySelector('[role="alert"]')!.textContent = error
    for (const button of root.querySelectorAll<HTMLButtonElement>('.region-controls button')) {
      button.disabled = busy || (button.dataset.action === 'mount' ? !!owner : !owner)
    }
  }
  function releaseNow(stopCalculation: boolean) {
    const current = owner
    owner = undefined
    book = undefined
    if (!current) return []
    const failures: unknown[] = []
    if (stopCalculation) {
      try {
        current.univerAPI.getFormula().stopCalculation()
      } catch (stop) {
        failures.push(stop)
      }
    }
    for (const handle of handles.splice(0)) {
      try {
        handle.dispose()
      } catch (cause) {
        failures.push(cause)
      }
    }
    try {
      current.univer.dispose()
    } catch (cause) {
      failures.push(cause)
    }
    return failures
  }
  async function release() {
    const current = owner
    if (!current) return
    const failures: unknown[] = []
    try {
      await bounded(current.univerAPI.getFormula().onCalculationResultApplied(10000), 'Cleanup calculation')
    } catch (cause) {
      failures.push(cause)
    }
    // Parent removal can synchronously release this owner while this wait settles.
    if (owner !== current) return
    failures.push(...releaseNow(failures.length > 0))
    if (failures.length) throw new AggregateError(failures, failures.map(String).join('; '))
  }
  async function mount(snapshot?: IWorkbookData) {
    if (closed || owner) return
    owner = createUniver({
      darkMode: region === 'south',
      locale: zh ? LocaleType.ZH_CN : LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: sheetsCoreEnUS, [LocaleType.ZH_CN]: sheetsCoreZhCN },
      presets: [UniverSheetsCorePreset({ container: slot, ribbonType: 'grid' })],
    })
    const current = owner
    try {
      let finish!: () => void
      const rendered = new Promise<void>((resolve) => {
        finish = resolve
      })
      handles.push(
        owner.univerAPI.addEvent(owner.univerAPI.Event.LifeCycleChanged, ({ stage }) => {
          if (stage >= current.univerAPI.Enum.LifecycleStages.Rendered) finish()
        }),
      )
      book = owner.univerAPI.createWorkbook(snapshot ? structuredClone(snapshot) : createBudget(region, fixture))
      await bounded(rendered, 'Rendered', events.signal)
      await bounded(
        current.univerAPI.getFormula().onCalculationResultApplied(10000),
        'Initial calculation',
        events.signal,
      )
    } catch (cause) {
      try {
        await release()
      } catch (cleanup) {
        throw new AggregateError([cause, cleanup], `${String(cause)}; ${String(cleanup)}`, { cause: cleanup })
      }
      throw cause
    }
  }
  async function run(operation: () => Promise<void>) {
    if (closed || busy) throw new Error(closed ? 'Regional host is closed' : 'Regional host is busy')
    busy = true
    error = ''
    render()
    try {
      await operation()
    } catch (cause) {
      error = String(cause)
      throw cause
    } finally {
      busy = false
      render()
    }
  }
  root.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')
      if (!button || button.disabled) return
      const action = button.dataset.action
      void run(async () => {
        if (action === 'dispose') await release()
        else if (action === 'mount') await mount()
        else if (action === 'download') {
          if (downloadUrl) URL.revokeObjectURL(downloadUrl)
          downloadUrl = URL.createObjectURL(
            new Blob([JSON.stringify(book!.save(), null, 2)], { type: 'application/json' }),
          )
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = `${region}-maintenance.json`
          link.click()
        }
      }).catch(() => {
        /* The host alert displays the error; programmatic calls still reject. */
      })
    },
    { signal: events.signal },
  )
  const ready = run(() => mount(saved))
  void ready.catch(() => {
    /* Startup failures remain visible in the host alert and reject ready. */
  })
  let disposal: Promise<void> | undefined
  return {
    get univerAPI() {
      return owner?.univerAPI
    },
    ready,
    restore(snapshot: IWorkbookData) {
      validateRegionalSnapshot(snapshot, region)
      const savedSnapshot = structuredClone(snapshot)
      return run(async () => {
        await release()
        if (!closed) await mount(savedSnapshot)
      })
    },
    dispose() {
      if (disposal) return disposal
      closed = true
      events.abort()
      root.remove()
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
      // React does not await effect cleanup before removing iframe documents.
      // Release SDK ownership synchronously while the child realm is still active.
      const failures = releaseNow(true)
      disposal = failures.length
        ? Promise.reject(new AggregateError(failures, failures.map(String).join('; ')))
        : Promise.resolve()
      return disposal
    },
  }
}
