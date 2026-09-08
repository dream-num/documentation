import { UniverDocsCalloutPlugin } from '@univerjs-pro/docs-callout'
import { UniverDocsCalloutUIPlugin } from '@univerjs-pro/docs-callout-ui'
import CalloutEnUS from '@univerjs-pro/docs-callout-ui/locale/en-US'
import { UniverDocsCodePlugin } from '@univerjs-pro/docs-code'
import { UniverDocsCodeUIPlugin } from '@univerjs-pro/docs-code-ui'
import CodeEnUS from '@univerjs-pro/docs-code-ui/locale/en-US'
import { UniverDocsListPlugin } from '@univerjs-pro/docs-list'
import { UniverDocsListUIPlugin } from '@univerjs-pro/docs-list-ui'
import ListEnUS from '@univerjs-pro/docs-list-ui/locale/en-US'
import { UniverDocsQuotePlugin } from '@univerjs-pro/docs-quote'
import { UniverDocsQuoteUIPlugin } from '@univerjs-pro/docs-quote-ui'
import QuoteEnUS from '@univerjs-pro/docs-quote-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { PresetListType } from '@univerjs/core'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { UniverDocsHyperLinkPreset } from '@univerjs/preset-docs-hyper-link'
import HyperLinkEnUS from '@univerjs/preset-docs-hyper-link/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { COMPARISON_ID, createData, PRIMARY_ID, STYLES } from './data'

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
  root.className = 'quote-demo'
  container.append(root)
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, HyperLinkEnUS, CalloutEnUS, CodeEnUS, ListEnUS, QuoteEnUS),
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
    for (const [first, last, blockId, style] of [
      ['[VOICE]', '[VOICE]', PRIMARY_ID, STYLES[0]],
      ['[COMPARE]', '[COMPARE]', COMPARISON_ID, STYLES[3]],
      ['[COMMUNITY]', '[ACCESS]', 'harbor-community', STYLES[1]],
      ['[RESEARCH]', '[OBSERVATION]', 'harbor-research', STYLES[2]],
    ] as const) {
      requireSuccess(
        doc.insertQuote({
          blockId,
          startOffset: paragraph(first).getRange().startOffset,
          endOffset: paragraph(last).getRange().endOffset,
        }),
        'Could not initialize ' + blockId,
      )
      requireSuccess(
        doc.getQuote(blockId)?.setStyle({
          lineColor: style.lineColor,
          textColor: style.textColor,
        }),
        'Could not style ' + blockId,
      )
    }
    requireSuccess(
      doc.insertCallout(paragraph('[CAUTION]'), {
        blockId: 'harbor-caution',
        config: { icon: '!', backgroundColor: '#FEF0C7' },
      }),
      'Could not create caution.',
    )
    for (const [first, last, listId, listType] of [
      ['Ferry to library:', 'Library to tram:', 'harbor-routes', PresetListType.BULLET_LIST],
      ['Walk both routes', 'Review the large-print', 'harbor-checks', PresetListType.CHECK_LIST],
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
    requireSuccess(
      doc.insertCode({
        blockId: 'harbor-config',
        startOffset: paragraph('const guide').getRange().startOffset,
        endOffset: paragraph('await routeGuide').getRange().endOffset,
        config: { language: 'typescript' },
      }),
      'Could not create guide code.',
    )
  } catch (cause) {
    root.dataset.ready = 'error'
    const alert = document.createElement('p')
    alert.role = 'alert'
    alert.textContent = 'Document startup failed: ' + (cause instanceof Error ? cause.message : String(cause))
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
