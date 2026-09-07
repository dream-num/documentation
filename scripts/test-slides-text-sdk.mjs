/* eslint-disable no-await-in-loop -- Undo and Redo must complete before checking the next state. */
// Selected SDK feasibility/undo checks. Rendering is verified separately; stored options are not visual proof.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { ShapeTextAutoFitType, ShapeTextWrapType } from '@univerjs-pro/engine-shape'
import { UniverSlidesPlugin } from '@univerjs-pro/slides'
import { IUndoRedoService, IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDrawingPlugin } from '@univerjs/drawing'

import {
  applyRichCopy,
  replaceText,
  setAutofit,
  setFontSize,
  setPadding,
  setWrapping,
} from '../showcase/slides/text-editing-and-autofit/code/actions.ts'
import { createData, TARGET_ID } from '../showcase/slides/text-editing-and-autofit/code/data.ts'

import '@univerjs-pro/slides/facade'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-text-sdk')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], observations: [], failure: null }
const univer = new Univer()
univer.registerPlugin(UniverDrawingPlugin)
univer.registerPlugin(UniverSlidesPlugin)
const api = FUniver.newAPI(univer)
try {
  const presentation = api.createPresentation(createData())
  const slide = presentation.getSlideByIndex(0)
  const shape = slide.getShape(TARGET_ID)
  assert.ok(shape, 'The existing reference slide must contain a real Shape facade')
  const text = shape.getText()
  // Compare the exported JSON contract. Optional undefined keys are not serialized data.
  const read = () => JSON.parse(JSON.stringify(presentation.save().slides[slide.getId()].elements[TARGET_ID]))
  const history = univer.__getInjector().get(IUndoRedoService)
  univer.__getInjector().get(IUniverInstanceService).focusUnit(presentation.getId())
  const initial = read()
  const originalText = text.getPlainText()
  const content =
    'Cobalt / Community print studio\nThree workshops. Twelve volunteer hosts.\nBring a draft, share a technique, and leave room for the next person.'
  history.clearUndoRedo(presentation.getId())
  text.setText(content)
  assert.equal(text.getPlainText(), content)
  assert.deepEqual(read().transform, initial.transform)
  assert.equal(await api.undo(), true)
  assert.equal(text.getPlainText(), originalText)
  assert.deepEqual(read(), initial, 'Text Undo must restore the entire original Shape, not only its visible words')
  assert.equal(await api.redo(), true)
  assert.equal(text.getPlainText(), content)
  report.checks.push('FShapeText.setText: exact text, preserved geometry, full-Shape Undo and Redo')

  for (const mode of [
    ShapeTextAutoFitType.NoAutoFit,
    ShapeTextAutoFitType.NormAutoFit,
    ShapeTextAutoFitType.SpAutoFit,
  ]) {
    const before = read()
    history.clearUndoRedo(presentation.getId())
    text.setTextBoxOptions({
      autoFitType: mode,
      textWrap: ShapeTextWrapType.Square,
      padding: { left: 14, right: 18, top: 10, bottom: 12 },
    })
    const options = text.getTextBoxOptions()
    assert.equal(options.autoFitType, mode)
    assert.equal(options.textWrap, ShapeTextWrapType.Square)
    assert.deepEqual(options.padding, { left: 14, right: 18, top: 10, bottom: 12 })
    assert.equal(text.getPlainText(), content)
    const applied = read()
    report.observations.push({ mode, options, transform: applied.transform })
    assert.equal(await api.undo(), true)
    assert.deepEqual(read(), before, `${mode}: exact Shape Undo`)
    assert.equal(await api.redo(), true)
    assert.deepEqual(read(), applied, `${mode}: exact Shape Redo`)
    report.checks.push(
      `${mode}: option/padding readback, preserved text and exact Shape Undo/Redo (not render acceptance)`,
    )
  }

  const beforeRich = read()
  const rich = text.getRichText().copy()
  const runs = rich.getParagraphs().flatMap((paragraph) => paragraph.getTextRuns())
  assert.ok(runs.length)
  runs[0].setText('A substantially longer heading for the print studio')
  assert.deepEqual(read(), beforeRich, 'Detached rich-text edits must not mutate the live slide')
  history.clearUndoRedo(presentation.getId())
  text.setRichText(rich)
  assert.match(text.getPlainText(), /^A substantially longer heading/)
  assert.deepEqual(read().transform, beforeRich.transform)
  assert.equal(await api.undo(), true)
  assert.deepEqual(read(), beforeRich, 'Rich-text Undo restores complete prior Shape')
  report.checks.push('Detached rich-text builder stays detached; setRichText commits it and Undo restores exact data')

  for (const variant of ['emphasis', 'paragraphs', 'bullets']) {
    const before = read()
    history.clearUndoRedo(presentation.getId())
    applyRichCopy(api, shape, variant)
    const applied = read()
    assert.notDeepEqual(applied, before)
    assert.equal(
      text.getRichText().getParagraphs().length,
      variant === 'bullets' ? 3 : variant === 'paragraphs' ? 2 : 1,
    )
    const body = text.getRichText().getData().body
    if (variant === 'emphasis') {
      const emphasized = body.textRuns.find((run) => body.dataStream.slice(run.st, run.ed) === 'one small draft')
      assert.ok(emphasized, 'The specific emphasized phrase must be a native text run')
      assert.equal(emphasized.ts.bl, 1)
      assert.equal(emphasized.ts.fs, 28)
      assert.equal(emphasized.ts.cl.rgb, '#9A3412')
    } else if (variant === 'paragraphs') {
      assert.deepEqual(
        body.paragraphs.map((paragraph) => paragraph.paragraphStyle.horizontalAlign),
        [api.Enum.HorizontalAlign.LEFT, api.Enum.HorizontalAlign.RIGHT],
      )
    } else {
      assert.ok(
        body.paragraphs.every((paragraph) => paragraph.bullet?.listId === 'saffron-workshop-steps'),
        'Every item must use native list metadata, not a typed bullet character',
      )
    }
    assert.equal(await api.undo(), true)
    assert.deepEqual(read(), before, `${variant}: complete Shape Undo`)
    assert.equal(await api.redo(), true)
    assert.deepEqual(read(), applied, `${variant}: complete Shape Redo`)
    report.checks.push(`${variant}: shared action changes native rich text; exact Undo/Redo`)
  }

  for (const [name, action] of [
    ['replace text', () => replaceText(shape, 'A short Saffron invitation')],
    ['font size', () => setFontSize(shape, 18)],
    ['padding', () => setPadding(shape, 24)],
    ['wrapping', () => setWrapping(shape, ShapeTextWrapType.None)],
    ['autofit config only', () => setAutofit(shape, ShapeTextAutoFitType.NoAutoFit)],
  ]) {
    const before = read()
    history.clearUndoRedo(presentation.getId())
    action()
    const applied = read()
    assert.notDeepEqual(applied, before, `${name}: not a silent no-op`)
    assert.equal(await api.undo(), true)
    assert.deepEqual(read(), before, `${name}: full Shape Undo`)
    assert.equal(await api.redo(), true)
    assert.deepEqual(read(), applied, `${name}: full Shape Redo`)
    report.checks.push(`${name}: shared action and full-Shape Undo/Redo`)
  }
  for (const action of [
    () => replaceText(shape, 'x'.repeat(4001)),
    ...[-1, 0, 97, Number.NaN, Number.POSITIVE_INFINITY].map((value) => () => setFontSize(shape, value)),
    ...[-1, 49, Number.NaN].map((value) => () => setPadding(shape, value)),
    () => setAutofit(shape, 'missing'),
    () => setWrapping(shape, 'missing'),
    () => applyRichCopy(api, shape, 'missing'),
  ]) {
    const before = read()
    assert.throws(action)
    assert.deepEqual(read(), before, 'Invalid input preserves all Shape data')
  }
  report.checks.push('Twelve invalid shared-action inputs throw before modifying the Shape')
  assert.equal(createData('empty').slideOrder.length, 0)
  const fresh = createData()
  assert.deepEqual(fresh, createData(), 'Visual fixtures must be deterministic, including native rich-text IDs')
  const richBody = (id) => fresh.slides[id].elements[TARGET_ID].shapeData.shapeText.dataModel.doc.body
  assert.ok(richBody('welcome').textRuns.some((run) => run.ts.bl === 1 && run.ts.fs === 40))
  assert.ok(richBody('workshops').paragraphs.every((paragraph) => paragraph.bullet?.listId === 'saffron-assignments'))
  assert.deepEqual(
    richBody('invitation').paragraphs.map((paragraph) => paragraph.paragraphStyle.horizontalAlign),
    [api.Enum.HorizontalAlign.LEFT, api.Enum.HorizontalAlign.CENTER, api.Enum.HorizontalAlign.RIGHT],
  )
  report.checks.push('Initial slides contain native emphasis, lists and three alignments without host actions')
  assert.equal(fresh.slideOrder.length, 3)
  assert.equal(
    new Set(Object.values(fresh.slides).map((page) => page.elements[TARGET_ID].shapeData.shapeText.text)).size,
    3,
  )
  fresh.slides.welcome.elements[TARGET_ID].shapeData.shapeText.text = 'changed test snapshot'
  assert.notEqual(createData().slides.welcome.elements[TARGET_ID].shapeData.shapeText.text, 'changed test snapshot')
  assert.throws(() => createData('missing'))
  report.checks.push('Three distinct pages, detached fixtures, zero-page state and invalid fixture guard')
  report.passed = true
} catch (cause) {
  report.failure = cause.stack || String(cause)
} finally {
  univer.dispose()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
}
assert.ok(report.passed, report.failure)
