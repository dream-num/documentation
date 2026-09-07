import type { IPdfAnnotationInsertOptions } from '@univerjs-pro/pdfs/facade'
import type { FUniver } from '@univerjs/core/facade'
import { PdfAnnotationType } from '@univerjs-pro/pdfs'
import { ImageSourceType } from '@univerjs/core'

import '@univerjs-pro/pdfs/facade'

export const REVIEW_DATE = '2027-03-31T09:00:00Z'
// Original fictional floor plan. This is an SDK exercise, not an evacuation plan or safety advice.
export const PLAN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="660" viewBox="0 0 1020 660">
<rect width="1020" height="660" fill="#f8fafc"/>
<g fill="white" stroke="#64748b" stroke-width="4"><rect x="35" y="100" width="280" height="200"/><rect x="375" y="100" width="270" height="200"/><rect x="705" y="100" width="280" height="200"/><rect x="35" y="390" width="280" height="190"/><rect x="705" y="390" width="280" height="190"/></g>
<g font-family="Arial" font-size="26" fill="#1e293b"><text x="70" y="190">Studio A</text><text x="415" y="190">Workshop</text><text x="740" y="190">Storage</text><text x="70" y="485">Reception</text><text x="735" y="485">Dispatch</text><text x="385" y="560">START / LOBBY</text></g>
<g fill="#d1fae5"><rect x="40" y="24" width="145" height="54"/><rect x="830" y="24" width="145" height="54"/></g>
<g font-family="Arial" font-size="27" font-weight="bold" fill="#065f46"><text x="56" y="61">EXIT A</text><text x="846" y="61">EXIT B</text></g>
<path d="M510 510V345H345V65H205" fill="none" stroke="#059669" stroke-width="9"/>
<path d="M535 510V365H675V65H810" fill="none" stroke="#2563eb" stroke-width="8" stroke-dasharray="16 10"/>
<g font-family="Arial" font-size="21" fill="#475569"><text x="45" y="635">Route A: solid green</text><text x="385" y="635">Route B: dashed blue</text><text x="720" y="635">ILLUSTRATIVE ONLY</text></g></svg>`

export const STROKES = [
  {
    id: 'exit-circle',
    label: 'Circle Exit A',
    paths: [
      Array.from({ length: 33 }, (_, n): [number, number] => {
        const angle = (n * Math.PI) / 16
        return [98 + 46 * Math.cos(angle), 160 + 21 * Math.sin(angle)]
      }),
    ],
  },
  {
    id: 'alternate-route',
    label: 'Alternate route',
    paths: [
      [
        [298, 387],
        [298, 309],
        [374, 309],
        [374, 169],
        [458, 169],
      ] as [number, number][],
    ],
  },
  {
    id: 'legend-check',
    label: 'Reviewer legend check',
    paths: [
      [
        [64, 533],
        [74, 545],
        [95, 516],
      ] as [number, number][],
    ],
  },
]

export function strokeOptions(index: number, color = '#dc2626', width = 2): IPdfAnnotationInsertOptions {
  const stroke = STROKES[index]
  if (!stroke) throw new Error('Choose a known stroke.')
  const points = stroke.paths.flat()
  const x = points.map(([left]) => left),
    y = points.map(([, top]) => top)
  return {
    id: stroke.id,
    annotationType: PdfAnnotationType.INK,
    left: Math.min(...x) - width,
    top: Math.min(...y) - width,
    width: Math.max(...x) - Math.min(...x) + 2 * width,
    height: Math.max(...y) - Math.min(...y) + 2 * width,
    ink: { paths: structuredClone(stroke.paths), stroke: { color, width } },
  }
}

export function createPlan(api: FUniver) {
  const pdf = api.createPdf({
    id: 'meridian-plan-review',
    name: 'Meridian studio / route review',
    metadata: { reviewDate: REVIEW_DATE },
  })
  const page = pdf.getPageByIndex(0)!
  const text = (id: string, value: string, top: number, size = 12, height = 35) =>
    page.insertTextBox({
      id,
      text: value,
      left: 42,
      top,
      width: 510,
      height,
      fontSize: size,
      fontFamily: 'Arial',
      fill: '#243746',
    })
  text('title', 'Meridian studio / route review', 42, 22).setTextStyle({ bold: true })
  text('subtitle', 'Original fictional floor plan / two reference routes', 87)
  page.insertImage(
    page
      .newImage('floor-plan')
      .setSource('data:image/svg+xml;base64,' + btoa(PLAN_SVG), ImageSourceType.BASE64)
      .setAbsolutePosition(42, 135)
      .setSize(510, 330)
      .build(),
  )
  text('legend', 'Reviewer legend: circle = question; violet line = proposed change', 492, 11)
  text('blank-legend', 'Review mark: ______________________', 565)
  text(
    'instructions',
    'Review the Exit A question and compare the proposed route.\nAdd your reviewer mark below the legend.',
    623,
    11,
    65,
  )
  text('notice', 'Illustrative SDK data only. Not a safety plan, approval or real site assessment.', 735, 10)
  page.insertAnnotation(strokeOptions(0, '#dc2626', 2))
  page.insertAnnotation(strokeOptions(1, '#7c3aed', 3))
  page.insertAnnotation(strokeOptions(2, '#a65a35', 2))
  return pdf
}
