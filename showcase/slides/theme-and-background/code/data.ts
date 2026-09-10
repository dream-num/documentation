import { ShapeFillEnum, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import {
  PageElementTypeEnum,
  PageTypeEnum,
  SLIDE_THEME_PRESETS,
  SlideBackgroundTypeEnum,
  SlidePageLayoutTypeEnum,
  SlidePresentationBackgroundGraphicFitEnum,
  type ISlideBackgroundData,
  type ISlideData,
  type ISlidePageElement,
} from '@univerjs-pro/slides'
import { HorizontalAlign, ImageSourceType, LocaleType, RichTextBuilder, VerticalAlign } from '@univerjs/core'

export const FROZEN_CLOCK = '2027-03-31T09:00:00Z'
export const VARIANTS = [
  { id: 'market', label: 'Market briefing · eight pages' },
  { id: 'serif', label: 'Serif theme · inherited Georgia' },
  { id: 'overrides', label: 'Background study · four fills' },
  { id: 'empty', label: 'Zero pages' },
] as const
export type Variant = (typeof VARIANTS)[number]['id']
export const THEMES = SLIDE_THEME_PRESETS
export const BACKGROUNDS = {
  solid: 'Solid color',
  gradient: 'Two-color gradient',
  pattern: 'Diagonal pattern',
  image: 'Original awning illustration',
}
export const BACKGROUND_PAGES = { opening: 'solid', purpose: 'gradient', stalls: 'pattern', routes: 'image' } as const
export const MASTER_COLOR = '#F5F7FF'
export const FIXED_COLOR = '#58C8FF'
const rect = (left: number, top: number, width: number, height: number) => ({ left, top, width, height, rotation: 0 })
const artwork =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="576" viewBox="0 0 1024 576"><rect width="1024" height="576" fill="#FFF5F4"/><path d="M0 0H1024V35H0Z" fill="#F37B78"/><path d="M0 0H120L90 35H0ZM240 0H360L330 35H210ZM480 0H600L570 35H450ZM720 0H840L810 35H690ZM960 0H1024V35H930Z" fill="#F2B84B"/><path d="M850 576L1024 400V576Z" fill="#F9D9D7"/></svg>'
export function background(kind: string, color = '#0A1226'): ISlideBackgroundData {
  if (kind === 'solid') {
    if (!/^#[\da-f]{6}$/i.test(color)) throw new Error('Enter a six-digit hex color, such as #0A1226.')
    return { type: SlideBackgroundTypeEnum.Solid, color }
  }
  if (kind === 'gradient')
    return {
      type: SlideBackgroundTypeEnum.Gradient,
      angle: 35,
      stops: [
        { position: 0, color: '#E8F7FF' },
        { position: 1, color: '#EEE8FF' },
      ],
    }
  if (kind === 'pattern')
    return {
      type: SlideBackgroundTypeEnum.Pattern,
      pattern: 'diagonal',
      foregroundColor: '#B5DDD6',
      backgroundColor: '#F0F8F6',
    }
  if (kind === 'image')
    return {
      type: SlideBackgroundTypeEnum.Image,
      source: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artwork)}`,
      imageSourceType: ImageSourceType.BASE64,
      fit: SlidePresentationBackgroundGraphicFitEnum.Cover,
    }
  throw new Error('Unknown background type; no change was made.')
}
export const CONTENT = [
  [
    'opening',
    'Lumen / Night market',
    '18 stalls / Four evenings',
    'A shared square after sunset.\nSeason proposal / 14 May 2027',
    'Original fictional market; do not present these numbers as real attendance.',
    'title',
  ],
  [
    'purpose',
    'Make a square feel welcoming',
    '01 / A place to linger',
    'Clear routes, patient hosts and room to sit.\nAccess is a planning requirement.',
    'This section sets the purpose; it is not a measured accessibility certification.',
    'section',
  ],
  [
    'stalls',
    'Eighteen stalls, four kinds',
    '6 food / 5 craft\n4 repair / 3 growers',
    'Count stall allocations, not visitor preferences.\nEach stall keeps its own identity.',
    '6 + 5 + 4 + 3 = 18 stalls. No invented market-share claim.',
    'content',
  ],
  [
    'routes',
    'Two routes, one meeting point',
    'NORTH / Step-free arrival\nSOUTH / Cycle parking',
    'Meet at the information lantern.\nKeep both approaches clear.',
    'A fictional wayfinding comparison, not directions to a real location.',
    'comparison',
  ],
  [
    'pilot',
    'Read the pilot without spin',
    '72 responses\n46 clear / 18 need signs / 8 unsure',
    'Next step: retest the signs.\nA small survey is not a crowd count.',
    '46 + 18 + 8 = 72 responses. This page receives the background override.',
    'data',
  ],
  [
    'quote',
    'A familiar face at the entrance',
    '“Someone had time\nto answer my question.”',
    'Ari / fictional visitor\nAuthored feedback for this fixture.',
    'This quotation is original fictional content, not a real endorsement.',
    'quote',
  ],
  [
    'hosts',
    'Twenty-four hosts, four shifts',
    '8 arrival / 6 wayfinding\n6 assistance / 4 closing',
    'One named lead per shift.\nKeep the handoff visible.',
    '8 + 6 + 6 + 4 = 24 host assignments; shifts are not simultaneous staffing.',
    'content',
  ],
  [
    'closing',
    'Leave the square ready',
    'Next check / 21 May 2027',
    'Review signs. Confirm stall access.\nOwner / Sal, fictional coordinator.',
    'Close with the next review, not a promise of a completed launch.',
    'closing',
  ],
] as const

function text(
  id: string,
  value: string,
  transform: ReturnType<typeof rect>,
  color: string,
  fontSize = 24,
): ISlidePageElement {
  const doc = RichTextBuilder.create()
    .span(value, { fontSize, color, bold: id === 'title' })
    .getData()
  doc.id = `lumen-${id}`
  doc.documentStyle = { ...doc.documentStyle, textStyle: { ff: 'Arial', fs: fontSize, cl: { rgb: color } } }
  doc.body?.paragraphs?.forEach((paragraph, index) => {
    paragraph.paragraphId = `${id}-${index}`
  })
  return {
    id,
    type: PageElementTypeEnum.Shape,
    transform,
    shapeData: {
      shapeType: ShapeTypeEnum.Rect,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { width: 0, color: 'transparent' },
      shapeText: {
        isHorizontal: true,
        text: value,
        dataModel: { doc, ha: HorizontalAlign.LEFT, va: VerticalAlign.MIDDLE },
      },
    },
  }
}
export function createData(variant: Variant = 'market'): ISlideData {
  const placement = {
    title: [rect(65, 70, 900, 85), rect(70, 195, 880, 110), rect(70, 340, 880, 95)],
    section: [rect(65, 80, 900, 95), rect(70, 220, 880, 90), rect(70, 340, 880, 95)],
    content: [rect(65, 40, 900, 90), rect(70, 165, 880, 125), rect(70, 330, 880, 105)],
    comparison: [rect(65, 40, 900, 95), rect(70, 180, 420, 210), rect(535, 205, 420, 195)],
    data: [rect(65, 40, 900, 95), rect(70, 170, 880, 140), rect(70, 340, 880, 95)],
    quote: [rect(65, 40, 900, 95), rect(110, 175, 800, 140), rect(110, 350, 800, 85)],
    closing: [rect(65, 65, 900, 90), rect(70, 195, 880, 100), rect(70, 340, 880, 95)],
  }
  const pages = (variant === 'empty' ? [] : CONTENT).map(([id, title, themeText, body, notes, layout]) => {
    const dark = variant === 'overrides' && (id === 'opening' || id === 'pilot')
    const [titleRect, cardRect, bodyRect] = placement[layout]
    const elements: ISlidePageElement[] = [
      text('title', title, titleRect, dark ? '#F5F7FF' : '#101A34', 34),
      {
        id: 'theme-card',
        type: PageElementTypeEnum.Shape,
        transform: cardRect,
        // Fill, stroke, font family and text color are absent on purpose: the SDK resolves them from the theme.
        shapeData: {
          shapeType: ShapeTypeEnum.Rect,
          shapeText: { isRichText: false, isHorizontal: true, text: themeText, fontSize: 26 },
        },
      },
      text('body', body, bodyRect, dark ? '#C8D0E4' : '#39455E'),
      {
        id: 'fixed-card',
        type: PageElementTypeEnum.Shape,
        transform: rect(70, 465, 880, 50),
        shapeData: {
          shapeType: ShapeTypeEnum.Rect,
          fill: { fillType: ShapeFillEnum.SolidFill, color: FIXED_COLOR },
          stroke: { color: FIXED_COLOR, width: 0 },
          shapeText: {
            isRichText: false,
            isHorizontal: true,
            text: 'LUMEN / Signal Cyan / Arial',
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#070B19',
          },
        },
      },
    ]
    return {
      id,
      name: title,
      pageType: PageTypeEnum.Slide as const,
      masterPageId: 'lumen-master',
      layoutPageId: layout,
      showMasterSp: true,
      speakerNotes: notes,
      elements: Object.fromEntries(elements.map((item) => [item.id, item])),
      elementOrder: elements.map((item) => item.id),
      background:
        variant === 'overrides' && (id in BACKGROUND_PAGES || id === 'pilot')
          ? background(id === 'pilot' ? 'solid' : BACKGROUND_PAGES[id as keyof typeof BACKGROUND_PAGES])
          : undefined,
    }
  })
  const theme = structuredClone(THEMES[0])
  theme.id = 'lumen-deep-ocean'
  theme.name = 'Lumen / Deep Ocean'
  if (!theme.fmtScheme || !theme.colorScheme) throw new Error('The SDK base theme is missing its color/format schemes.')
  theme.fmtScheme.fillStyleLst[1].color = '#6688FF'
  theme.fmtScheme.lnStyleLst[1].color = '#22365F'
  theme.colorScheme.lt1 = '#070B19'
  if (variant === 'serif') {
    theme.id = 'lumen-serif'
    theme.name = 'Lumen serif study'
    theme.fontScheme = { heading: 'Georgia', body: 'Georgia' }
  }
  return {
    id: 'lumen-deck',
    name: 'Lumen / Night market',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    rev: 1,
    defaultPageSize: { width: 1024, height: 576 },
    theme,
    slides: Object.fromEntries(pages.map((page) => [page.id, page])),
    slideOrder: pages.map((page) => page.id),
    activeSlideId: pages[0]?.id,
    masterPages: {
      'lumen-master': {
        id: 'lumen-master',
        name: 'Neutral canvas',
        pageType: PageTypeEnum.Master,
        background: { type: SlideBackgroundTypeEnum.Solid, color: MASTER_COLOR },
        elements: {},
        elementOrder: [],
      },
    },
    masterPageOrder: ['lumen-master'],
    layoutPages: Object.fromEntries(
      Object.keys(placement).map((id) => [
        id,
        {
          id,
          name: id,
          pageType: PageTypeEnum.Layout,
          layoutType: SlidePageLayoutTypeEnum.Custom,
          masterPageId: 'lumen-master',
          elements: {},
          elementOrder: [],
        },
      ]),
    ),
    layoutPageOrder: Object.keys(placement),
  }
}
