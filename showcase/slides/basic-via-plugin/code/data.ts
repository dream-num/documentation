import type { ISlideData } from '@univerjs-pro/slides'
import { ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { PageElementTypeEnum, PageTypeEnum, SlideBackgroundTypeEnum } from '@univerjs-pro/slides'
import { LocaleType } from '@univerjs/core'

export const SLIDE_DATA: ISlideData = {
  id: 'slides-pro-demo',
  name: 'Univer Slides Pro',
  appVersion: '1.0.0-beta.1',
  rev: 1,
  locale: LocaleType.EN_US,
  defaultPageSize: {
    width: 1200,
    height: 675,
  },
  slideOrder: ['cover', 'feature'],
  activeSlideId: 'cover',
  slides: {
    cover: {
      id: 'cover',
      pageType: PageTypeEnum.Slide,
      name: 'Cover',
      background: {
        type: SlideBackgroundTypeEnum.Solid,
        color: '#F8FAFC',
      },
      elementOrder: ['hero-bg', 'title', 'subtitle', 'badge'],
      elements: {
        'hero-bg': {
          id: 'hero-bg',
          type: PageElementTypeEnum.Shape,
          transform: {
            left: 72,
            top: 72,
            width: 1056,
            height: 528,
            rotation: 0,
          },
          shapeData: {
            shapeType: ShapeTypeEnum.RoundRect,
            fill: { color: '#EEF6FF' },
            stroke: { color: '#BBD7FF', width: 1.5 },
          },
        },
        title: {
          id: 'title',
          type: PageElementTypeEnum.Text,
          transform: {
            left: 150,
            top: 205,
            width: 720,
            height: 92,
            rotation: 0,
          },
          text: 'Univer Slides Pro',
          textStyle: {
            color: '#111827',
            fontSize: 46,
            bold: true,
          },
        },
        subtitle: {
          id: 'subtitle',
          type: PageElementTypeEnum.Text,
          transform: {
            left: 154,
            top: 316,
            width: 760,
            height: 72,
            rotation: 0,
          },
          text: 'A minimal plugin-mode setup powered by @univerjs-pro/slides and @univerjs-pro/slides-ui.',
          textStyle: {
            color: '#4B5563',
            fontSize: 22,
          },
        },
        badge: {
          id: 'badge',
          type: PageElementTypeEnum.Shape,
          transform: {
            left: 154,
            top: 420,
            width: 260,
            height: 58,
            rotation: 0,
          },
          shapeData: {
            shapeType: ShapeTypeEnum.RoundRect,
            fill: { color: '#2563EB' },
            stroke: { color: '#1D4ED8', width: 1 },
            shapeText: {
              isHorizontal: true,
              isRichText: false,
              text: '@univerjs-pro',
              fontSize: 24,
              color: '#FFFFFF',
              bold: true,
            },
          },
        },
      },
    },
    feature: {
      id: 'feature',
      pageType: PageTypeEnum.Slide,
      name: 'Feature',
      background: {
        type: SlideBackgroundTypeEnum.Solid,
        color: '#FFFFFF',
      },
      elementOrder: ['panel', 'heading', 'copy', 'shape-a', 'shape-b'],
      elements: {
        panel: {
          id: 'panel',
          type: PageElementTypeEnum.Shape,
          transform: {
            left: 96,
            top: 96,
            width: 1008,
            height: 480,
            rotation: 0,
          },
          shapeData: {
            shapeType: ShapeTypeEnum.RoundRect,
            fill: { color: '#F9FAFB' },
            stroke: { color: '#E5E7EB', width: 1 },
          },
        },
        heading: {
          id: 'heading',
          type: PageElementTypeEnum.Text,
          transform: {
            left: 150,
            top: 150,
            width: 560,
            height: 64,
            rotation: 0,
          },
          text: 'Plugin mode',
          textStyle: {
            color: '#111827',
            fontSize: 34,
            bold: true,
          },
        },
        copy: {
          id: 'copy',
          type: PageElementTypeEnum.Text,
          transform: {
            left: 152,
            top: 230,
            width: 650,
            height: 100,
            rotation: 0,
          },
          text: 'Register core UI, Docs, Drawing, License, Slides Pro and Slides Pro UI plugins before creating a slide unit.',
          textStyle: {
            color: '#4B5563',
            fontSize: 22,
          },
        },
        'shape-a': {
          id: 'shape-a',
          type: PageElementTypeEnum.Shape,
          transform: {
            left: 815,
            top: 178,
            width: 140,
            height: 140,
            rotation: 8,
          },
          shapeData: {
            shapeType: ShapeTypeEnum.Ellipse,
            fill: { color: '#10B981' },
            stroke: { color: '#059669', width: 2 },
          },
        },
        'shape-b': {
          id: 'shape-b',
          type: PageElementTypeEnum.Shape,
          transform: {
            left: 900,
            top: 318,
            width: 150,
            height: 112,
            rotation: -8,
          },
          shapeData: {
            shapeType: ShapeTypeEnum.Hexagon,
            fill: { color: '#F97316' },
            stroke: { color: '#EA580C', width: 2 },
          },
        },
      },
    },
  },
}
