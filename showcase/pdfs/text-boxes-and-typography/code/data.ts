import type { FUniver } from '@univerjs/core/facade'
import { PdfTextAnchor } from '@univerjs-pro/pdfs'

import '@univerjs-pro/pdfs/facade'

export const SAMPLE =
  'Small changes make a clear page. Keep the words intact while comparing the width of the native text frame.'
export function createTextGallery(api: FUniver) {
  const pdf = api.createPdf({ id: 'pdf-text-gallery', name: 'Text boxes / type and width' })
  const pages = [pdf.getPageByIndex(0)!, pdf.insertPage()]
  pages.forEach((page, index) => {
    page
      .insertTextBox({
        id: 'title-' + index,
        text: index ? 'Same words, different widths' : 'Text with a little emphasis',
        left: 48,
        top: 42,
        width: 495,
        height: 60,
        fontFamily: 'Arial',
        fontSize: 25,
        fill: '#163c48',
      })
      .setTextStyle({ bold: true })
    page.insertTextBox({
      id: 'subtitle-' + index,
      text: index
        ? 'Story-backed paragraphs: initially 480 and 220 points wide.'
        : 'Initially: regular, range-styled and horizontally anchored text.',
      left: 48,
      top: 108,
      width: 495,
      height: 50,
      fontFamily: 'Arial',
      fontSize: 11,
      fill: '#64748b',
    })
    page.insertDivider({ left: 48, top: 165, width: 495, strokeColor: '#99b6ba' })
  })
  const page = pages[0]
  page.insertTextBox({
    id: 'editable',
    text: 'A clear sentence starts here.',
    left: 48,
    top: 205,
    width: 480,
    height: 55,
    fontFamily: 'Arial',
    fontSize: 19,
    fill: '#263b43',
  })
  page
    .insertTextBox({
      id: 'emphasis',
      text: 'One word, several possibilities.',
      left: 48,
      top: 310,
      width: 480,
      height: 70,
      fontFamily: 'Arial',
      fontSize: 22,
      fill: '#263b43',
    })
    .setTextStyle({ bold: true, fill: '#a34a32' }, { start: 4, end: 8 })
    .setTextStyle({ italic: true }, { start: 10, end: 17 })
  page.insertTextBox({
    id: 'anchor-label',
    text: 'Initially: end anchor in a 120-point frame.',
    left: 48,
    top: 440,
    width: 480,
    height: 40,
    fontFamily: 'Arial',
    fontSize: 11,
    fill: '#64748b',
  })
  page
    .insertTextBox({
      id: 'anchored',
      text: 'Aligned to the frame end.',
      left: 48,
      top: 480,
      width: 480,
      height: 120,
      fontFamily: 'Arial',
      fontSize: 18,
      fill: '#116d71',
    })
    .setTextAnchor(PdfTextAnchor.END)
  page.insertDivider({ left: 48, top: 605, width: 480, strokeColor: '#99b6ba' })
  for (const [id, top, width] of [
    ['wide', 205, 480],
    ['narrow', 410, 220],
  ] as const) {
    pages[1].insertParagraph({
      id,
      text: SAMPLE,
      left: 48,
      top,
      width,
      height: 160,
      fontFamily: 'Arial',
      fontSize: 16,
      fill: '#263b43',
    })
  }
  return pdf
}
