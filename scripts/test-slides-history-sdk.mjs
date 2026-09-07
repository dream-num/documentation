// Strict installed-SDK reproduction: no renderer, host widgets or patched packages.
import assert from 'node:assert/strict'

import { PageElementTypeEnum, UniverSlidesPlugin } from '@univerjs-pro/slides'
import { IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDrawingPlugin } from '@univerjs/drawing'

import { createData } from '../showcase/slides/slide-lifecycle/code/data.ts'

import '@univerjs-pro/slides/facade'

const univer = new Univer()
univer.registerPlugin(UniverDrawingPlugin)
univer.registerPlugin(UniverSlidesPlugin)
const api = FUniver.newAPI(univer)
try {
  const failures = []
  // Preserve the exact legacy Text regression after the visual demo moved to transparent Shapes.
  const legacy = createData('single')
  legacy.slides.welcome.elements.title = {
    id: 'title',
    type: PageElementTypeEnum.Text,
    text: 'Northlight / Museum after hours',
    textStyle: { fontSize: 34, color: '#233D49', bold: true },
    transform: { left: 85, top: 48, width: 900, height: 100, rotation: 0 },
  }
  const presentation = api.createPresentation(legacy)
  const slide = presentation.getActiveSlide()
  const original = structuredClone(slide.getData().elements.title)
  slide
    .getElementById('title')
    .setRichText(api.newRichText().span('Northlight / Revised title', { fontSize: 34, bold: true }))
  assert.equal(slide.getData().elements.title.text, 'Northlight / Revised title')
  univer.__getInjector().get(IUniverInstanceService).focusUnit(presentation.getId())
  assert.equal(await api.undo(), true)
  const undone = slide.getData().elements.title
  console.log(JSON.stringify({ original, undone }, null, 2))
  try {
    assert.deepEqual(undone.textData, original.textData)
    assert.deepEqual(JSON.parse(JSON.stringify(undone)), JSON.parse(JSON.stringify(original)))
  } catch {
    failures.push('Title Undo retains newly created rich text instead of restoring the original element')
  }
  api.disposeUnit(presentation.getId())
  const data = createData()
  data.id = 'northlight-history-selection'
  const second = api.createPresentation(data)
  second.setActiveSlide(second.getSlideById('atrium'))
  const clone = structuredClone(second.getActiveSlide().getData())
  clone.id = 'independent-copy'
  second.insertSlide(3, clone)
  assert.equal(second.getActiveSlide().getId(), clone.id)
  univer.__getInjector().get(IUniverInstanceService).focusUnit(second.getId())
  assert.equal(await api.undo(), true)
  assert.deepEqual(second.save().slideOrder, createData().slideOrder)
  const activeAfterUndo = second.getActiveSlide()?.getId()
  if (activeAfterUndo !== 'atrium')
    failures.push('Insertion Undo selects ' + activeAfterUndo + ' instead of the previously active atrium page')
  console.log(JSON.stringify({ activeAfterUndo, failures }, null, 2))
  assert.deepEqual(failures, [], 'Native history must restore both content and selection')
} finally {
  api.dispose()
}
