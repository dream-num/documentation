import type { IBoardData, IBoardPageElement } from '@univerjs-pro/boards'
import {
  BoardPageType,
  createBoardImageElement,
  createBoardShapeElement,
  createBoardStickyElement,
  createBoardTextBoxShapeElement,
  createBoardTextElement,
} from '@univerjs-pro/boards'
import { ShapeTextAutoFitType, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { ImageSourceType } from '@univerjs/core'

export const STATES = ['default', 'empty', 'boundary', 'error'] as const
export const REVIEW_DATE = '2027-03-31T09:00:00Z'
const marker = (id: string, text: string, left: number, top: number) =>
  createBoardTextElement({ id, text, left, top, width: 520, height: 55, textStyle: { fs: 24, cl: { rgb: '#173B4A' } } })
function sticky(id: string, text: string, left: number, top: number, fillColor: string) {
  const element = createBoardStickyElement({ id, left, top, width: 250, height: 190, fillColor })
  element.shapeData.shapeText = createBoardTextBoxShapeElement({
    text,
    left,
    top,
    width: 250,
    height: 190,
    textStyle: { fs: 20, cl: { rgb: '#172033' } },
    textWrap: ShapeTextWrapType.Square,
  }).shapeData.shapeText
  element.shapeData.shapeText!.autoFitType = ShapeTextAutoFitType.NoAutoFit
  element.shapeData.textRectPadding = { left: 14, top: 14, right: 14, bottom: 14 }
  return element
}
const plan: IBoardPageElement[] = [
  marker('title', 'Tern field station / Opening plan', 100, 75),
  marker('viewport-marker', 'Origin marker · (100, 75)', 100, 780),
  createBoardShapeElement({
    id: 'zone',
    shapeType: ShapeTypeEnum.RoundRect,
    left: 80,
    top: 165,
    width: 1180,
    height: 530,
    fillColor: '#EFF6F5',
    strokeColor: '#658A86',
  }),
  sticky('supplies', 'Mina / Supplies\n12 sampling kits\nDock pickup 08:30', 135, 230, '#FFF2AD'),
  sticky('safety', 'Owen / Safety\nRadio test pending\nChannel 4', 445, 260, '#D7EDFF'),
  sticky('survey', 'Lea / Survey\nNorth transect\n6 observation points', 755, 210, '#E9DFFF'),
  marker('caption', 'Route placeholder · replace with your field map', 800, 730),
  createBoardImageElement({
    id: 'map',
    left: 1030,
    top: 235,
    width: 190,
    height: 270,
    imageSourceType: ImageSourceType.BASE64,
    source:
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="190" height="270"><rect width="190" height="270" fill="#D9EEE9"/><path d="M0 220 Q100 180 90 80 T190 20" fill="none" stroke="#68A8BF" stroke-width="22"/><path d="M25 240 L45 150 L140 90 L160 35" fill="none" stroke="#335D47" stroke-width="4" stroke-dasharray="7 6"/><circle cx="45" cy="150" r="9" fill="#D07430"/></svg>',
      ),
  }),
]
const review: IBoardPageElement[] = [
  marker('review-title', 'Tern field station / Handover', 120, 100),
  sticky('handover', 'Evening shift\nArchive 36 samples\nRefrigerator B', 170, 230, '#D9F2DF'),
  sticky('follow-up', 'Follow up\nReplace west buoy\nOwner: Anika', 560, 315, '#FFE2C6'),
]
const page = (id: string, name: string, elements: IBoardPageElement[]) => ({
  id,
  name,
  pageType: BoardPageType.Page,
  elementOrder: elements.map((element) => element.id),
  elements: Object.fromEntries(elements.map((element) => [element.id, element])),
})
const BASE: IBoardData = {
  id: 'tern-station-lifecycle',
  name: 'Tern field station / Opening and handover',
  appVersion: '1.0.0-rc.0',
  defaultPageSize: { width: 1920, height: 1080 },
  activePageId: 'plan',
  pageOrder: ['plan', 'review'],
  pages: { plan: page('plan', 'Opening plan', plan), review: page('review', 'Evening handover', review) },
  custom: { reviewDate: REVIEW_DATE, scenario: 'Original Tern station fixture; no external image request' },
}
export function createData(state: string): IBoardData {
  if (!STATES.some((id) => id === state)) throw new Error('Unknown canvas state; existing edits were not replaced.')
  const data = structuredClone(BASE)
  if (state === 'empty') {
    data.pageOrder = ['plan']
    data.pages = { plan: page('plan', 'Blank planning page', []) }
  }
  if (state === 'boundary') {
    data.pageOrder = ['review', 'plan']
    data.activePageId = 'review'
    data.pages.review.elements.handover.transform = { left: -120, top: -80, width: 250, height: 190, rotation: 12 }
    data.pages.review.elementOrder.reverse()
  }
  return data
}
