import { DocChartInsertAnchorKind, UniverDocsChartPlugin } from '@univerjs-pro/docs-chart'
import { UniverDocsChartUIPlugin } from '@univerjs-pro/docs-chart-ui'
import ChartEnUS from '@univerjs-pro/docs-chart-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { unmount } from '@univerjs/design'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createData, createVariants } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import '@univerjs-pro/docs-chart-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-chart/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'charts-demo'
  root.dataset.ready = 'false'
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS, ChartEnUS),
    },
    presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: root }), UniverDocsDrawingPreset()],
    plugins: [UniverLicensePlugin, UniverDocsChartPlugin, UniverDocsChartUIPlugin],
  })
  const doc = univerAPI.createDocument(createData())
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  const events = new AbortController()
  let disposed = false
  let frame = 0
  let pending = Promise.resolve()
  const gate = (event: Event) => {
    if (root.dataset.ready !== 'true') {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  for (const event of ['pointerdown', 'keydown', 'beforeinput', 'paste', 'drop'])
    root.addEventListener(event, gate, { capture: true, signal: events.signal })
  function initialize() {
    if (disposed) return
    if (univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Rendered) {
      frame = requestAnimationFrame(initialize)
      return
    }
    pending = (async () => {
      const failures: string[] = []
      for (const variant of createVariants()) {
        if (disposed) return
        try {
          const anchor = doc.getParagraphs().find((paragraph) => paragraph.getId() === variant.id + '-anchor')
          if (!anchor) throw new Error('Chart anchor is missing: ' + variant.id)
          const chart = doc
            .newChart(variant.type)
            .setSource(variant.values)
            .setPosition({ kind: DocChartInsertAnchorKind.BodyOffset, offset: anchor.getRange().startOffset })
            .setInline()
            .setSize(560, 280)
            .setTitle(variant.title)
            .setCategoryField(0)
            .setValueFields(variant.values[0].slice(1).map((_, i) => i + 1))
            .setPalette(variant.palette)
            .setLegend(variant.legend === false ? false : { position: variant.legend })
            .build()
          // Each insertion changes the following paragraph offsets in this document.
          // eslint-disable-next-line no-await-in-loop
          await doc.insertChart(chart)
        } catch (error) {
          if (disposed) return
          const message = variant.title + ': SDK could not create this variant: ' + String(error)
          failures.push(message)
          const anchor = doc.getParagraphs().find((paragraph) => paragraph.getId() === variant.id + '-anchor')
          if (!doc.insertText(anchor?.getRange().startOffset ?? 0, message + '\r'))
            throw new Error(message, { cause: error })
        }
      }
      if (!disposed) {
        root.dataset.errors = JSON.stringify(failures)
        root.dataset.ready = 'true'
      }
    })().catch((error) => {
      if (disposed) return
      root.dataset.error = String(error)
      const alert = document.createElement('p')
      alert.setAttribute('role', 'alert')
      alert.textContent = 'Chart initialization failed: ' + String(error)
      root.prepend(alert)
    })
  }
  frame = requestAnimationFrame(initialize)
  return {
    univerAPI,
    doc,
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(frame)
      events.abort()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      // Finish an uncancellable insertion before releasing native React roots/services.
      void pending.finally(() => {
        unmount(root)
        univer.dispose()
        root.remove()
      })
    },
  }
}
