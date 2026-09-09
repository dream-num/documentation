import { UniverLicensePlugin } from '@univerjs-pro/license'
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
import CoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import {
  InsertDocDrawingCommand,
  TextWrappingStyle,
  UniverDocsDrawingPreset,
  type IDocImage,
} from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createData, ILLUSTRATION, VARIANTS } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'anchored-images-and-page-flow'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(CoreEnUS, DrawingEnUS) },
    presets: [UniverDocsCorePreset({ container: root, ribbonType: 'grid' }), UniverDocsDrawingPreset()],
    plugins: [UniverLicensePlugin],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  let disposed = false,
    initialized = false
  let lifecycle: { dispose(): void } | undefined
  const dispose = () => {
    if (disposed) return
    disposed = true
    lifecycle?.dispose()
    if (owner.univerAPI === univerAPI) delete owner.univerAPI
    try {
      univer.dispose()
    } finally {
      root.remove()
    }
  }
  try {
    const doc = univerAPI.createDocument(createData())
    owner.univerAPI = univerAPI
    const initialize = () => {
      if (disposed || initialized) return
      initialized = true
      for (const v of VARIANTS) {
        const paragraph = doc.findParagraphs({ paragraphId: v.id + '-anchor' })[0]
        if (!paragraph) throw new Error('Missing image anchor: ' + v.id)
        const offset = paragraph.getRange().startOffset + 'The survey team '.length
        const transform = buildDocTransform(210, 140)
        const drawing: IDocImage = {
          unitId: doc.getId(),
          subUnitId: doc.getId(),
          drawingId: v.id,
          drawingType: DrawingTypeEnum.DRAWING_IMAGE,
          imageSourceType: ImageSourceType.BASE64,
          source: 'data:image/svg+xml;base64,' + btoa(ILLUSTRATION),
          docTransform: transform,
          transform: docDrawingPositionToTransform(transform),
          title: v.title,
          description: 'Original ridge trail sketch with green hills and a pale walking route.',
          behindDoc: BooleanNumber.FALSE,
          layoutType: PositionedObjectLayoutType.INLINE,
          wrapText: WrapTextType.LARGEST,
          distT: 8,
          distB: 8,
          distL: 12,
          distR: 12,
        }
        if (
          !univerAPI.syncExecuteCommand(InsertDocDrawingCommand.id, {
            unitId: doc.getId(),
            drawings: [drawing],
            textRange: { startOffset: offset, endOffset: offset, collapsed: true },
          })
        )
          throw new Error('Image insertion rejected: ' + v.id)
        const image = doc.getImage(v.id)!
        if (v.id !== 'inline') {
          if (
            !image.setWrappingStyle(
              v.id === 'square' ? TextWrappingStyle.WRAP_SQUARE : TextWrappingStyle.WRAP_TOP_AND_BOTTOM,
            )
          )
            throw new Error('Wrapping rejected')
          if (!image.setPositionH({ relativeFrom: ObjectRelativeFromH.MARGIN, align: AlignTypeH.LEFT }))
            throw new Error('Image alignment rejected')
        }
      }
      root.dataset.ready = 'true'
    }
    const initializeSafely = () => {
      try {
        initialize()
      } catch (error) {
        try {
          dispose()
        } finally {
          const alert = document.createElement('p')
          alert.setAttribute('role', 'alert')
          alert.textContent = error instanceof Error ? error.message : String(error)
          container.append(alert)
        }
        throw error
      }
    }
    lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === univerAPI.Enum.LifecycleStages.Steady) initializeSafely()
    })
    if (univerAPI.getCurrentLifecycleStage() >= univerAPI.Enum.LifecycleStages.Steady) initializeSafely()
    return { univerAPI, dispose }
  } catch (error) {
    try {
      dispose()
    } catch (cleanupError) {
      // eslint-disable-next-line preserve-caught-error -- Preserve both initialization and cleanup errors.
      throw new AggregateError([error, cleanupError], 'Image flow initialization and cleanup failed', { cause: error })
    }
    throw error
  }
}
