import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'

import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import { html, LitElement } from 'lit'

import { WORKBOOK_DATA } from './data'

class MyWebComponent extends LitElement {
  override firstUpdated() {
    const container = this.renderRoot.querySelector('#containerId') as HTMLDivElement

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          sheetsCoreEnUS,
        ),
      },
      theme: defaultTheme,
      presets: [
        UniverSheetsCorePreset({
          container,
        }),
      ],
    })

    univerAPI.createWorkbook(WORKBOOK_DATA)
  }

  override render() {
    return html`
      <link rel="stylesheet" href="https://unpkg.com/@univerjs/preset-sheets-core/lib/index.css">
      <div style="height: 100%;" id="containerId" />
    `
  }
}

window.customElements.define('my-univer', MyWebComponent)
