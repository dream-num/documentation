import type { Dependency } from '@univerjs/core'
import { Inject, Injector, Plugin } from '@univerjs/core'
import { OTPlaygroundCollaborationStatusDisplayController } from './controllers/collab-status.controller'

export class OTPlaygroundPlugin extends Plugin {
  static override pluginName = 'UNIVER_COLLABORATION_PLAYGROUND_PLUGIN'

  constructor(
        @Inject(Injector) protected readonly _injector: Injector,
  ) {
    super()
  }

  override onStarting(): void {
    ([
      [OTPlaygroundCollaborationStatusDisplayController],
    ] as Dependency[]).forEach(d => this._injector.add(d))

    // initialize dependencies
    this._injector.get(OTPlaygroundCollaborationStatusDisplayController)
  }
}
