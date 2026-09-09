import type { FUniver } from '@univerjs/core/facade'
import { createPdfDocument, createPdfPage, ptToEmu } from '@univerjs-pro/pdfs'
import { ImageSourceType } from '@univerjs/core'

import '@univerjs-pro/pdfs/facade'

export function createViewerGallery(api: FUniver, _legacyChinese = false) {
  const titles = ['Portrait · editable text', 'Landscape · table', 'Square · image']
  const sizes = [
    [595, 842],
    [842, 595],
    [600, 600],
  ]
  const pdf = api.createPdf({
    id: 'pdf-viewer-gallery',
    name: 'PDF page gallery',
    document: createPdfDocument({
      id: 'pdf-viewer-gallery',
      pages: sizes.map(([width, height], index) =>
        createPdfPage({
          id: ['portrait', 'landscape', 'square'][index],
          index,
          label: String(index + 1),
          size: { width: ptToEmu(width), height: ptToEmu(height) },
        }),
      ),
    }),
  })
  pdf.getPages().forEach((page, index) => {
    page
      .insertTextBox({
        id: 'title-' + index,
        text: titles[index],
        left: 40,
        top: 42,
        width: sizes[index][0] - 80,
        height: 60,
        fontSize: 25,
        fill: ['#176b87', '#893448', '#4859a8'][index],
      })
      .setTextStyle({ bold: true })
    page.insertDivider({
      id: 'divider-' + index,
      left: 40,
      top: 115,
      width: sizes[index][0] - 80,
      strokeColor: '#cbd5e1',
    })
    page.insertTextBox({
      id: 'footer-' + index,
      text: 'Original SDK sample · ' + (index + 1) + ' / 3',
      left: 40,
      top: sizes[index][1] - 50,
      width: 400,
      height: 24,
      fontSize: 10,
      fill: '#64748b',
    })
  })
  const first = pdf.getPageByIndex(0)!
  first.insertTextBox({
    id: 'editable-text',
    text: 'Double-click to edit this text.',
    left: 40,
    top: 160,
    width: 510,
    height: 70,
    fontSize: 22,
    fill: '#172033',
  })
  first.insertTextBox({
    id: 'body-text',
    text: 'A portrait page keeps short paragraphs easy to scan.\nUse the native toolbar and page controls.',
    left: 40,
    top: 270,
    width: 510,
    height: 110,
    fontSize: 16,
    fill: '#475569',
  })
  pdf.getPageByIndex(1)!.insertTable({
    id: 'comparison-table',
    left: 40,
    top: 165,
    width: 762,
    height: 230,
    rowCount: 4,
    columnCount: 4,
    cellTexts: [
      'Item',
      'Quantity',
      'Price',
      'Amount',
      'Paper',
      '20',
      '3',
      '60',
      'Brushes',
      '8',
      '12',
      '96',
      'Folders',
      '6',
      '9',
      '54',
    ],
  })
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="280"><rect width="520" height="280" fill="#edf2fa"/><circle cx="115" cy="140" r="75" fill="#4859a8"/><rect x="220" y="65" width="100" height="150" rx="12" fill="#42b7a0"/><path d="M345 215L410 65L475 215Z" fill="#e8a14b"/></svg>'
  const third = pdf.getPageByIndex(2)!
  third.insertImage(
    third
      .newImage('geometry-image')
      .setSource('data:image/svg+xml;base64,' + btoa(svg), ImageSourceType.BASE64)
      .setAbsolutePosition(40, 160)
      .setSize(520, 280)
      .build(),
  )
  return pdf
}
