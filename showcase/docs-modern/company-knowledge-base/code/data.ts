import { BooleanNumber, DocumentFlavor, NamedStyleType, type IDocumentData } from '@univerjs/core'

export const KNOWLEDGE_PAGES = {
  handbook: {
    title: 'Engineering Handbook',
    owner: 'Platform Enablement',
    reviewed: '2027-01-08',
    tags: ['engineering', 'onboarding', 'standards'],
    sections: [
      ['Purpose', 'Use this handbook to make safe technical decisions without waiting for tribal knowledge.'],
      ['Delivery standards', 'Every change has an owner, an observable acceptance check, and a rollback note.'],
      ['Related pages', 'API Standards · Incident Response · Release Checklist'],
    ],
  },
  api: {
    title: 'API Standards',
    owner: 'Developer Experience',
    reviewed: '2027-01-12',
    tags: ['api', 'sdk', 'compatibility'],
    sections: [
      ['Compatibility', 'Published APIs remain source-compatible inside a major version.'],
      ['Errors', 'Return actionable typed errors and preserve the last valid user state.'],
      ['Related pages', 'Engineering Handbook · SDK Release Process'],
    ],
  },
  legacy: {
    title: 'Legacy Deployment Guide',
    owner: 'Infrastructure',
    reviewed: '2026-06-30',
    tags: ['archived', 'deployment'],
    sections: [
      ['Archived', 'This page is retained for audit history. Use Release Checklist for current deployments.'],
      ['Replacement', 'Release Checklist documents the supported build, verification, and rollback flow.'],
    ],
  },
} as const

export type KnowledgePageId = keyof typeof KNOWLEDGE_PAGES

export function createPageData(id: KnowledgePageId): IDocumentData {
  const page = KNOWLEDGE_PAGES[id]
  const accent = { handbook: '#345DB2', api: '#147B73', legacy: '#A3532A' }[id]
  const rows = [
    { text: page.title, kind: 'title' },
    { text: `Owner: ${page.owner} · Tags: ${page.tags.join(', ')}`, kind: 'meta' },
    { text: `Last reviewed: ${page.reviewed}`, kind: 'review' },
    ...page.sections.flatMap(([heading, body]) => [
      { text: heading, kind: 'heading' },
      { text: body, kind: 'body' },
    ]),
  ]
  let offset = 0
  const paragraphs = rows.map((row, index) => {
    offset += row.text.length + 1
    return {
      startIndex: offset - 1,
      paragraphId: `knowledge-${id}-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          row.kind === 'title'
            ? NamedStyleType.TITLE
            : row.kind === 'heading'
              ? NamedStyleType.HEADING_1
              : NamedStyleType.NORMAL_TEXT,
        ...(row.kind === 'heading' ? { headingId: `knowledge-${id}-heading-${index}` } : {}),
        spaceAbove: { v: row.kind === 'heading' ? 16 : 0 },
        spaceBelow: { v: row.kind === 'title' ? 16 : row.kind === 'review' ? 22 : 10 },
        textStyle: {
          ff: 'Arial',
          fs:
            row.kind === 'title'
              ? 30
              : row.kind === 'heading'
                ? 18
                : row.kind === 'meta' || row.kind === 'review'
                  ? 11
                  : 13,
          bl: row.kind === 'title' || row.kind === 'heading' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: {
            rgb:
              row.kind === 'title' ? '#17243B' : row.kind === 'heading' || row.kind === 'review' ? accent : '#475467',
          },
        },
      },
    }
  })
  return {
    id: `knowledge-${id}`,
    title: page.title,
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 880, height: 1123 },
      marginTop: 36,
      marginBottom: 36,
      marginLeft: 48,
      marginRight: 48,
    },
    body: {
      dataStream: rows.map((row) => row.text).join('\r') + '\r\n',
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: offset, sectionId: `knowledge-${id}-section` }],
    },
  }
}
