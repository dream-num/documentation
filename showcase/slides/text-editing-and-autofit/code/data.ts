import { ShapeFillEnum, ShapeTextAutoFitType, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SlideBackgroundTypeEnum,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { HorizontalAlign, LocaleType, RichTextBuilder, VerticalAlign } from '@univerjs/core'

export const TARGET_ID = 'editable-copy'
export const VARIANTS = [
  { id: 'studio', label: 'Studio briefing · three pages' },
  { id: 'overflow', label: 'Long copy · small text boxes' },
  { id: 'blank', label: 'Empty text · existing boxes' },
  { id: 'empty', label: 'Zero pages' },
] as const
export type Variant = (typeof VARIANTS)[number]['id']
export const LONG_COPY =
  'Saffron print studio welcomes first-time makers and experienced printers. Bring a small draft, test one technique, and share what changed. Three workshops have twelve volunteer hosts: four for lettering, five for relief printing, and three for binding. These are fictional assignments, not attendance results.'
const CONTENT = [
  {
    id: 'welcome',
    title: 'Make room for a first draft',
    copy: 'Saffron / Community print studio\nThree workshops. Twelve volunteer hosts.',
    caption: '01 / EMPHASIS — one native text box, contrasting size, weight and color.',
    x: 64,
    y: 182,
    width: 580,
    height: 220,
    color: '#FFF0E5',
    background: '#FFF9F4',
    accent: '#C64F55',
  },
  {
    id: 'workshops',
    title: 'Three ways to start',
    copy: 'Lettering / four hosts\nRelief printing / five hosts\nBinding / three hosts',
    caption: '02 / LISTS — native list items, shared list identity, three different assignments.',
    x: 352,
    y: 170,
    width: 608,
    height: 270,
    color: '#E2F4ED',
    background: '#F5FAF7',
    accent: '#24756B',
  },
  {
    id: 'invitation',
    title: 'Leave a technique for someone else',
    copy: 'Bring a draft.\nTry one unfamiliar tool.\nTell the next maker what helped.',
    caption: '03 / ALIGNMENT — left, center and right paragraphs inside the same text box.',
    x: 180,
    y: 178,
    width: 664,
    height: 238,
    color: '#EEE8FF',
    background: '#F7F5FC',
    accent: '#66509E',
  },
] as const
const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, rotation: 0 })

function labelData(id: string, text: string, fontSize: number, color: string, bold = false) {
  const doc = RichTextBuilder.create().span(text, { fontSize, color, bold }).getData()
  doc.id = id
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial' } }
  doc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `${id}-p-${index}`
  })
  doc.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId = `${id}-s-${index}`
  })
  return { doc, ha: HorizontalAlign.LEFT, va: VerticalAlign.MIDDLE }
}

// Native rich-text data is visible immediately; no button click is needed to demonstrate these styles.
function createRichCopy(id: (typeof CONTENT)[number]['id']) {
  const rich = RichTextBuilder.create()
  if (id === 'welcome') {
    rich
      .span('Saffron', { bold: true, fontSize: 40, color: '#C64F55' })
      .span(' / Community print studio', { fontSize: 22 })
      .paragraph({ spaceBefore: 20 })
      .span('Three workshops.', { bold: true, fontSize: 26 })
      .span(' Twelve volunteer hosts.', { italic: true, fontSize: 22 })
  } else if (id === 'workshops') {
    for (const line of ['Lettering / four hosts', 'Relief printing / five hosts', 'Binding / three hosts']) {
      rich.listItem(line, { listId: 'saffron-assignments' })
    }
  } else {
    rich
      .paragraph({ align: HorizontalAlign.LEFT, spaceAfter: 16 })
      .text('Bring a draft.')
      .paragraph({ align: HorizontalAlign.CENTER, spaceAfter: 16 })
      .text('Try one unfamiliar tool.')
      .paragraph({ align: HorizontalAlign.RIGHT })
      .text('Tell the next maker what helped.')
  }
  const doc = rich.getData()
  doc.id = `saffron-${id}`
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial', fs: 24, cl: { rgb: '#28343D' } } }
  // Builder-generated paragraph IDs are otherwise random; fixtures and Reset must be reproducible.
  doc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `${id}-p-${index}`
  })
  doc.body?.sectionBreaks?.forEach((section, index) => {
    section.sectionId = `${id}-s-${index}`
  })
  return doc
}

export function createData(variant: Variant = 'studio'): ISlideData {
  if (!VARIANTS.some((item) => item.id === variant)) throw new Error('Unknown fixture; no presentation was created.')
  const pages = (variant === 'empty' ? [] : CONTENT).map((item) => {
    const elements: ISlidePageElement[] = [
      {
        id: 'title',
        type: PageElementTypeEnum.Shape,
        transform: rect(64, 52, 896, 98),
        shapeData: {
          shapeType: ShapeTypeEnum.Rect,
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          shapeText: { dataModel: labelData(`${item.id}-title`, item.title, 32, '#101A34', true) },
        },
      },
      {
        id: TARGET_ID,
        type: PageElementTypeEnum.Shape,
        transform: rect(
          item.x,
          item.y,
          variant === 'overflow' ? 280 : item.width,
          variant === 'overflow' ? 100 : item.height,
        ),
        shapeData: {
          shapeType: ShapeTypeEnum.Rect,
          isTextBox: true,
          fill: { fillType: ShapeFillEnum.SolidFill, color: item.color },
          stroke: { color: item.accent, width: 1 },
          textRectPadding: { left: 18, right: 18, top: 14, bottom: 14 },
          shapeText: {
            isHorizontal: true,
            text: variant === 'blank' ? '' : variant === 'overflow' ? LONG_COPY : item.copy,
            ...(variant === 'studio' ? { dataModel: { doc: createRichCopy(item.id) } } : {}),
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#28343D',
            autoFitType: ShapeTextAutoFitType.NoAutoFit,
            textWrap: ShapeTextWrapType.Square,
          },
        },
      },
      {
        id: 'caption',
        type: PageElementTypeEnum.Shape,
        transform: rect(64, 464, 896, 52),
        shapeData: {
          shapeType: ShapeTypeEnum.Rect,
          fill: { fillType: ShapeFillEnum.NoFill },
          stroke: { color: 'transparent', width: 0 },
          shapeText: { dataModel: labelData(`${item.id}-caption`, item.caption, 16, item.accent) },
        },
      },
    ]
    return {
      id: item.id,
      name: item.title,
      pageType: PageTypeEnum.Slide as const,
      background: { type: SlideBackgroundTypeEnum.Solid as const, color: item.background },
      speakerNotes:
        'Original fictional studio. No competitor artwork or real participant data. Autofit behavior in beta.2 is not accepted; inspect actual bounds rather than only stored options.',
      elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      elementOrder: elements.map((element) => element.id),
    }
  })
  return {
    id: 'saffron-text-deck',
    name: 'Saffron / Text lab',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1024, height: 576 },
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: pages[0]?.id,
  }
}
