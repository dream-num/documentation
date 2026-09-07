import type { BoardModel } from '@univerjs-pro/boards'
import { BoardElementType, UniverBoardsPlugin } from '@univerjs-pro/boards'
import {
  BoardViewportService,
  getBoardElementRenderObjectKey,
  IBoardElementStateService,
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

import { DATA } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'query-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML = `<fieldset disabled>
    <label>Search text<input aria-label="Search text" value="Risk" maxlength="200"></label>
    <label>Element type<select aria-label="Element type"><option value="shape">Shapes</option><option value="all">All types</option><option value="connector">Connectors</option></select></label>
    <button type="button" data-action="search">Search</button><button type="button" data-action="type">List by type</button>
    <button type="button" data-action="select">Select results</button><button type="button" data-action="clear">Clear selection</button>
    <button type="button" data-action="resolve">Resolve supplier risk</button>
    <button type="button" data-action="undo">Undo</button><button type="button" data-action="redo">Redo</button>
    <button type="button" data-action="invalid">Try missing ID</button><button type="button" data-action="inspect">Refresh query</button>
    <button type="button" data-action="fit">Fit content</button><button type="button" data-action="empty">Empty board</button><button type="button" data-action="reset">Reset</button>
  </fieldset><p role="status">Starting release review…</p><p role="alert" hidden></p>
  <p class="hint">Search uses the SDK Find index (case-insensitive text, names, IDs, and labels). List by type ignores the text. Select results deduplicates element IDs. After native edits, use Refresh query.</p>
  <section aria-label="Query results"><p class="query-summary"></p><div class="query-results"></div></section>
  <details><summary>SDK query, selection, and rendered bounds</summary><pre><output aria-label="SDK readback"></output></pre></details>
  <div class="query-editor" tabindex="0" aria-label="Board canvas"></div>`
  container.append(root)
  const controls = root.querySelector('fieldset')!
  const input = root.querySelector<HTMLInputElement>('input')!
  const type = root.querySelector<HTMLSelectElement>('select')!
  const editor = root.querySelector<HTMLElement>('.query-editor')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const error = root.querySelector<HTMLElement>('[role="alert"]')!
  const resultList = root.querySelector<HTMLElement>('.query-results')!
  const summary = root.querySelector<HTMLElement>('.query-summary')!
  const output = root.querySelector('output')!
  const events = new AbortController()
  let disposed = false
  let busy = false
  let ready = false
  let fitPending = true
  let mode: 'text' | 'type' = 'text'
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
  const injector = univer.__getInjector()
  const selection = () => injector.get(IBoardElementStateService)
  let board = api.createBoard(structuredClone(DATA))

  function query() {
    const elementType =
      type.value === 'shape'
        ? BoardElementType.Shape
        : type.value === 'connector'
          ? BoardElementType.Connector
          : undefined
    const candidates = board.describeElements({ elementType })
    const allowed = new Set(candidates.map((element) => element.id))
    const hits =
      mode === 'text'
        ? board.findElementsByText(input.value).filter((hit) => allowed.has(hit.elementId))
        : candidates.map((element) => ({
            elementId: element.id,
            title: element.text || element.name || element.id,
            description: element.type,
          }))
    const ids = [...new Set(hits.map((hit) => hit.elementId))]
    return {
      mode,
      text: input.value,
      elementType: type.value,
      hits,
      ids,
      bounds: board.getElementsBoundingRectByIds(ids),
    }
  }

  async function refresh() {
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (disposed) return
    const result = query()
    const elements = board.describeElements({ includeHidden: true })
    const scene = injector.get(IRenderManagerService).getRenderUnitById(board.getId())?.scene
    const rendered = Object.fromEntries(
      elements
        .filter((element) => element.type === BoardElementType.Shape)
        .map((element) => {
          const object = scene?.getObject(getBoardElementRenderObjectKey(board.getId(), element.id))
          return [
            element.id,
            object ? { left: object.left, top: object.top, width: object.width, height: object.height } : null,
          ]
        }),
    )
    output.textContent = JSON.stringify(
      {
        query: result,
        elements,
        rendered,
        selection: selection().getSnapshot(),
        missing: board.getElementsBoundsByIds(['missing-element']),
      },
      null,
      2,
    )
    summary.textContent = `${result.mode === 'text' ? 'Text search' : 'Type query'} · ${result.hits.length} hits · ${result.ids.length} unique elements · Bounds: ${result.bounds ? `${result.bounds.left}, ${result.bounds.top} · ${result.bounds.width} × ${result.bounds.height}` : 'none'}`
    resultList.replaceChildren()
    for (const id of result.ids) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.element = id
      button.textContent = `${id} · ${result.hits.find((hit) => hit.elementId === id)!.title.replace(/\s+/g, ' ')}`
      resultList.append(button)
    }
    if (!result.ids.length) resultList.textContent = 'No matching elements.'
    if (fitPending && board.getElementOrder().length) {
      // Results change the remaining canvas height; measure after their layout is committed.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      if (disposed) return
      const rect = editor.getBoundingClientRect()
      injector
        .get(BoardViewportService)
        .fitContent(injector.get(IUniverInstanceService).getUnit<BoardModel>(board.getId()) ?? null, {
          viewportSize: { width: rect.width, height: rect.height },
          padding: 48,
          zoom: { maxZoomRatio: 1.1 },
        })
      fitPending = false
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    }
  }

  async function run(action: () => string) {
    if (busy || disposed) return
    busy = true
    controls.disabled = true
    error.hidden = true
    try {
      const message = action()
      await refresh()
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
    void run(() => 'Search Risk: three matching shapes, no connectors selected').then(() => {
      if (!disposed) root.dataset.ready = 'true'
    })
  })
  root.addEventListener(
    'click',
    (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button')
      if (!button) return
      if (button.dataset.element) {
        void run(() => {
          const rect = editor.getBoundingClientRect()
          if (!board.focusElement(button.dataset.element!, { x: rect.width / 2, y: rect.height / 2 }))
            throw new Error('This result no longer exists or cannot be focused. Refresh the query.')
          editor.focus()
          return `Focused ${button.dataset.element}`
        })
        return
      }
      const action = button.dataset.action
      if (!action) return
      void run(() => {
        if (action === 'reset' || action === 'empty') {
          selection().clearSelection()
          api.disposeUnit(board.getId())
          const data = structuredClone(DATA)
          if (action === 'empty') {
            data.pages.review.elements = {}
            data.pages.review.elementOrder = []
          }
          board = api.createBoard(data)
          mode = 'text'
          input.value = 'Risk'
          type.value = 'shape'
          fitPending = true
          root.querySelector('details')!.open = false
          return action === 'empty' ? 'Empty board: no hits or bounds' : 'Original Orion review restored'
        }
        if (action === 'search' || action === 'type') {
          mode = action === 'search' ? 'text' : 'type'
          return 'Query executed against the current SDK model'
        }
        if (action === 'select') {
          const ids = query().ids
          injector.get(IUniverInstanceService).focusUnit(board.getId())
          selection().selectElements({ unitId: board.getId(), subUnitId: 'review' }, ids)
          editor.focus()
          return `Selected ${ids.length} unique elements; arrow keys move the SDK selection`
        }
        if (action === 'clear') {
          selection().clearSelection()
          return 'Selection cleared; query unchanged'
        }
        if (action === 'resolve') {
          const shape = board.getShape('supply')
          if (!shape) throw new Error('Supplier card is missing. Reset the board.')
          shape.getText().setText('Supplier cleared\nLead time +2 days')
          if (board.getShape('supply')?.getText().getPlainText() !== 'Supplier cleared\nLead time +2 days')
            throw new Error('The SDK did not update the supplier text. Inspect its current state before retrying.')
          return 'Supplier text updated through FShape.getText(); the query is re-run'
        }
        if (action === 'undo' || action === 'redo')
          return (action === 'undo' ? board.undo() : board.redo())
            ? `${action} applied; query refreshed`
            : `No ${action} available`
        if (action === 'invalid') {
          const check = board.checkElementIds(['missing-element'])
          if (!check.allExist)
            throw new Error(
              `Missing ID: ${check.missingIds.join(', ')}. Selection is unchanged; bounds readback is null.`,
            )
          throw new Error('Unexpected SDK acceptance of missing-element.')
        }
        if (action === 'fit') {
          fitPending = true
          return 'Content fitted'
        }
        root.querySelector('details')!.open = true
        return 'Query, selection, and render bounds refreshed'
      })
    },
    { signal: events.signal },
  )
  input.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        void run(() => {
          mode = 'text'
          return 'Search submitted with Enter'
        })
      }
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
