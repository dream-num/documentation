'use client'

import { createComponent } from '@lit/react'
import { UniverDocsCorePreset } from '@univerjs/preset-docs-core'
import docsCoreEnUS from '@univerjs/preset-docs-core/locales/en-US'
import { createUniver, LocaleType, merge } from '@univerjs/presets'
import { html, LitElement } from 'lit'
import React from 'react'

import '@univerjs/preset-docs-core/lib/index.css'

class MyWebComponent extends LitElement {
  override firstUpdated() {
    const container = this.renderRoot.querySelector('#containerId') as HTMLDivElement

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          docsCoreEnUS,
        ),
      },
      presets: [
        UniverDocsCorePreset({
          container,
        }),
      ],
    })

    univerAPI.createUniverDoc({})
  }

  override render() {
    return html`
      <link rel="stylesheet" href="https://unpkg.com/@univerjs/preset-docs-core/lib/index.css">
      <div style="height: 100%;" id="containerId" />
    `
  }
}

customElements.define('my-univer', MyWebComponent)

const MyUniver = createComponent({
  tagName: 'my-univer',
  elementClass: MyWebComponent,
  react: React,
  events: {
    onMyEvent: 'my-event',
  },
})

export default function Preview() {
  return (
    <MyUniver />
  )
}
