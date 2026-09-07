// Strict reproduction of beta.2 cross-type update history, without host UI or renderer.
import assert from 'node:assert/strict'
import process from 'node:process'
import { isDeepStrictEqual } from 'node:util'

import { UniverSlidesPlugin, UpdateSlideDrawingCommand } from '@univerjs-pro/slides'
import { IUniverInstanceService, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { UniverDrawingPlugin } from '@univerjs/drawing'

import { PRODUCT_LAUNCH_MEDIA_DATA } from '../showcase/slides/product-launch/code/data.ts'

import '@univerjs-pro/slides/facade'

const univer = new Univer()
univer.registerPlugin(UniverDrawingPlugin)
univer.registerPlugin(UniverSlidesPlugin)
const api = FUniver.newAPI(univer)
const mode = process.argv[2] ?? 'cross-type'
assert.ok(['cross-type', 'delete-order'].includes(mode))
try {
  const presentation = api.createPresentation(structuredClone(PRODUCT_LAUNCH_MEDIA_DATA))
  const unitId = presentation.getId()
  const before = structuredClone(presentation.save().slides.closing.elements['launch-media'])
  const beforeOrder = [...presentation.save().slides.closing.elementOrder]
  if (mode === 'delete-order') {
    const slide = presentation.getSlideById('closing')
    assert.equal(slide.deleteElement(slide.getElementById('launch-media')), true)
  } else {
    assert.equal(
      api.syncExecuteCommand(UpdateSlideDrawingCommand.id, {
        patches: [
          {
            unitId,
            subUnitId: 'closing',
            drawingId: 'launch-media',
            element: {
              id: 'launch-media',
              type: 'image',
              source: 'data:image/png;base64,AA==',
              imageSourceType: 'BASE64',
              transform: before.transform,
            },
          },
        ],
      }),
      true,
    )
  }
  univer.__getInjector().get(IUniverInstanceService).focusUnit(unitId)
  assert.equal(await api.undo(), true)
  const after = presentation.save().slides.closing.elements['launch-media']
  console.log(
    JSON.stringify({
      restoredType: after.type,
      retainedImageSource: 'source' in after,
      retainedSourceType: 'imageSourceType' in after,
      beforeOrder,
      afterOrder: presentation.save().slides.closing.elementOrder,
    }),
  )
  assert.equal(
    isDeepStrictEqual(after, before) && isDeepStrictEqual(presentation.save().slides.closing.elementOrder, beforeOrder),
    true,
    'Undo must restore the exact Shape without retained image fields and at its original stacking index',
  )
} finally {
  api.dispose()
}
