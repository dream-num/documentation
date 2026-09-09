import type { IBoardData } from '@univerjs-pro/boards'
import {
  BoardPageType,
  createBoardStickyElement,
  createBoardTextBoxShapeElement,
  createBoardTextElement,
} from '@univerjs-pro/boards'
import { ShapeTextAutoFitType, ShapeTextWrapType } from '@univerjs-pro/engine-shape'

const text = (id: string, content: string, left: number, top: number, size: number, bold = false) =>
  createBoardTextElement({
    id,
    text: content,
    left,
    top,
    width: 1040,
    height: 64,
    textStyle: { fs: size, bl: bold ? 1 : 0, cl: { rgb: '#173B4A' } },
  })
function sticky(
  id: string,
  content: string,
  left: number,
  width: number,
  height: number,
  fillColor: string,
  size: number,
) {
  const element = createBoardStickyElement({ id, left, top: 310, width, height, fillColor })
  element.shapeData.shapeText = createBoardTextBoxShapeElement({
    text: content,
    left,
    top: 310,
    width,
    height,
    textStyle: { fs: size, cl: { rgb: '#173B4A' } },
    textWrap: ShapeTextWrapType.Square,
  }).shapeData.shapeText
  element.shapeData.shapeText!.autoFitType = ShapeTextAutoFitType.NoAutoFit
  element.shapeData.textRectPadding = { left: 20, right: 20, top: 20, bottom: 20 }
  return element
}
export function createData(): IBoardData {
  const elements = [
    text('title', 'Text & sticky notes', 80, 65, 38, true),
    text('caption', 'Standalone typography above. Native sticky shape text below.', 80, 130, 20),
    text('body', 'A short note can stay light, readable and directly editable.', 80, 205, 26),
    sticky('yellow', 'One idea\nKeep it short.', 80, 260, 240, '#FFF0A8', 28),
    sticky('blue', 'A little more detail\nSeparate a thought from its next step.', 380, 300, 240, '#D6ECFF', 21),
    sticky(
      'pink',
      'Wide note\nSpace for a concise explanation without a separate panel.',
      720,
      370,
      240,
      '#FADDE8',
      24,
    ),
  ]
  return {
    id: 'text-sticky-gallery',
    name: 'Text and sticky notes',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1200, height: 650 },
    activePageId: 'gallery',
    pageOrder: ['gallery'],
    pages: {
      gallery: {
        id: 'gallery',
        name: 'Typography and notes',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
