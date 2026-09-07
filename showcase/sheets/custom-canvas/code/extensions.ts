import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/preset-sheets-core'
import type { IScale } from '@univerjs/presets'
import { SheetExtension } from '@univerjs/preset-sheets-core'

export type RenderMode = 'bar' | 'dots'
export type RenderArea = 'main' | 'row' | 'column'
export interface RenderInput {
  active: boolean
  values: unknown[]
  mode: RenderMode
}

// Cumulative geometry is indexed directly: starting in the middle of a scrolled sheet must not restart at zero.
export function band(accumulation: number[], index: number): [number, number] {
  return [index === 0 ? 0 : accumulation[index - 1], accumulation[index]]
}
export function progress(value: unknown): { kind: 'empty' | 'invalid' | 'value'; ratio: number; color: string } {
  if (value == null || value === '') return { kind: 'empty', ratio: 0, color: '#64748b' }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 100)
    return { kind: 'invalid', ratio: 0, color: '#e11d48' }
  return { kind: 'value', ratio: value / 100, color: value >= 70 ? '#0d9488' : value >= 40 ? '#d97706' : '#be123c' }
}

// One drawing implementation, registered separately in the SDK's three rendering areas.
export class SeedCanvasExtension extends SheetExtension {
  constructor(
    private readonly area: RenderArea,
    private readonly read: () => RenderInput,
  ) {
    super()
    this.uKey = 'mossbrook-' + area
  }
  override get zIndex() {
    return this.area === 'main' ? 60 : 11
  }

  override draw(ctx: UniverRenderingContext, _scale: IScale, skeleton: SpreadsheetSkeleton) {
    const data = this.read()
    if (!data.active) return
    const { rowColumnSegment: visible, rowHeightAccumulation: rows, columnWidthAccumulation: columns } = skeleton
    if (!rows.length || !columns.length) return
    ctx.save()
    try {
      if (this.area === 'column') {
        if (visible.startColumn > 2 || visible.endColumn < 2) return
        const [left, right] = band(columns, 2)
        if (right <= left) return
        ctx.fillStyle = '#7c3aed'
        ctx.fillRect(left + 2, (skeleton.columnHeaderHeight ?? 20) - 4, Math.max(0, right - left - 4), 3)
        return
      }
      for (let row = Math.max(3, visible.startRow); row <= Math.min(26, visible.endRow); row++) {
        const [top, bottom] = band(rows, row)
        if (bottom <= top) continue
        const state = progress(data.values[row - 3])
        if (this.area === 'row') {
          ctx.fillStyle = state.color
          ctx.fillRect(2, top + 3, 3, Math.max(0, bottom - top - 6))
          continue
        }
        if (visible.startColumn > 2 || visible.endColumn < 2) continue
        const [left, right] = band(columns, 2)
        const width = right - left - 12
        if (width <= 0 || bottom - top < 14) continue
        ctx.save()
        ctx.beginPath()
        ctx.rect(left + 1, top + 1, right - left - 2, bottom - top - 2)
        ctx.clip()
        const y = bottom - 6
        ctx.fillStyle = '#cbd5e1'
        ctx.fillRect(left + 6, y, width, 5)
        ctx.fillStyle = state.color
        if (state.kind === 'invalid') {
          ctx.fillRect(left + 6, y, 5, 5)
          ctx.fillRect(left + 14, y, 5, 5)
        } else if (state.kind === 'empty') {
          ctx.fillRect(left + 6, y + 2, 9, 1)
        } else if (data.mode === 'bar') {
          ctx.fillRect(left + 6, y, width * state.ratio, 5)
        } else {
          ctx.fillStyle = '#7c3aed'
          for (let dot = 0; dot < Math.round(state.ratio * 10); dot++) {
            ctx.beginPath()
            ctx.arc(left + 6 + ((dot + 0.5) * width) / 10, y + 2.5, Math.min(2.5, width / 25), 0, Math.PI * 2)
            ctx.fill()
          }
        }
        ctx.restore()
      }
    } finally {
      ctx.restore()
    }
  }
}
