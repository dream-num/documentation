import type { CollaborationEntity } from '@univerjs-pro/collaboration-client'
import type { Nullable } from '@univerjs/core'
import type { Observable } from 'rxjs'
import { CollaborationController } from '@univerjs-pro/collaboration-client'
import { Disposable, Inject, Injector, IUniverInstanceService } from '@univerjs/core'
import { BuiltInUIPart, connectInjector, IUIPartsService } from '@univerjs/ui'
import { BehaviorSubject, of, switchMap } from 'rxjs'
import { OTPlaygroundCollaborationStatusDisplay } from '../views/collab-status/OtPlaygroundCollabStatus'

export class OTPlaygroundCollaborationStatusDisplayController extends Disposable {
  protected readonly _entity$ = new BehaviorSubject<Nullable<CollaborationEntity>>(null)

  constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @IUIPartsService private readonly _uiPartsService: IUIPartsService,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(CollaborationController) private readonly _collaborationController: CollaborationController,
  ) {
    super()

    this._initStatusComponent()
    this._initStatusListener()
  }

  protected _initStatusListener(): void {
    this.disposeWithMe(this._univerInstanceService.focused$
      .pipe(
        switchMap(() => {
          const focusedUnit = this._univerInstanceService.getFocusedUnit()
          if (focusedUnit) return this._collaborationController.getCollabEntity$(focusedUnit.getUnitId())
          return of(null)
        }),
      )
      .subscribe(entity => this._entity$.next(entity)))
  }

  protected _initStatusComponent(): void {
    this.disposeWithMe(this._uiPartsService.registerComponent(BuiltInUIPart.HEADER_MENU, () =>
      connectInjector(passProps({ entity$: this._entity$.asObservable() }), this._injector)))
  }
}

function passProps(props: { entity$: Observable<Nullable<CollaborationEntity>> }) {
  const { entity$ } = props
  return function ConnectedOnlineStatus() {
    return <OTPlaygroundCollaborationStatusDisplay entity$={entity$} />
  }
}
