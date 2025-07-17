import type { CollaborationEntity } from '@univerjs-pro/collaboration-client'
import type { Nullable } from '@univerjs/core'
import type { Observable } from 'rxjs'
import type { IManualCollaborationSocket, IManualCollaborationSocketService } from '../../services/manual-collaboration-socket.service'
import { CollaborationSessionService, CollaborationStatus, ICollaborationSocketService } from '@univerjs-pro/collaboration-client'
import { Button, clsx, Tooltip } from '@univerjs/design'
import { OffLineIcon, OnLineIcon } from '@univerjs/icons'
import { useDependency, useObservable } from '@univerjs/ui'
import { useCallback, useMemo } from 'react'
import { of, switchMap } from 'rxjs'

export interface IOTPlaygroundCollaborationStatusDisplayProps {
  entity$: Observable<Nullable<CollaborationEntity>>
}

function mapStatusToDisplayText(status: CollaborationStatus): string {
  switch (status) {
    case CollaborationStatus.OFFLINE:
      return 'Offline'
    case CollaborationStatus.CONFLICT:
      return 'Conflict'
    case CollaborationStatus.FETCH_MISS:
      return 'Fetching Miss'
    case CollaborationStatus.NOT_COLLAB:
      return 'Not Collaborating'
    case CollaborationStatus.PENDING:
      return 'Pending'
    case CollaborationStatus.AWAITING:
      return 'Awaiting'
    case CollaborationStatus.AWAITING_WITH_PENDING:
      return 'Awaiting with Pending'
    case CollaborationStatus.SYNCED:
      return 'Synced'
  }
}

export function OTPlaygroundCollaborationStatusDisplay(props: Readonly<IOTPlaygroundCollaborationStatusDisplayProps>) {
  const { entity$ } = props

  const sessionService = useDependency(CollaborationSessionService)
  const socketService = useDependency(ICollaborationSocketService) as IManualCollaborationSocketService
  const socket = useObservable(sessionService.socket$, null, false) as Nullable<IManualCollaborationSocket>

  const status$ = useMemo(() => {
    return entity$.pipe(
      switchMap((entityOrNull) => {
        if (entityOrNull) return entityOrNull.status$
        return of(CollaborationStatus.NOT_COLLAB)
      }),
    )
  }, [entity$])
  const status = useObservable(() => status$, CollaborationStatus.NOT_COLLAB, true, [status$])
  const title = mapStatusToDisplayText(status)

  const online = status !== CollaborationStatus.OFFLINE

  const icon = online ? <OnLineIcon /> : <OffLineIcon />
  const toggleOnline = useCallback(() => {
    // toggle online and offline
    if (online && socket) {
      socketService.toggleNetwork(false)
    } else {
      socketService.toggleNetwork(true)
      sessionService.reconnect()
    }
  }, [online, sessionService, socketService, socket])

  const manuallyUpdateNewChangesDisabled = useObservable(socketService.manuallyUpdateNewChangesDisabled$)
  const toggleUpdateNewChangesDisabled = useCallback(() => {
    socketService.toggleAllowingSendingNewChangesets(!manuallyUpdateNewChangesDisabled)
  }, [manuallyUpdateNewChangesDisabled, socketService])

  const allowConflict = status === CollaborationStatus.AWAITING || status === CollaborationStatus.AWAITING_WITH_PENDING
  const mockConflict = useCallback(() => {
    socketService.mockConflict()
  }, [socketService])

  const flushing = useObservable(socketService.flushing$)

  const flush = useCallback(() => {
    if (!flushing) socketService.flush()
  }, [socketService, flushing])

  return (
    <>
      <Button variant="text" onClick={flush} disabled={flushing}>
        ⚡️
        {' '}
        {flushing ? 'Flushing...' : 'Flush' }
      </Button>
      <Button variant="text" onClick={mockConflict} disabled={!allowConflict}>
        <Tooltip
          title='Mock a conflicting error. It is only applicable when the state is on of "Awaiting" and "Awaiting with Pending"'
        >
          <span>
            💀 Mock Conflict
          </span>
        </Tooltip>
      </Button>
      <Button variant="text" onClick={toggleUpdateNewChangesDisabled}>
        <Tooltip title='This would simulate sending "new_changes" with error.'>
          <span>
            {manuallyUpdateNewChangesDisabled ? '🔑 Enable Update New Changes' : '🔒 Disable Update New Changes'}
          </span>
        </Tooltip>
      </Button>
      <Button variant="text" onClick={toggleOnline}>
        {online ? '🏁 Go Offline' : '🚥 Go Online'}
      </Button>
      <div>
        {/* buttons to toggle online and offline */}
        <div
          className={clsx('univer-mr-2 univer-flex univer-text-xl', {
            'univer-text-green-500': online,
            'univer-text-red-500': !online,
          })}
        >
          {icon}
        </div>
        <div
          className={`
            univer-text-sm/8 univer-text-gray-600
            dark:!univer-text-gray-200
          `}
        >
          {title}
        </div>
      </div>
    </>
  )
}
