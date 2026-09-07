/* eslint-disable no-await-in-loop -- Create each protection rule before setting its dependent permission points. */
import type { IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

type Profile = 'worksheet' | 'locked' | 'hidden' | 'editable' | 'mixed' | 'none'
type Shadow = 'always' | 'non-editable' | 'non-viewable' | 'none'

export function createDemo(container: HTMLElement, darkMode = false) {
  let disposed = false
  let runtime: ReturnType<typeof mount>
  const replace = async (empty: boolean) => {
    await runtime.dispose()
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
    if (!disposed) runtime = mount(container, darkMode, empty, replace)
  }
  runtime = mount(container, darkMode, false, replace)
  return {
    dispose() {
      disposed = true
      void runtime.dispose()
    },
  }
}

function mount(container: HTMLElement, darkMode: boolean, empty: boolean, replace: (empty: boolean) => Promise<void>) {
  const root = document.createElement('div')
  root.className = 'permission-shadow-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  root.dataset.ready = 'false'
  root.innerHTML = `<section><p><strong>Harbor repair café</strong> · Compare native protection shadows with actual cell permissions. Hiding a shadow does not unlock the cell.</p>
    <details class="permission-shadow-controls"><summary>Protection profiles and shadow strategies</summary>
    <fieldset disabled><label>Profile <select aria-label="Protection profile"><option value="worksheet">Whole worksheet · read-only</option><option value="locked">C4:C9 · read-only</option><option value="hidden">C4:C9 · not viewable</option><option value="editable">C4:C9 · protected but editable</option><option value="mixed">Two ranges · editable / read-only</option><option value="none">No protection</option></select></label><button data-action="profile">Apply profile</button>
    <label>Shadow <select aria-label="Shadow strategy"><option value="none">None</option><option value="always">Always</option><option value="non-editable">Non-editable only</option><option value="non-viewable">Non-viewable only</option></select></label><button data-action="shadow">Apply shadow strategy</button></fieldset>
    <fieldset disabled><label>Target <select aria-label="Permission target"><option>C4</option><option>C6</option><option>C8</option><option>B4</option><option>E9</option></select></label><button data-action="select">Select target</button><label>Hours <input type="number" aria-label="Hours value" step="any" min="0" max="168" value="7.5"></label><button data-action="write">Write if editable</button><button data-action="clear">Clear if editable</button><button data-action="sheet">Other worksheet</button></fieldset>
    <fieldset disabled><button data-action="inspect">Inspect SDK state</button><button data-action="download">Download data snapshot</button><button data-action="empty">Empty hours</button><button data-action="reset">Reset café</button></fieldset>
    <p>Shadow strategy is global within this Univer owner. Profiles affect Volunteer rota only; the second worksheet remains independent. Applying a profile replaces this demo's protection rules, not cell values. Use native cell editing to test enforcement. Host writes explicitly check canEditCell first. Developer readback and JSON still contain local data even when View is false: this is not server authorization, encryption or confidential-data removal. Reset, Empty and theme replacement clear history; Empty retains the formula. No permission-history or permission-snapshot portability is claimed.</p></details>
    <p role="status" aria-live="polite">Waiting for SDK rendering and local permissions…</p><details><summary>Developer readback · local data, not a secure viewer</summary><pre aria-label="Permission readback"></pre></details></section><div class="permission-shadow-editor"></div>`
  container.append(root)
  root.querySelector<HTMLDetailsElement>('.permission-shadow-controls')!.open =
    container.clientWidth >= 600 && container.clientHeight >= 850
  const editor = root.querySelector<HTMLElement>('.permission-shadow-editor')!
  const status = root.querySelector<HTMLElement>('[role="status"]')!
  const output = root.querySelector<HTMLElement>('pre')!
  const profile = root.querySelector<HTMLSelectElement>('[aria-label="Protection profile"]')!
  const shadow = root.querySelector<HTMLSelectElement>('[aria-label="Shadow strategy"]')!
  const target = root.querySelector<HTMLSelectElement>('[aria-label="Permission target"]')!
  const value = root.querySelector<HTMLInputElement>('[aria-label="Hours value"]')!
  const dom = new AbortController()
  // Gate native input only while asynchronous local permission transitions are pending.
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
  ])
    editor.addEventListener(
      event,
      (input) => {
        if (root.dataset.ready === 'true') return
        input.preventDefault()
        input.stopImmediatePropagation()
      },
      { capture: true, signal: dom.signal },
    )
  // Keep native extensions registered initially; 'none' is applied through the runtime Facade once rendered.
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: enUS },
    presets: [UniverSheetsCorePreset({ ribbonType: 'grid', container: editor })],
  })
  let disposed = false,
    initialized = false,
    frame = 0,
    initializeFrame = 0,
    readGeneration = 0,
    calculating = false
  let pending: Promise<void> | undefined, released: Promise<void> | undefined
  let appliedProfile: Profile = 'worksheet'
  const engine = univerAPI.getFormula()
  const setBusy = (busy: boolean) => {
    root.dataset.ready = String(!busy)
    editor.setAttribute('aria-busy', String(busy))
    for (const fieldset of root.querySelectorAll<HTMLFieldSetElement>(':scope > section fieldset'))
      fieldset.disabled = busy
  }
  const sheet = () => workbook.getSheetBySheetId('rota')!
  const refresh = async () => {
    if (disposed || !initialized) return
    const generation = ++readGeneration
    const permission = sheet().getWorksheetPermission()
    const rules = await permission.listRangeProtectionRules({ ignoreCollaborators: true })
    if (disposed || generation !== readGeneration) return
    output.textContent = JSON.stringify(
      {
        hostProfile: appliedProfile,
        shadowStrategy: univerAPI.getProtectedRangeShadowStrategy(),
        activeSheet: workbook.getActiveSheet()?.getSheetId(),
        worksheetProtected: permission.isProtected(),
        worksheetPermissions: permission.getSnapshot(),
        rules: rules.map((rule) => ({
          id: rule.id,
          ranges: rule.ranges.map((range) => range.getA1Notation()),
          permissions: rule.getSnapshot(),
        })),
        cells: Object.fromEntries(
          ['C4', 'C6', 'C8', 'B4', 'E9'].map((address) => {
            const range = sheet().getRange(address)
            return [
              address,
              {
                canEdit: permission.canEditCell(range.getRow(), range.getColumn()),
                canView: permission.canViewCell(range.getRow(), range.getColumn()),
              },
            ]
          }),
        ),
        rawValues: sheet().getRange('A1:E14').getRawValues(),
        formulas: sheet().getRange('A1:E14').getFormulas(),
        notes: workbook.getSheetBySheetId('notes')!.getRange('A1:D5').getRawValues(),
      },
      null,
      2,
    )
  }
  const schedule = () => {
    cancelAnimationFrame(frame)
    if (!disposed && initialized)
      frame = requestAnimationFrame(() => {
        void refresh().catch((error) => {
          if (!disposed) status.textContent = 'Readback failed: ' + String(error)
        })
      })
  }
  const applyProfile = async (next: Profile) => {
    const permission = sheet().getWorksheetPermission()
    if (permission.isProtected() && !(await permission.unprotect()))
      throw new Error('SDK did not remove worksheet protection.')
    const rules = await permission.listRangeProtectionRules({ ignoreCollaborators: true })
    if (rules.length && !(await permission.unprotectRules(rules.map((rule) => rule.id))))
      throw new Error('SDK did not remove range rules.')
    if (next === 'worksheet') {
      await permission.protect()
      await permission.setPoint(univerAPI.Enum.WorksheetPermissionPoint.Edit, false)
    } else if (next !== 'none') {
      const ranges = next === 'mixed' ? ['C4:C6', 'C7:C9'] : ['C4:C9']
      for (const [index, address] of ranges.entries()) {
        const rule = await sheet()
          .getRange(address)
          .getRangePermission()
          .protect({ name: 'Café ' + address })
        await rule.setPoint(
          univerAPI.Enum.RangePermissionPoint.Edit,
          next === 'editable' || (next === 'mixed' && index === 0),
        )
        await rule.setPoint(univerAPI.Enum.RangePermissionPoint.View, next !== 'hidden')
      }
    }
    appliedProfile = next
  }
  const run = (operation: () => Promise<void>) => {
    if (disposed || pending) return
    setBusy(true)
    pending = operation()
      .then(async () => {
        if (disposed) return
        sheet().refreshCanvas()
        await refresh()
      })
      .catch((error) => {
        if (!disposed) status.textContent = 'Action failed: ' + (error instanceof Error ? error.message : String(error))
      })
      .finally(() => {
        pending = undefined
        if (!disposed) setBusy(false)
      })
  }
  const events = [
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== univerAPI.Enum.LifecycleStages.Rendered || initialized) return
      initializeFrame = requestAnimationFrame(() => {
        if (disposed) return
        initialized = true
        run(async () => {
          univerAPI.setPermissionDialogVisible(false)
          univerAPI.setProtectedRangeShadowStrategy('none')
          await applyProfile('worksheet')
          status.textContent = 'Ready. Worksheet editing is blocked even though protection shadows are hidden.'
        })
      })
    }),
    univerAPI.addEvent(univerAPI.Event.CommandExecuted, schedule),
    engine.calculationStart(() => {
      calculating = true
    }),
    engine.calculationEnd(() => {
      calculating = false
      schedule()
    }),
    engine.calculationResultApplied(schedule),
  ]
  const data = structuredClone(WORKBOOK_DATA) as Partial<IWorkbookData>
  if (empty) for (let row = 3; row <= 8; row++) data.sheets!.rota.cellData![row][2] = {}
  const workbook = univerAPI.createWorkbook(data)
  for (const button of root.querySelectorAll<HTMLButtonElement>('[data-action]'))
    button.addEventListener(
      'click',
      () => {
        if (!initialized || disposed || pending) return
        const action = button.dataset.action
        if (action === 'reset' || action === 'empty') {
          setBusy(true)
          void replace(action === 'empty')
          return
        }
        run(async () => {
          if (action === 'profile') await applyProfile(profile.value as Profile)
          else if (action === 'shadow') univerAPI.setProtectedRangeShadowStrategy(shadow.value as Shadow)
          else if (action === 'sheet')
            workbook.setActiveSheet(workbook.getActiveSheet()?.getSheetId() === 'rota' ? 'notes' : 'rota')
          else if (action === 'select') {
            if (workbook.getActiveSheet()?.getSheetId() !== 'rota') workbook.setActiveSheet('rota')
            sheet().getRange(target.value).activate()
            sheet().scrollToCell(sheet().getRange(target.value).getRow(), sheet().getRange(target.value).getColumn())
          } else if (action === 'write' || action === 'clear') {
            const range = sheet().getRange(target.value)
            if (!sheet().getWorksheetPermission().canEditCell(range.getRow(), range.getColumn())) {
              status.textContent = 'Blocked by SDK permission readback: ' + target.value + ' was not changed.'
              return
            }
            if (action === 'clear') range.clearContent()
            else {
              // The fieldset is disabled while this operation runs, so browser validity checks are barred.
              if (
                !value.value.trim() ||
                !Number.isFinite(value.valueAsNumber) ||
                value.valueAsNumber < 0 ||
                value.valueAsNumber > 168
              )
                throw new Error('Enter finite hours from 0 to 168.')
              range.setValue(value.valueAsNumber)
            }
          } else if (action === 'download') {
            const href = URL.createObjectURL(
              new Blob([JSON.stringify(workbook.save(), null, 2)], { type: 'application/json' }),
            )
            const link = document.createElement('a')
            link.href = href
            link.download = 'harbor-repair-cafe.json'
            link.click()
            setTimeout(() => URL.revokeObjectURL(href), 1000)
          }
          status.textContent =
            'Applied ' + button.textContent + '. Compare actual SDK permissions, data and native editing.'
        })
      },
      { signal: dom.signal },
    )
  return {
    dispose() {
      if (released) return released
      disposed = true
      dom.abort()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(initializeFrame)
      root.remove()
      released = (pending ?? Promise.resolve())
        .catch(() => {})
        .then(
          () =>
            new Promise<void>((resolve) => {
              const release = () => {
                events.forEach((event) => event.dispose())
                univer.dispose()
                resolve()
              }
              if (calculating) {
                const ended = engine.calculationEnd(() => {
                  ended.dispose()
                  queueMicrotask(release)
                })
              } else release()
            }),
        )
      return released
    },
  }
}
