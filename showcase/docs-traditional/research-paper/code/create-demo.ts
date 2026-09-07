import type { IDocumentData } from '@univerjs/core'
import { unmount } from '@univerjs/design'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import DocsZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createPaperData, PAPER_ID } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function validateSnapshot(data: IDocumentData) {
  if (
    data.id !== PAPER_ID ||
    !data.body?.dataStream?.endsWith('\r\n') ||
    !Array.isArray(data.body.paragraphs) ||
    ![data.documentStyle?.pageSize?.width, data.documentStyle?.pageSize?.height].every(
      (value) => typeof value === 'number' && Number.isFinite(value) && value > 0,
    )
  )
    throw new Error(
      'Restore a complete research-paper snapshot with its original identity and positive page dimensions',
    )
}

export function createResearchPaperDemo(container: HTMLElement, darkMode = false, saved?: IDocumentData) {
  const data = structuredClone(saved ?? createPaperData())
  validateSnapshot(data)
  const root = document.createElement('div')
  root.className = 'research-paper-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: mergeLocales(DocsEnUS), [LocaleType.ZH_CN]: mergeLocales(DocsZhCN) },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root, header: true, toolbar: true, footer: true })],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false,
    frame = 0
  let timeout: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  function waitForCanvas() {
    if (disposed) return
    const canvas = root.querySelector<HTMLCanvasElement>('#univer-doc-main-canvas')
    if (canvas?.width && canvas.height && !root.querySelector('[data-u-comp="workbench-skeleton-content"]')) {
      root.dataset.ready = 'true'
      clearTimeout(timeout)
      finish()
    } else frame = requestAnimationFrame(waitForCanvas)
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage === univerAPI.Enum.LifecycleStages.Rendered) frame = requestAnimationFrame(waitForCanvas)
  })
  function dispose() {
    if (disposed) return
    disposed = true
    lifecycle.dispose()
    cancelAnimationFrame(frame)
    clearTimeout(timeout)
    finish()
    const errors: unknown[] = []
    for (const release of [() => unmount(root), () => univerAPI.disposeUnit(PAPER_ID), () => univer.dispose()]) {
      try {
        release()
      } catch (error) {
        errors.push(error)
      }
    }
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    root.remove()
    if (errors.length) throw new AggregateError(errors, 'Research paper cleanup failed')
  }
  timeout = setTimeout(() => {
    if (disposed) return
    cancelAnimationFrame(frame)
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent =
      locale === LocaleType.ZH_CN ? '论文未能启动，请重新加载。' : 'The paper could not start. Reload to retry.'
    root.prepend(alert)
    console.error(new Error('Research paper native canvas startup timed out'))
    finish()
  }, 20000)
  try {
    univerAPI.createDocument(data)
  } catch (error) {
    dispose()
    throw error
  }
  return { univerAPI, ready, dispose }
}
