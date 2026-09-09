import type { IDocumentData } from '@univerjs/core'
import { UniverDocsCorePreset, unmount } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function validateSnapshot(data: IDocumentData) {
  if (
    !data.id ||
    !data.body?.dataStream?.endsWith('\r\n') ||
    ![data.documentStyle?.pageSize?.width, data.documentStyle?.pageSize?.height].every(
      (value) => typeof value === 'number' && Number.isFinite(value) && value > 0,
    )
  )
    throw new Error('Restore a complete document snapshot with an ID, terminated body and positive page size.')
}
export function createDemo(
  container: HTMLElement,
  darkMode = false,
  _legacyLocale: LocaleType = LocaleType.EN_US,
  saved?: IDocumentData,
) {
  const locale = LocaleType.EN_US
  const data = structuredClone(saved ?? createData())
  validateSnapshot(data)
  const root = document.createElement('div')
  root.className = 'harbor-page-setup'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: docsCoreEnUS },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root })],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false,
    frame = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  function startupError(error: unknown) {
    root.dataset.error = String(error)
    const alert = document.createElement('p')
    alert.setAttribute('role', 'alert')
    alert.textContent = 'The Harbor document could not start. Reload to retry; details are in the console.'
    root.prepend(alert)
  }
  function waitForCanvas() {
    if (disposed || root.dataset.error) return
    const canvas = root.querySelector<HTMLCanvasElement>('#univer-doc-main-canvas')
    if (
      canvas &&
      canvas.width > 0 &&
      canvas.height > 0 &&
      !root.querySelector('[data-u-comp="workbench-skeleton-content"]')
    ) {
      clearTimeout(timer)
      root.dataset.ready = 'true'
      finish()
    } else frame = requestAnimationFrame(waitForCanvas)
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Rendered && !disposed) frame = requestAnimationFrame(waitForCanvas)
  })
  function dispose() {
    if (disposed) return
    disposed = true
    lifecycle.dispose()
    cancelAnimationFrame(frame)
    clearTimeout(timer)
    finish()
    const errors: unknown[] = []
    for (const release of [() => unmount(root), () => univerAPI.disposeUnit(data.id), () => univer.dispose()]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Harbor cleanup failed')
  }
  try {
    timer = setTimeout(() => {
      if (disposed) return
      cancelAnimationFrame(frame)
      const error = new Error('Harbor native canvas did not become ready within 20 seconds.')
      startupError(error)
      console.error(error)
      finish()
    }, 20000)
    univerAPI.createDocument(data)
    return { univerAPI, ready, dispose }
  } catch (error) {
    dispose()
    container.append(root)
    startupError(error)
    throw error
  }
}
