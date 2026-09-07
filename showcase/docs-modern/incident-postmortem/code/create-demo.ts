import { BooleanNumber, type IDocumentData } from '@univerjs/core'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import docsCoreZhCN from '@univerjs/preset-docs-core/locales/zh-CN'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { POSTMORTEM } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createIncidentPostmortemDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved?: IDocumentData,
) {
  if (saved && (!saved.id || typeof saved.body?.dataStream !== 'string'))
    throw new Error('Restore a document snapshot with its original ID and body.')
  const root = document.createElement('div')
  root.className = 'incident-postmortem-demo'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(docsCoreEnUS),
      [LocaleType.ZH_CN]: mergeLocales(docsCoreZhCN),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root })],
  })
  const doc = univerAPI.createDocument(
    saved
      ? structuredClone(saved)
      : {
          id: 'incident-postmortem-sev-1',
          title: POSTMORTEM.title,
          documentStyle: { documentFlavor: univerAPI.Enum.DocumentFlavor.MODERN },
        },
  )

  if (!saved) {
    doc.getParagraphs()[0]?.setText(POSTMORTEM.title)
    doc.getParagraphs()[0]?.setStyle({
      textStyle: { bl: BooleanNumber.TRUE, fs: 24, cl: { rgb: '#7F1D1D' } },
    })
    doc.appendParagraph(POSTMORTEM.subtitle).setStyle({
      textStyle: { fs: 10, cl: { rgb: '#667085' } },
      spaceBelow: { v: 16 },
    })
    POSTMORTEM.sections.forEach(([heading, body]) => {
      doc.appendParagraph(heading).setStyle({
        textStyle: { bl: BooleanNumber.TRUE, fs: 15, cl: { rgb: '#B42318' } },
      })
      doc.appendParagraph(body).setStyle({
        textStyle: { fs: 11, cl: { rgb: '#475467' } },
        spaceBelow: { v: 12 },
      })
    })
    doc.appendParagraph('Remediation').setStyle({
      textStyle: { bl: BooleanNumber.TRUE, fs: 15, cl: { rgb: '#B42318' } },
    })
    const action = doc.appendParagraph(POSTMORTEM.actionBefore)
    action.setStyle({
      textStyle: { fs: 11, cl: { rgb: '#B54708' } },
      spaceBelow: { v: 12 },
    })
  }
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  let disposed = false
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
