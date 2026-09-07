import type { FUniver } from '@univerjs/core/facade'
import { ImageSourceType } from '@univerjs/core'

import '@univerjs-pro/pdfs/facade'

export const AUDIT_DATE = '31 March 2027'
export const PAGE_TITLES = [
  'Supplier audit packet',
  'Findings and ownership',
  'Receiving-area evidence',
  'Review and sign-off',
]
export const PENDING_SIGNOFF = 'Decision: pending corrective-action review'
export const REVIEWED_SIGNOFF = 'Decision: conditional approval\nFollow-up due 14 April 2027'

// Original schematic, not a photograph or third-party audit evidence.
export const EVIDENCE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520">
<rect width="1000" height="520" fill="#eef4f8"/>
<rect x="35" y="35" width="930" height="450" rx="14" fill="white" stroke="#cbd5e1" stroke-width="4"/>
<path d="M60 290H940" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="12 8"/>
<g font-family="Arial" font-size="25" fill="#172033">
<text x="65" y="88">KESTREL / RECEIVING BAY 02</text>
<rect x="75" y="125" width="245" height="125" rx="8" fill="#d1fae5"/>
<text x="95" y="174">Verified labels</text><text x="95" y="217">42 / 48 cartons</text>
<rect x="360" y="125" width="245" height="125" rx="8" fill="#fef3c7"/>
<text x="380" y="174">Relabel required</text><text x="380" y="217">6 / 48 cartons</text>
<rect x="655" y="125" width="265" height="125" rx="8" fill="#fee2e2"/>
<text x="675" y="174">Hold area</text><text x="675" y="217">Do not dispatch</text>
<text x="75" y="357">Keep the marked inspection aisle clear.</text>
<text x="75" y="404">Illustrative layout - not to scale.</text>
</g></svg>`

export function createAuditPacket(api: FUniver) {
  const pdf = api.createPdf({ id: 'kestrel-supplier-audit', name: 'Kestrel Components - supplier audit' })
  const pages = [pdf.getPageByIndex(0)!, pdf.insertPage(), pdf.insertPage(), pdf.insertPage()]
  pages.forEach((page, index) => {
    page.insertTextBox({
      id: `eyebrow-${index}`,
      text: 'KESTREL COMPONENTS / FICTIONAL TRAINING PACKET',
      left: 42,
      top: 35,
      width: 510,
      height: 20,
      fontSize: 9,
      fill: '#2563eb',
    })
    page
      .insertTextBox({
        id: `title-${index}`,
        text: PAGE_TITLES[index],
        left: 42,
        top: 75,
        width: 510,
        height: 65,
        fontSize: 25,
        fill: '#172033',
      })
      .setTextStyle({ bold: true })
    page.insertDivider({ id: `rule-${index}`, left: 42, top: 150, width: 510, strokeColor: '#cbd5e1' })
    page.insertTextBox({
      id: `footer-${index}`,
      text: `AUD-2027-031 / ${AUDIT_DATE} / ${index + 1} of 4`,
      left: 42,
      top: 775,
      width: 510,
      height: 22,
      fontSize: 9,
      fill: '#64748b',
    })
  })
  const text = (pageIndex: number, id: string, value: string, top: number, height = 80, fontSize = 13) =>
    pages[pageIndex].insertTextBox({
      id,
      text: value,
      left: 42,
      top,
      width: 510,
      height,
      fontSize,
      fill: '#334155',
      fontFamily: 'Arial',
    })
  text(
    0,
    'scope',
    'Supplier: Kestrel Components\nSite: East Yard / receiving and traceability\nAudit scope: 48 cartons across three incoming lots',
    185,
    110,
    16,
  )
  text(
    0,
    'summary',
    '42 cartons carried complete lot labels. Six require relabeling\nbefore release. Two additional process findings concern\ncalibration records and aisle clearance.',
    325,
    115,
  )
  text(0, 'outcome', '3 findings / 2 owners / 1 follow-up visit', 480, 60, 21).setTextStyle({ bold: true })
  text(
    0,
    'disclaimer',
    'All organizations, quantities and observations are fictional.\nThis packet demonstrates SDK lifecycle behavior; it is not\ncompliance advice or a completed audit.',
    615,
    110,
    11,
  )
  pages[1].insertTable({
    id: 'findings-table',
    left: 42,
    top: 190,
    width: 510,
    height: 240,
    rowCount: 4,
    columnCount: 3,
    cellTexts: [
      'Finding',
      'Owner',
      'Due',
      'F-01: 6 lot labels',
      'Mira Chen',
      '07 Apr',
      'F-02: calibration log',
      'Owen Reed',
      '10 Apr',
      'F-03: aisle marking',
      'Mira Chen',
      '12 Apr',
    ],
  })
  text(
    1,
    'acceptance',
    'Closure criteria\nF-01: Reinspect all six labels.\nF-02: Attach the current calibration record.\nF-03: Confirm the aisle is clear at shift handover.',
    495,
    150,
  )
  text(1, 'follow-up', 'Follow-up visit: 14 April 2027. Findings remain open until reviewed.', 690, 45, 11)
  pages[2].insertImage(
    pages[2]
      .newImage('receiving-diagram')
      .setSource('data:image/svg+xml;base64,' + btoa(EVIDENCE_SVG), ImageSourceType.BASE64)
      .setAbsolutePosition(42, 190)
      .setSize(510, 265.2)
      .build(),
  )
  text(
    2,
    'evidence-caption',
    'Figure 1. Original receiving-area schematic. Amber cartons are\nheld for relabeling; green cartons passed the label check.\nColor is reinforced by text and counts.',
    490,
    105,
  )
  text(
    2,
    'evidence-limit',
    'This is an illustrative image embedded in the SDK snapshot,\nnot a remote asset or genuine inspection photograph.',
    640,
    80,
    11,
  )
  text(
    3,
    'reviewers',
    'Prepared by: Mira Chen / Supplier Quality\nReviewed by: Owen Reed / Operations\nReview date: 31 March 2027',
    190,
    115,
    15,
  )
  text(3, 'signoff', PENDING_SIGNOFF, 350, 105, 18).setTextStyle({ bold: true })
  text(
    3,
    'conditions',
    'Approval conditions\nKeep six cartons on hold until labels are rechecked.\nAttach calibration evidence before the follow-up.\nRecord a separate decision after closure verification.',
    515,
    150,
  )
  text(3, 'signature-note', 'Typed review text only. No electronic signature or certification is created.', 705, 45, 10)
  return pdf
}
