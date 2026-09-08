import type { IDocImage } from '@univerjs/preset-docs-drawing'
import {
  AlignTypeH,
  BooleanNumber,
  DrawingTypeEnum,
  ImageSourceType,
  ObjectRelativeFromH,
  PositionedObjectLayoutType,
  WrapTextType,
} from '@univerjs/core'
import { buildDocTransform, docDrawingPositionToTransform } from '@univerjs/docs'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import {
  InsertDocDrawingCommand,
  TextWrappingStyle,
  UniverDocsDrawingPreset,
  UpdateDrawingDocTransformCommand,
} from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { ALT_TEXT, COAST_SVG, createData, VARIANTS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import './styles.css'

function check(value: unknown) {
  if (!value) throw new Error('The SDK rejected an image setting.')
}

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'images-demo'
  const editor = document.createElement('div')
  editor.className = 'images-editor'
  const error = document.createElement('p')
  error.setAttribute('role', 'alert')
  error.hidden = true
  root.append(error, editor)
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS),
    },
    presets: [UniverDocsCorePreset({ container: editor, ribbonType: 'grid' }), UniverDocsDrawingPreset()],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  let disposed = false,
    initialized = false
  let lifecycle: { dispose(): void } | undefined
  try {
    const doc = univerAPI.createDocument(createData(false))
    owner.univerAPI = univerAPI
    const initialize = () => {
      if (disposed || initialized) return
      initialized = true
      try {
        for (const variant of VARIANTS) {
          const paragraph = doc.getParagraphs().find((candidate) => candidate.getId() === variant.id + '-anchor')
          if (!paragraph) throw new Error('Missing image anchor: ' + variant.id)
          const offset = paragraph.getRange().startOffset
          const transform = buildDocTransform(240, 150)
          const drawing: IDocImage = {
            unitId: doc.getId(),
            subUnitId: doc.getId(),
            drawingId: variant.id,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            imageSourceType: ImageSourceType.BASE64,
            source: 'data:image/svg+xml;base64,' + btoa(COAST_SVG),
            docTransform: transform,
            transform: docDrawingPositionToTransform(transform),
            title: variant.en,
            description: ALT_TEXT,
            behindDoc: BooleanNumber.FALSE,
            layoutType: PositionedObjectLayoutType.INLINE,
            wrapText: WrapTextType.BOTH_SIDES,
            distT: 8,
            distB: 8,
            distL: 12,
            distR: 12,
          }
          check(
            univerAPI.syncExecuteCommand(InsertDocDrawingCommand.id, {
              unitId: doc.getId(),
              drawings: [drawing],
              textRange: { startOffset: offset, endOffset: offset, collapsed: true },
            }),
          )
          const image = doc.getImage(variant.id)!
          if (variant.id.startsWith('square')) {
            check(image.setWrappingStyle(TextWrappingStyle.WRAP_SQUARE))
            const align =
              variant.id === 'square-left'
                ? AlignTypeH.LEFT
                : variant.id === 'square-center'
                  ? AlignTypeH.CENTER
                  : AlignTypeH.RIGHT
            check(image.setPositionH({ relativeFrom: ObjectRelativeFromH.MARGIN, align }))
          }
          if (variant.id === 'top-bottom') check(image.setWrappingStyle(TextWrappingStyle.WRAP_TOP_AND_BOTTOM))
          if (variant.id === 'behind') check(image.setWrappingStyle(TextWrappingStyle.BEHIND_TEXT))
          if (variant.id === 'front') check(image.setWrappingStyle(TextWrappingStyle.IN_FRONT_OF_TEXT))
          if (variant.id === 'rotated') {
            check(image.setSize(180, 112.5))
            check(image.setRotate(15))
          }
          if (variant.id.endsWith('-crop')) {
            const portrait = variant.id === 'recorder-crop'
            check(
              univerAPI.syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
                unitId: doc.getId(),
                subUnitId: doc.getId(),
                drawings: [
                  {
                    drawingId: variant.id,
                    key: 'srcRect',
                    value: portrait
                      ? { left: 60, right: 60, top: 0, bottom: 0 }
                      : { left: 0, right: 0, top: 30, bottom: 45 },
                  },
                  {
                    drawingId: variant.id,
                    key: 'size',
                    value: portrait ? { width: 120, height: 150 } : { width: 240, height: 75 },
                  },
                ],
              }),
            )
          }
        }
        root.dataset.ready = 'true'
      } catch (cause) {
        error.textContent = cause instanceof Error ? cause.message : String(cause)
        error.hidden = false
      }
    }
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Rendered) initialize()
    })
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Rendered) initialize()
    return {
      univerAPI,
      doc,
      dispose() {
        if (disposed) return
        disposed = true
        lifecycle?.dispose()
        if (owner.univerAPI === univerAPI) delete owner.univerAPI
        univer.dispose()
        root.remove()
      },
    }
  } catch (cause) {
    lifecycle?.dispose()
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    univer.dispose()
    root.remove()
    throw cause
  }
}
