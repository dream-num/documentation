import type { IScale } from '@univerjs/presets'
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/presets/preset-sheets-core'
import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, getColor, SheetExtension } from '@univerjs/presets/preset-sheets-core'

const UNIQUE_KEY = 'ColumnHeaderCustomExtension'

// Show custom emojis on column headers
const customEmojiList = ['🍎', '🍌', '🍒', '🍓', '🍅', '🍆', '🍇', '🍈', '🍉', '🍊']

export default class ColumnHeaderCustomExtension extends SheetExtension {
  uKey = UNIQUE_KEY

  // Must be greater than 10
  get zIndex() {
    return 11
  }

  draw(ctx: UniverRenderingContext, _parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
    const { rowColumnSegment, columnHeaderHeight = 0 } = spreadsheetSkeleton
    const { startColumn, endColumn } = rowColumnSegment

    if (!spreadsheetSkeleton) {
      return
    }

    const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight }
            = spreadsheetSkeleton

    if (
      !rowHeightAccumulation
      || !columnWidthAccumulation
      || columnTotalWidth === undefined
      || rowTotalHeight === undefined
    ) {
      return
    }
    // painting background
    ctx.fillStyle = getColor([248, 249, 250])

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = getColor([0, 0, 0])
    ctx.beginPath()
    ctx.lineWidth = 1

    ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET)

    ctx.strokeStyle = getColor([217, 217, 217])
    ctx.font = `13px ${DEFAULT_FONTFACE_PLANE}`
    let preColumnPosition = 0
    const columnWidthAccumulationLength = columnWidthAccumulation.length
    for (let c = startColumn - 1; c <= endColumn; c++) {
      if (c < 0 || c > columnWidthAccumulationLength - 1) {
        continue
      }

      const columnEndPosition = columnWidthAccumulation[c]
      if (preColumnPosition === columnEndPosition) {
        // Skip hidden columns
        continue
      }

      // painting column header text
      const middleCellPos = preColumnPosition + (columnEndPosition - preColumnPosition) / 2
      customEmojiList[c] && ctx.fillText(customEmojiList[c], middleCellPos + 20, columnHeaderHeight / 2) // Magic number 1, because the vertical alignment appears to be off by 1 pixel
      preColumnPosition = columnEndPosition
    }

    ctx.stroke()
  }
}
