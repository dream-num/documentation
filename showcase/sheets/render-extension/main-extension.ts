import type { IScale } from '@univerjs/presets'
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/presets/preset-sheets-core'
import { DEFAULT_FONTFACE_PLANE, FIX_ONE_PIXEL_BLUR_OFFSET, getColor, MIDDLE_CELL_POS_MAGIC_NUMBER, SheetExtension } from '@univerjs/presets/preset-sheets-core'

const UNIQUE_KEY = 'MainCustomExtension'

// Show custom emojis on row headers
const customEmojiList = ['🍎', '🍌', '🍒', '🍓', '🍅', '🍆', '🍇', '🍈', '🍉', '🍊']

export default class MainCustomExtension extends SheetExtension {
  uKey = UNIQUE_KEY

  // Must be greater than 50
  get zIndex() {
    return 50
  }

  draw(ctx: UniverRenderingContext, _parentScale: IScale, spreadsheetSkeleton: SpreadsheetSkeleton) {
    const { rowColumnSegment } = spreadsheetSkeleton
    const { startRow, endRow, startColumn, endColumn } = rowColumnSegment

    if (!spreadsheetSkeleton) {
      return
    }

    const { rowHeightAccumulation, columnTotalWidth, columnWidthAccumulation, rowTotalHeight } = spreadsheetSkeleton

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

    for (let r = startRow - 1; r <= endRow; r++) {
      if (r < 0 || r > rowHeightAccumulation.length - 1) {
        continue
      }

      const rowEndPosition = rowHeightAccumulation[r]

      if (preRowPosition === rowEndPosition) {
        // Skip hidden rows
        continue
      }

      // Only draw customEmojiList.length rows
      if (r > customEmojiList.length - 1) {
        break
      }

      let preColumnPosition = 0

      for (let c = startColumn - 1; c <= endColumn; c++) {
        if (c < 0 || c > columnWidthAccumulation.length - 1) {
          continue
        }

        const columnEndPosition = columnWidthAccumulation[c]

        if (preColumnPosition === columnEndPosition) {
          // Skip hidden columns
          continue
        }

        // painting cell text
        const middleCellPosX = preColumnPosition + (columnEndPosition - preColumnPosition) / 2
        const middleCellPosY = preRowPosition + (rowEndPosition - preRowPosition) / 2
        customEmojiList[c] && ctx.fillText(customEmojiList[c], middleCellPosX + 20, middleCellPosY + MIDDLE_CELL_POS_MAGIC_NUMBER) // Magic number 1, because the vertical alignment appears to be off by 1 pixel
        preColumnPosition = columnEndPosition
      }

      preRowPosition = rowEndPosition
    }

    ctx.stroke()
  }
}
