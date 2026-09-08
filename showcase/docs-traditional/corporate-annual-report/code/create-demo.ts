import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber } from '@univerjs/core'
import { UniverDocsCorePreset, unmount } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { ANNUAL_REPORT } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createAnnualReportDemo(
  container: HTMLElement,
  darkMode = false,
  _legacyLocale: LocaleType = LocaleType.EN_US,
  saved?: IDocumentData,
) {
  const locale = LocaleType.EN_US
  if (saved) validateSnapshot(saved)
  const root = globalThis.document.createElement('div')
  root.className = 'annual-report'
  root.style.height = '100%'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: mergeLocales(docsCoreEnUS) },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root })],
  })
  const document = univerAPI.createDocument(
    saved
      ? structuredClone(saved)
      : {
          id: 'atlas-fy2027-report',
          title: ANNUAL_REPORT.title,
          documentStyle: {
            documentFlavor: univerAPI.Enum.DocumentFlavor.TRADITIONAL,
            pageSize: { width: 794, height: 1123 },
            marginTop: 76,
            marginRight: 72,
            marginBottom: 76,
            marginLeft: 72,
          },
        },
  )

  if (!saved) {
    const headerId = document.ensurePageHeader()
    document.appendParagraph('ATLAS SYSTEMS · ANNUAL REPORT 2027', headerId).setStyle({
      textStyle: { fs: 8, cl: { rgb: '#667085' } },
    })
    const footerId = document.ensurePageFooter()
    document.appendParagraph('PUBLIC SAMPLE · LOCAL FIXTURE', footerId).setStyle({
      textStyle: { fs: 8, cl: { rgb: '#98A2B3' } },
    })

    document.getParagraphs()[0]?.setText(ANNUAL_REPORT.title)
    document.getParagraphs()[0]?.setStyle({
      textStyle: { bl: BooleanNumber.TRUE, fs: 22, ff: 'Georgia', cl: { rgb: '#0F2F4F' } },
      spaceBelow: { v: 10 },
    })
    document.appendParagraph(ANNUAL_REPORT.subtitle).setStyle({
      textStyle: { fs: 10, it: BooleanNumber.TRUE, ff: 'Georgia', cl: { rgb: '#667085' } },
      spaceBelow: { v: 20 },
    })

    ANNUAL_REPORT.sections.slice(0, 2).forEach(([heading, body]) => appendSection(document, heading, body))
    appendSection(document, ...ANNUAL_REPORT.sections[2])
    const revenue = document.appendParagraph(ANNUAL_REPORT.revenueBefore)
    revenue.setStyle({
      textStyle: { bl: BooleanNumber.TRUE, fs: 13, ff: 'Georgia', cl: { rgb: '#175CD3' } },
      spaceBelow: { v: 12 },
    })
    ANNUAL_REPORT.sections.slice(3).forEach(([heading, body]) => appendSection(document, heading, body))
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
      const errors: unknown[] = []
      for (const release of [
        () => unmount(root),
        () => univerAPI.disposeUnit(document.getId()),
        () => univer.dispose(),
      ]) {
        try {
          release()
        } catch (error) {
          errors.push(error)
        }
      }
      root.remove()
      if (errors.length) throw new AggregateError(errors, 'Annual report cleanup failed')
    },
  }
}

export function validateSnapshot(data: IDocumentData) {
  if (
    data.id !== 'atlas-fy2027-report' ||
    !data.body?.dataStream?.endsWith('\r\n') ||
    ![data.documentStyle?.pageSize?.width, data.documentStyle?.pageSize?.height].every(
      (value) => typeof value === 'number' && Number.isFinite(value) && value > 0,
    )
  )
    throw new Error(
      'Restore a complete Atlas native snapshot with the same ID, terminated body and positive page size.',
    )
}

function appendSection(
  document: ReturnType<ReturnType<typeof createUniver>['univerAPI']['createDocument']>,
  heading: string,
  body: string,
) {
  document.appendParagraph(heading).setStyle({
    keepNext: BooleanNumber.TRUE,
    textStyle: { bl: BooleanNumber.TRUE, fs: 14, ff: 'Georgia', cl: { rgb: '#0F2F4F' } },
    spaceAbove: { v: 8 },
  })
  body.split('\n').forEach((line) =>
    document.appendParagraph(line).setStyle({
      widowControl: BooleanNumber.TRUE,
      textStyle: { fs: 10.5, ff: 'Georgia', cl: { rgb: '#344054' } },
      lineSpacing: 1.15,
      spaceBelow: { v: 12 },
    }),
  )
}
