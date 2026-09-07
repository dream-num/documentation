import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import enUS from '@univerjs/preset-sheets-core/locales/en-US'
import { createUniver, LocaleType } from '@univerjs/presets'
import { html, LitElement } from 'lit'

import { WORKBOOK_DATA } from './data'

// Global styles cover SDK portals; the same installed CSS is bundled as an asset for the shadow root.
import '@univerjs/preset-sheets-core/lib/index.css'
const stylesheet = new URL('@univerjs/preset-sheets-core/lib/index.css', import.meta.url).href
const tag = 'univer-sheets-lit-demo'

class UniverElement extends LitElement {
  darkMode = false
  private univer?: ReturnType<typeof createUniver>['univer']

  override connectedCallback() {
    super.connectedCallback()
    void this.updateComplete.then(() => {
      if (!this.isConnected || this.univer) return
      const { univer, univerAPI } = createUniver({
        darkMode: this.darkMode,
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: enUS },
        presets: [
          UniverSheetsCorePreset({
            ribbonType: 'grid',
            container: this.renderRoot.querySelector<HTMLElement>('#editor')!,
          }),
        ],
      })
      this.univer = univer
      univerAPI.createWorkbook(structuredClone(WORKBOOK_DATA))
      this.dataset.ready = 'true'
    })
  }

  override disconnectedCallback() {
    const univer = this.univer
    this.univer = undefined
    // Disconnection can happen inside an enclosing React commit; capture this owner.
    queueMicrotask(() => univer?.dispose())
    delete this.dataset.ready
    super.disconnectedCallback()
  }

  override render() {
    return html`<style>
        :host {
          display: block;
          height: 100%;
        }
      </style>
      <link rel="stylesheet" href=${stylesheet} />
      <div id="editor" style="height:100%"></div>`
  }
}

export function createDemo(container: HTMLElement, darkMode = false) {
  if (!customElements.get(tag)) customElements.define(tag, UniverElement)
  const element = document.createElement(tag) as UniverElement
  element.darkMode = darkMode
  container.append(element)
  return { dispose: () => element.remove() }
}
