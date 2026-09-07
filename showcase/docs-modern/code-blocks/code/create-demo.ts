import { UniverDocsCalloutPlugin } from '@univerjs-pro/docs-callout'
import { UniverDocsCalloutUIPlugin } from '@univerjs-pro/docs-callout-ui'
import CalloutEnUS from '@univerjs-pro/docs-callout-ui/locale/en-US'
import CalloutZhCN from '@univerjs-pro/docs-callout-ui/locale/zh-CN'
import { UniverDocsCodePlugin } from '@univerjs-pro/docs-code'
import { UniverDocsCodeUIPlugin } from '@univerjs-pro/docs-code-ui'
import CodeEnUS from '@univerjs-pro/docs-code-ui/locale/en-US'
import CodeZhCN from '@univerjs-pro/docs-code-ui/locale/zh-CN'
import { UniverDocsListPlugin } from '@univerjs-pro/docs-list'
import { UniverDocsListUIPlugin } from '@univerjs-pro/docs-list-ui'
import ListEnUS from '@univerjs-pro/docs-list-ui/locale/en-US'
import ListZhCN from '@univerjs-pro/docs-list-ui/locale/zh-CN'
import { UniverDocsQuotePlugin } from '@univerjs-pro/docs-quote'
import { UniverDocsQuoteUIPlugin } from '@univerjs-pro/docs-quote-ui'
import QuoteEnUS from '@univerjs-pro/docs-quote-ui/locale/en-US'
import QuoteZhCN from '@univerjs-pro/docs-quote-ui/locale/zh-CN'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { PresetListType } from '@univerjs/core'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import DocsZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { UniverDocsHyperLinkPreset } from '@univerjs/preset-docs-hyper-link'
import HyperLinkEnUS from '@univerjs/preset-docs-hyper-link/locales/en-US'
import HyperLinkZhCN from '@univerjs/preset-docs-hyper-link/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { COMPARISON_ID, createData, PRIMARY_ID, SAMPLES } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-hyper-link/lib/index.css'
import '@univerjs-pro/docs-callout-ui/lib/index.css'
import '@univerjs-pro/docs-code-ui/lib/index.css'
import '@univerjs-pro/docs-list-ui/lib/index.css'
import '@univerjs-pro/docs-quote-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-callout/facade'
import '@univerjs-pro/docs-code/facade'
import '@univerjs-pro/docs-list/facade'
import '@univerjs-pro/docs-quote/facade'

function requireSuccess(result: unknown, message: string) {
  if (!result) throw new Error(message)
}
export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'code-demo'
  container.append(root)
  const locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, HyperLinkEnUS, CalloutEnUS, CodeEnUS, ListEnUS, QuoteEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DocsZhCN, HyperLinkZhCN, CalloutZhCN, CodeZhCN, ListZhCN, QuoteZhCN),
    },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: root, header: true, toolbar: true, footer: true }),
      UniverDocsHyperLinkPreset(),
    ],
    plugins: [
      UniverLicensePlugin,
      UniverDocsCalloutPlugin,
      UniverDocsCalloutUIPlugin,
      UniverDocsCodePlugin,
      UniverDocsCodeUIPlugin,
      UniverDocsListPlugin,
      UniverDocsListUIPlugin,
      UniverDocsQuotePlugin,
      UniverDocsQuoteUIPlugin,
    ],
  })
  const owner = window as typeof window & { univerAPI?: typeof api }
  owner.univerAPI = api
  let disposed = false
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (!disposed && stage === api.Enum.LifecycleStages.Rendered && root.dataset.ready !== 'error')
      root.dataset.ready = 'true'
  })
  try {
    const doc = api.createDocument(createData())
    function paragraph(marker: string) {
      const matches = doc.getParagraphs().filter((item) => item.getText().includes(marker))
      if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
      return matches[0]
    }
    function codeBetween(firstHeading: string, nextHeading: string, blockId: string, language: string) {
      const paragraphs = doc.getParagraphs()
      const first = paragraph(firstHeading).getInfo().paragraphIndex + 1
      const last = paragraph(nextHeading).getInfo().paragraphIndex - 1
      if (last < first) throw new Error('No code paragraphs between the headings')
      requireSuccess(
        doc.insertCode({
          blockId,
          startOffset: paragraphs[first].getRange().startOffset,
          endOffset: paragraphs[last].getRange().endOffset + (paragraphs[last].getText() === '' ? 1 : 0),
          config: { language },
        }),
        'Could not create ' + blockId,
      )
    }
    codeBetween('02 · Ingestion example', '03 · Review rules', PRIMARY_ID, 'typescript')
    codeBetween('04 · Comparison query', SAMPLES[1].label, COMPARISON_ID, 'sql')
    for (let index = 1; index < SAMPLES.length; index++)
      codeBetween(
        SAMPLES[index].label,
        SAMPLES[index + 1]?.label ?? '05 · Acceptance checklist',
        'beacon-' + SAMPLES[index].id,
        SAMPLES[index].id,
      )
    requireSuccess(
      doc.insertCallout(paragraph('[CAUTION]'), {
        blockId: 'beacon-caution',
        config: { icon: '!', backgroundColor: '#FEF0C7' },
      }),
      'Could not create caution.',
    )
    requireSuccess(
      doc.insertQuote(paragraph('[QUOTE]'), { blockId: 'beacon-perspective' }),
      'Could not create editorial quote.',
    )
    for (const [first, last, listId, listType] of [
      ['Keep every original', 'Record station names', 'beacon-rules', PresetListType.BULLET_LIST],
      ['Verify tabs', 'Confirm a language', 'beacon-checks', PresetListType.CHECK_LIST],
    ] as const)
      requireSuccess(
        doc.insertList({
          startOffset: paragraph(first).getRange().startOffset,
          endOffset: paragraph(last).getRange().endOffset,
          listId,
          listType,
        }),
        'Could not create ' + listId,
      )
  } catch (cause) {
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent =
      (locale === LocaleType.ZH_CN ? '文档启动失败：' : 'Document startup failed: ') +
      (cause instanceof Error ? cause.message : String(cause))
    root.append(alert)
    console.error(cause)
  }
  return {
    univerAPI: api,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
