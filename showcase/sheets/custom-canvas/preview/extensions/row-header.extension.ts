import type { IScale } from '@univerjs/presets'
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/presets/preset-sheets-core'
import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, getColor, MIDDLE_CELL_POS_MAGIC_NUMBER, SheetExtension } from '@univerjs/presets/preset-sheets-core'

const UNIQUE_KEY = 'RowHeaderCustomExtension'

// Show custom emojis on row headers
const customEmojiList = ['🍎', '🍌', '🍒', '🍓', '🍅', '🍆', '🍇', '🍈', '🍉', '🍊']

export default class RowHeaderCustomExtension extends SheetExtension {
  uKey = UNIQUE_KEY

  // Must be greater than 10
  get zIndex() {
    return 11
  }

  draw(ctx: UniverRenderingContext, _parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
    const { rowColumnSegment, rowHeaderWidth = 0 } = spreadsheetSkeleton
    const { startRow, endRow } = rowColumnSegment
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

    ctx.fillStyle = getColor([248, 249, 250])
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = getColor([0, 0, 0])!
    ctx.beginPath()
    ctx.lineWidth = 1

    ctx.translateWithPrecisionRatio(FIX_ONE_PIXEL_BLUR_OFFSET, FIX_ONE_PIXEL_BLUR_OFFSET)

    ctx.strokeStyle = getColor([217, 217, 217])
    ctx.font = `13px ${DEFAULT_FONTFACE_PLANE}`
    let preRowPosition = 0
    const rowHeightAccumulationLength = rowHeightAccumulation.length
    for (let r = startRow - 1; r <= endRow; r++) {
      if (r < 0 || r > rowHeightAccumulationLength - 1) {
        continue
      }
      const rowEndPosition = rowHeightAccumulation[r]
      if (preRowPosition === rowEndPosition) {
        // Skip hidden rows
        continue
      }

      const middleCellPos = preRowPosition + (rowEndPosition - preRowPosition) / 2
      customEmojiList[r] && ctx.fillText(customEmojiList[r], rowHeaderWidth / 2 + 14, middleCellPos + MIDDLE_CELL_POS_MAGIC_NUMBER) // Magic number 1, because the vertical alignment appears to be off by 1 pixel.
      preRowPosition = rowEndPosition
    }
    ctx.stroke()
  }
}
