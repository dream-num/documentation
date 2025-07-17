import type {
  ICollaborationEvent,
  ICombRequestEvent,
  ICombResponseEvent,
  IIngestQuestEvent,
  INewChangesetsEvent,
  IRecvResponseEvent,
  ISubmitChangesetEvent,
} from '@univerjs-pro/collaboration'
import type { Injector } from '@univerjs/core'
import type { IManualCollaborationSocket, IManualCollaborationSocketService } from '../../services/manual-collaboration-socket.service'
import { animated, useSpring } from '@react-spring/web'
import { ICollaborationSocketService } from '@univerjs-pro/collaboration-client'
import { Tools } from '@univerjs/core'
import { Button, MessageType } from '@univerjs/design'
import { MoreDownIcon, MoreUpIcon } from '@univerjs/icons'
import { IMessageService, useDependency, useObservable } from '@univerjs/ui'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CollabTestController } from '../../controllers/collab-test.controller'
import './index.css'

export interface ICollaborationPanelProps {
  injectorAlice: Injector
  injectorBob: Injector
}

/**
 * This component is for testers to control the collaboration sending & receiving.
 */
export function CollaborationControlPanel(props: ICollaborationPanelProps) {
  const { injectorAlice, injectorBob } = props

  const playgroundCollabTestController = useDependency(CollabTestController)
  const messageService = useDependency(IMessageService)

  const socketServiceAlice = useMemo(() => injectorAlice.get(ICollaborationSocketService), [injectorAlice]) as IManualCollaborationSocketService
  const socketServiceBob = useMemo(() => injectorBob.get(ICollaborationSocketService), [injectorBob]) as IManualCollaborationSocketService

  const socketAlice = useObservable(socketServiceAlice.socket$)
  const socketBob = useObservable(socketServiceBob.socket$)

  const flushingAlice = useObservable(socketServiceAlice.flushing$)
  const flushingBob = useObservable(socketServiceBob.flushing$)
  const flushing = flushingAlice || flushingBob

  const flush = useCallback(() => {
    socketServiceAlice.flush()
    socketServiceBob.flush()
  }, [socketServiceAlice, socketServiceBob])

  const toggleFlushing = useCallback((forceEnabled?: boolean) => {
    const enabled = forceEnabled ?? !(flushingAlice || flushingBob)
    socketServiceAlice.toggleAutoFlush(enabled)
    socketServiceBob.toggleAutoFlush(enabled)
  }, [socketServiceAlice, socketServiceBob, flushingAlice, flushingBob])

  const replayCommandsFromLocal = useCallback(async () => {
    toggleFlushing(true)

    const equal = await playgroundCollabTestController.replayCommandsFromLocalAndCompare(() => {
      messageService.show({ type: MessageType.Loading, content: 'Replaying commands' })
    })

    toggleFlushing(false)

    if (!equal) {
      messageService.show({ type: MessageType.Error, content: 'Two snapshots do not equal!' })
    } else {
      messageService.show({ type: MessageType.Success, content: 'Two snapshots equal' })
    }
  }, [messageService, playgroundCollabTestController, toggleFlushing])

  return (
    <div className="univer-collaboration-control-panel">
      <div className="univer-collaboration-control-panel-individual">
        {socketAlice ? <CollaborationControlSegment socket={socketAlice} /> : <CollaborationControlEmpty />}
        {socketBob ? <CollaborationControlSegment socket={socketBob} /> : <CollaborationControlEmpty />}
      </div>
      <div className="univer-collaboration-control-panel-all">
        <Button variant="text" onClick={() => toggleFlushing()}>{flushing ? '👋 Manual' : '⚡️ Auto Flushing'}</Button>
        <Button variant="text" onClick={flush} disabled={flushing}>⚡ Flush</Button>
        <Button variant="text" onClick={replayCommandsFromLocal}>📹 Replay</Button>
      </div>
    </div>
  )
}

interface ICollaborationControlSegmentProps {
  socket: IManualCollaborationSocket
}

function CollaborationControlEmpty() {
  return <div className="univer-collaboration-control-segment" />
}

function CollaborationControlSegment(props: ICollaborationControlSegmentProps) {
  const { socket } = props

  const [pendingRequests, setPendingRequests] = useState<ICombRequestEvent[]>([])
  const [pendingMessages, setPendingMessages] = useState<ICombResponseEvent[]>([])

  const [requestsInfo, setRequestsInfo] = useState<string[]>([])
  const [messagesInfo, setMessagesInfo] = useState<string[]>([])

  const [sendSprings, sendAPI] = useSpring(() => ({
    from: { offset: 0, opacity: 0 },
  }))

  const [receiveSprings, receiveAPI] = useSpring(() => ({
    from: { offset: 0, opacity: 0 },
  }))

  const sendRequest = () => socket.letSend()
  const receiveResponse = () => socket.letReceive()

  // subscribe to the socket's pending requests and messages
  useEffect(() => {
    let beforeRequests: ICombRequestEvent[] = []
    let beforeMessages: ICombResponseEvent[] = []
    const requestsSubscription = socket.pendingRequests$
      .subscribe((requests) => {
        if (requests.length > 0) {
          const mutationIds = (requests[0].data as ISubmitChangesetEvent)
            ?.data
            ?.changeset
            ?.mutations
            .map((mutation: { id: string }) => mutation.id) || []

          setRequestsInfo(mutationIds)
        }

        setPendingRequests(requests)
        if (requests.length > 0) {
          sendAPI.start({
            from: { offset: 0, opacity: 0 },
            to: { offset: 50, opacity: 1 },
          })
        } else if (beforeRequests.length > 0 && requests.length === 0) {
          sendAPI.start({
            from: { offset: 50, opacity: 1 },
            to: { offset: 100, opacity: 0 },
          })
        }
        beforeRequests = Tools.deepClone(requests)
      })

    const messagesSubscription = socket.pendingMessages$
      .subscribe((messages) => {
        // set the message info
        if (messages.length > 0) {
          const mutationIds: string[] = []
          messages.forEach((message) => {
            const messageData = message.data as ICollaborationEvent
            if (messageData.eventID !== 'changeset_ack') {
              (messageData as INewChangesetsEvent).data?.mutations?.forEach((item: { id: string }) => {
                mutationIds.push(item.id)
              })
            }
          })

          setMessagesInfo([...mutationIds])
        }

        setPendingMessages([...messages])

        if (beforeMessages.length === 0 && messages.length > 0) {
          receiveAPI.start({
            from: { offset: 0, opacity: 0 },
            to: { offset: 50, opacity: 1 },
          })
        } else if (beforeMessages.length > 0 && messages.length === 0) {
          receiveAPI.start({
            from: { offset: 50, opacity: 1 },
            to: { offset: 100, opacity: 0 },
          })
        }

        beforeMessages = Tools.deepClone(messages)
      })

    return () => {
      requestsSubscription.unsubscribe()
      messagesSubscription.unsubscribe()
    }
  }, [receiveAPI, sendAPI, socket])

  return (
    <div className="univer-collaboration-control-segment">
      <div className="univer-collaboration-control-send">
        {pendingRequests.map((request, index) => (
          <div key={index} className="univer-collaboration-control-send-request">
            {`${request.cmd}/${(request.data as IIngestQuestEvent['data']).eventID}`}
          </div>
        ))}
        <div className="univer-collaboration-control-send-secondary-button" onClick={sendRequest}>
          <MoreUpIcon />
        </div>
        <div className="univer-collaboration-control-send-line" />
        <div className="univer-collaboration-control-send-track">
          {/* @ts-ignore */}
          <animated.div
            className="univer-collaboration-control-send-track-bar"
            style={{
              opacity: sendSprings.opacity.to(x => x),
              top: sendSprings.offset.to(x => `calc(${100 - x}%)`),
            }}
          >
            <ul>

              {requestsInfo.map((mutationId, i) => (
                <li key={i}>{mutationId}</li>
              ))}
            </ul>
          </animated.div>
        </div>
      </div>
      <div className="univer-collaboration-control-receive">
        {pendingMessages.map((messages, index) => (
          <div key={index} className="univer-collaboration-control-send-request">
            {`${messages.cmd}/${(messages.data as IRecvResponseEvent['data']).eventID}`}
          </div>
        ))}
        <div className="univer-collaboration-control-receive-button" onClick={receiveResponse}>
          <MoreDownIcon />
        </div>
        <div className="univer-collaboration-control-send-line" />
        <div className="univer-collaboration-control-send-track">
          {/* @ts-ignore */}
          <animated.div
            className="univer-collaboration-control-send-trackbar"
            style={{
              opacity: receiveSprings.opacity.to(x => x),
              top: receiveSprings.offset.to(x => `calc(${x}%)`),
            }}
          >
            <ul>
              {messagesInfo.map((mutationId, i) => (
                <li key={i}>{mutationId}</li>
              ))}
            </ul>
          </animated.div>
        </div>
      </div>
    </div>
  )
}
