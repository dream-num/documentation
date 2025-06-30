import type { IShortcutItem } from '@univerjs/presets/preset-sheets-core'
import { KeyCode, whenSheetEditorFocused } from '@univerjs/presets/preset-sheets-core'
import { CustomClearSelectionContentCommand } from '../../commands/commands/custom.command'

export const CustomClearSelectionValueShortcutItem: IShortcutItem = {
  id: CustomClearSelectionContentCommand.id,
  // high priority to ensure it is checked first
  priority: 9999,
  // when focusing on any other input tag do not trigger this shortcut
  preconditions: whenSheetEditorFocused,
  binding: KeyCode.DELETE,
  mac: KeyCode.BACKSPACE,
}
