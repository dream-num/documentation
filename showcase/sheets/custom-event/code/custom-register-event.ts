import type { FWorkbook, FWorksheet, IRemoveColByRangeCommandParams, IRender } from '@univerjs/preset-sheets-core'
import type { FUniver, IEventBase, Nullable, Univer } from '@univerjs/presets'
import {
  IContextMenuService,
  IRenderManagerService,
  RemoveColByRangeCommand,
  SHEET_VIEW_KEY,
} from '@univerjs/preset-sheets-core'
import {
  CanceledError,
  DisposableCollection,
  ICommandService,
  LifecycleService,
  LifecycleStages,
  UniverInstanceType,
} from '@univerjs/presets'
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
  // Register before createWorkbook(): renderManager.created$ is not replayed.
  const registrations = new DisposableCollection()
  registrations.add(registerMainRightClickEvent(univer, univerAPI))
  registrations.add(registerRemoveColumnEvent(univer, univerAPI))
  registrations.add(registerBeforeRemoveColumnEvent(univer, univerAPI))
  return registrations
}

function registerMainRightClickEvent(univer: Univer, univerAPI: FUniver) {
  const injector = univer.__getInjector()
  const renderManagerService = injector.get(IRenderManagerService)
  const lifeCycleService = injector.get(LifecycleService)
  const contextMenuService = injector.get(IContextMenuService)

  let sheetRenderUnit: Nullable<IRender>
  const combined$ = combineLatest([renderManagerService.created$, lifeCycleService.lifecycle$])
  const disposable = new DisposableCollection()
  const lifetime = new DisposableCollection()
  let disposed = false
  lifetime.add(() => {
    disposed = true
  })
  let pointer: { row: number; column: number; workbookId: string; sheetId: string } | undefined
  lifetime.add(
    univerAPI.addEvent(univerAPI.Event.CellPointerDown, (params) => {
      pointer = {
        row: params.row,
        column: params.column,
        workbookId: params.workbook.getId(),
        sheetId: params.worksheet.getSheetId(),
      }
    }),
  )
  let frame = 0
  let bindFrame = 0
  lifetime.add(() => cancelAnimationFrame(frame))
  lifetime.add(() => cancelAnimationFrame(bindFrame))
  lifetime.add(disposable)

  lifetime.add(
    combined$.subscribe(([created, lifecycle]) => {
      if (created.type === UniverInstanceType.UNIVER_SHEET) {
        sheetRenderUnit = created
      }
      if (lifecycle < LifecycleStages.Rendered) return
      if (!sheetRenderUnit) return
      // A reset creates a renderer while the application is already Steady.
      // Its render controllers finish attaching after created$ is emitted.
      cancelAnimationFrame(bindFrame)
      bindFrame = requestAnimationFrame(() => {
        if (!sheetRenderUnit) return
        const { components } = sheetRenderUnit
        const mainComponent = components.get(SHEET_VIEW_KEY.MAIN)
        if (!mainComponent) return

        const fWorkbook = univerAPI.getWorkbook(sheetRenderUnit.unitId)
        if (!fWorkbook) return

        disposable.dispose()

        disposable.add(
          univerAPI.registerEventHandler('MainRightClickEvent', () =>
            mainComponent.onPointerDown$.subscribeEvent((event) => {
              if (event.button !== 2) return
              // Sheet switches reattach native pointer observers. Read the Facade
              // hit-test result after all observers have handled this same event.
              queueMicrotask(() => {
                if (disposed) return
                // The clicked cell can differ from the top-left of a multi-cell selection.
                if (
                  !pointer ||
                  pointer.workbookId !== fWorkbook.getId() ||
                  pointer.sheetId !== fWorkbook.getActiveSheet()?.getSheetId()
                )
                  return
                const eventParams: IMainRightClickEventParams = {
                  event,
                  row: pointer.row,
                  column: pointer.column,
                }

                univerAPI.fireEvent('MainRightClickEvent', eventParams)

                // If the event is canceled, do not show the context menu
                if (eventParams.cancel) {
                  cancelAnimationFrame(frame)
                  frame = requestAnimationFrame(() => {
                    contextMenuService.hideContextMenu()
                  })
                }
              })
            }),
          ),
        )
      })
    }),
  )
  return lifetime
}

function registerRemoveColumnEvent(univer: Univer, univerAPI: FUniver) {
  const injector = univer.__getInjector()
  const commandService = injector.get(ICommandService)

  return univerAPI.registerEventHandler('RemoveColumnEvent', () =>
    commandService.onCommandExecuted((commandInfo) => {
      if (commandInfo.id !== RemoveColByRangeCommand.id) return

      const target = univerAPI.getSheetCommandTarget(commandInfo.params)
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

  return univerAPI.registerEventHandler('BeforeRemoveColumnEvent', () =>
    commandService.beforeCommandExecuted((commandInfo) => {
      if (commandInfo.id !== RemoveColByRangeCommand.id) return

      const target = univerAPI.getSheetCommandTarget(commandInfo.params)
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
  interface IEventParamConfig extends ICustomEventParamConfig {}
}
