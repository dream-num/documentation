import type { IBoardData } from '@univerjs-pro/boards'
import { BoardPageType, createBoardImageElement, createBoardTextElement } from '@univerjs-pro/boards'
import { ImageSourceType } from '@univerjs/core'

function svg(width: number, height: number, body: string) {
  return (
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
        width +
        '" height="' +
        height +
        '" viewBox="0 0 ' +
        width +
        ' ' +
        height +
        '">' +
        body +
        '</svg>',
    )
  )
}
const wide = () =>
  svg(
    640,
    320,
    '<rect width="640" height="320" fill="#e8daba"/><rect width="160" height="320" fill="#b9d1c0"/><rect x="480" width="160" height="320" fill="#d8a28c"/><path d="M190 250L320 70L450 250Z" fill="#37695b"/><circle cx="320" cy="155" r="40" fill="#eac567"/><text x="50" y="65" font-family="Arial" font-size="36" fill="#26483e">WEST</text><text x="510" y="285" font-family="Arial" font-size="36" fill="#653d30">EAST</text>',
  )
const square = () =>
  svg(
    360,
    360,
    '<rect width="360" height="360" fill="#d8e3ee"/><circle cx="180" cy="180" r="125" fill="#386179"/><path d="M90 190L150 250L280 110" fill="none" stroke="#e5c96f" stroke-width="25"/><circle cx="180" cy="180" r="155" fill="none" stroke="#789cb3" stroke-width="10"/>',
  )
const portrait = () =>
  svg(
    240,
    480,
    '<rect width="240" height="480" fill="#e8d4d2"/><path d="M120 415V75M120 160L55 100M120 260L190 200M120 350L55 285" stroke="#5b7661" stroke-width="16"/><ellipse cx="50" cy="95" rx="37" ry="22" fill="#b7cda9"/><ellipse cx="187" cy="198" rx="37" ry="22" fill="#88ab85"/><ellipse cx="52" cy="282" rx="37" ry="22" fill="#b7cda9"/><circle cx="120" cy="60" r="30" fill="#c57e67"/>',
  )
const label = (id: string, text: string, left: number, top: number, width: number, size = 20) =>
  createBoardTextElement({ id, text, left, top, width, height: 58, textStyle: { fs: size, cl: { rgb: '#294c48' } } })
export function createData(): IBoardData {
  const crop = createBoardImageElement({
    id: 'cropped',
    source: wide(),
    imageSourceType: ImageSourceType.URL,
    left: 980,
    top: 190,
    width: 160,
    height: 160,
  })
  crop.crop = { left: 80, right: 80, top: 0, bottom: 0 }
  const elements = [
    label('title', 'Orchard signs / image frames', 60, 50, 1120, 36),
    label(
      'subtitle',
      'Original SVG artwork in native Board images. Select and drag an image to edit its position.',
      60,
      115,
      1120,
      19,
    ),
    createBoardImageElement({
      id: 'wide',
      source: wide(),
      imageSourceType: ImageSourceType.URL,
      left: 60,
      top: 190,
      width: 320,
      height: 160,
    }),
    createBoardImageElement({
      id: 'square',
      source: square(),
      imageSourceType: ImageSourceType.URL,
      left: 460,
      top: 190,
      width: 180,
      height: 180,
    }),
    createBoardImageElement({
      id: 'portrait',
      source: portrait(),
      imageSourceType: ImageSourceType.URL,
      left: 760,
      top: 190,
      width: 120,
      height: 240,
    }),
    crop,
    label('wide-label', 'Initially: wide / 2:1', 60, 460, 330),
    label('square-label', 'Initially: square / 1:1', 460, 460, 260),
    label('portrait-label', 'Initially: portrait / 1:2', 760, 460, 220, 16),
    label('crop-label', 'Initially: center crop', 980, 460, 220, 16),
    label(
      'footer',
      'Fit means proportional dimensions; crop and source replacement use the public Board element API.',
      60,
      550,
      1130,
      18,
    ),
  ]
  return {
    id: 'orchard-image-gallery',
    name: 'Orchard image frames',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 1240, height: 650 },
    activePageId: 'gallery',
    pageOrder: ['gallery'],
    pages: {
      gallery: {
        id: 'gallery',
        name: 'Image frames',
        pageType: BoardPageType.Page,
        elementOrder: elements.map(({ id }) => id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
