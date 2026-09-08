import { UniverLicensePlugin } from '@univerjs-pro/license'
import { IConfigService, JSONX } from '@univerjs/core'
import { RichTextEditingMutation } from '@univerjs/docs'
import { DOCS_UI_PLUGIN_CONFIG_KEY } from '@univerjs/docs-ui'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import DocsEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'

import { createData } from './data'

import '@univerjs/preset-docs-core/lib/index.css'
import './styles.css'

export function createDemo(container: HTMLElement, darkMode = false, _locale: LocaleType = LocaleType.EN_US) {
  const root = document.createElement('div')
  root.className = 'responsive-demo'
  root.dataset.theme = darkMode ? 'dark' : 'light'
  const label = 'External container width'
  root.innerHTML =
    '<label class="responsive-control">' +
    label +
    '<select aria-label="' +
    label +
    '" disabled><option value="fluid">' +
    'Fluid' +
    '</option><option value="960">960 px</option><option value="600">600 px</option><option value="390">390 px</option><option value="320">320 px</option></select></label>' +
    '<p role="alert" hidden></p><div class="responsive-host"><div class="responsive-editor"></div></div>'
  container.append(root)
  const widthSelect = root.querySelector('select')!
  const host = root.querySelector<HTMLElement>('.responsive-host')!
  const editor = root.querySelector<HTMLElement>('.responsive-editor')!
  const error = root.querySelector<HTMLElement>('[role=alert]')!
  const { univer, univerAPI: api } = createUniver({
    darkMode,
    locale: LocaleType.EN_US,
    locales: { [LocaleType.EN_US]: DocsEnUS },
    presets: [
      UniverDocsCorePreset({ ribbonType: 'grid', container: editor, header: true, toolbar: true, footer: true }),
    ],
    plugins: [UniverLicensePlugin],
  })
  // Disable automatic view fitting: native zoom must magnify text, not shrink it to the host.
  const config = univer.__getInjector().get(IConfigService)
  config.setConfig(DOCS_UI_PLUGIN_CONFIG_KEY, {
    ...config.getConfig<Record<string, unknown>>(DOCS_UI_PLUGIN_CONFIG_KEY),
    container: editor,
    fitToWidth: { mode: 'none' },
  })
  const owner = window as typeof window & { univerAPI?: typeof api }
  owner.univerAPI = api
  let disposed = false
  let rendered = false
  let resizeFrame = 0
  function reflow() {
    if (disposed || !rendered || !editor.clientWidth) return
    try {
      const oldWidth = doc.save().documentStyle.pageSize!.width
      const pageWidth = Math.min(820, Math.max(240, Math.floor(editor.clientWidth - 16)))
      // A failed layout can leave the model at the requested width. A no-op is not recovery.
      if (oldWidth === pageWidth && root.dataset.ready === 'error') return
      if (
        oldWidth !== pageWidth &&
        !api.syncExecuteCommand(RichTextEditingMutation.id, {
          unitId: doc.getId(),
          noHistory: true,
          textRanges: null,
          actions: JSONX.getInstance().replaceOp(['documentStyle', 'pageSize', 'width'], oldWidth, pageWidth),
        })
      )
        throw new Error('The SDK rejected the page width update.')
      error.hidden = true
      root.dataset.ready = 'true'
      widthSelect.disabled = false
    } catch (cause) {
      root.dataset.ready = 'error'
      error.textContent = 'SDK layout failed: ' + (cause instanceof Error ? cause.message : String(cause))
      error.hidden = false
      widthSelect.disabled = false
      console.error(cause)
    }
  }
  const lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
    if (disposed || stage !== api.Enum.LifecycleStages.Rendered) return
    rendered = true
    reflow()
  })
  const doc = api.createDocument(createData())
  const onWidthChange = () => {
    host.style.width = widthSelect.value === 'fluid' ? '100%' : widthSelect.value + 'px'
  }
  widthSelect.addEventListener('change', onWidthChange)
  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(reflow)
  })
  resize.observe(editor)
  return {
    univerAPI: api,
    setDarkMode(value: boolean) {
      root.dataset.theme = value ? 'dark' : 'light'
      api.toggleDarkMode(value)
    },
    dispose() {
      if (disposed) return
      disposed = true
      widthSelect.removeEventListener('change', onWidthChange)
      resize.disconnect()
      cancelAnimationFrame(resizeFrame)
      lifecycle.dispose()
      if (owner.univerAPI === api) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
