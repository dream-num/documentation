import { UniverDocsShapePlugin } from '@univerjs-pro/docs-shape'
import { UniverDocsShapeUIPlugin } from '@univerjs-pro/docs-shape-ui'
import ShapeEnUS from '@univerjs-pro/docs-shape-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import { UniverProFormulaEnginePlugin } from '@univerjs-pro/engine-formula'
import { ShapeFillEnum, ShapeLineTypeEnum } from '@univerjs-pro/engine-shape'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { IUndoRedoService } from '@univerjs/core'
import { DocStateChangeManagerService } from '@univerjs/docs'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { TextWrappingStyle, UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createData, SHAPES } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import '@univerjs-pro/docs-shape-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-shape/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'shapes-demo'
  container.append(root)
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS, ShapeEnUS, ShapeEditorEnUS, EmbedUnitEnUS),
    },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: root, header: true, toolbar: true, footer: true }),
      UniverDocsDrawingPreset(),
      // Shape UI needs Pro formula services; replace the core formula plugin by name.
      { plugins: [UniverLicensePlugin, UniverProFormulaEnginePlugin] },
    ],
    plugins: [UniverDocsShapePlugin, UniverDocsShapeUIPlugin],
  })
  const owner = window as typeof window & { univerAPI?: typeof api }
  owner.univerAPI = api
  let disposed = false
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (disposed || stage !== api.Enum.LifecycleStages.Rendered) return
    try {
      for (const sample of SHAPES) {
        const shape = doc.insertShape({
          name: sample.en,
          shapeType: sample.type,
          placement:
            sample.wrapping === TextWrappingStyle.INLINE
              ? { wrappingStyle: sample.wrapping, anchor: { paragraphId: sample.id + '-anchor' } }
              : {
                  wrappingStyle: sample.wrapping,
                  anchor: { paragraphId: sample.id + '-anchor' },
                  position: { horizontalOffset: 64, verticalOffset: 0 },
                },
          transform: { width: sample.width, height: 64, rotation: sample.rotation },
          shapeData: {
            fill: sample.fill
              ? { fillType: ShapeFillEnum.SolidFill, color: sample.fill }
              : { fillType: ShapeFillEnum.NoFill },
            stroke: { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: sample.stroke, width: 2 },
          },
        })
        if (!shape) throw new Error('Could not insert shape: ' + sample.id)
        if (sample.wrapping !== TextWrappingStyle.BEHIND_TEXT) shape.getText().setText(sample.en)
      }
      const injector = univer.__getInjector()
      injector.get(DocStateChangeManagerService).clearHistory(doc.getId())
      injector.get(IUndoRedoService).clearUndoRedo(doc.getId())
      root.dataset.ready = 'true'
    } catch (cause) {
      root.dataset.ready = 'error'
      const alert = document.createElement('p')
      alert.role = 'alert'
      alert.textContent = 'Shape startup failed: ' + (cause instanceof Error ? cause.message : String(cause))
      root.append(alert)
      console.error(cause)
    }
  })
  const doc = api.createDocument(createData())
  return {
    univerAPI: api,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
