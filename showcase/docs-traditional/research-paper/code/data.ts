import { BooleanNumber, DocumentFlavor, NamedStyleType, type IDocumentData } from '@univerjs/core'

export const RESEARCH_PAPER = {
  title: 'Latency-Aware Reconciliation for Offline Collaborative Documents',
  authors: 'A. Rivera · M. Chen · S. Okafor — Univer Systems Research',
  abstract:
    'This paper evaluates a deterministic reconciliation strategy for intermittently connected document clients. Across 12,480 replayed editing sessions, the strategy reduced user-visible conflicts by 37% while preserving a complete audit trail.',
  sections: [
    [
      '1. Introduction',
      'Offline review is a traditional document workflow with modern synchronization constraints. A useful model must preserve pagination, comments, and accepted edits without hiding unresolved conflicts.',
    ],
    [
      '2. Method',
      'We replayed fixed operation traces at 80 ms, 240 ms, and 1,200 ms network latency. Each trace contained paragraph edits, style changes, comments, and section breaks.',
    ],
    [
      '3. Results',
      'Median reconciliation time was 142 ms. The 95th percentile was 611 ms, and no accepted operation was lost. Conflict density increased from 0.8% to 2.6% at the highest latency.',
    ],
    [
      '4. Limitations',
      'The experiment excludes media larger than 25 MB and does not model concurrent font substitution. These cases remain future work.',
    ],
    [
      'References',
      '[1] Univer Systems Group. Deterministic Operation Replay, 2026.\n[2] Open Collaboration Institute. Paginated Review Benchmarks, 2025.',
    ],
  ],
  appendix: [
    'Appendix A. Reproduction Parameters',
    'Seed: UDOC-2026-09-03 · Sessions: 12,480 · Frozen clock: 2026-08-31T09:00:00Z · Retry schedule: 1 s / 3 s / 10 s.',
  ],
} as const

export const PAPER_ID = 'research-paper'

export function createPaperData(): IDocumentData {
  const rows = [
    { text: RESEARCH_PAPER.title, kind: 'title' },
    { text: RESEARCH_PAPER.authors, kind: 'authors' },
    { text: 'Abstract', kind: 'heading' },
    { text: RESEARCH_PAPER.abstract, kind: 'body' },
    ...RESEARCH_PAPER.sections.flatMap(([heading, content]) => [
      { text: heading, kind: 'heading' },
      ...content.split('\n').map((text) => ({ text, kind: heading === 'References' ? 'reference' : 'body' })),
    ]),
    { text: RESEARCH_PAPER.appendix[0], kind: 'appendix' },
    { text: RESEARCH_PAPER.appendix[1], kind: 'body' },
    { text: 'Replay matrix', kind: 'heading' },
    { text: '80 ms · Low-latency trace replay', kind: 'parameter' },
    { text: '240 ms · Intermediate-latency trace replay', kind: 'parameter' },
    { text: '1,200 ms · High-latency trace replay', kind: 'parameter' },
    { text: 'Scope of reproduction', kind: 'heading' },
    {
      text: 'Paragraph edits, style changes, comments, and section breaks are included. Media larger than 25 MB and concurrent font substitution are excluded.',
      kind: 'body',
    },
  ]
  let offset = 0
  const paragraphs = rows.map((row, index) => {
    offset += row.text.length + 1
    const heading = row.kind === 'heading' || row.kind === 'appendix'
    return {
      startIndex: offset - 1,
      paragraphId: `research-paragraph-${index}`,
      paragraphStyle: {
        namedStyleType:
          row.kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
        ...(heading ? { headingId: `research-heading-${index}` } : {}),
        ...(row.kind === 'appendix' ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
        spaceAbove: { v: heading ? 12 : 0 },
        spaceBelow: { v: row.kind === 'title' || row.kind === 'authors' ? 16 : 8 },
        lineSpacing: 1.15,
        textStyle: {
          ff: 'Times New Roman',
          fs: row.kind === 'title' ? 16.5 : heading ? 13 : row.kind === 'authors' || row.kind === 'reference' ? 10 : 11,
          bl: row.kind === 'title' || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          it: row.kind === 'authors' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: { rgb: heading ? '#24467A' : row.kind === 'authors' ? '#556173' : '#202735' },
        },
      },
    }
  })
  return {
    id: PAPER_ID,
    title: RESEARCH_PAPER.title,
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 72,
      marginRight: 72,
      marginBottom: 72,
      marginLeft: 72,
    },
    body: {
      dataStream: rows.map((row) => row.text).join('\r') + '\r\n',
      paragraphs,
      textRuns: [],
      sectionBreaks: [{ startIndex: offset, sectionId: 'research-section' }],
    },
  }
}
