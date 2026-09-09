import { BooleanNumber, SectionType, type IParagraphStyle } from '@univerjs/core'

export const BREAK_SPECIMENS = [
  { id: 'continuous', text: 'Continuous section: initially on the same page.', type: SectionType.CONTINUOUS },
  { id: 'next-page', text: 'Next-page section: initially starts a new page.', type: SectionType.NEXT_PAGE },
  { id: 'odd-page', text: 'Odd-page section: initially skips to an odd leaf.', type: SectionType.ODD_PAGE },
  { id: 'even-page', text: 'Even-page section: initially starts on an even leaf.', type: SectionType.EVEN_PAGE },
] as const

// Original inspection bulletin. The short page deliberately creates boundary pressure.
export const TITLE = 'River Station Bulletin — Pagination Rules'
export const PARAGRAPHS = [
  'River Station 12 · Inspection Bulletin',
  'Inspection date: 19 March 2027. Team: Lena Ortiz and Theo Park. The following fictional record demonstrates page-boundary behavior, not operating procedures.',
  'Morning observations: the intake screen is clear; the east sensor reports a stable level; the backup recorder has a fresh battery. Photographs and measurements were reconciled before the handover.',
  'Follow-up actions',
  'Replace the worn seal at the next scheduled service. Record the batch number, retain the removed part for inspection, and attach the signed service note to the station record.',
  'Boundary sample: retain the first and last lines with their neighbors when possible. A paragraph longer than an entire page cannot be kept intact. The engine must still place all of its text, even when stronger keep settings need to yield to the available space. This longer sample lets you inspect that behavior after increasing its length in the editor.',
  'Handover complete',
  'Supervisor: Asha Rao. Next review: 26 March 2027. No unresolved findings in this fictional record.',
]
export const BASE_RULES: IParagraphStyle = {
  keepNext: BooleanNumber.FALSE,
  keepLines: BooleanNumber.FALSE,
  widowControl: BooleanNumber.FALSE,
  pageBreakBefore: BooleanNumber.FALSE,
}
export const VARIANTS: {
  id: string
  label: string
  heading: IParagraphStyle
  body: IParagraphStyle
  spacer?: number
  oversized?: boolean
}[] = [
  { id: 'natural', label: 'Natural flow', heading: { ...BASE_RULES }, body: { ...BASE_RULES } },
  {
    id: 'heading-reference',
    label: 'Natural heading',

    spacer: 270,
    heading: { ...BASE_RULES },
    body: { ...BASE_RULES },
  },
  {
    id: 'heading',
    spacer: 270,

    label: 'Keep heading with next',
    heading: { ...BASE_RULES, keepNext: BooleanNumber.TRUE },
    body: { ...BASE_RULES },
  },
  {
    id: 'together',

    label: 'Keep paragraph lines',
    heading: { ...BASE_RULES },
    body: { ...BASE_RULES, keepLines: BooleanNumber.TRUE },
  },
  {
    id: 'widow',

    label: 'Widow / orphan control',
    heading: { ...BASE_RULES },
    body: { ...BASE_RULES, widowControl: BooleanNumber.TRUE },
  },
  {
    id: 'break',

    label: 'Page break before heading',
    heading: { ...BASE_RULES, pageBreakBefore: BooleanNumber.TRUE },
    body: { ...BASE_RULES },
  },
  {
    id: 'oversized',
    label: 'Oversized paragraph',

    oversized: true,
    heading: { ...BASE_RULES },
    body: { ...BASE_RULES, keepLines: BooleanNumber.TRUE },
  },
]
