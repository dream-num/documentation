import type { IDocumentData } from '@univerjs/core'
import { unmount } from '@univerjs/design'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import DocsZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createPageData, KNOWLEDGE_PAGES, type KnowledgePageId } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export interface KnowledgeSnapshot {
  activePageId: KnowledgePageId
  documents: Record<KnowledgePageId, IDocumentData>
}

export function validateSnapshot(saved: KnowledgeSnapshot) {
  if (!Object.hasOwn(KNOWLEDGE_PAGES, saved.activePageId)) throw new Error('Unknown knowledge page')
  for (const id of Object.keys(KNOWLEDGE_PAGES) as KnowledgePageId[]) {
    const doc = saved.documents?.[id]
    if (doc?.id !== `knowledge-${id}` || !doc.body?.dataStream?.endsWith('\r\n') || !Array.isArray(doc.body.paragraphs))
      throw new Error(`Restore a complete modern document with the original knowledge-${id} identity`)
  }
}

export function createKnowledgeBaseDemo(container: HTMLElement, darkMode = false, saved?: KnowledgeSnapshot) {
  const state: KnowledgeSnapshot = structuredClone(
    saved ?? {
      activePageId: 'handbook',
      documents: { handbook: createPageData('handbook'), api: createPageData('api'), legacy: createPageData('legacy') },
    },
  )
  validateSnapshot(state)
  const locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US
  const chinese = locale === LocaleType.ZH_CN
  const root = document.createElement('div')
  root.className = 'knowledge-demo'
  root.dataset.ready = 'false'
  const nav = document.createElement('nav')
  nav.className = 'knowledge-navigation'
  nav.setAttribute('aria-label', chinese ? '知识库页面' : 'Knowledge pages')
  const heading = document.createElement('h2')
  heading.textContent = chinese ? '团队知识库' : 'Team knowledge'
  nav.append(heading)
  const editor = document.createElement('div')
  editor.className = 'knowledge-editor'
  root.append(nav, editor)
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DocsZhCN),
    },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: editor, header: true, toolbar: true, footer: true }),
    ],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  let frame = 0
  let timeout: ReturnType<typeof setTimeout> | undefined
  let finish!: () => void
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  function waitForCanvas() {
    if (disposed) return
    const canvas = editor.querySelector<HTMLCanvasElement>('#univer-doc-main-canvas')
    if (canvas?.width && canvas.height && !editor.querySelector('[data-u-comp="workbench-skeleton-content"]')) {
      root.dataset.ready = 'true'
      clearTimeout(timeout)
      finish()
    } else frame = requestAnimationFrame(waitForCanvas)
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage === univerAPI.Enum.LifecycleStages.Rendered) frame = requestAnimationFrame(waitForCanvas)
  })
  function save() {
    if (disposed) throw new Error('Knowledge space is disposed')
    const doc = univerAPI.getActiveDocument()
    if (!doc || doc.getId() !== `knowledge-${state.activePageId}`)
      throw new Error('The active knowledge document is missing')
    state.documents[state.activePageId] = structuredClone(doc.save())
    return structuredClone(state)
  }
  function openPage(pageId: KnowledgePageId) {
    if (disposed || !Object.hasOwn(KNOWLEDGE_PAGES, pageId)) throw new Error('Unknown or disposed knowledge page')
    if (pageId === state.activePageId) return
    save()
    univerAPI.disposeUnit(`knowledge-${state.activePageId}`)
    univerAPI.createDocument(structuredClone(state.documents[pageId]))
    state.activePageId = pageId
    for (const button of nav.querySelectorAll('button')) {
      if (button.dataset.page === pageId) button.setAttribute('aria-current', 'page')
      else button.removeAttribute('aria-current')
    }
  }
  const labels = { handbook: '工程手册', api: 'API 规范', legacy: '旧版部署指南' }
  for (const id of Object.keys(KNOWLEDGE_PAGES) as KnowledgePageId[]) {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.page = id
    button.textContent = chinese ? labels[id] : KNOWLEDGE_PAGES[id].title
    if (id === state.activePageId) button.setAttribute('aria-current', 'page')
    button.addEventListener('click', () => openPage(id))
    nav.append(button)
  }
  timeout = setTimeout(() => {
    if (disposed) return
    cancelAnimationFrame(frame)
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent = chinese ? '文档未能启动，请重新加载。' : 'The document could not start. Reload to retry.'
    editor.prepend(alert)
    console.error(new Error('Knowledge document canvas startup timed out'))
    finish()
  }, 20000)
  univerAPI.createDocument(structuredClone(state.documents[state.activePageId]))
  return {
    univerAPI,
    ready,
    openPage,
    save,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
      finish()
      const errors: unknown[] = []
      for (const release of [
        () => unmount(editor),
        () => univerAPI.disposeUnit(`knowledge-${state.activePageId}`),
        () => univer.dispose(),
      ]) {
        try {
          release()
        } catch (error) {
          errors.push(error)
        }
      }
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      root.remove()
      if (errors.length) throw new AggregateError(errors, 'Knowledge space cleanup failed')
    },
  }
}
