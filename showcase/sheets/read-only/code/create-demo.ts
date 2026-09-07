import type { FWorkbook } from '@univerjs/preset-sheets-core'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import zhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { createUniver, LocaleType, type IWorkbookData } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

type Mode = 'display' | 'selectable' | 'editable'

export function createDemo(
  container: HTMLElement,
  darkMode = false,
  locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
  saved: Partial<IWorkbookData> = WORKBOOK_DATA,
) {
  if (!saved?.id || !saved.sheets || !saved.sheetOrder?.length)
    throw new Error('A saved workbook with its original ID, sheets and sheetOrder is required.')
  const zh = locale === LocaleType.ZH_CN
  const labels = zh
    ? {
        modes: '查看模式',
        display: '仅展示',
        selectable: '可选择只读',
        editable: '可编辑对照',
        pending: '正在应用权限…',
        blocked: '只读模式：已阻止撤销或重做。',
        error: '权限设置失败；交互仍禁用，可重试模式。',
      }
    : {
        modes: 'Viewer mode',
        display: 'Display only',
        selectable: 'Selectable read-only',
        editable: 'Editable comparison',
        pending: 'Applying permissions…',
        blocked: 'Read-only: Undo or Redo blocked.',
        error: 'Permission setup failed; interaction stays disabled. Retry a mode.',
      }
  const root = document.createElement('div')
  root.className = 'read-only-demo'
  root.dataset.ready = 'false'
  root.innerHTML = `<fieldset disabled aria-label="${labels.modes}"><button data-mode="display">${labels.display}</button><button data-mode="selectable">${labels.selectable}</button><button data-mode="editable">${labels.editable}</button></fieldset>
    <p role="status" aria-live="polite">${labels.pending}</p>
    <div class="read-only-editor"></div>`
  container.append(root)
  const editor = root.querySelector<HTMLElement>('.read-only-editor')!
  const controls = root.querySelector<HTMLFieldSetElement>('fieldset')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const domEvents = new AbortController()
  // Inert breaks native cell input restoration in this SDK/browser combination.
  // Gate only transitions; steady viewer protection comes from SDK permissions.
  for (const event of [
    'pointerdown',
    'mousedown',
    'dblclick',
    'contextmenu',
    'keydown',
    'beforeinput',
    'paste',
    'cut',
    'drop',
  ]) {
    editor.addEventListener(
      event,
      (input) => {
        if (root.dataset.ready === 'true') return
        input.preventDefault()
        input.stopImmediatePropagation()
      },
      { capture: true, signal: domEvents.signal },
    )
  }
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale,
    locales: { [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN },
    presets: [
      UniverSheetsCorePreset({
        ribbonType: 'grid',
        container: editor,
        toolbar: false,
        contextMenu: false,
        formulaBar: false,
        footer: false,
      }),
    ],
  })
  let workbook: FWorkbook
  // Retain this handle: enableShortcut() must release the same disable handle.
  const shortcut = univerAPI.getShortcut()
  let pending: Promise<void> | undefined
  let disposed = false
  let started = false
  const demoWindow = window as Window & { univerAPI?: typeof univerAPI }
  demoWindow.univerAPI = univerAPI
  const applyMode = (next: Mode) => {
    if (!['display', 'selectable', 'editable'].includes(next)) throw new RangeError('Unknown viewer mode: ' + next)
    if (disposed || pending) return
    controls.disabled = true
    root.dataset.ready = 'false'
    editor.setAttribute('aria-busy', 'true')
    root.dataset.state = 'pending'
    status.textContent = labels.pending
    const current = workbook
    pending = (async () => {
      const permission = current.getWorkbookPermission()
      if (next === 'editable') await permission.setEditable()
      else await permission.setReadOnly()
      if (disposed) return
      if (permission.canEdit() !== (next === 'editable'))
        throw new Error('SDK permission readback does not match the requested mode.')
      if (next === 'display') {
        current.disableSelection()
        shortcut.disableShortcut()
      } else {
        current.enableSelection()
        shortcut.enableShortcut()
      }
      univerAPI.setPermissionDialogVisible(false)
      root.dataset.mode = next
      for (const button of controls.querySelectorAll<HTMLButtonElement>('[data-mode]')) {
        button.disabled = button.dataset.mode === next
        button.setAttribute('aria-pressed', String(button.disabled))
      }
      root.dataset.ready = 'true'
      editor.setAttribute('aria-busy', 'false')
      root.dataset.state = 'ready'
      status.textContent =
        next === 'display'
          ? zh
            ? '只读 · 禁止选择与快捷键'
            : 'Read-only · selection and shortcuts disabled'
          : next === 'selectable'
            ? zh
              ? '只读 · 可选择和导航'
              : 'Read-only · selection and navigation enabled'
            : zh
              ? '可编辑 · E4 预约人数驱动 F4 余位公式'
              : 'Editable · E4 bookings drive F4 availability'
    })()
      .catch((error) => {
        if (disposed) return
        root.dataset.state = 'error'
        status.textContent = labels.error + ' ' + (error instanceof Error ? error.message : String(error))
      })
      .finally(() => {
        pending = undefined
        if (!disposed) controls.disabled = false
      })
    return pending
  }
  const initialize = () => {
    if (
      disposed ||
      started ||
      !workbook ||
      univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Rendered
    )
      return
    started = true
    applyMode('display')
  }
  const subscriptions = [
    ...[univerAPI.Event.BeforeUndo, univerAPI.Event.BeforeRedo].map((event) =>
      univerAPI.addEvent(event, (history) => {
        // Viewer permissions alone do not block existing Undo history in beta.2.
        history.cancel = root.dataset.ready !== 'true' || !workbook.getWorkbookPermission().canEdit()
        if (history.cancel && !disposed) status.textContent = labels.blocked
      }),
    ),
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, initialize),
  ]
  workbook = univerAPI.createWorkbook(structuredClone(saved))
  initialize()
  for (const button of controls.querySelectorAll<HTMLButtonElement>('[data-mode]')) {
    button.addEventListener('click', () => applyMode(button.dataset.mode as Mode), { signal: domEvents.signal })
  }
  return {
    univerAPI,
    setMode: applyMode,
    dispose() {
      if (disposed) return
      disposed = true
      domEvents.abort()
      subscriptions.forEach((subscription) => subscription.dispose())
      shortcut.enableShortcut()
      root.remove()
      if (demoWindow.univerAPI === univerAPI) delete demoWindow.univerAPI
      // The Facade permission API has no cancellation handle. Keep its owner
      // alive until an in-flight update settles, without touching detached UI.
      if (pending) return pending.then(() => univer.dispose())
      univer.dispose()
    },
  }
}
