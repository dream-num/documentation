import type { FUniver } from '@univerjs/core/facade'

import '@univerjs-pro/pdfs/facade'

export function createTransformGallery(api: FUniver) {
  const pdf = api.createPdf({ id: 'pdf-object-transforms', name: 'Object rotation and layering' })
  const pages = [pdf.getPageByIndex(0)!, pdf.insertPage()]
  pages.forEach((page, i) => {
    page.insertTextBox({
      id: 'title-' + i,
      text: i ? 'Layers / same placement' : 'Rotation and reflection',
      left: 40,
      top: 36,
      width: 510,
      height: 50,
      fontFamily: 'Arial',
      fontSize: 25,
      fill: '#254B5A',
    })
    page.insertTextBox({
      id: 'hint-' + i,
      text: i ? 'Text in front of or behind a native divider.' : 'Every specimen retains the text: Gate B / 12',
      left: 40,
      top: 95,
      width: 510,
      height: 35,
      fontFamily: 'Arial',
      fontSize: 12,
      fill: '#60747C',
    })
  })
  const samples = [
    { id: 'original', label: 'Original / 0 degrees', left: 55, top: 190, rotation: 0, flipX: false, flipY: false },
    { id: 'rotated-30', label: 'Rotate / 30 degrees', left: 330, top: 190, rotation: 30, flipX: false, flipY: false },
    { id: 'rotated-90', label: 'Rotate / 90 degrees', left: 55, top: 390, rotation: 90, flipX: false, flipY: false },
    { id: 'flip-x', label: 'Reflect / horizontal', left: 330, top: 390, rotation: 0, flipX: true, flipY: false },
    { id: 'flip-y', label: 'Reflect / vertical', left: 55, top: 590, rotation: 0, flipX: false, flipY: true },
    { id: 'combined', label: 'Rotate 30 / reflect X', left: 330, top: 590, rotation: 30, flipX: true, flipY: false },
  ]
  for (const sample of samples) {
    const text = pages[0].insertTextBox({
      id: sample.id,
      text: 'Gate B / 12',
      left: sample.left,
      top: sample.top,
      width: 170,
      height: 50,
      fontFamily: 'Arial',
      fontSize: 22,
      fill: '#2F7877',
    })
    text.setTransform({ ...text.getTransform(), rotation: sample.rotation, flipX: sample.flipX, flipY: sample.flipY })
    pages[0].insertTextBox({
      id: sample.id + '-label',
      text: sample.label,
      left: sample.left - 10,
      top: sample.top + 110,
      width: 230,
      height: 35,
      fontFamily: 'Arial',
      fontSize: 11,
      fill: '#60747C',
    })
  }
  for (const [id, top, front] of [
    ['text-front', 220, true],
    ['divider-front', 440, false],
  ] as const) {
    pages[1].insertTextBox({
      id: id + '-label',
      text: front ? 'Text above divider' : 'Divider above text',
      left: 55,
      top: top - 55,
      width: 470,
      height: 35,
      fontFamily: 'Arial',
      fontSize: 14,
      fill: '#60747C',
    })
    const text = pages[1].insertTextBox({
      id,
      text: 'OPEN STUDIO / 24',
      left: 70,
      top,
      width: 440,
      height: 65,
      fontFamily: 'Arial',
      fontSize: 32,
      fill: '#254B5A',
    })
    pages[1].insertDivider({
      id: id + '-bar',
      left: 55,
      top: top + 22,
      width: 475,
      strokeColor: '#D9AB74',
      strokeWidth: 24,
    })
    if (front) text.bringToFront()
  }
  return pdf
}
