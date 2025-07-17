import type {
  ICombRequestEvent,
  ICombResponseEvent,
  IFetchingMissEvent,
  IPseudoFetchMissingResultEvent,
  IRecvResponseEvent,
  ISubmitChangesetEvent,
} from '@univerjs-pro/collaboration'
import type { ICollaborationSocket, ICollaborationSocketService } from '@univerjs-pro/collaboration-client'
import type { Nullable } from '@univerjs/core'
import type { Observable } from 'rxjs'
import { CollaborationEvent, ISnapshotServerService } from '@univerjs-pro/collaboration'
import {
  deserializeToCombResponse,
  serializeCombRequest,
} from '@univerjs-pro/collaboration-client'
import { BrowserCollaborationSocketService } from '@univerjs-pro/collaboration-client-ui'
import { DisposableCollection, IConfigService, ILogService, Inject, Injector, toDisposable } from '@univerjs/core'
import { HTTPService, ISocketService } from '@univerjs/network'
import { CmdRspCode, CombCmd } from '@univerjs/protocol'
import { BehaviorSubject, combineLatest, map, Subject } from 'rxjs'

/**
 * This service implements {@link ICollaborationSocketService} so testers can have a deep control on collaboration
 * system.
 */
export interface IManualCollaborationSocketService extends ICollaborationSocketService {
  socket$: Observable<Nullable<IManualCollaborationSocket>>
  manuallyUpdateNewChangesDisabled$: Observable<boolean>
  flushing$: Observable<boolean>

  createSocket: (url: string) => Promise<IManualCollaborationSocket>

  /**
   * Flush all messages to send or receive util there are empty for a while (2 seconds).
   */
  flush: () => void

  /**
   * Toggle auto flushing. If auto flushing is toggled on, it would be have like normal socket service and
   * testers doesn't need to manually send or receive messages.
   * @param enabled If auto flushing is enabled.
   */
  toggleAutoFlush: (enabled: boolean) => void
  /**
   * Toggle allowing sending changes. If it is turned off, the collaboration session would go offline
   * the next time it tries to send new changesets.
   * @param enabled If sending changeset is enabled.
   */
  toggleAllowingSendingNewChangesets: (enabled: boolean) => void
  /**
   * Toggle network connection.
   * @param enabled If the network connection is enabled.
   */
  toggleNetwork: (enabled: boolean) => void

  mockConflict: () => void
}

export interface IManualCollaborationSocket extends ICollaborationSocket {
  letSend: () => boolean
  letReceive: () => boolean

  pendingRequests$: Observable<ICombRequestEvent[]>
  pendingMessages$: Observable<ICombResponseEvent[]>
}

/**
 * This is the internal interface so {@link IManualCollaborationSocketService} can interact with the socket itself.
 */
interface IManualCollaborationSocketHandler extends IManualCollaborationSocket {
  flush: (setUpAutoResume: boolean) => void
  mockConflict: () => void
  terminate: () => boolean
}

/**
 * This socket service implementation is for manually testing collaboration in the playground.
 * It will connect to the collaboration server and join the room like the normal socket service does,
 * but it will not send any changesets or pass remote changeset to the collaboration session
 * util the tester manually tell it to do so.
 */
export class ManualCollaborationSocketService extends BrowserCollaborationSocketService implements IManualCollaborationSocketService {
  private readonly _socket$ = new BehaviorSubject<Nullable<IManualCollaborationSocketHandler>>(null)
  readonly socket$: Observable<Nullable<IManualCollaborationSocket>> = this._socket$.asObservable()
  private get _socket(): Nullable<IManualCollaborationSocketHandler> { return this._socket$.getValue() }

  constructor(
        @Inject(Injector) injector: Injector,
        @Inject(HTTPService) http: HTTPService,
        @IConfigService configService: IConfigService,
        @ILogService logService: ILogService,
        @ISnapshotServerService snapshotServerService: ISnapshotServerService,
  ) {
    super(injector, http, configService, logService, snapshotServerService)
  }

  override dispose(): void {
    super.dispose()

    this._socket$.complete()
    this._flushing$.complete()
  }

  enableNetwork(): void {
    this._manuallyNetworkDisabled = false
  }

  private readonly _tempFlushing$ = new BehaviorSubject<boolean>(false)
  private readonly _flushing$ = new BehaviorSubject<boolean>(false)
  private get _flushing(): boolean { return this._flushing$.getValue() }
  readonly flushing$ = combineLatest([this._tempFlushing$, this._flushing$]).pipe(map(v => v[0] || v[1]))
  toggleAutoFlush(enabled: boolean): void {
    this._flushing$.next(enabled)

    if (enabled && this._socket) {
      this._socket.flush(false)
    }
  }

  private readonly _manuallyUpdateNewChangesDisabled$ = new BehaviorSubject<boolean>(false)
  readonly manuallyUpdateNewChangesDisabled$ = this._manuallyUpdateNewChangesDisabled$.asObservable()
  get manuallyUpdateNewChangesDisabled(): boolean { return this._manuallyUpdateNewChangesDisabled$.getValue() }
  toggleAllowingSendingNewChangesets(enabled: boolean): void {
    this._manuallyUpdateNewChangesDisabled$.next(!enabled)
  }

  private _manuallyNetworkDisabled = false
  toggleNetwork(enabled: boolean): void {
    this._manuallyNetworkDisabled = !enabled

    if (!enabled && this._socket) {
      this._socket.terminate()
    }
  }

  mockConflict(): void {
    this._socket?.mockConflict()
  }

  flush(): void {
    this._socket?.flush(true)
  }

  override async createSocket(rawUrl: string): Promise<IManualCollaborationSocket> {
    const ticket = await this._getSessionTicket()
    const url = this._createSocketURL(rawUrl, ticket)
    const socket = this._doCreateSocket(url)

    return socket
  }

  override _doCreateSocket(URL: string): IManualCollaborationSocket {
    if (this._manuallyNetworkDisabled) throw new Error('[ManualCollaborationSocketService]: network is disabled!')

    // The socket is reused whatever the URL is.
    if (this._socket) return this._socket

    const webSocketService = this._injector.get(ISocketService)
    if (!webSocketService) throw new Error('[ManualCollaborationSocketService]: failed to get web socket factory!')

    const ws = webSocketService.createSocket(URL)
    if (!ws) throw new Error('[ManualCollaborationSocketService]: failed to create socket!')

    const disposables = new DisposableCollection()

    const closeSource$ = new Subject<Event>()
    disposables.add(toDisposable(ws.close$.subscribe(event => closeSource$.next(event))))
    disposables.add(toDisposable(() => closeSource$.complete()))

    const errorSource$ = new Subject<Event>()
    disposables.add(toDisposable(ws.error$.subscribe(event => errorSource$.next(event))))
    disposables.add(toDisposable(() => errorSource$.complete()))

    // eslint-disable-next-line ts/no-this-alias
    const service = this
    let socket: IManualCollaborationSocketHandler
    let temporarilyFlushing = false
    let backToQueueingModeTimer: number | null = null

    function resetQueueingTimer() {
      if (temporarilyFlushing) {
        if (backToQueueingModeTimer !== null) window.clearTimeout(backToQueueingModeTimer)

        backToQueueingModeTimer = window.setTimeout(() => {
          temporarilyFlushing = false
          service._tempFlushing$.next(false)
        }, 5000)
      }
    }

    /** This queue caches all messages from the collaboration server. */
    const queuedMessages: ICombResponseEvent[] = []
    const pendingMessages$ = new BehaviorSubject<ICombResponseEvent[]>(queuedMessages)
    const messageSource$ = new Subject<ICombResponseEvent>()
    disposables.add(ws.message$.subscribe((event: MessageEvent) => {
      const response = deserializeToCombResponse(event)
      if ((!service._flushing && !temporarilyFlushing) && shouldHold(response)) {
        queuedMessages.push(response)
        pendingMessages$.next(queuedMessages)

        resetQueueingTimer()
      } else {
        messageSource$.next(response)
      }
    }))
    disposables.add(toDisposable(() => messageSource$.complete()))

    const terminateWithError = () => {
      errorSource$.next(new Event('Connection error'))
      closeSource$.next(new Event('Connection error'))
      socket.close()
    }

    const terminateManually = () => {
      errorSource$.next(new Event('Manually terminated network'))
      closeSource$.next(new Event('Manually terminated network'))
      socket.close()
    }

    const sendQueue: ICombRequestEvent[] = []
    const pendingRequests$ = new BehaviorSubject<ICombRequestEvent[]>(sendQueue)
    const send = (event: ICombRequestEvent) => {
      if (event.cmd === CombCmd.INGEST) {
        if (event.data.eventID === CollaborationEvent.SUBMIT_CHANGESET) {
          if (this.manuallyUpdateNewChangesDisabled) {
            terminateWithError()
            return
          }

          this._submitChangeset(socket, event.data as ISubmitChangesetEvent).catch((error) => {
            this._logService.error(error)
            terminateWithError()
          })

          return
        }

        if (event.data.eventID === CollaborationEvent.FETCH_MISSING) {
          const collabEvent = event.data as IFetchingMissEvent
          this._fetchMissChangesets(collabEvent)
            .then((changesets) => {
              messageSource$.next({
                cmd: CombCmd.RECV,
                code: CmdRspCode.OK,
                routeKey: collabEvent.data.unitID,
                routeType: '',
                data: {
                  eventID: CollaborationEvent.PSEUDO_FETCH_MISSING_RESULT,
                  data: {
                    changesets,
                  },
                } as IPseudoFetchMissingResultEvent,
              } as IRecvResponseEvent)
            })
            .catch((error) => {
              this._logService.error(error)
              terminateWithError()
            })

          return
        }
      }

      ws.send(serializeCombRequest(event))
    }

    socket = {
      memberID: '',

      close$: closeSource$.asObservable(),
      error$: errorSource$.asObservable(),
      open$: ws.open$,
      message$: messageSource$.asObservable(),
      pendingMessages$,
      pendingRequests$,

      send: (event: ICombRequestEvent): void => {
        if ((!service._flushing && !temporarilyFlushing) && shouldHold(event)) {
          sendQueue.push(event)
          pendingRequests$.next(sendQueue)

          resetQueueingTimer()
        } else {
          send(event)
        }
      },
      close: () => {
        ws.close()
        disposables.dispose()

        this._socket$.next(null)
      },
      terminate: () => {
        this._manuallyNetworkDisabled = true
        terminateManually()
        return true
      },
      letReceive() {
        if (!queuedMessages.length) return false
        messageSource$.next(queuedMessages[0])
        queuedMessages.splice(0, 1)
        pendingMessages$.next(queuedMessages)
        return true
      },
      letSend() {
        if (!sendQueue.length) return false
        send(sendQueue[0])
        sendQueue.splice(0, 1)
        pendingRequests$.next(sendQueue)
        return true
      },
      flush(setUpAutoResume: boolean) {
        if (setUpAutoResume) {
          temporarilyFlushing = true
          service._tempFlushing$.next(true)
          resetQueueingTimer()
        }

        queuedMessages.forEach(m => messageSource$.next(m))
        pendingMessages$.next([])

        sendQueue.forEach(m => send(m))
        pendingRequests$.next([])
      },
      mockConflict(): boolean {
        const rejectedChangeset = sendQueue.find((event) => {
          return event.cmd === CombCmd.INGEST && event.data.eventID === CollaborationEvent.SUBMIT_CHANGESET
        })

        if (!rejectedChangeset) return false
        const data = rejectedChangeset.data as ISubmitChangesetEvent

        messageSource$.next({
          cmd: CombCmd.RECV,
          code: CmdRspCode.OK,
          routeKey: data.data.unitID,
          data: {
            eventID: CollaborationEvent.CHANGESET_REJ,
            data: {
              unitID: data.data.unitID,
              changeset: {
                baseRev: data.data.changeset.baseRev,
                // in mocking test we always assume the changeset conflict with the last one
                revision: data.data.changeset.baseRev - 1,
              },
            },
          },
        })

        return true
      },
    }

    this._socket$.next(socket)
    return socket
  }

  disableUpdateNewChanges(): void {
    this._manuallyUpdateNewChangesDisabled$.next(true)
  };

  enableUpdateNewChanges(): void {
    this._manuallyUpdateNewChangesDisabled$.next(false)
  };
}

function shouldHold(event: ICombRequestEvent | ICombResponseEvent): boolean {
  return (
    (event.cmd === CombCmd.INGEST || event.cmd === CombCmd.RECV)
    && event.data.eventID !== CollaborationEvent.USERS_ENTER
    && event.data.eventID !== CollaborationEvent.USERS_LEAVE
    && event.data.eventID !== CollaborationEvent.UPDATE_CURSOR
  )
}
