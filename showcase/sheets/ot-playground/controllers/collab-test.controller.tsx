import type { ICommandInfo, Injector, IWorkbookData } from '@univerjs/core'
import type { IManualCollaborationSocketService } from '../services/manual-collaboration-socket.service'
import { ICollaborationSocketService } from '@univerjs-pro/collaboration-client'
import { ActionReplayService } from '@univerjs/action-recorder'
import { awaitTime, Disposable, IResourceLoaderService, IUniverInstanceService } from '@univerjs/core'
import { ILocalFileService } from '@univerjs/ui'
import deepEqual from 'deep-equal'
import { dehydrateWorkbookDataForComparison } from './util'

// NOTE: this interface is copied to `e2e/collab/e2e.d.ts`. When you modify this interface, make sure
// the duplication is updated as well.
export interface ICollabE2EControllerAPI {
  replayCommandsAndGetSnapshots: (
    commandsAlice: ICommandInfo[],
    commandsBob: ICommandInfo[]
  ) => Promise<false | undefined | [object, object]>
}

declare global {

  interface Window {
    CollabE2EControllerAPI?: ICollabE2EControllerAPI
  }
}

/**
 * This controller provides methods to test collaboration consistency when there are two clients.
 */
export class CollabTestController extends Disposable {
  private _injectorAlice: Injector | null = null
  private _injectorBob: Injector | null = null

  constructor(
        @ILocalFileService private readonly _localFileService: ILocalFileService,
  ) {
    super()

    window.CollabE2EControllerAPI = {
      replayCommandsAndGetSnapshots: (commandsAlice: ICommandInfo[], commandsBob: ICommandInfo[]) =>
        this.replayCommandsAndGetSnapshots(commandsAlice, commandsBob),
    }
  }

  override dispose(): void {
    super.dispose()

    window.CollabE2EControllerAPI = undefined
  }

  setInjectorAlice(injector: Injector): void { this._injectorAlice = injector }
  setInjectorBob(injector: Injector): void { this._injectorBob = injector }

  async replayCommandsFromLocalAndCompare(onStartedReplaying?: () => void): Promise<boolean | void> {
    const result = await this.replayCommandsFromLocalAndGetSnapshots(onStartedReplaying)
    if (typeof result === 'boolean' || typeof result === 'undefined') {
      return result
    }

    const [snapshotAlice, snapshotBob] = result
    const equal = deepEqual(snapshotAlice, snapshotBob)
    return equal
  }

  async replayCommandsAndGetSnapshots(
    commandsAlice: ICommandInfo[],
    commandsBob: ICommandInfo[],
  ): Promise<false | undefined | [object, object]> {
    if (!this._injectorAlice || !this._injectorBob) {
      throw new Error('[OTPlaygroundCollabTestController]: injectorAlice or injectorBob is not set')
    }

    const replayServiceAlice = this._injectorAlice.get(ActionReplayService)
    const replayServiceBob = this._injectorBob.get(ActionReplayService)

    toggleFlushing(this._injectorAlice, true)
    toggleFlushing(this._injectorBob, true)

    const [resultAlice, resultBob] = await Promise.all([
      replayServiceAlice.replayCommandsWithDelay(commandsAlice),
      replayServiceBob.replayCommandsWithDelay(commandsBob),
    ])

    if (!resultAlice || !resultBob) {
      return false
    }

    await awaitTime(5_000)

    toggleFlushing(this._injectorAlice, false)
    toggleFlushing(this._injectorBob, false)

    const snapshotAlice = getCurrentUnitSnapshot(this._injectorAlice)!
    const snapshotBob = getCurrentUnitSnapshot(this._injectorBob)!

    dehydrateWorkbookDataForComparison(snapshotAlice as IWorkbookData)
    dehydrateWorkbookDataForComparison(snapshotBob as IWorkbookData)

    return [snapshotAlice, snapshotBob]
  }

  async replayCommandsFromLocalAndGetSnapshots(onStartedReplaying?: () => void): Promise<false | undefined | [object, object]> {
    const files = await this._localFileService.openFile({ multiple: true, accept: '.json' })
    if (files.length === 0) return
    if (files.length !== 2) {
      // eslint-disable-next-line no-alert
      window.alert('You should select 2 files for replaying commands.')
      return
    }

    onStartedReplaying?.()

    const [commandsAlice, commandsBob] = await Promise.all(files.map(async file => JSON.parse(await file.text())))
    return this.replayCommandsAndGetSnapshots(commandsAlice, commandsBob)
  }
}

function getCurrentUnitSnapshot(injector: Injector) {
  const instanceService = injector.get(IUniverInstanceService)
  const loaderService = injector.get(IResourceLoaderService)
  return loaderService.saveUnit(instanceService.getFocusedUnit()!.getUnitId())
}

function toggleFlushing(injector: Injector, flushing: boolean): void {
  const manualCollabSocketService = injector.get<ICollaborationSocketService>(ICollaborationSocketService) as IManualCollaborationSocketService
  manualCollabSocketService.toggleAutoFlush(flushing)
}
