import type { BoardModel } from '@univerjs-pro/boards'
import { SetBoardElementsMetadataOperation, UniverBoardsPlugin } from '@univerjs-pro/boards'
import {
  BoardViewportService,
  getBoardElementRenderObjectKey,
  IBoardElementStateService,
  IBoardUIStateService,
  UniverBoardsUIPlugin,
} from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { IUniverInstanceService, LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import { IRenderManagerService, UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { DATA, LAYER_VARIANTS, MEDIA_IDS } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'

function requireSuccess(success: boolean, message: string) {
  if (!success) throw new Error(message)
}

const elementIds = (items: { id: string }[]) => items.map((item) => item.id)

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'group-layer-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML = `<fieldset disabled>
    <label>Layer action<select aria-label="Layer action"></select></label>
    <button type="button" data-action="layer">Apply layer action</button>
    <button type="button" data-action="group">Group media</button>
    <button type="button" data-action="nest">Nest group + priority</button>
    <button type="button" data-action="focus">Focus nested Caption</button>
    <button type="button" data-action="lock">Lock media cards</button>
    <button type="button" data-action="locked-move">Try moving locked Caption</button>
    <button type="button" data-action="unlock-move">Unlock and move group</button>
    <button type="button" data-action="ungroup">Ungroup all</button>
    <button type="button" data-action="invalid">Try missing element</button>
    <button type="button" data-action="undo">Undo</button><button type="button" data-action="redo">Redo</button>
    <button type="button" data-action="inspect">Inspect</button><button type="button" data-action="fit">Fit content</button>
    <button type="button" data-action="empty">Empty board</button><button type="button" data-action="reset">Reset</button>
  </fieldset><p role="status">Starting museum campaign…</p><p role="alert" hidden></p>
  <p class="hint">The three overlapping media cards form a group. Priority stays independent for layer actions, then can wrap the media group in a second level. The red route intentionally starts detached.</p>
  <p class="hint">Known beta.2 limitation: undoing Ungroup all restores membership but can change sibling layer order. The inspector shows the SDK result without reordering it.</p>
  <details><summary>SDK hierarchy, layers, focus, and rendered bounds</summary><pre><output aria-label="SDK readback"></output></pre></details>
  <div class="group-layer-editor" tabindex="0" aria-label="Board canvas"></div>`
  container.append(root)
  const controls = root.querySelector('fieldset')!
  const editor = root.querySelector<HTMLElement>('.group-layer-editor')!
  const variant = root.querySelector<HTMLSelectElement>('select')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const error = root.querySelector<HTMLElement>('[role="alert"]')!
  const output = root.querySelector('output')!
  for (const [id, label] of LAYER_VARIANTS) variant.add(new Option(label, id))
  const events = new AbortController()
  let disposed = false
  let busy = false
  let ready = false
  let fitPending = true
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, DrawingUIEnUS, BoardsUIEnUS) },
  })
  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverUIPlugin, {
    ribbonType: 'grid',
    container: editor,
    header: false,
    toolbar: false,
    footer: false,
  })
  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverDocsUIPlugin)
  univer.registerPlugin(UniverDrawingPlugin)
  univer.registerPlugin(UniverDrawingUIPlugin)
  univer.registerPlugin(UniverLicensePlugin)
  univer.registerPlugin(UniverBoardsPlugin)
  univer.registerPlugin(UniverBoardsUIPlugin, { workbench: { header: false, headerMenu: false } })
  const api = FUniver.newAPI(univer)
  let board = api.createBoard(structuredClone(DATA))
  const sharedParent = (ids: readonly string[]) => {
    const parents = ids.map((id) => board.getElementParentChain(id)[0])
    const parent = parents[0]
    if (!parent || parents.some((id) => id !== parent)) return null
    const children = board.getContainerChildren(parent)
    return children.length === ids.length && children.every((child) => ids.includes(child.id)) ? parent : null
  }

  const currentGroups = () => {
    const mediaGroupId = sharedParent(MEDIA_IDS)
    return { mediaGroupId, campaignGroupId: mediaGroupId ? sharedParent([mediaGroupId, 'priority']) : null }
  }

  const ensureMediaGroup = () => {
    const existing = sharedParent(MEDIA_IDS)
    if (existing) return existing
    requireSuccess(
      board.wrapElementsInContainer([...MEDIA_IDS], { title: 'Media package' }),
      'The SDK could not wrap the three media cards.',
    )
    const mediaGroupId = sharedParent(MEDIA_IDS)
    if (!mediaGroupId) throw new Error('The SDK did not create one shared media parent.')
    return mediaGroupId
  }

  async function inspect() {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (disposed) return
    const injector = univer.__getInjector()
    if (fitPending && board.getElementOrder().length) {
      const rect = editor.getBoundingClientRect()
      injector
        .get(BoardViewportService)
        .fitContent(injector.get(IUniverInstanceService).getUnit<BoardModel>(board.getId()) ?? null, {
          viewportSize: { width: rect.width, height: rect.height },
          padding: 48,
          zoom: { maxZoomRatio: 1.15 },
        })
      fitPending = false
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    }
    if (disposed) return
    const elements = board.describeElements({ includeHidden: true })
    const scene = injector.get(IRenderManagerService).getRenderUnitById(board.getId())?.scene
    const rendered = Object.fromEntries(
      elements
        .filter((element) => element.type === 'shape' || element.type === 'container')
        .map((element) => {
          const object = scene?.getObject(getBoardElementRenderObjectKey(board.getId(), element.id))
          return [
            element.id,
            object ? { left: object.left, top: object.top, width: object.width, height: object.height } : null,
          ]
        }),
    )
    const viewport = injector.get(IBoardUIStateService).getState()
    const { mediaGroupId, campaignGroupId } = currentGroups()
    output.textContent = JSON.stringify(
      {
        elements,
        order: board.getElementOrder(),
        hierarchy: {
          mediaGroupId,
          campaignGroupId,
          mediaChildren: mediaGroupId ? elementIds(board.getContainerChildren(mediaGroupId)) : [],
          campaignChildren: campaignGroupId ? elementIds(board.getContainerChildren(campaignGroupId)) : [],
          campaignDescendants: campaignGroupId ? elementIds(board.getContainerDescendants(campaignGroupId)) : [],
          captionParentChain: board.getElementParentChain('caption'),
        },
        selection: injector.get(IBoardElementStateService).getSnapshot(),
        rendered,
        viewport: { zoomRatio: viewport.zoomRatio, panOffset: viewport.viewportPanOffset },
      },
      null,
      2,
    )
  }

  async function run(action: () => string) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    error.hidden = true
    try {
      const message = action()
      await inspect()
      if (!disposed) status.textContent = message
    } catch (cause) {
      if (!disposed) {
        error.textContent = cause instanceof Error ? cause.message : String(cause)
        error.hidden = false
      }
    } finally {
      busy = false
      if (!disposed) controls.disabled = !ready
    }
  }

  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (stage !== api.Enum.LifecycleStages.Rendered || ready || disposed) return
    ready = true
    void run(() => 'Eight museum assets · twelve routes · deterministic overlap').then(() => {
      if (!disposed) root.dataset.ready = 'true'
    })
  })

  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action) return
      void run(() => {
        const { mediaGroupId, campaignGroupId } = currentGroups()
        if (action === 'reset' || action === 'empty') {
          const data = structuredClone(DATA)
          if (action === 'empty') {
            data.pages.campaign.elements = {}
            data.pages.campaign.elementOrder = []
          }
          api.disposeUnit(board.getId())
          board = api.createBoard(data)
          variant.value = 'front'
          root.querySelector('details')!.open = false
          fitPending = true
          return action === 'empty' ? 'Empty board' : 'Original museum campaign restored'
        }
        if (action === 'inspect') {
          root.querySelector('details')!.open = true
          return 'Read fresh hierarchy, order, focus, and rendered bounds'
        }
        if (action === 'fit') {
          fitPending = true
          return 'Content fitted'
        }
        if (action === 'undo' || action === 'redo')
          return (action === 'undo' ? board.undo() : board.redo()) ? `${action} applied` : `No ${action} available`
        if (action === 'invalid') {
          if (!board.bringElementsToFront(['missing-layer']))
            throw new Error('SDK rejected missing-layer. The layer order is unchanged.')
          throw new Error('Unexpected SDK acceptance of missing-layer; inspect the result.')
        }
        if (action === 'layer') {
          if (!board.getElement('priority')) throw new Error('Priority is missing. Reset the board.')
          const operation = LAYER_VARIANTS.find(([id]) => id === variant.value)?.[0]
          const changed =
            operation === 'front'
              ? board.bringElementsToFront(['priority'])
              : operation === 'forward'
                ? board.bringElementsForward(['priority'])
                : operation === 'backward'
                  ? board.sendElementsBackward(['priority'])
                  : operation === 'back'
                    ? board.sendElementsToBack(['priority'])
                    : false
          requireSuccess(changed, 'Choose a valid layer action, or Reset if Priority is already at that boundary.')
          return `Priority moved ${operation}`
        }
        if (action === 'group') {
          ensureMediaGroup()
          return 'Photo, Caption, and Credit grouped in Media package'
        }
        if (action === 'nest') {
          const groupId = ensureMediaGroup()
          if (!campaignGroupId) {
            requireSuccess(
              board.wrapElementsInContainer([groupId, 'priority'], { title: 'Campaign package' }),
              'The SDK could not create the nested hierarchy.',
            )
            if (!sharedParent([groupId, 'priority']))
              throw new Error('The SDK did not create one shared campaign parent.')
          }
          return 'Media package and Priority nested in Campaign package'
        }
        if (action === 'focus') {
          if (!mediaGroupId || !board.getElement(mediaGroupId))
            throw new Error('Group media before focusing its nested Caption.')
          const rect = editor.getBoundingClientRect()
          requireSuccess(
            board.focusElement('caption', { x: rect.width / 2, y: rect.height / 2 }),
            'The nested Caption could not be focused.',
          )
          editor.focus()
          return 'Nested Caption selected and focused'
        }
        if (action === 'lock') {
          ensureMediaGroup()
          requireSuccess(
            api.syncExecuteCommand(SetBoardElementsMetadataOperation.id, {
              unitId: board.getId(),
              subUnitId: 'campaign',
              updates: MEDIA_IDS.map((elementId) => ({ elementId, metadata: { locked: true } })),
            }),
            'The media cards could not be locked.',
          )
          return 'Photo, Caption, and Credit locked atomically'
        }
        if (action === 'locked-move') {
          const caption = board.describeElement('caption')
          if (!mediaGroupId || !caption) throw new Error('Group media before testing its lock.')
          if (!caption.locked) throw new Error('Lock the media cards before testing a blocked move.')
          if (!board.translateElement(caption.id, { dx: 80, dy: 40 }))
            throw new Error('SDK blocked the locked Caption move. Geometry is unchanged.')
          throw new Error('Unexpected SDK movement of a locked Caption; inspect its geometry.')
        }
        if (action === 'unlock-move') {
          const group = mediaGroupId ? board.describeElement(mediaGroupId) : null
          if (!group) throw new Error('Group media before moving it.')
          requireSuccess(
            api.syncExecuteCommand(SetBoardElementsMetadataOperation.id, {
              unitId: board.getId(),
              subUnitId: 'campaign',
              updates: MEDIA_IDS.map((elementId) => ({ elementId, metadata: { locked: false } })),
            }),
            'The media cards could not be unlocked.',
          )
          requireSuccess(board.translateElement(group.id, { dx: 80, dy: 40 }), 'The unlocked media group did not move.')
          return 'Media cards unlocked; their group moved by 80 × 40'
        }
        if (action === 'ungroup') {
          if (campaignGroupId && board.getElement(campaignGroupId))
            requireSuccess(board.disbandContainer(campaignGroupId), 'The campaign group could not be disbanded.')
          if (mediaGroupId && board.getElement(mediaGroupId)) {
            requireSuccess(
              api.syncExecuteCommand(SetBoardElementsMetadataOperation.id, {
                unitId: board.getId(),
                subUnitId: 'campaign',
                updates: MEDIA_IDS.map((elementId) => ({ elementId, metadata: { locked: false } })),
              }),
              'The media cards could not be unlocked.',
            )
            requireSuccess(board.disbandContainer(mediaGroupId), 'The media group could not be disbanded.')
          }
          return 'All containers removed; child world geometry preserved'
        }
        return 'No action'
      })
    },
    { signal: events.signal },
  )

  return {
    dispose() {
      disposed = true
      events.abort()
      lifecycle.dispose()
      univer.dispose()
      root.remove()
    },
  }
}
