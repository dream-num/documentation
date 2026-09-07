import type { IPdfAnnotationInsertOptions } from '@univerjs-pro/pdfs/facade'
import type { FUniver } from '@univerjs/core/facade'
import { PdfAnnotationType } from '@univerjs-pro/pdfs'

import '@univerjs-pro/pdfs/facade'

export const REVIEW_DATE = '2027-03-31T09:00:00Z'
export const MARK_TYPES = [
  PdfAnnotationType.HIGHLIGHT,
  PdfAnnotationType.UNDERLINE,
  PdfAnnotationType.STRIKEOUT,
  PdfAnnotationType.SQUIGGLY,
] as const
export const TARGETS = [
  { id: 'renewal', label: 'Renewal date', page: 0, top: 218, width: 330, lines: ['Renewal review: 30 September 2027'] },
  { id: 'fee', label: 'Service fee', page: 0, top: 350, width: 350, lines: ['Proposed annual fee: USD 18,450.00'] },
  {
    id: 'obsolete',
    label: 'Obsolete clause (two lines)',
    page: 1,
    top: 218,
    width: 435,
    lines: [
      'Old draft: paper-only change requests are required.',
      'Old draft: email submissions will not be accepted.',
    ],
  },
] as const

// One geometry definition shared by the seeded comparison and interactive Facade insertion.
export function createMarkOptions(
  index: number,
  annotationType: (typeof MARK_TYPES)[number],
  color: string,
  opacity: number,
): IPdfAnnotationInsertOptions {
  const selected = TARGETS[index]
  if (!selected) throw new Error('Unknown text target.')
  return {
    id: `${selected.id}-mark`,
    annotationType,
    left: 48,
    top: selected.top,
    width: selected.width,
    height: 22 + (selected.lines.length - 1) * 30,
    markup: {
      color,
      opacity,
      quadPoints: selected.lines.map((_, line) => {
        const top = selected.top + line * 30
        return [
          [48, top],
          [48 + selected.width, top],
          [48, top + 22],
          [48 + selected.width, top + 22],
        ]
      }),
    },
  }
}

// Original fictional draft for UI testing, not a reusable legal agreement.
export function createContract(api: FUniver) {
  const pdf = api.createPdf({
    id: 'aster-markup-draft',
    name: 'Aster Studio / review exercise',
    metadata: { reviewDate: REVIEW_DATE },
  })
  const pages = [pdf.getPageByIndex(0)!, pdf.insertPage()]
  pages.forEach((page, index) => {
    const text = (id: string, value: string, top: number, fontSize = 13, height = 50) =>
      page.insertTextBox({
        id,
        text: value,
        left: 48,
        top,
        width: 495,
        height,
        fontSize,
        fontFamily: 'Arial',
        fill: '#243746',
      })
    text(`label-${index}`, 'ASTER STUDIO / FICTIONAL CONTRACT REVIEW', 42, 10)
    text(`title-${index}`, index === 0 ? 'Dates and commercial terms' : 'Change-request procedure', 94, 23, 70)
    page.insertDivider({ id: `divider-${index}`, left: 48, top: 170, width: 495, strokeColor: '#cbd5e1' })
    text(
      `note-${index}`,
      index === 0
        ? 'Review task: flag the renewal date and confirm the fee.\nThese values are synthetic and do not describe a real offer.'
        : 'Review task: mark the old draft for discussion.\nA strikeout is a review annotation; it does not delete text.',
      465,
      12,
      90,
    )
    text(
      `context-${index}`,
      index === 0
        ? 'Service: illustration archive maintenance\nScope: 240 assets / quarterly checks\nContact: Nia Sol / Aster Studio (fictional)'
        : 'Proposed alternative: accept tracked electronic requests.\nOwner: Rowan Vale / operations (fictional)\nDecision: pending review, not approval.',
      595,
      12,
      110,
    )
    text(`footer-${index}`, `31 March 2027 / DRAFT FOR SDK TESTING / ${index + 1} of 2`, 775, 9)
  })
  for (const target of TARGETS)
    target.lines.forEach((line, index) =>
      pages[target.page].insertTextBox({
        id: `${target.id}-text-${index}`,
        text: line,
        left: 48,
        top: target.top + index * 30,
        width: 495,
        height: 28,
        fontSize: 15,
        fontFamily: 'Arial',
        fill: '#243746',
      }),
    )
  for (const [index, color] of ['#f5bd34', '#2563eb', '#dc2626'].entries())
    pages[TARGETS[index].page].insertAnnotation(
      createMarkOptions(index, MARK_TYPES[index], color, index === 0 ? 0.5 : 1),
    )
  return pdf
}
