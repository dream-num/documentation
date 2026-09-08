/* eslint-disable no-await-in-loop -- Protection must exist before its points can be set. */
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createData, PROFILES } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

type Shadow = 'always' | 'non-editable' | 'non-viewable' | 'none'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'permission-shadow-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<label>Global protection shadow (SDK setting) <select disabled aria-label="Protection shadow strategy"><option value="none">None</option><option value="always">Always</option><option value="non-editable">Non-editable only</option><option value="non-viewable">Non-viewable only</option></select></label><p role="alert">Applying local permissions…</p><div class="permission-shadow-editor" aria-disabled="true" aria-busy="true"></div>`
  container.append(root)
  const editor = root.querySelector<HTMLElement>('.permission-shadow-editor')!
  const error = root.querySelector<HTMLElement>('[role="alert"]')!
  const select = root.querySelector('select')!
  // Keep SDK focus/DOM selection initialization possible; inert blocks its hidden text editor.
  // Capture before SDK ancestor handlers, but only for this editor's events.
  const events = new AbortController()
  const gate = (event: Event) => {
    if (root.dataset.ready !== 'true' && event.composedPath().includes(editor)) {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  for (const type of [
    'pointerdown',
    'pointerup',
    'pointercancel',
    'mousedown',
    'mouseup',
    'click',
    'dblclick',
    'keydown',
    'beforeinput',
    'input',
    'compositionstart',
    'compositionupdate',
    'compositionend',
    'paste',
    'cut',
    'drop',
    'contextmenu',
  ])
    window.addEventListener(type, gate, { capture: true, signal: events.signal })
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: editor })],
  })
  Object.assign(window, { univerAPI })
  let disposed = false
  let pending: Promise<void> = Promise.resolve()
  let frame = 0
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage !== univerAPI.Enum.LifecycleStages.Rendered) return
    frame = requestAnimationFrame(() => {
      if (disposed) return
      pending = initialize().catch((cause) => {
        if (disposed) return
        root.dataset.ready = 'error'
        error.hidden = false
        error.textContent = 'Permission initialization failed: ' + String(cause)
        console.error(cause)
      })
    })
  })
  const workbook = univerAPI.createWorkbook(createData())
  async function initialize() {
    univerAPI.setPermissionDialogVisible(false)
    univerAPI.setProtectedRangeShadowStrategy('none')
    for (const [id] of PROFILES) {
      const sheet = workbook.getSheetBySheetId(id)!
      const permission = sheet.getWorksheetPermission()
      if (id === 'worksheet') {
        await permission.protect()
        await permission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.Edit, false)
        if (permission.canEditCell(3, 2)) throw new Error('Worksheet protection was not applied')
      } else if (id !== 'none') {
        for (const [index, address] of (id === 'mixed' ? ['C4:C6', 'C7:C9'] : ['C4:C9']).entries()) {
          const rule = await sheet.getRange(address).getRangePermission().protect({ name: address })
          const editable = id === 'editable' || (id === 'mixed' && index === 0)
          await rule.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, editable)
          await rule.setPoint(univerAPI.Enum.RangePermissionPoint.View, id !== 'hidden')
          const row = sheet.getRange(address).getRow()
          if (permission.canEditCell(row, 2) !== editable || permission.canViewCell(row, 2) !== (id !== 'hidden'))
            throw new Error('Range protection was not applied: ' + id + ' ' + address)
        }
      }
      if (disposed) return
    }
    workbook.getActiveSheet()?.refreshCanvas()
    error.hidden = true
    select.disabled = false
    editor.setAttribute('aria-disabled', 'false')
    editor.setAttribute('aria-busy', 'false')
    root.dataset.ready = 'true'
  }
  select.addEventListener('change', () => {
    univerAPI.setProtectedRangeShadowStrategy(select.value as Shadow)
    workbook.getActiveSheet()?.refreshCanvas()
  })
  return {
    univerAPI,
    setDarkMode(value: boolean) {
      root.dataset.theme = value ? 'dark' : 'light'
      univerAPI.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      events.abort()
      cancelAnimationFrame(frame)
      lifecycle.dispose()
      root.remove()
      const global = window as Window & { univerAPI?: typeof univerAPI }
      if (global.univerAPI === univerAPI) delete global.univerAPI
      void pending.finally(() => univer.dispose())
    },
  }
}
