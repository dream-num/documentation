import type { FShape } from '@univerjs-pro/engine-shape/facade'
import type { FUniver } from '@univerjs/core/facade'
import { ShapeTextAutoFitType, ShapeTextWrapType } from '@univerjs-pro/engine-shape'

// These same actions are intended for the live preview and the exported project.
// Each action performs one SDK mutation; native Undo retains its own semantics.
export function replaceText(shape: FShape, value: string) {
  if (value.length > 4000) throw new Error('Use at most 4,000 characters; the current text was not changed.')
  shape.getText().setText(value)
  if (shape.getText().getPlainText() !== value) throw new Error('The SDK did not retain the requested text.')
}

export function setFontSize(shape: FShape, value: number) {
  if (!Number.isFinite(value) || value < 8 || value > 96) throw new Error('Font size must be between 8 and 96 points.')
  shape.getText().setFontSize(value)
}

export function setAutofit(shape: FShape, mode: string) {
  if (!Object.values(ShapeTextAutoFitType).includes(mode as ShapeTextAutoFitType))
    throw new Error('Unknown autofit mode; no change was made.')
  shape.getText().setTextBoxOptions({ autoFitType: mode as ShapeTextAutoFitType })
  if (shape.getText().getTextBoxOptions().autoFitType !== mode)
    throw new Error('The SDK did not retain the requested autofit mode.')
  return 'Mode stored. This is not proof of fitting: beta.2 programmatic shrink/grow failed the retained renderer checks.'
}

export function setWrapping(shape: FShape, wrap: string) {
  if (!Object.values(ShapeTextWrapType).includes(wrap as ShapeTextWrapType))
    throw new Error('Unknown wrapping mode; no change was made.')
  shape.getText().setTextBoxOptions({ textWrap: wrap as ShapeTextWrapType })
  if (shape.getText().getTextBoxOptions().textWrap !== wrap)
    throw new Error('The SDK did not retain the requested wrapping mode.')
}

export function setPadding(shape: FShape, value: number) {
  if (!Number.isFinite(value) || value < 0 || value > 48) throw new Error('Padding must be between 0 and 48.')
  shape.getText().setTextBoxOptions({ padding: { left: value, right: value, top: value, bottom: value } })
}

export function applyRichCopy(api: FUniver, shape: FShape, variant: 'emphasis' | 'paragraphs' | 'bullets') {
  const rich = api.newRichText()
  if (variant === 'emphasis') {
    rich
      .text('Start with ')
      .span('one small draft', { bold: true, color: '#9A3412', fontSize: 28 })
      .text(', then share a technique.')
  } else if (variant === 'paragraphs') {
    rich
      .paragraph({ align: api.Enum.HorizontalAlign.LEFT, spaceAfter: 14 })
      .text('A draft is a starting point, not a test.')
      .paragraph({ align: api.Enum.HorizontalAlign.RIGHT, spaceBefore: 8 })
      .text('Leave a useful note for the next maker.')
  } else if (variant === 'bullets') {
    rich
      .listItem('Choose a tool', { listId: 'saffron-workshop-steps' })
      .listItem('Make one trial print', { listId: 'saffron-workshop-steps' })
      .listItem('Share what changed', { listId: 'saffron-workshop-steps' })
  } else throw new Error('Unknown rich-text example; no change was made.')
  shape.getText().setRichText(rich)
}
