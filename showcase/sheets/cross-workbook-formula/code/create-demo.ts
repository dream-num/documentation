import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import type { Book } from './data'
import { bookNames, createWorkbooks, IDS } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _legacyLocale?: LocaleType) {
  const root = document.createElement('div')
  root.className = 'cross-workbook-demo'
  root.dataset.ready = 'false'
  const label = document.createElement('label')
  label.className = 'workbook-picker'
  label.append('Workbook ')
  const picker = document.createElement('select')
  picker.setAttribute('aria-label', 'Viewed workbook')
  picker.disabled = true
  const names = bookNames()
  for (const key of Object.keys(IDS) as Book[]) picker.add(new Option(names[key], key))
  label.append(picker)
  const editor = document.createElement('div')
  editor.className = 'cross-workbook-editor'
  root.append(label, editor)
  container.append(root)
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [UniverSheetsCorePreset({ container: editor, ribbonType: 'grid' })],
  })
  const owner = window as Window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  const engine = univerAPI.getFormula()
  const events = new AbortController()
  let disposed = false,
    calculating = false,
    frame = 0
  let released: Promise<void> | undefined
  const subscriptions = [
    engine.calculationStart(() => {
      calculating = true
    }),
    engine.calculationEnd(() => {
      calculating = false
    }),
  ]
  for (const data of createWorkbooks()) univerAPI.createWorkbook(data, { makeCurrent: data.id === IDS.summary })
  picker.addEventListener('change', () => univerAPI.setCurrent(IDS[picker.value as Book]), { signal: events.signal })
  const gate = (event: Event) => {
    if (root.dataset.ready !== 'true') {
      event.preventDefault()
      event.stopImmediatePropagation()
    }
  }
  for (const event of ['pointerdown', 'keydown', 'beforeinput', 'paste', 'drop'])
    editor.addEventListener(event, gate, { capture: true, signal: events.signal })
  function initialize() {
    if (disposed) return
    if (univerAPI.getCurrentLifecycleStage() < univerAPI.Enum.LifecycleStages.Steady || calculating) {
      frame = requestAnimationFrame(initialize)
      return
    }
    // setCurrent() requires the render unit; createWorkbook() alone is not enough before Steady.
    if (univerAPI.getActiveWorkbook()?.getId() !== IDS.summary) univerAPI.setCurrent(IDS.summary)
    const applied = engine.onCalculationResultApplied(30000)
    engine.executeCalculation()
    void applied
      .then(() => {
        if (disposed) return
        root.dataset.ready = 'true'
        picker.disabled = false
      })
      .catch((error) => {
        if (disposed) return
        root.dataset.error = String(error)
        const alert = document.createElement('p')
        alert.setAttribute('role', 'alert')
        alert.textContent = 'SDK calculation failed: ' + String(error)
        root.prepend(alert)
      })
  }
  frame = requestAnimationFrame(initialize)
  return {
    univerAPI,
    dispose() {
      if (released) return released
      disposed = true
      events.abort()
      cancelAnimationFrame(frame)
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      released = new Promise<void>((resolve) => {
        const release = () => {
          subscriptions.forEach((s) => s.dispose())
          try {
            univer.dispose()
          } finally {
            root.remove()
            resolve()
          }
        }
        if (calculating) {
          const ended = engine.calculationEnd(() => {
            ended.dispose()
            queueMicrotask(release)
          })
        } else release()
      })
      return released
    },
  }
}
