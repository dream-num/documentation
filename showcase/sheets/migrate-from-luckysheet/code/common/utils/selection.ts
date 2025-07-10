import type { IRange } from '@univerjs/presets'
import type { IRangeArray } from '../interface/selection'

export function rangeArrayToRanges(rangeArray: IRangeArray[]): IRange[] {
  return rangeArray.map((range) => {
    const startRow = range.row[0]
    const endRow = range.row[1]

    const startColumn = range.column[0]
    const endColumn = range.column[1]

    return {
      startRow,
      endRow,
      startColumn,
      endColumn,
    }
  })
}
