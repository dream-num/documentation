import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { BASE_RECORD_ID_FIELD_ID, LocaleType, mergeLocales, Univer, type IGridViewConfig } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'

import { DATA, VARIANTS } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'

// The full host interaction is shared by Preview and the standalone entry.
export function createDemo(container: HTMLElement, darkMode = false) {
  const root = document.createElement('div')
  root.className = 'base-feature'
  root.innerHTML =
    '<fieldset class="base-feature-controls" disabled><label>Variant<select aria-label="Variant"></select></label><label>View<select aria-label="Active view"><option value="working">Working view</option><option value="reference">Reference view</option></select></label><label>Sample width<input aria-label="Sample width" type="number" min="80" max="640" value="240"></label><button type="button" data-action="width">Apply width</button><button type="button" data-action="toggle-notes">Toggle field notes</button><button type="button" data-action="inspect">Inspect</button><button type="button" data-action="reset">Reset</button></fieldset><p class="base-feature-activity" role="status">Starting Base…</p><p role="alert" hidden></p><details><summary>SDK projection and settings</summary><pre><output aria-label="SDK readback"></output></pre></details><div class="base-feature-editor"></div>'
  container.append(root)
  const controls = root.querySelector('fieldset')!
  const select = root.querySelector<HTMLSelectElement>('[aria-label="Variant"]')!
  for (const variant of VARIANTS) select.add(new Option(variant.label, variant.id))
  const custom = new Option('Custom / edited', 'custom')
  custom.disabled = true
  select.add(custom)
  const output = root.querySelector('output')!
  const activity = root.querySelector<HTMLElement>('[role="status"]')!
  const error = root.querySelector<HTMLElement>('[role="alert"]')!
  const events = new AbortController()
  let disposed = false
  let ready = false
  let activeViewId = 'working'
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, BasesEnUS, BasesUIEnUS) },
  })
  univer.registerPlugin(UniverRenderEnginePlugin)
  univer.registerPlugin(UniverUIPlugin, {
    container: root.querySelector<HTMLElement>('.base-feature-editor')!,
    ribbonType: 'grid',
  })
  univer.registerPlugin(UniverDocsPlugin)
  univer.registerPlugin(UniverDocsUIPlugin)
  univer.registerPlugin(UniverDrawingPlugin)
  univer.registerPlugin(UniverLicensePlugin)
  univer.registerPlugin(UniverBasesPlugin)
  univer.registerPlugin(UniverBasesUIPlugin)
  const univerAPI = FUniver.newAPI(univer)
  let base = univerAPI.createBase(structuredClone(DATA))
  const table = () => {
    const current = base.getTableById('records')
    if (!current) throw new Error('The demo table was removed. Reset to restore it.')
    return current
  }
  const view = () => {
    const current = table().getViewById(activeViewId)
    if (!current) throw new Error('The selected view was removed. Reset to restore it.')
    return current
  }
  function readSettings() {
    const current = view()
    const snapshot = current.getView()
    if (current.getType() !== univerAPI.Enum.BaseViewType.Grid) throw new Error('Choose a Grid view for this demo.')
    const config = current.getConfig() as IGridViewConfig
    const visible = current.getVisibleFields().map((field) => field.getId())
    const width = current.getFieldSettings('sample').width
    select.value =
      VARIANTS.find(
        (item) =>
          JSON.stringify(snapshot.fieldOrder?.filter((id) => id !== BASE_RECORD_ID_FIELD_ID)) ===
            JSON.stringify(item.order) &&
          JSON.stringify(visible) === JSON.stringify(item.order.filter((id) => item.visible.includes(id))) &&
          config.rowHeight === item.rowHeight &&
          config.frozenFieldCount === item.frozen &&
          width === item.width,
      )?.id ?? 'custom'
    const reference = table().getViewById('reference')!
    return {
      config: current.getConfig(),
      fieldOrder: snapshot.fieldOrder,
      visibleFieldIds: visible,
      fieldWidths: Object.fromEntries(visible.map((id) => [id, current.getFieldSettings(id).width])),
      tableFieldOrder: table().getTable().fieldOrder,
      reference: {
        config: reference.getConfig(),
        fieldOrder: reference.getView().fieldOrder,
        visibleFieldIds: reference.getVisibleFields().map((field) => field.getId()),
      },
    }
  }
  function inspect() {
    const settings = readSettings()
    const projection = view().getProjection()
    if (projection.type === 'invalid') throw new Error('Invalid view projection: ' + projection.reason)
    const sourceRecords = table().getRecords()
    output.textContent = JSON.stringify(
      {
        activeViewId,
        ...settings,
        visibleRecordIds: projection.rows.map((row) => row.recordId),
        visibleRows: projection.rows,
        sourceRecordIds: sourceRecords.map((record) => record.getId()),
        sourceValues: sourceRecords.map((record) => ({ id: record.getId(), values: record.getValues() })),
      },
      null,
      2,
    )
    activity.textContent = projection.rows.length + ' of ' + sourceRecords.length + ' records · ' + view().getName()
  }
  async function activate() {
    const ui = univerAPI.getBaseUI()
    await ui.activateTable(table().getId())
    if (disposed) return
    await ui.activateView(activeViewId)
    if (disposed) return
    ui.closeLeftSidebar()
  }
  async function run(action: () => void | Promise<void>) {
    if (disposed) return
    controls.disabled = true
    error.hidden = true
    try {
      await action()
      if (!disposed) inspect()
    } catch (cause) {
      if (!disposed) {
        error.textContent = cause instanceof Error ? cause.message : String(cause)
        error.hidden = false
      }
    } finally {
      if (!disposed) controls.disabled = !ready
    }
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
    if (stage !== univerAPI.Enum.LifecycleStages.Rendered || ready) return
    void run(async () => {
      await activate()
      if (!disposed) {
        ready = true
        root.dataset.ready = 'true'
      }
    })
  })
  const edits = univerAPI.addEvent(univerAPI.Event.BaseTableCellValueChanged, () => {
    if (ready && !disposed) void run(() => {})
  })
  select.addEventListener(
    'change',
    () => {
      void run(() => {
        const variant = VARIANTS.find((item) => item.id === select.value)
        if (!variant) throw new Error('Choose a supported variant.')
        const current = view()
        variant.order.slice(1).forEach((id, index) => current.moveField(id, { afterFieldId: variant.order[index] }))
        DATA.tables.records.fieldOrder.forEach((id) => current.setFieldVisible(id, variant.visible.includes(id)))
        current.setFieldWidth('sample', variant.width)
        current.updateConfig({ rowHeight: variant.rowHeight, frozenFieldCount: variant.frozen })
        root.querySelector<HTMLInputElement>('[aria-label="Sample width"]')!.value = String(variant.width)
      })
    },
    { signal: events.signal },
  )
  controls.addEventListener(
    'click',
    (event) => {
      const action = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]')?.dataset.action
      if (!action) return
      void run(async () => {
        if (action === 'reset') {
          univerAPI.disposeUnit(base.getId())
          base = univerAPI.createBase(structuredClone(DATA))
          activeViewId = 'working'
          root.querySelector<HTMLSelectElement>('[aria-label="Active view"]')!.value = 'working'
          root.querySelector<HTMLInputElement>('[aria-label="Sample width"]')!.value = '240'
          await activate()
        } else if (action === 'inspect') {
          root.querySelector('details')!.open = true
        }
        if (action === 'width') {
          const width = root.querySelector<HTMLInputElement>('[aria-label="Sample width"]')!.valueAsNumber
          if (!Number.isFinite(width) || width < 80 || width > 640)
            throw new Error('Width must be between 80 and 640 pixels. No layout change applied.')
          view().setFieldWidth('sample', width)
        } else if (action === 'toggle-notes') {
          view().setFieldVisible('notes', Boolean(view().getFieldSettings('notes').hidden))
        }
      })
    },
    { signal: events.signal },
  )
  root.querySelector<HTMLSelectElement>('[aria-label="Active view"]')!.addEventListener(
    'change',
    (event) => {
      void run(async () => {
        activeViewId = (event.target as HTMLSelectElement).value
        await activate()
        root.querySelector<HTMLInputElement>('[aria-label="Sample width"]')!.value = String(
          view().getFieldSettings('sample').width,
        )
      })
    },
    { signal: events.signal },
  )
  return {
    dispose() {
      disposed = true
      events.abort()
      lifecycle.dispose()
      edits.dispose()
      univer.dispose()
      root.remove()
    },
  }
}
