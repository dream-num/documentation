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
  root.className = 'heading-demo'
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
    if (!disposed && stage === api.Enum.LifecycleStages.Rendered) root.dataset.ready = 'true'
  })
  try {
    const doc = api.createDocument(createData())
    function paragraph(marker: string) {
      const matches = doc.getParagraphs().filter((item) => item.getText().includes(marker))
      if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
      return matches[0]
    }
    // Supporting content uses real block/list plugins, with deterministic block IDs.
    requireSuccess(
      doc.insertList({
        startOffset: paragraph('Field researchers').getRange().startOffset,
        endOffset: paragraph('Reviewers comparing').getRange().endOffset,
        listId: 'lumen-audience',
        listType: PresetListType.BULLET_LIST,
      }),
      'Could not create the audience list.',
    )
    requireSuccess(
      doc.insertList(paragraph('Confirm consent'), { listId: 'lumen-checklist', listType: PresetListType.CHECK_LIST }),
      'Could not create the task.',
    )
    requireSuccess(
      doc.insertCallout(paragraph('RISK NOTE:'), {
        blockId: 'lumen-risk',
        config: { icon: '!', backgroundColor: '#FFF4CC' },
      }),
      'Could not create the callout.',
    )
    requireSuccess(
      doc.insertCode({
        blockId: 'lumen-code',
        startOffset: paragraph('const pilot').getRange().startOffset,
        endOffset: paragraph('await fieldNotes').getRange().endOffset,
        config: { language: 'typescript' },
      }),
      'Could not create the code block.',
    )
    requireSuccess(
      doc.insertQuote(paragraph('A useful note'), { blockId: 'lumen-quote' }),
      'Could not create the quote.',
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
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
