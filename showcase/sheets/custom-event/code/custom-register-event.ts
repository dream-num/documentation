import type { FWorkbook, FWorksheet, IRemoveColByRangeCommandParams, IRender } from '@univerjs/preset-sheets-core'
import type { FUniver, IEventBase, Nullable, Univer } from '@univerjs/presets'
import { IContextMenuService, IRenderManagerService, RemoveColByRangeCommand, SHEET_VIEW_KEY } from '@univerjs/preset-sheets-core'
import { CanceledError, DisposableCollection, ICommandService, LifecycleService, LifecycleStages, UniverInstanceType } from '@univerjs/presets'
import { combineLatest } from 'rxjs'

interface IMainRightClickEventParams extends IEventBase {
  event: MouseEvent
  row?: number
  column?: number
}

interface IRemoveColumnEventParams extends IEventBase {
  workbook: FWorkbook
  worksheet: FWorksheet
  startColumn: number
  endColumn: number
}

interface IBeforeRemoveColumnEventParams extends IEventBase {
  workbook: FWorkbook
  worksheet: FWorksheet
  startColumn: number
  endColumn: number
}

interface ICustomEventParamConfig {
  MainRightClickEvent: IMainRightClickEventParams
  RemoveColumnEvent: IRemoveColumnEventParams
  BeforeRemoveColumnEvent: IBeforeRemoveColumnEventParams
}

export function customRegisterEvent(univer: Univer, univerAPI: FUniver) {
  registerMainRightClickEvent(univer, univerAPI)

  univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage === univerAPI.Enum.LifecycleStages.Steady) {
      registerRemoveColumnEvent(univer, univerAPI)
      registerBeforeRemoveColumnEvent(univer, univerAPI)

      univerAPI.addEvent('MainRightClickEvent', (params) => {
        const { row, column } = params
        console.warn(`Right clicked on cell at ${univerAPI.Util.tools.chatAtABC(column as number)}${row as number + 1}`)
        // If the cell is A1, do not show the context menu
        if (row === 0 && column === 0) {
          params.cancel = true
        }
      })

      univerAPI.addEvent('RemoveColumnEvent', (params) => {
        const { startColumn, endColumn } = params
        console.warn(`Removed columns from ${univerAPI.Util.tools.chatAtABC(startColumn)} to ${univerAPI.Util.tools.chatAtABC(endColumn)}`)
      })

      const beforeRemoveColumnEventDisposable = univerAPI.addEvent('BeforeRemoveColumnEvent', (params) => {
        const { startColumn, endColumn } = params
        console.warn(`Before removing columns from ${univerAPI.Util.tools.chatAtABC(startColumn)} to ${univerAPI.Util.tools.chatAtABC(endColumn)}`)
        // If the column to be deleted includes column C to E, prevent the deletion
        if (!(startColumn > 4 || endColumn < 2)) {
          params.cancel = true
          console.warn('Cannot delete column C to E')
        }
      })

      // Remove the BeforeRemoveColumnEvent listener after 10 seconds
      setTimeout(() => {
        beforeRemoveColumnEventDisposable.dispose()
        console.warn('BeforeRemoveColumnEvent listener has been removed, you can delete any columns now.')
      }, 10000)
    }
  })
}

function registerMainRightClickEvent(univer: Univer, univerAPI: FUniver) {
  const injector = univer.__getInjector()
  const renderManagerService = injector.get(IRenderManagerService)
  const lifeCycleService = injector.get(LifecycleService)
  const contextMenuService = injector.get(IContextMenuService)

  let sheetRenderUnit: Nullable<IRender>
  const combined$ = combineLatest([
    renderManagerService.created$,
    lifeCycleService.lifecycle$,
  ])
  const disposable = new DisposableCollection()

  univerAPI.disposeWithMe(combined$.subscribe(([created, lifecycle]) => {
    if (created.type === UniverInstanceType.UNIVER_SHEET) {
      sheetRenderUnit = created
    }
    if (lifecycle <= LifecycleStages.Rendered) return
    if (!sheetRenderUnit) return

    const { components } = sheetRenderUnit
    const mainComponent = components.get(SHEET_VIEW_KEY.MAIN)
    if (!mainComponent) return

    const fWorkbook = univerAPI.getWorkbook(sheetRenderUnit.unitId)
    if (!fWorkbook) return

    const fWorksheet = fWorkbook.getActiveSheet()
    if (!fWorksheet) return

    disposable.dispose()

    disposable.add(
      univerAPI.registerEventHandler(
        'MainRightClickEvent',
        () => mainComponent.onPointerDown$.subscribeEvent((event) => {
          if (event.button !== 2) return

          const activeRange = fWorksheet.getActiveRange()
          const eventParams: IMainRightClickEventParams = {
            event,
            row: activeRange?.getRow() ?? 0,
            column: activeRange?.getColumn() ?? 0,
          }

          univerAPI.fireEvent('MainRightClickEvent', eventParams)

          // If the event is canceled, do not show the context menu
          if (eventParams.cancel) {
            requestAnimationFrame(() => {
              contextMenuService.hideContextMenu()
            })
          }
        }),
      ),
    )

    univerAPI.disposeWithMe(disposable)
  }))
}

function registerRemoveColumnEvent(univer: Univer, univerAPI: FUniver) {
  const injector = univer.__getInjector()
  const commandService = injector.get(ICommandService)

  univerAPI.registerEventHandler(
    'RemoveColumnEvent',
    () => commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id !== RemoveColByRangeCommand.id) return

      const target = univerAPI.getCommandSheetTarget(commandInfo)
      if (!target) return

      const { range } = commandInfo.params as IRemoveColByRangeCommandParams
      const eventParams: IRemoveColumnEventParams = {
        workbook: target.workbook,
        worksheet: target.worksheet,
        startColumn: range.startColumn,
        endColumn: range.endColumn,
      }

      univerAPI.fireEvent('RemoveColumnEvent', eventParams)
    }),
  )
}

function registerBeforeRemoveColumnEvent(univer: Univer, univerAPI: FUniver) {
  const injector = univer.__getInjector()
  const commandService = injector.get(ICommandService)

  univerAPI.registerEventHandler(
    'BeforeRemoveColumnEvent',
    () => commandService.beforeCommandExecuted((commandInfo) => {
      if (commandInfo.id !== RemoveColByRangeCommand.id) return

      const target = univerAPI.getCommandSheetTarget(commandInfo)
      if (!target) return

      const { range } = commandInfo.params as IRemoveColByRangeCommandParams
      const eventParams: IBeforeRemoveColumnEventParams = {
        workbook: target.workbook,
        worksheet: target.worksheet,
        startColumn: range.startColumn,
        endColumn: range.endColumn,
      }

      univerAPI.fireEvent('BeforeRemoveColumnEvent', eventParams)

      if (eventParams.cancel) {
        throw new CanceledError()
      }
    }),
  )
}

declare module '@univerjs/presets' {
  interface IEventParamConfig extends ICustomEventParamConfig { }
}
