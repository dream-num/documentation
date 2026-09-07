import { UniverDocsCalloutPlugin } from '@univerjs-pro/docs-callout'
import { UniverDocsCalloutUIPlugin } from '@univerjs-pro/docs-callout-ui'
import CalloutEnUS from '@univerjs-pro/docs-callout-ui/locale/en-US'
import CalloutZhCN from '@univerjs-pro/docs-callout-ui/locale/zh-CN'
import { UniverDocsCodePlugin } from '@univerjs-pro/docs-code'
import { UniverDocsCodeUIPlugin } from '@univerjs-pro/docs-code-ui'
import CodeEnUS from '@univerjs-pro/docs-code-ui/locale/en-US'
import CodeZhCN from '@univerjs-pro/docs-code-ui/locale/zh-CN'
import { DocsListSelectionMode, UniverDocsListPlugin } from '@univerjs-pro/docs-list'
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

import { createData } from './data'

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
  root.className = 'list-demo'
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
    for (const [first, last, listId, listType] of [
      ['[RADIO]', '[COAT]', 'mosaic-objects', PresetListType.BULLET_LIST],
      ['[FLOOR]', '[OPEN]', 'mosaic-install', PresetListType.ORDER_LIST],
      ['[EMAIL]', '[SIGNS]', 'mosaic-partners', PresetListType.ORDER_LIST],
      ['[EXIT]', '[KEYS]', 'mosaic-checks', PresetListType.CHECK_LIST],
    ] as const)
      requireSuccess(
        doc.insertList({
          startOffset: paragraph(first).getRange().startOffset,
          endOffset: paragraph(last).getRange().endOffset,
          listId,
          listType,
        }),
        'Could not initialize ' + listId,
      )
    // Label and lighting preparation are children of the accessible-route installation step.
    for (const marker of ['[LABEL]', '[LIGHT]'])
      requireSuccess(
        doc.findListItemByText(marker)?.demote({ mode: DocsListSelectionMode.Item }),
        'Could not nest ' + marker,
      )
    requireSuccess(paragraph('[KEYS]').setTaskChecked(true), 'Could not complete the collected-keys task.')
    requireSuccess(
      doc.insertCallout(paragraph('[RISK]'), {
        blockId: 'mosaic-sunlight',
        config: { icon: '!', backgroundColor: '#FFF4CC' },
      }),
      'Could not initialize the sunlight callout.',
    )
    requireSuccess(
      doc.insertCode({
        ...paragraph('const opening').getRange(),
        blockId: 'mosaic-config',
        config: { language: 'typescript' },
      }),
      'Could not initialize the operating code.',
    )
    requireSuccess(
      doc.insertQuote(paragraph('An object becomes'), { blockId: 'mosaic-quote' }),
      'Could not initialize the quotation.',
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
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
