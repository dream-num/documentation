import { BoardElementType, UniverBoardsPlugin } from '@univerjs-pro/boards'
import { UniverBoardsUIPlugin } from '@univerjs-pro/boards-ui'
import BoardsUIEnUS from '@univerjs-pro/boards-ui/locale/en-US'
import EmbedUnitEnUS from '@univerjs-pro/embed-unit-ui/locale/en-US'
import InkUIEnUS from '@univerjs-pro/ink-ui/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import ShapeEditorEnUS from '@univerjs-pro/shape-editor-ui/locale/en-US'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { createData } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs-pro/boards-ui/lib/index.css'
import '@univerjs-pro/shape-editor-ui/lib/index.css'
import '@univerjs-pro/embed-unit-ui/lib/index.css'
import '@univerjs-pro/ink-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/boards/facade'
import '@univerjs-pro/boards-ui/facade'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const copy = {
    text: 'Search text',
    type: 'Element type',
    shapes: 'Shapes',
    all: 'All types',
    connectors: 'Connectors',
    search: 'Search',
    list: 'List by type',
    results: 'Query results',
    empty: 'No matching elements.',
    elements: 'elements',
    hits: 'hits',
    bounds: 'Bounds',
    canvas: 'Canvas editor',
    failed: 'Query failed: ',
    focusFailed: 'This element no longer exists or cannot be focused. Search again.',
  }
  const root = document.createElement('div')
  root.className = 'query-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.innerHTML =
    '<form><fieldset disabled>' +
    '<label>' +
    copy.text +
    '<input aria-label="' +
    copy.text +
    '" value="Risk" maxlength="200"></label>' +
    '<label>' +
    copy.type +
    '<select aria-label="' +
    copy.type +
    '"><option value="shape">' +
    copy.shapes +
    '</option><option value="all">' +
    copy.all +
    '</option><option value="connector">' +
    copy.connectors +
    '</option></select></label>' +
    '<button type="submit" data-action="search">' +
    copy.search +
    '</button><button type="button" data-action="type">' +
    copy.list +
    '</button>' +
    '</fieldset></form><section aria-label="' +
    copy.results +
    '"><p class="query-summary" role="status"></p><div class="query-results"></div></section>' +
    '<p role="alert" hidden></p><div class="query-editor" tabindex="0" aria-label="' +
    copy.canvas +
    '"></div>'
  container.append(root)
  const form = root.querySelector('form')!
  const controls = root.querySelector('fieldset')!
  const input = root.querySelector('input')!
  const type = root.querySelector('select')!
  const editor = root.querySelector<HTMLElement>('.query-editor')!
  const error = root.querySelector<HTMLElement>('[role="alert"]')!
  const resultList = root.querySelector<HTMLElement>('.query-results')!
  const summary = root.querySelector<HTMLElement>('.query-summary')!
  const events = new AbortController()
  let disposed = false
  let mode: 'text' | 'type' = 'text'
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        UIEnUS,
        DocsUIEnUS,
        DrawingUIEnUS,
        BoardsUIEnUS,
        ShapeEditorEnUS,
        EmbedUnitEnUS,
        InkUIEnUS,

        // Demo-only product names; preserve every other official English translation.
        {
          'boards-ui': {
            ...BoardsUIEnUS['boards-ui'],
            settings: { ...BoardsUIEnUS['boards-ui']['settings'], findBoardElements: 'Find canvas elements' },
          },
          'shape-editor-ui': {
            ...ShapeEditorEnUS['shape-editor-ui'],
            formulaBinding: { ...ShapeEditorEnUS['shape-editor-ui']['formulaBinding'], baseUnit: 'Relational Tables' },
            formulaShape: { ...ShapeEditorEnUS['shape-editor-ui']['formulaShape'], baseUnit: 'Relational Tables' },
          },
          'embed-unit-ui': {
            ...EmbedUnitEnUS['embed-unit-ui'],
            referencedUnitViewer: {
              ...EmbedUnitEnUS['embed-unit-ui']['referencedUnitViewer'],
              base: 'Relational Tables',
            },
          },
        },
      ),
    },
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
  univer.registerPlugin(UniverBoardsUIPlugin)
  const api = FUniver.newAPI(univer)
  const owner = window as typeof window & { univerAPI?: typeof api }
  owner.univerAPI = api

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
        : candidates.map((element) => ({ elementId: element.id, title: element.text || element.name || element.id }))
    const ids = [...new Set(hits.map((hit) => hit.elementId))]
    return { hits, ids, bounds: board.getElementsBoundingRectByIds(ids) }
  }
  function showError(cause: unknown) {
    error.textContent = copy.failed + (cause instanceof Error ? cause.message : String(cause))
    error.hidden = false
    console.error(cause)
  }
  function refresh() {
    error.hidden = true
    const result = query()
    summary.textContent =
      result.ids.length +
      ' ' +
      copy.elements +
      ' · ' +
      result.hits.length +
      ' ' +
      copy.hits +
      (result.bounds
        ? ' · ' + copy.bounds + ': ' + Math.round(result.bounds.width) + ' × ' + Math.round(result.bounds.height)
        : '')
    resultList.replaceChildren()
    for (const id of result.ids) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.element = id
      button.textContent = result.hits.find((hit) => hit.elementId === id)!.title.replace(/\s+/g, ' ')
      resultList.append(button)
    }
    if (!result.ids.length) resultList.textContent = copy.empty
  }
  function search(nextMode: 'text' | 'type') {
    mode = nextMode
    try {
      refresh()
    } catch (cause) {
      showError(cause)
    }
  }
  form.addEventListener(
    'submit',
    (event) => {
      event.preventDefault()
      search('text')
    },
    { signal: events.signal },
  )
  controls
    .querySelector('[data-action=type]')!
    .addEventListener('click', () => search('type'), { signal: events.signal })
  resultList.addEventListener(
    'click',
    (event) => {
      const id = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-element]')?.dataset.element
      if (!id) return
      try {
        error.hidden = true
        const rect = editor.getBoundingClientRect()
        if (!board.focusElement(id, { x: rect.width / 2, y: rect.height / 2 })) throw new Error(copy.focusFailed)
        editor.focus()
      } catch (cause) {
        showError(cause)
      }
    },
    { signal: events.signal },
  )
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (disposed || stage !== api.Enum.LifecycleStages.Rendered) return
    try {
      refresh()
      controls.disabled = false
      root.dataset.ready = 'true'
    } catch (cause) {
      root.dataset.ready = 'error'
      showError(cause)
    }
  })
  const board = api.createBoard(createData())
  return {
    univerAPI: api,
    query,
    setDarkMode(value: boolean) {
      root.dataset.theme = value ? 'dark' : 'light'
      api.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      events.abort()
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
