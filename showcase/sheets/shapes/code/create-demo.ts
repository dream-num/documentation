import { FConnectorShape } from '@univerjs-pro/engine-shape/facade'
import { FSheetShape } from '@univerjs-pro/sheets-shape/facade'
import { UniverSheetsAdvancedPreset } from '@univerjs/preset-sheets-advanced'
import advancedEnUS from '@univerjs/preset-sheets-advanced/locales/en-US'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing'
import drawingEnUS from '@univerjs/preset-sheets-drawing/locales/en-US'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { createFixture } from './fixture'
import { bindNodes, IMAGE_FILL, seedWorkbench } from './function'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-drawing/lib/index.css'
import '@univerjs/preset-sheets-advanced/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'sheet-shapes-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<section aria-label="Demo controls">
    <p><strong>Marlow reservoir</strong> · Native shapes, text and connected workflow. Original task hours include zero, a missing estimate and decimals.</p>
    <details class="shape-controls"><summary>Shape controls and API boundaries</summary>
    <fieldset><label>Worksheet <select aria-label="Worksheet"></select></label><button data-action="sheet">Open worksheet</button><label>Shape target <select aria-label="Shape target"></select></label><button data-action="reveal">Scroll to origin</button></fieldset>
    <fieldset><label>Shape preset <select aria-label="Shape preset"><option value="RoundRect">Rounded rectangle</option><option value="Rect">Rectangle</option><option value="Ellipse">Ellipse</option><option value="Diamond">Diamond</option><option value="SmileyFace">Smiley face</option><option value="Heart">Heart</option><option value="Star5">Five-point star</option><option value="Cloud">Cloud</option></select></label><button data-action="create">Create shape</button><button data-action="preset" data-basic>Apply preset</button><button data-action="custom" data-basic>Custom SVG path</button><button data-action="adjust" data-basic>Rounded corners 40%</button></fieldset>
    <fieldset><label>Fill <select aria-label="Fill"><option value="solid">Solid amber</option><option value="gradient">Blue / cyan gradient</option><option value="image">Original reservoir image</option><option value="crop">Image · crop 20% at sides</option><option value="none">No fill</option></select></label><button data-action="fill" data-basic>Apply fill</button><label>Stroke <select aria-label="Stroke"><option value="solid">Solid blue · 2px</option><option value="dash">Dashed red · 4px</option><option value="faint">Amber · 50% opacity</option></select></label><button data-action="stroke" data-target>Apply stroke</button></fieldset>
    <fieldset><label>Shape text <input aria-label="Shape text" value="Intake approved" maxlength="80"></label><button data-action="text" data-basic>Set text</button><label>Text style <select aria-label="Text style"><option value="bold">Bold blue · 20px</option><option value="italic">Italic teal · 16px</option><option value="plain">Plain dark · 14px</option></select></label><button data-action="text-style" data-basic>Apply text style</button><label>Alignment <select aria-label="Alignment"><option value="center">Center / middle</option><option value="start">Left / top</option><option value="end">Right / bottom</option></select></label><button data-action="align" data-basic>Align text</button></fieldset>
    <fieldset><label>Rotation ° <input aria-label="Rotation" type="number" min="-180" max="180" step="1" value="20"></label><button data-action="rotate" data-basic>Rotate</button><button data-action="move" data-basic>Move +40px</button><button data-action="size" data-basic>Size 220 × 120</button><button data-action="overlap" data-basic>Overlap intake</button><button data-action="front" data-target>Bring to front</button><button data-action="back" data-target>Send to back</button><button data-action="visible" data-target>Toggle visibility</button><button data-action="selectable" data-target>Toggle selectability</button></fieldset>
    <fieldset><label>Placement <select aria-label="Placement"><option value="Position">One cell · move with cell</option><option value="Both">Two cells · move and size</option><option value="None">Absolute · fixed rectangle</option></select></label><button data-action="placement" data-basic>Apply placement</button><button data-action="row-before">Toggle row 1 height</button><button data-action="row-height">Toggle row 3 height</button></fieldset>
    <fieldset><label>Connector route <select aria-label="Connector route"><option value="StraightConnector1">Straight</option><option value="BentConnector3">Elbow</option><option value="CurvedConnector2">Curved</option></select></label><button data-action="route" data-connector>Apply route</button><label>Arrowheads <select aria-label="Arrowheads"><option value="end">End arrow</option><option value="both">Diamond start / open end</option><option value="none">No arrows</option></select></label><button data-action="arrows" data-connector>Apply arrowheads</button><button data-action="unbind" data-connector>Unbind endpoints</button><button data-action="rebind" data-connector>Bind Intake → Sample</button></fieldset>
    <fieldset><button data-action="remove" data-target>Remove target</button><button data-action="empty">Empty shapes on sheet</button><button data-action="undo">Undo</button><button data-action="redo">Redo</button><button data-action="inspect">Inspect SDK state</button><button data-action="json">Download workbook JSON</button><button data-action="reload">Reload snapshot</button><button data-action="reset">Reset reservoir</button></fieldset>
    <p>Target is a host choice, not native drawing selection. All controls act on the active worksheet. Existing flowchart / image-fill / cropped-image galleries are retained. Basic-shape and connector controls are enabled only for compatible handles. Create is limited to 24 shapes per sheet. Cell values are independent of the workflow, not data-bound labels.</p>
    <p>Preset changes preserve the ID and clear custom geometry/adjustments; custom path replaces its geometry. Rounded corners applies only to RoundRect. Apply placement preserves current bounds; change row 1 height (before Intake) and row 3 height (inside Intake) to compare movement and resizing. Connector binding uses Intake and Sample decision on the workbench; unbinding keeps endpoints in place. Move a bound node to inspect its route. In readback, route contains intermediate points only; start/end are separate. Selectability is a UI interaction flag, not permission control.</p>
    <p>Undo/Redo applies one SDK history step, not one host-button transaction: seed, text-format and binding actions may run multiple setters. Empty removes shapes, not cells or floating images. Reload saves and recreates the current snapshot; Reset restores the original fixture and seeds a new workbench. Both use a fresh unit ID; theme changes discard edits. JSON is not XLSX. This case does not claim SmartArt, exhaustive preset coverage or unrelated Advanced-preset features. SDK trial restrictions remain visible.</p>
    </details><p role="status" aria-live="polite">Preparing native shapes…</p><details><summary>Actual shapes, anchors and task data</summary><pre aria-label="Shape readback"></pre></details>
    </section><div class="shapes-editor"></div>`
  container.append(root)
  const select = (label: string) => root.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!
  const target = select('Shape target'),
    sheetChoice = select('Worksheet')
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const output = root.querySelector<HTMLElement>('pre')!
  const editor = root.querySelector<HTMLElement>('.shapes-editor')!
  const listeners = new AbortController()
  let disposed = false,
    initialized = false,
    busy = false,
    initFrame = 0,
    readFrame = 0,
    revision = 0
  let pending = Promise.resolve()
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(coreEnUS, drawingEnUS, advancedEnUS) },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: editor }),
      UniverSheetsDrawingPreset(),
      UniverSheetsAdvancedPreset(),
    ],
  })
  const E = api.Enum
  const presets = {
    RoundRect: E.ShapeTypeEnum.RoundRect,
    Rect: E.ShapeTypeEnum.Rect,
    Ellipse: E.ShapeTypeEnum.Ellipse,
    Diamond: E.ShapeTypeEnum.Diamond,
    SmileyFace: E.ShapeTypeEnum.SmileyFace,
    Heart: E.ShapeTypeEnum.Heart,
    Star5: E.ShapeTypeEnum.Star5,
    Cloud: E.ShapeTypeEnum.Cloud,
  }
  const routes = {
    StraightConnector1: E.ShapeTypeEnum.StraightConnector1,
    BentConnector3: E.ShapeTypeEnum.BentConnector3,
    CurvedConnector2: E.ShapeTypeEnum.CurvedConnector2,
  }
  let workbook = api.createWorkbook(createFixture('marlow-shapes'))
  const sheet = () => workbook.getActiveSheet()
  const shapes = () => sheet().getShapes()
  const selected = () => (target.value ? sheet().getShape(target.value) : null)
  let lastSheet = ''
  function readback() {
    if (disposed) return
    const items = shapes(),
      previous = target.value
    target.replaceChildren(...items.map((shape) => new Option(shape.getName() || shape.getId(), shape.getId())))
    if (items.some((shape) => shape.getId() === previous)) target.value = previous
    const next = selected()
    if (lastSheet !== sheet().getSheetId()) {
      sheetChoice.replaceChildren(...workbook.getSheets().map((s) => new Option(s.getSheetName(), s.getSheetId())))
      sheetChoice.value = sheet().getSheetId()
      lastSheet = sheetChoice.value
    }
    root.dataset.ready = String(initialized && !busy)
    root.dataset.busy = String(busy)
    root.querySelectorAll<HTMLFieldSetElement>('fieldset').forEach((el) => {
      el.disabled = busy || !initialized
    })
    root.querySelectorAll<HTMLButtonElement>('[data-target]').forEach((el) => {
      el.disabled = !next
    })
    root.querySelectorAll<HTMLButtonElement>('[data-basic]').forEach((el) => {
      el.disabled = !(next instanceof FSheetShape)
    })
    root.querySelectorAll<HTMLButtonElement>('[data-connector]').forEach((el) => {
      el.disabled = !(next instanceof FConnectorShape)
    })
    root.querySelector<HTMLButtonElement>('[data-action="adjust"]')!.disabled =
      next?.getShapeType() !== E.ShapeTypeEnum.RoundRect
    root.querySelector<HTMLButtonElement>('[data-action="create"]')!.disabled = items.length >= 24
    root.querySelector<HTMLButtonElement>('[data-action="empty"]')!.disabled = !items.length
    root.querySelector<HTMLButtonElement>('[data-action="rebind"]')!.disabled =
      !(next instanceof FConnectorShape) ||
      !items.some((s) => s.getName() === 'Intake') ||
      !items.some((s) => s.getName() === 'Sample decision')
    output.textContent = JSON.stringify(
      {
        unitId: workbook.getId(),
        activeSheet: sheet().getSheetId(),
        target: next?.getId() ?? null,
        shapes: items.map((shape) => ({
          id: shape.getId(),
          name: shape.getName(),
          snapshot: shape.getSnapshot(),
          text: shape.getText().getPlainText(),
          richText: shape.getText().getRichText()?.getData(),
          connectionSites: shape.getConnectionSites(),
          adjustHandles: shape.getAdjustHandles(),
          placement: shape instanceof FSheetShape ? shape.getPlacement() : null,
          connector:
            shape instanceof FConnectorShape
              ? {
                  start: shape.getStartEndpoint(),
                  end: shape.getEndEndpoint(),
                  route: shape.getRoutePoints(),
                  startArrow: shape.getStartArrow(),
                  endArrow: shape.getEndArrow(),
                }
              : null,
        })),
        drawingLayout: sheet().getDrawingLayout(),
        row3Height: sheet().getRowHeight(2),
        row1Height: sheet().getRowHeight(0),
        taskData: workbook.getSheetBySheetId('workbench')!.getRange('A13:D17').getRawValues(),
      },
      null,
      2,
    )
  }
  function schedule() {
    if (disposed) return
    cancelAnimationFrame(readFrame)
    readFrame = requestAnimationFrame(readback)
  }
  function run(action: () => void | Promise<void>) {
    if (disposed || busy) return
    busy = true
    readback()
    pending = (async () => {
      try {
        await action()
      } catch (error) {
        if (!disposed) status.textContent = 'Action failed: ' + (error instanceof Error ? error.message : String(error))
      } finally {
        busy = false
        if (!disposed) {
          readback()
          schedule()
        }
      }
    })()
  }
  // Only asynchronous history can span events; retain its owner until it settles.
  for (const name of ['pointerdown', 'keydown', 'beforeinput', 'paste', 'drop'])
    editor.addEventListener(
      name,
      (event) => {
        if (busy) {
          event.preventDefault()
          event.stopImmediatePropagation()
        }
      },
      { capture: true, signal: listeners.signal },
    )

  root.querySelector('section')!.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action || !initialized || busy) return
      run(async () => {
        const shape = selected()
        switch (action) {
          case 'sheet':
            workbook.setActiveSheet(sheetChoice.value)
            break
          case 'reveal':
            sheet().scrollToCell(0, 0)
            break
          case 'create': {
            if (shapes().length >= 24) throw new Error('This demo allows up to 24 shapes per sheet.')
            const created = sheet().insertShape({
              name: 'Checkpoint ' + ++revision,
              shapeType: presets[select('Shape preset').value as keyof typeof presets],
              transform: { left: 270 + (revision % 3) * 35, top: 210, width: 180, height: 95 },
              shapeData: {
                fill: { fillType: E.ShapeFillEnum.SolidFill, color: '#fbcfe8' },
                stroke: { color: '#9d174d', width: 2 },
              },
            })
            if (!created) throw new Error('The SDK did not insert a shape.')
            readback()
            target.value = created.getId()
            break
          }
          case 'preset': {
            const data = shape?.getShapeData()
            if (shape && data) {
              // setShapeType alone preserves custom geometry. Explicitly return to a preset.
              delete data.customGeometry
              delete data.adjustValues
              shape.setShapeData({
                ...data,
                isCustom: false,
                shapeType: presets[select('Shape preset').value as keyof typeof presets],
              })
            }
            break
          }
          case 'custom':
            shape?.setCustomGeometryFromSvgPath({
              pathData: 'M0 0 L160 0 L200 60 L160 120 L0 120 L40 60 Z',
              width: 200,
              height: 120,
            })
            break
          case 'adjust':
            shape?.setAdjustValues({ adj: 40000 })
            break
          case 'fill':
            if (select('Fill').value === 'solid') shape?.setSolidFill('#fbbf24')
            else if (select('Fill').value === 'gradient')
              shape?.setGradientFill(
                E.ShapeGradientTypeEnum.Linear,
                [
                  { position: 0, color: '#2563eb' },
                  { position: 1, color: '#22d3ee' },
                ],
                45,
              )
            else if (select('Fill').value === 'none') shape?.setNoneFill()
            else
              shape?.setImageFill(IMAGE_FILL, E.ShapeImageSourceTypeEnum.URL, {
                imageFillMode: E.ShapeImageFillModeEnum.Stretch,
                imageOpacity: 1,
                imageRotateWithShape: false,
                imageTile: {},
                stretchFillRect: { left: 0, top: 0, right: 0, bottom: 0 },
                srcRect: {
                  left: select('Fill').value === 'crop' ? 20 : 0,
                  right: select('Fill').value === 'crop' ? 20 : 0,
                  top: 0,
                  bottom: 0,
                },
              })
            break
          case 'stroke': {
            const mode = select('Stroke').value
            shape?.setStroke({
              lineStrokeType: E.ShapeLineTypeEnum.SolidLine,
              color: mode === 'dash' ? '#dc2626' : mode === 'faint' ? '#d97706' : '#2563eb',
              width: mode === 'dash' ? 4 : 2,
              opacity: mode === 'faint' ? 0.5 : 1,
              dashType: mode === 'dash' ? E.ShapeLineDashEnum.Dash : E.ShapeLineDashEnum.Solid,
            })
            break
          }
          case 'text':
            shape?.getText().setText(root.querySelector<HTMLInputElement>('[aria-label="Shape text"]')!.value)
            break
          case 'text-style': {
            const style = select('Text style').value
            shape?.getText().setTextStyle({
              bl: style === 'bold' ? 1 : 0,
              it: style === 'italic' ? 1 : 0,
              fs: style === 'bold' ? 20 : style === 'italic' ? 16 : 14,
              cl: { rgb: style === 'bold' ? '#1d4ed8' : style === 'italic' ? '#0f766e' : '#0f172a' },
            })
            break
          }
          case 'align': {
            const align = select('Alignment').value
            shape
              ?.getText()
              .setHorizontalAlign(
                align === 'start'
                  ? E.HorizontalAlign.LEFT
                  : align === 'end'
                    ? E.HorizontalAlign.RIGHT
                    : E.HorizontalAlign.CENTER,
              )
              .setVerticalAlign(
                align === 'start'
                  ? E.VerticalAlign.TOP
                  : align === 'end'
                    ? E.VerticalAlign.BOTTOM
                    : E.VerticalAlign.MIDDLE,
              )
            break
          }
          case 'rotate': {
            const rotation = root.querySelector<HTMLInputElement>('[aria-label="Rotation"]')!.valueAsNumber
            if (!Number.isFinite(rotation) || rotation < -180 || rotation > 180)
              throw new Error('Rotation must be a finite number from -180 to 180.')
            shape?.setRotation(rotation)
            break
          }
          case 'move': {
            const transform = shape?.getTransform()
            if (transform) shape!.setAbsolutePosition(transform.left + 40, transform.top)
            break
          }
          case 'size':
            shape?.setSize(220, 120)
            break
          case 'overlap':
            shape?.setAbsolutePosition(100, 90)
            break
          case 'front':
            shape?.bringToFront()
            break
          case 'back':
            shape?.sendToBack()
            break
          case 'visible':
            shape?.setVisible(!shape.isVisible())
            break
          case 'selectable':
            shape?.setSelectable(!shape.isSelectable())
            break
          case 'placement': {
            const transform = shape?.getTransform()
            if (shape instanceof FSheetShape && transform) {
              const mode = select('Placement').value as 'Position' | 'Both' | 'None'
              if (!shape.setPlacement({ kind: E.SheetDrawingAnchorType[mode], bounds: transform }))
                throw new Error('SDK rejected sheet placement.')
            }
            break
          }
          case 'row-height':
            sheet().setRowHeight(2, sheet().getRowHeight(2) === 28 ? 68 : 28)
            break
          case 'row-before':
            sheet().setRowHeight(0, sheet().getRowHeight(0) === 28 ? 68 : 28)
            break
          case 'route':
            if (shape instanceof FConnectorShape)
              shape.setShapeType(routes[select('Connector route').value as keyof typeof routes])
            break
          case 'arrows':
            if (shape instanceof FConnectorShape) {
              const mode = select('Arrowheads').value
              shape
                .setStartArrow(mode === 'both' ? E.ShapeArrowTypeEnum.DiamondArrow : E.ShapeArrowTypeEnum.None)
                .setEndArrow(
                  mode === 'both'
                    ? E.ShapeArrowTypeEnum.OpenArrow
                    : mode === 'end'
                      ? E.ShapeArrowTypeEnum.Arrow
                      : E.ShapeArrowTypeEnum.None,
                )
            }
            break
          case 'unbind':
            if (shape instanceof FConnectorShape) shape.unbindStart().unbindEnd()
            break
          case 'rebind': {
            const source = shapes().find((s) => s.getName() === 'Intake'),
              destination = shapes().find((s) => s.getName() === 'Sample decision')
            if (shape instanceof FConnectorShape && source && destination) bindNodes(shape, source, destination)
            break
          }
          case 'remove':
            if (shape && !shape.remove()) throw new Error('SDK did not remove the shape.')
            break
          case 'empty':
            for (const item of shapes()) if (!item.remove()) throw new Error('SDK did not remove ' + item.getId())
            break
          case 'undo':
          case 'redo': {
            const applied = action === 'undo' ? await api.undo() : await api.redo()
            if (!disposed)
              status.textContent = applied
                ? 'One SDK history step applied. Inspect the model and native drawing.'
                : 'No SDK history step available.'
            return
          }
          case 'json': {
            const href = URL.createObjectURL(
              new Blob([JSON.stringify(workbook.save(), null, 2)], { type: 'application/json' }),
            )
            const link = document.createElement('a')
            link.href = href
            link.download = 'marlow-reservoir-shapes.json'
            root.append(link)
            link.click()
            link.remove()
            setTimeout(() => URL.revokeObjectURL(href), 1000)
            break
          }
          case 'reload':
          case 'reset': {
            const active = sheet().getSheetId()
            const snapshot = action === 'reload' ? workbook.save() : createFixture('temporary')
            api.disposeUnit(workbook.getId())
            workbook = api.createWorkbook({ ...snapshot, id: 'marlow-shapes-' + ++revision })
            lastSheet = ''
            if (action === 'reset') {
              const id = seedWorkbench(api)
              readback()
              target.value = id
            } else workbook.setActiveSheet(active)
            break
          }
          case 'inspect':
            break
        }
        if (!disposed)
          status.textContent =
            'Completed: ' +
            action +
            '. Readback is the actual SDK state; reapplying the same value may leave it unchanged.'
      })
    },
    { signal: listeners.signal },
  )
  target.addEventListener('change', schedule, { signal: listeners.signal })
  const subscription = api.addEvent(api.Event.CommandExecuted, schedule)
  function initialize() {
    if (disposed) return
    if (api.getCurrentLifecycleStage() < LifecycleStages.Steady) {
      initFrame = requestAnimationFrame(initialize)
      return
    }
    run(() => {
      const id = seedWorkbench(api)
      initialized = true
      readback()
      target.value = id
      status.textContent = 'Created four native shapes and two bound connectors. Choose a target to explore.'
    })
  }
  initFrame = requestAnimationFrame(initialize)
  readback()
  return {
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(initFrame)
      cancelAnimationFrame(readFrame)
      listeners.abort()
      subscription.dispose()
      root.remove()
      void pending.finally(() => univer.dispose())
    },
  }
}
