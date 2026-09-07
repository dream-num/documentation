import { BooleanNumber, IUndoRedoService } from '@univerjs/core'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import docsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { PRODUCT_BRIEF } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createProductBriefDemo(container: HTMLElement, darkMode = false) {
  const root = window.document.createElement('div')
  root.className = 'product-brief-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const locale = window.document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(docsCoreEnUS),
      [LocaleType.ZH_CN]: mergeLocales(docsCoreZhCN),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root })],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage === univerAPI.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  })
  try {
    const document = univerAPI.createDocument({
      id: 'atlas-offline-product-brief',
      title: PRODUCT_BRIEF.title,
      documentStyle: { documentFlavor: univerAPI.Enum.DocumentFlavor.MODERN },
    })
    const title = document.getParagraphs()[0]
    title?.setText(PRODUCT_BRIEF.title)
    title?.setStyle({ textStyle: { bl: BooleanNumber.TRUE, fs: 26, cl: { rgb: '#172033' } } })
    document.appendParagraph(PRODUCT_BRIEF.subtitle).setStyle({
      spaceBelow: { v: 18 },
      textStyle: { fs: 11, cl: { rgb: '#667085' } },
    })
    PRODUCT_BRIEF.sections.forEach(([heading, content]) => appendSection(document, heading, content))
    // Construction is baseline content, not a sequence of user edits to undo.
    univer.__getInjector().get(IUndoRedoService).clearUndoRedo(document.getId())
  } catch (cause) {
    root.dataset.ready = 'error'
    const alert = window.document.createElement('p')
    alert.role = 'alert'
    alert.textContent =
      (locale === LocaleType.ZH_CN ? '文档启动失败：' : 'Document startup failed: ') +
      (cause instanceof Error ? cause.message : String(cause))
    root.append(alert)
    console.error(cause)
  }
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}

function appendSection(
  document: ReturnType<ReturnType<typeof createUniver>['univerAPI']['createDocument']>,
  heading: string,
  content: string,
) {
  document.appendParagraph(heading).setStyle({
    textStyle: { bl: BooleanNumber.TRUE, fs: 16, cl: { rgb: '#226C68' } },
  })
  document.appendParagraph(content).setStyle({
    spaceBelow: { v: 14 },
    textStyle: { fs: 11, cl: { rgb: '#475467' } },
  })
}
