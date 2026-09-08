import type { IDisposable, IWorkbookData } from '@univerjs/core'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { validateSnapshot } from './data'

// The host dynamically imports this module. Keep all SDK runtime and official CSS here.
import '@univerjs/preset-sheets-core/lib/index.css'

import '@univerjs/sheets/facade'
import '@univerjs/engine-formula/facade'

export function createEditor(
  container: HTMLElement,
  saved: Partial<IWorkbookData>,
  darkMode: boolean,
  _legacyLanguage: string,
) {
  const snapshot = validateSnapshot(saved)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: sheetsCoreEnUS },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container })],
  })
  const hostWindow = window as Window & { univerAPI?: typeof univerAPI }
  let closed = false
  const lifetime = new AbortController()
  async function waitFor(pending: Promise<void>, phase: string, cancelOnDispose = false) {
    let timer: ReturnType<typeof setTimeout> | undefined
    let cancel: (() => void) | undefined
    const interrupted = new Promise<void>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${phase} did not settle within 10000 ms.`)), 10000)
      cancel = () => reject(new DOMException('Editor owner disposed.', 'AbortError'))
      if (cancelOnDispose) {
        if (lifetime.signal.aborted) cancel()
        else lifetime.signal.addEventListener('abort', cancel, { once: true })
      }
    })
    try {
      await Promise.race([pending, interrupted])
    } finally {
      clearTimeout(timer)
      if (cancel) lifetime.signal.removeEventListener('abort', cancel)
    }
  }
  let finish!: () => void
  const rendered = new Promise<void>((resolve) => {
    finish = resolve
  })
  let lifecycle: IDisposable | undefined
  function releaseResources() {
    const errors: unknown[] = []
    for (const action of [() => lifecycle?.dispose(), () => univer.dispose()]) {
      try {
        action()
      } catch (cause) {
        errors.push(cause)
      }
    }
    if (hostWindow.univerAPI === univerAPI) delete hostWindow.univerAPI
    return errors
  }
  let workbook
  try {
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage >= univerAPI.Enum.LifecycleStages.Rendered) finish()
    })
    workbook = univerAPI.createWorkbook(snapshot)
    hostWindow.univerAPI = univerAPI
  } catch (cause) {
    closed = true
    lifetime.abort()
    const failures = releaseResources()
    if (failures.length)
      throw new AggregateError(
        [cause, ...failures],
        `Editor initialization failed: ${[cause, ...failures].map(String).join('; ')}`,
        { cause },
      )
    throw cause
  }
  const ready = (async () => {
    await waitFor(rendered, 'Rendered', true)
    if (!closed) await waitFor(univerAPI.getFormula().onCalculationResultApplied(10000), 'Initial calculation', true)
  })()
  void ready.catch(() => {})
  let disposal: Promise<void> | undefined
  return {
    ready,
    univerAPI,
    dispose() {
      if (disposal) return disposal
      closed = true
      lifetime.abort()
      disposal = (async () => {
        await ready.catch(() => {})
        const errors: unknown[] = []
        const canvases = [...container.querySelectorAll('canvas')]
        try {
          await waitFor(univerAPI.getFormula().onCalculationResultApplied(10000), 'Teardown calculation')
        } catch (cause) {
          errors.push(cause)
          try {
            univerAPI.getFormula().stopCalculation()
          } catch (stop) {
            errors.push(stop)
          }
        }
        try {
          const id = workbook.getId()
          if (!univerAPI.disposeUnit(id) || univerAPI.getWorkbook(id) !== null)
            throw new Error('The workbook unit was not unloaded.')
        } catch (cause) {
          errors.push(cause)
        }
        errors.push(...releaseResources())
        if (canvases.some((canvas) => canvas.isConnected))
          errors.push(new Error('Disposed SDK canvases remain connected.'))
        if (errors.length)
          throw new AggregateError(errors, `SDK owner cleanup reported errors: ${errors.map(String).join('; ')}`)
      })()
      return disposal
    },
  }
}
