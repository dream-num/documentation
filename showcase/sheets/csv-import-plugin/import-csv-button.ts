import type { ICellData, ICommand, Workbook } from '@univerjs/presets'
import { FolderSingle } from '@univerjs/icons'
import {
  CommandType,
  ICommandService,
  Inject,
  Injector,
  IUniverInstanceService,
  Plugin,
  UniverInstanceType,
} from '@univerjs/presets'
import {
  ComponentManager,
  IMenuManagerService,
  MenuItemType,
  RibbonStartGroup,
  SetRangeValuesCommand,
} from '@univerjs/presets/preset-sheets-core'

/**
 * wait user select csv file
 */
function waitUserSelectCSVFile(onSelect: (data: {
  data: string[][]
  colsCount: number
  rowsCount: number
}) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv'
  input.click()

  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result
      if (typeof text !== 'string') return

      // tip: use npm package to parse csv
      const rows = text.split(/\r\n|\n/)
      const data = rows.map(line => line.split(','))

      const colsCount = data.reduce((max, row) => Math.max(max, row.length), 0)

      onSelect({
        data,
        colsCount,
        rowsCount: data.length,
      })
    }
    reader.readAsText(file)
  }
}

/**
 * parse csv to univer data
 * @param csv
 * @returns { v: string }[][]
 */
function parseCSV2UniverData(csv: string[][]): ICellData[][] {
  return csv.map((row) => {
    return row.map((cell) => {
      return {
        v: cell || '',
      }
    })
  })
}

/**
 * Import CSV Button Plugin
 * A simple Plugin example, show how to write a plugin.
 */
class ImportCSVButtonPlugin extends Plugin {
  static pluginName = 'import-csv-plugin'

  constructor(
    _config: null,
    // inject injector, required
    @Inject(Injector) readonly _injector: Injector,
    // inject menu service, to add toolbar button
    @Inject(IMenuManagerService) private readonly menuManagerService: IMenuManagerService,
    // inject command service, to register command handler
    @Inject(ICommandService) private readonly commandService: ICommandService,
    // inject component manager, to register icon component
    @Inject(ComponentManager) private readonly componentManager: ComponentManager,
  ) {
    super()
  }

  /**
   * The first lifecycle of the plugin mounted on the Univer instance,
   * the Univer business instance has not been created at this time.
   * The plugin should add its own module to the dependency injection system at this lifecycle.
   * It is not recommended to initialize the internal module of the plugin outside this lifecycle.
   */
  onStarting() {
    // register icon component
    this.componentManager.register('FolderSingle', FolderSingle)

    const buttonId = 'import-csv-button'

    const command: ICommand = {
      type: CommandType.OPERATION,
      id: buttonId,
      handler: (accessor) => {
        // inject univer instance service
        const univer = accessor.get(IUniverInstanceService)
        const commandService = accessor.get(ICommandService)

        // get current sheet
        const sheet = univer.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()
        // wait user select csv file
        waitUserSelectCSVFile(({ data, rowsCount, colsCount }) => {
          // set sheet size
          sheet.setColumnCount(colsCount)
          sheet.setRowCount(rowsCount)

          // set sheet data
          commandService.executeCommand(SetRangeValuesCommand.id, {
            range: {
              startColumn: 0, // start column index
              startRow: 0, // start row index
              endColumn: colsCount - 1, // end column index
              endRow: rowsCount - 1, // end row index
            },
            value: parseCSV2UniverData(data),
          })
        })
        return true
      },
    }

    const menuItemFactory = () => ({
      id: buttonId,
      title: 'Import CSV',
      tooltip: 'Import CSV',
      icon: 'FolderSingle', // icon name
      type: MenuItemType.BUTTON,
    })

    this.menuManagerService.mergeMenu({
      [RibbonStartGroup.OTHERS]: {
        [buttonId]: {
          order: 10,
          menuItemFactory,
        },
      },
    })

    this.commandService.registerCommand(command)
  }
}

export default ImportCSVButtonPlugin
