'use client'

import { createComponent } from '@lit/react'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'
import sheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN'
import { html, LitElement } from 'lit'
import { useTheme } from 'nextra-theme-docs'
import { useEffect, useState } from 'react'
import React from 'react'
import { Preview } from '@/components/preview'
import { useCodeHighlight } from '@/hooks/use-code'
import { WORKBOOK_DATA } from './data'

const code = `
import { html, LitElement } from 'lit'
import { createUniver, defaultTheme, LocaleType, merge } from '@univerjs/presets'

import { UniverSheetsCorePreset } from '@univerjs/presets/preset-sheets-core'
import sheetsCoreEnUS from '@univerjs/presets/preset-sheets-core/locales/en-US'

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
    return html\`
      <link rel="stylesheet" href="https://unpkg.com/@univerjs/preset-sheets-core/lib/index.css">
      <div style="height: 100%;" id="containerId" />
    \`
  }
}

window.customElements.define('my-univer', MyWebComponent)
`

interface IDemoProps {
  lang: 'zh-CN' | 'en-US'
}

const localesMap = {
  'zh-CN': {
    name: 'ZH_CN',
    locale: LocaleType.ZH_CN,
    locales: merge(
      {},
      sheetsCoreZhCN,
    ),
  },
  'en-US': {
    name: 'EN_US',
    locale: LocaleType.EN_US,
    locales: merge(
      {},
      sheetsCoreEnUS,
    ),
  },
}

export default function Demo(props: IDemoProps) {
  const { lang } = props

  const [App, setApp] = useState<React.ComponentType | null>(null)

  const { theme } = useTheme()

  const { locale, locales } = localesMap[lang]

  useEffect(() => {
    class MyWebComponent extends LitElement {
      override firstUpdated() {
        const container = this.renderRoot.querySelector('#containerId') as HTMLDivElement

        const { univerAPI } = createUniver({
          darkMode: theme === 'dark',
          locale,
          locales: {
            [locale]: locales,
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

    const App = createComponent({
      tagName: 'my-univer',
      elementClass: MyWebComponent,
      react: React,
      events: {
        onMyEvent: 'my-event',
      },
    })

    setApp(App)
  }, [])

  const codeWithHighlight = useCodeHighlight({
    code,
    lang,
  })

  return (
    <>
      {App && <Preview component={<App />} code={codeWithHighlight} />}
    </>
  )
}
