import type { IDocumentData, ITextStyle } from '@univerjs/core'
import type { IDocImage } from '@univerjs/preset-docs-drawing'
import { UniverDocsTablePlugin } from '@univerjs-pro/docs-table'
import { UniverDocsTableUIPlugin } from '@univerjs-pro/docs-table-ui'
import TableEnUS from '@univerjs-pro/docs-table-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import {
  BooleanNumber,
  CommandType,
  DrawingTypeEnum,
  ICommandService,
  ImageSourceType,
  IUndoRedoService,
  PositionedObjectLayoutType,
  WrapTextType,
} from '@univerjs/core'
import {
  buildDocTransform,
  docDrawingPositionToTransform,
  DocSelectionManagerService,
  DocSkeletonManagerService,
  DocStateChangeManagerService,
} from '@univerjs/docs'
import { SetDocZoomRatioOperation } from '@univerjs/docs-ui'
import { IRenderManagerService } from '@univerjs/engine-render'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { InsertDocDrawingCommand, UniverDocsDrawingPreset } from '@univerjs/preset-docs-drawing'
import DrawingEnUS from '@univerjs/preset-docs-drawing/locales/en-US'
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'

import { createData, FONTS, METRICS_SVG, REVIEW_DATE, SAMPLES } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import '@univerjs/preset-docs-drawing/lib/index.css'
import '@univerjs-pro/docs-table-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/docs-table/facade'

const paint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
const STYLE_COMMAND = 'demo.command.alder-text-style'
const success = (value: unknown) => {
  if (!value) throw new Error('The SDK rejected this operation; inspect the current document or Reset.')
}
export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'font-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<details class="font-controls"><summary>Demo controls / Fonts and fallback</summary><fieldset disabled>
    <label>State <select data-input="fixture"><option value="default">Typography report</option><option value="empty">Empty document</option><option value="boundary">Large sample type</option><option value="error">Invalid range</option></select></label><button data-action="fixture">Load state</button>
    <label>View <select data-input="zoom"><option value="fit">Fit page width (up to 100%)</option><option value="actual">100% / native scrolling</option></select></label>
    <label>Scope <select data-input="scope"><option value="sample">Selected sample</option><option value="report">Whole report text</option></select></label><label>Sample <select data-input="sample">${SAMPLES.map((item) => `<option value="${item.id}">${item.label}</option>`).join('')}</select></label><button data-action="select">Select sample in editor</button>
    <label>Font stack <select data-input="font">${FONTS.map((font) => `<option value="${font.id}">${font.label}</option>`).join('')}</select></label><button data-action="font">Apply font family</button>
    <label>Size (pt) <input data-input="size" type="number" min="8" max="32" step="1" value="13"></label><label>Weight <select data-input="weight"><option value="0">Regular</option><option value="1">Bold</option></select></label><button data-action="style">Apply size and weight</button>
    <button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="invalid">Try invalid range</button><button data-action="reload">Reload snapshot</button><button data-action="reset">Reset report</button><button data-action="download">Download snapshot JSON</button>
    </fieldset><p>Samples are resolved by their [ID] prefix after edits/history; removing or duplicating a marker disables that target. Whole report includes headings and table text. Local face probes are browser diagnostics, not glyph coverage or SDK Facades. No font files are downloaded. Fallback and RTL shaping vary by platform. State/Reset/theme replace edits and history; JSON is not PDF output.</p></details>
    <p role="status">Loading…</p><p class="font-availability"></p><p role="alert" hidden></p><details><summary>SDK styles, glyph metrics and browser face probes</summary><pre><output aria-label="Typography readback"></output></pre></details><div class="font-editor"></div>`
  container.append(root)
  const editor = root.querySelector<HTMLElement>('.font-editor')!,
    controls = root.querySelector('fieldset')!,
    output = root.querySelector('output')!,
    status = root.querySelector('[role=status]')!,
    alert = root.querySelector<HTMLElement>('[role=alert]')!,
    availability = root.querySelector('.font-availability')!
  const input = (name: string) => root.querySelector<HTMLInputElement | HTMLSelectElement>(`[data-input=${name}]`)!
  const button = (name: string) => root.querySelector<HTMLButtonElement>(`[data-action=${name}]`)!
  const events = new AbortController(),
    fixtures = new Map<string, IDocumentData>()
  const probes: Record<string, string> = {}
  let current: ReturnType<typeof initialize> | undefined
  let disposed = false,
    busy = false,
    scheduled = 0,
    loadedFixture = 'default'
  const font = () => FONTS.find((item) => item.id === input('font').value)!
  const sample = () => {
    const matches =
      current?.doc.getParagraphs().filter((p) => p.getText().startsWith(`[${input('sample').value}]`)) ?? []
    return matches.length === 1 ? matches[0] : undefined
  }
  function target() {
    if (!current) return
    if (input('scope').value === 'report') {
      const length = current.doc.getBody().dataStream.length - 2
      return length > 0 ? current.doc.getTextRange(0, length) : undefined
    }
    const paragraph = sample()
    if (!paragraph) return
    const start = paragraph.getRange().startOffset
    return current.doc.getTextRange(start, start + paragraph.getText().length)
  }
  function inspect() {
    if (!current || disposed) return
    const { doc, univer } = current
    const injector = univer.__getInjector()
    const skeleton = injector
      .get(IRenderManagerService)
      .getRenderUnitById(doc.getId())
      ?.with(DocSkeletonManagerService)
      .getSkeleton()
    const selected = target(),
      common = selected?.getCommonExplicitTextStyle()
    const samples = SAMPLES.map((item) => {
      const paragraphs = doc.getParagraphs().filter((p) => p.getText().startsWith(`[${item.id}]`))
      if (paragraphs.length !== 1) return { id: item.id, present: false }
      const p = paragraphs[0],
        start = p.getRange().startOffset,
        range = doc.getTextRange(start, start + p.getText().length)
      const glyph = skeleton?.findNodeByCharIndex(start + item.id.length + 3)
      return {
        id: item.id,
        present: true,
        text: range.getText(),
        range: range.getRange(),
        style: range.getCommonExplicitTextStyle(),
        glyph: glyph
          ? {
              requestedFamily: glyph.fontStyle?.fontFamily,
              fontString: glyph.fontStyle?.fontString,
              size: glyph.fontStyle?.fontSize,
              width: glyph.width,
              lineHeight: glyph.parent?.parent?.lineHeight,
            }
          : null,
      }
    })
    const pageCount = skeleton?.getSkeletonData()?.pages.length ?? 0
    output.textContent = JSON.stringify(
      {
        loadedFixture,
        reviewDate: REVIEW_DATE,
        pageCount,
        zoomRatio: doc.save().settings?.zoomRatio ?? 1,
        samples,
        target: selected?.describe() ?? null,
        localFaceProbes: probes,
        glyphCoverage: 'Not inferred from face availability, font checks or glyph width; inspect native samples.',
        selection: injector.get(DocSelectionManagerService).getTextRanges(),
        snapshot: doc.save(),
      },
      null,
      2,
    )
    status.textContent = `${pageCount} native pages / target: ${selected ? (input('scope').value === 'report' ? 'whole report' : input('sample').value) : 'unavailable'} / style read from SDK`
    availability.textContent = `${font().probe}: ${probes[font().id] ?? 'probing local face'}; requested stack: ${font().family}. Per-glyph fallback identity is not exposed here.`
    button('font').disabled = !selected || common?.ff === font().family
    button('style').disabled =
      !selected ||
      (!!input('size').value.trim() &&
        common?.fs === Number(input('size').value) &&
        common?.bl === Number(input('weight').value))
    button('select').disabled = !sample()
    button('undo').disabled = !current.history.pitchTopUndoElement()
    button('redo').disabled = !current.history.pitchTopRedoElement()
  }
  function sync() {
    const style = target()?.getCommonExplicitTextStyle()
    input('size').value = String(style?.fs ?? 13)
    input('weight').value = String(style?.bl ?? 0)
    input('font').value = FONTS.find((item) => item.family === style?.ff)?.id ?? 'sans'
  }
  function fitWidth() {
    if (!current || disposed) return
    const { univer, doc, api } = current
    const width = univer.__getInjector().get(IRenderManagerService).getRenderUnitById(doc.getId())?.mainComponent?.width
    if (!width || editor.clientWidth < 1) return
    const zoomRatio =
      input('zoom').value === 'actual' ? 1 : Math.min(1, Math.max(0.1, (editor.clientWidth - 24) / (width + 80)))
    if (Math.abs((doc.save().settings?.zoomRatio ?? 1) - zoomRatio) > 0.001)
      success(api.syncExecuteCommand(SetDocZoomRatioOperation.id, { unitId: doc.getId(), zoomRatio }))
  }
  function initialize(snapshot?: IDocumentData, empty = false) {
    const { univer, univerAPI: api } = createUniver({
      darkMode,
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(DocsEnUS, DrawingEnUS, TableEnUS) },
      presets: [UniverDocsCorePreset({ ribbonType: 'grid', container: editor }), UniverDocsDrawingPreset()],
      plugins: [UniverLicensePlugin, UniverDocsTablePlugin, UniverDocsTableUIPlugin],
    })
    try {
      const doc = api.createDocument(snapshot ? structuredClone(snapshot) : createData(empty))
      if (!snapshot && !empty) {
        const marker = (key: string) => doc.findParagraphByText(key)!.getRange().startOffset
        success(
          doc.insertTableFromData(
            [
              ['Collection', 'Items', 'Reference'],
              ['Maps', '14', 'MAP-017'],
              ['Letters', '28', 'LTR-028'],
              ['Photographs', '9', 'IMG-009'],
            ],
            {
              tableId: 'alder-font-register',
              offset: marker('[TABLE]'),
              width: 620,
              columnWidths: [260, 130, 230],
              headerRowCount: 1,
            },
          ),
        )
        const docTransform = buildDocTransform(480, 130)
        const image: IDocImage = {
          unitId: doc.getId(),
          subUnitId: doc.getId(),
          drawingId: 'alder-baseline-reference',
          drawingType: DrawingTypeEnum.DRAWING_IMAGE,
          imageSourceType: ImageSourceType.BASE64,
          source: 'data:image/svg+xml;base64,' + btoa(METRICS_SVG),
          docTransform,
          transform: docDrawingPositionToTransform(docTransform),
          title: 'Baseline and cap-height reference',
          description: 'Two dashed horizontal guides mark cap height and baseline beside the letters Ag.',
          behindDoc: BooleanNumber.FALSE,
          layoutType: PositionedObjectLayoutType.INLINE,
          wrapText: WrapTextType.BOTH_SIDES,
          distT: 8,
          distB: 8,
          distL: 0,
          distR: 0,
        }
        const offset = marker('[FIGURE]')
        // Bootstrap the native reference fixture; demonstration buttons below use text Facades.
        success(
          api.syncExecuteCommand(InsertDocDrawingCommand.id, {
            unitId: doc.getId(),
            drawings: [image],
            textRange: { startOffset: offset, endOffset: offset, collapsed: true },
          }),
        )
      }
      const injector = univer.__getInjector(),
        history = injector.get(IUndoRedoService)
      // beta.2 direct range setters omit the history trigger. A real SDK command
      // boundary supplies it; native Undo/Redo owns the mutations, not the host.
      injector.get(ICommandService).registerCommand({
        id: STYLE_COMMAND,
        type: CommandType.COMMAND,
        handler: (_accessor, params: { start: number; end: number; style: ITextStyle }) =>
          doc.getTextRange(params.start, params.end).setTextStyle(params.style),
      })
      const schedule = () => {
        cancelAnimationFrame(scheduled)
        scheduled = requestAnimationFrame(inspect)
      }
      const subscription = injector.get(ICommandService).onCommandExecuted(schedule)
      const historySubscription = history.undoRedoStatus$.subscribe(schedule)
      return { univer, api, doc, history, subscription, historySubscription }
    } catch (error) {
      univer.dispose()
      throw error
    }
  }
  async function mount(snapshot?: IDocumentData, empty = false) {
    const previous = current
    current = undefined
    previous?.subscription.dispose()
    previous?.historySubscription.unsubscribe()
    previous?.univer.dispose()
    await paint()
    if (disposed) return
    editor.replaceChildren()
    const owner = (current = initialize(snapshot, empty))
    /* eslint-disable no-unmodified-loop-condition, no-await-in-loop -- SDK lifecycle and ownership progress between frames. */
    while (
      !disposed &&
      current === owner &&
      owner.api.getCurrentLifecycleStage() < owner.api.Enum.LifecycleStages.Rendered
    )
      await paint()
    /* eslint-enable no-unmodified-loop-condition, no-await-in-loop */
    if (disposed || current !== owner) return
    await paint()
    fitWidth()
    await paint()
    // Rendered can precede drawing layout. Cache the actual initialized figure,
    // not its bootstrap (0, 0) transform, so replay does not race normalization.
    const deadline = performance.now() + 10000
    /* eslint-disable no-await-in-loop, no-unmodified-loop-condition -- Owned SDK layout/disposal progresses between frames. */
    while (!disposed && current === owner) {
      const drawing = owner.doc.save().drawings?.['alder-baseline-reference'] as IDocImage | undefined
      if (!drawing || drawing.transforms?.length) break
      if (performance.now() > deadline) throw new Error('Native reference figure layout did not become ready.')
      await paint()
    }
    /* eslint-enable no-await-in-loop, no-unmodified-loop-condition */
    if (disposed || current !== owner) return
    owner.univer.__getInjector().get(DocStateChangeManagerService).clearHistory(owner.doc.getId())
    owner.history.clearUndoRedo(owner.doc.getId())
  }
  function invalid() {
    current!.doc.getTextRange(-1, 1).setTextStyle({ ff: font().family })
  }
  async function fixture(name: string) {
    if (!['default', 'empty', 'boundary', 'error'].includes(name)) throw new Error('Unknown state; edits retained.')
    await mount(fixtures.get(name) ?? (name === 'empty' ? undefined : fixtures.get('default')), name === 'empty')
    if (!current || disposed) return
    input('scope').value = 'sample'
    input('sample').value = 'EN'
    if (!fixtures.has(name)) {
      if (name === 'boundary') success(target()!.setTextStyle({ fs: 32, bl: BooleanNumber.TRUE }))
      await paint()
      fixtures.set(name, structuredClone(current.doc.save()))
    }
    current.univer.__getInjector().get(DocStateChangeManagerService).clearHistory(current.doc.getId())
    current.history.clearUndoRedo(current.doc.getId())
    loadedFixture = name
    input('fixture').value = name
    sync()
    if (name === 'error') invalid()
  }
  async function run(action: () => void | Promise<void>, clearError = true) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    root.dataset.ready = 'false'
    if (clearError) alert.hidden = true
    try {
      await action()
      await paint()
    } catch (error) {
      alert.textContent = error instanceof Error ? error.message : String(error)
      alert.hidden = false
    } finally {
      busy = false
      if (!disposed) {
        controls.disabled = !current
        root.dataset.ready = current ? 'true' : 'false'
        inspect()
      }
    }
  }
  controls.addEventListener(
    'input',
    () => {
      if (!busy) inspect()
    },
    { signal: events.signal },
  )
  controls.addEventListener(
    'change',
    (event) => {
      if (['scope', 'sample'].includes((event.target as HTMLElement).dataset.input ?? '')) sync()
      if ((event.target as HTMLElement).dataset.input === 'zoom') void run(fitWidth)
      if (!busy) inspect()
    },
    { signal: events.signal },
  )
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest('button')?.dataset.action
      if (!action) return
      void run(async () => {
        if (action === 'font' || action === 'style') {
          const range = target()
          if (!range) throw new Error('Target is missing or ambiguous; restore the marker or Reset.')
          const patch: ITextStyle = { ff: font().family }
          if (action === 'style') {
            const size = Number(input('size').value)
            if (!input('size').value.trim() || !Number.isFinite(size) || size < 8 || size > 32)
              throw new Error('This demo accepts 8–32 pt; nothing changed.')
            delete patch.ff
            patch.fs = size
            patch.bl = Number(input('weight').value)
          }
          const { startOffset: start, endOffset: end } = range.getRange()
          success(current!.api.syncExecuteCommand(STYLE_COMMAND, { start, end, style: patch }))
        }
        if (action === 'select') {
          const p = sample()!
          current!.doc.setSelection(p.getRange().startOffset, p.getRange().startOffset + p.getText().length)
        }
        if (action === 'undo') success(current!.doc.undo())
        if (action === 'redo') success(current!.doc.redo())
        if (action === 'undo' || action === 'redo') sync()
        if (action === 'invalid') invalid()
        if (action === 'fixture') await fixture(input('fixture').value)
        if (action === 'reset') await fixture('default')
        if (action === 'reload') await mount(current!.doc.save())
        if (action === 'download') {
          const url = URL.createObjectURL(
            new Blob([JSON.stringify(current!.doc.save(), null, 2)], { type: 'application/json' }),
          )
          const link = document.createElement('a')
          link.href = url
          link.download = 'alder-typography.json'
          link.click()
          setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      })
    },
    { signal: events.signal },
  )
  let observedWidth = editor.clientWidth
  const resize = new ResizeObserver(() => {
    if (editor.clientWidth === observedWidth) return
    observedWidth = editor.clientWidth
    if (!busy && !disposed) void run(fitWidth, false)
  })
  resize.observe(editor)
  void run(async () => {
    await Promise.all(
      FONTS.map(async (item) => {
        try {
          await new FontFace(`AlderProbe-${item.id}`, `local("${item.probe}")`).load()
          probes[item.id] = 'local regular face resolved (not glyph coverage)'
        } catch {
          probes[item.id] = 'local face unavailable; explicit fallback requested'
        }
      }),
    )
    if (!disposed) await fixture('default')
  })
  return {
    dispose() {
      disposed = true
      events.abort()
      resize.disconnect()
      cancelAnimationFrame(scheduled)
      current?.subscription.dispose()
      current?.historySubscription.unsubscribe()
      current?.univer.dispose()
      current = undefined
      root.remove()
    },
  }
}
