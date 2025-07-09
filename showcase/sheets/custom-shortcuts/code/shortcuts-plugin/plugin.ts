import { IShortcutService } from '@univerjs/preset-sheets-core'
import { ICommandService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/presets'
import { CustomClearSelectionContentCommand } from './commands/custom.command'
import { CustomClearSelectionValueShortcutItem } from './controllers/custom.shortcut'

const SHEET_CUSTOM_SHORTCUT_PLUGIN = 'SHEET_CUSTOM_SHORTCUT_PLUGIN'

export class UniverSheetsCustomShortcutPlugin extends Plugin {
  static override type = UniverInstanceType.UNIVER_SHEET
  static override pluginName = SHEET_CUSTOM_SHORTCUT_PLUGIN

  constructor(
    @Inject(Injector) protected readonly _injector: Injector,
    @ICommandService private readonly _commandService: ICommandService,
    @IShortcutService private readonly _shortcutService: IShortcutService,
  ) {
    super()

    this._initCommands()
    this._initShortcuts()
  }

  private _initCommands() {
    [
      CustomClearSelectionContentCommand,
    ].forEach(command => this.disposeWithMe(this._commandService.registerCommand(command)))
  }

  private _initShortcuts() {
    [
      CustomClearSelectionValueShortcutItem,
    ].forEach(item => this.disposeWithMe(this._shortcutService.registerShortcut(item)))
  }
}
