'use client'

import {
  BoardConnectorSite,
  createBoardConnectorElement,
  createBoardContainerElement,
  createBoardStickyElement,
  createBoardSwimlaneElement,
  createBoardTextBoxShapeElement,
  UniverBoardsPlugin,
} from '@univerjs-pro/boards'
import { UniverBoardsLatexUIPlugin } from '@univerjs-pro/boards-latex-ui'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, mergeLocales, VerticalAlign } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import { useCallback } from 'react'
import type { IUniverCanvasProps } from './canvas'
import { UniverCanvas } from './canvas'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/boards/facade'

const locales = mergeLocales(BoardsUIEnUS)

export default function BoardsDemo() {
  const seedBoard = useCallback((univerAPI: ReturnType<typeof FUniver.newAPI>) => {
    const board = univerAPI.createBoard({ id: 'boards-home-demo', name: 'Univer Boards · Ideas become a system' })
    const frame = createBoardContainerElement({
      id: 'board-tour',
      left: 40,
      top: 40,
      width: 1112,
      height: 652,
      title: 'UNIVER BOARDS  /  IDEAS BECOME A SYSTEM',
      fillColor: '#F3F6FA',
      strokeColor: '#94A3B8',
      strokeWidth: 1,
    })
    const notes = createBoardContainerElement({
      id: 'notes',
      parentId: frame.id,
      left: 24,
      top: 56,
      width: 242,
      height: 562,
      title: '01  CAPTURE IDEAS',
      fillColor: '#FFFFFF',
      strokeColor: '#CBD5E1',
      strokeWidth: 1,
    })
    const flow = createBoardContainerElement({
      id: 'flow',
      parentId: frame.id,
      left: 286,
      top: 56,
      width: 802,
      height: 324,
      title: '02  CONNECT THE THINKING  ·  DRAG A NODE',
      fillColor: '#FFFFFF',
      strokeColor: '#CBD5E1',
      strokeWidth: 1,
    })
    const pipeline = createBoardSwimlaneElement({
      id: 'pipeline',
      parentId: frame.id,
      left: 286,
      top: 400,
      width: 802,
      height: 218,
      title: '03  ORGANIZE THE WORK  ·  NATIVE SWIMLANES',
      fillColor: '#FFFFFF',
      strokeColor: '#CBD5E1',
      strokeWidth: 1,
      orientation: 'vertical',
      headerSize: 40,
      lanes: [
        { id: 'capture', title: 'CAPTURE', size: 267 },
        { id: 'connect', title: 'CONNECT', size: 267 },
        { id: 'share', title: 'SHARE', size: 268 },
      ],
    })
    function createCard(
      id: string,
      text: string,
      left: number,
      top: number,
      width: number,
      height: number,
      fill: string,
      parentId: string,
      { laneId, shapeType = ShapeTypeEnum.RoundRect }: { laneId?: string; shapeType?: ShapeTypeEnum } = {},
    ) {
      const card = createBoardTextBoxShapeElement({
        id,
        text,
        left: left - 326,
        top: top - (parentId === pipeline.id ? 440 : 96),
        width,
        height,
        parentId,
        laneId,
        horizontalAlign: HorizontalAlign.CENTER,
        verticalAlign: VerticalAlign.MIDDLE,
        textStyle: { fs: 14, bl: BooleanNumber.TRUE, cl: { rgb: '#123B50' } },
        textWrap: ShapeTextWrapType.Square,
      })
      return {
        ...card,
        shapeData: {
          ...card.shapeData,
          shapeType,
          fill: { fillType: ShapeFillEnum.SolidFill, color: fill },
          stroke: { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#8FA8B5', width: 1 },
          textRectPadding: { left: 10, right: 10, top: 10, bottom: 10 },
        },
      }
    }
    const stickies = [
      ['A SPACE TO THINK\n\nPlace ideas anywhere.\nPan and zoom to explore.', '#FEF3C7'],
      ['CONTEXT STAYS CLOSE\n\nGroup ideas in a frame.\nMove the frame as one.', '#DCFCE7'],
      ['YOUR NEXT IDEA\n\nDouble-click this note.\nWhat would you build?', '#FCE7F3'],
    ].map(([text, fillColor], index) => {
      const sticky = createBoardStickyElement({
        id: `note-${index}`,
        parentId: notes.id,
        left: 20,
        top: 56 + index * 158,
        width: 202,
        height: 138,
        fillColor,
      })
      Object.assign(sticky.shapeData, {
        shapeText: {
          isRichText: false,
          isHorizontal: true,
          text,
          fontFamily: 'Arial',
          fontSize: 13,
          color: '#334155',
        },
        textRectPadding: { left: 14, right: 14, top: 16, bottom: 12 },
      })
      sticky.transform.rotation = index === 1 ? 2 : -2
      return sticky
    })
    const cards = [
      createCard('idea', 'Start with\nan idea', 352, 155, 142, 70, '#DBEAFE', flow.id),
      createCard('shape', 'Give it\na shape', 566, 155, 142, 70, '#DDF4EF', flow.id),
      createCard('decision', 'GO?', 780, 146, 126, 88, '#FEF3C7', flow.id, { shapeType: ShapeTypeEnum.Diamond }),
      createCard('story', 'A clear\nvisual story', 972, 155, 132, 70, '#DDF4EF', flow.id),
      createCard('context', 'Add a note\nKeep the context', 352, 298, 194, 70, '#FCE7F3', flow.id),
      createCard('refine', 'Refine together\nMove · edit · reconnect', 686, 298, 218, 70, '#EDE9FE', flow.id),
      createCard('capture-task', 'STICKY NOTES\nCapture the raw idea', 352, 542, 214, 86, '#FEF3C7', pipeline.id, {
        laneId: 'capture',
      }),
      createCard(
        'connect-task',
        'BOUND CONNECTORS\nRelationships follow nodes',
        618,
        542,
        214,
        86,
        '#DBEAFE',
        pipeline.id,
        { laneId: 'connect' },
      ),
      createCard('share-task', 'FRAMES & LANES\nTurn a canvas into a plan', 886, 542, 214, 86, '#DDF4EF', pipeline.id, {
        laneId: 'share',
      }),
    ]
    const connections = [
      ['idea', 'shape', BoardConnectorSite.Right, BoardConnectorSite.Left, 'shape it'],
      ['shape', 'decision', BoardConnectorSite.Right, BoardConnectorSite.Left, 'review'],
      ['decision', 'story', BoardConnectorSite.Right, BoardConnectorSite.Left, 'yes'],
      ['decision', 'refine', BoardConnectorSite.Bottom, BoardConnectorSite.Top, 'not yet'],
      ['refine', 'shape', BoardConnectorSite.Top, BoardConnectorSite.Bottom, 'iterate'],
      ['idea', 'context', BoardConnectorSite.Bottom, BoardConnectorSite.Top, 'explain'],
      ['context', 'refine', BoardConnectorSite.Right, BoardConnectorSite.Left, 'discuss'],
    ] as const
    board.addElements([
      frame,
      notes,
      flow,
      pipeline,
      ...stickies,
      ...cards,
      ...connections.map(([from, to, startSite, endSite, label], index) =>
        createBoardConnectorElement({
          id: `relationship-${index}`,
          start: { kind: 'shapeSite', shapeId: from, connectionSiteId: startSite },
          end: { kind: 'shapeSite', shapeId: to, connectionSiteId: endSite },
          routing: 'orthogonal',
          routingMode: 'auto',
          style: {
            stroke: index === 3 || index === 4 ? '#8B5CF6' : '#64748B',
            strokeWidth: 1.8,
            endMarker: { type: 'filledArrow' },
          },
          label: {
            id: `relationship-label-${index}`,
            content: label,
            style: { fill: { color: '#FFFFFF', opacity: 1 } },
          },
        }),
      ),
    ])
  }, [])

  const initialize = useCallback<IUniverCanvasProps['initialize']>(
    (univer) => {
      univer.registerPlugin(UniverBoardsPlugin)
      univer.registerPlugin(UniverBoardsUIPlugin)
      univer.registerPlugin(UniverBoardsLatexUIPlugin)

      const univerAPI = FUniver.newAPI(univer)
      seedBoard(univerAPI)
      return { api: univerAPI }
    },
    [seedBoard],
  )

  return <UniverCanvas initialize={initialize} locales={locales} />
}
