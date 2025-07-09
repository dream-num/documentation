import type { IAccessor, ICommand } from '@univerjs/presets'
import { ClearSelectionContentCommand, getSheetCommandTarget, SheetsSelectionsService } from '@univerjs/preset-sheets-core'
import { CommandType, ICommandService, IUniverInstanceService } from '@univerjs/presets'

/**
 * The command to clear content in current selected ranges.
 */
export const CustomClearSelectionContentCommand: ICommand = {
  id: 'sheet.command.custom-clear-selection-content',

  type: CommandType.COMMAND,

  handler: (accessor: IAccessor) => {
    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService))
    if (!target) return false

    const { unitId, subUnitId, worksheet } = target

    const selectionManagerService = accessor.get(SheetsSelectionsService)
    const range = selectionManagerService.getCurrentLastSelection()?.range
    if (!range) return false

    const commandService = accessor.get(ICommandService)
    const { startRow, endRow, startColumn, endColumn } = range
    const isSingleCell = startRow === endRow && startColumn === endColumn

    if (isSingleCell && startRow === 2 && startColumn === 2) {
      // If the range is cell C3, clear the entire row.
      return commandService.executeCommand(ClearSelectionContentCommand.id, {
        unitId,
        subUnitId,
        ranges: [
          {
            startRow,
            endRow,
            startColumn: 0,
            endColumn: worksheet.getMaxColumns() - 1,
          },
        ],
      })
    } else {
      // Clear the selected range.
      return commandService.executeCommand(ClearSelectionContentCommand.id, {
        unitId,
        subUnitId,
        ranges: [
          {
            startRow,
            endRow,
            startColumn,
            endColumn,
          },
        ],
      })
    }
  },
}
