import type { FPdfPage } from '@univerjs-pro/pdfs/facade'
import type { FUniver } from '@univerjs/core/facade'
import { ImageSourceType } from '@univerjs/core'

import '@univerjs-pro/pdfs/facade'

export const REVIEW_DATE = '2027-03-31T09:00:00Z'
// Original vector artwork, embedded in the snapshot: no network image or borrowed photograph.
export const ARTWORK = {
  summer: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540"><rect width="900" height="540" fill="#fef3c7"/><circle cx="180" cy="145" r="80" fill="#dc2626"/><path d="M0 540V410L190 290 360 440 530 220 710 330 900 170V540Z" fill="#0d9488"/><path d="M0 540V480L250 410 470 500 750 360 900 400V540Z" fill="#115e59"/><g fill="#164e63" font-family="Arial" font-size="28"><text x="34" y="40">SUMMER / RED SUN</text><text x="580" y="80">RIDGE / EAST</text></g><path d="M430 535L510 470 455 410 530 355" fill="none" stroke="#fff" stroke-width="12"/></svg>`,
  winter: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540"><rect width="900" height="540" fill="#dbeafe"/><circle cx="725" cy="135" r="72" fill="#7c3aed"/><path d="M0 540V330L190 160 400 395 590 230 900 410V540Z" fill="#475569"/><path d="M92 245L190 160 292 274 203 249 173 276Z M490 317L590 230 692 288 578 280Z" fill="#fff"/><path d="M0 540V480L250 410 470 500 750 360 900 400V540Z" fill="#1e3a8a"/><g fill="#1e3a8a" font-family="Arial" font-size="28"><text x="34" y="40">WINTER / VIOLET MOON</text><text x="32" y="90">SNOW / WEST</text></g></svg>`,
}
export type Artwork = keyof typeof ARTWORK
export const source = (name: Artwork) => 'data:image/svg+xml;base64,' + btoa(ARTWORK[name])
export function insertHero(page: FPdfPage, name: Artwork = 'summer') {
  return page.insertImage(
    page
      .newImage('trail-hero')
      .setSource(source(name), ImageSourceType.BASE64)
      .setAbsolutePosition(72, 145)
      .setSize(450, 270)
      .build(),
  )
}
export function createProof(api: FUniver) {
  const pdf = api.createPdf({
    id: 'ridgeway-image-proof',
    name: 'Ridgeway / Trail guide proof',
    metadata: { reviewDate: REVIEW_DATE },
  })
  const page = pdf.getPageByIndex(0)!
  const text = (id: string, value: string, top: number, fontSize = 12, height = 45) =>
    page.insertTextBox({
      id,
      text: value,
      left: 42,
      top,
      width: 510,
      height,
      fontSize,
      fontFamily: 'Arial',
      fill: '#1e293b',
    })
  text('title', 'Ridgeway / Trail guide proof', 42, 24).setTextStyle({ bold: true })
  text('subtitle', 'IMAGE EDITING / 2027 seasonal pocket guide', 89)
  insertHero(page)
  text('caption', 'Artwork slot: summer landscape or winter ridge. Original vector artwork.', 470, 11)
  text(
    'brief',
    'Proof brief\nKeep the surrounding text intact.\nCompare a full illustration with a detail crop.\nReplace the seasonal source, not the PDF page.',
    530,
    13,
    100,
  )
  text(
    'note',
    'Crop controls use PDF-point coordinates relative to the image placement.\nCropping is not redaction: the complete image source remains in the snapshot.',
    665,
    11,
    60,
  )
  text('footer', 'Fictional editorial proof / embedded artwork', 750, 11)
  return pdf
}
