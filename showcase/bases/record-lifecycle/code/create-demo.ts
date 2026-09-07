import { UniverBasesPlugin } from '@univerjs-pro/bases'
import { UniverBasesUIPlugin } from '@univerjs-pro/bases-ui'
import BasesUIEnUS from '@univerjs-pro/bases-ui/locale/en-US'
import BasesUIZhCN from '@univerjs-pro/bases-ui/locale/zh-CN'
import BasesEnUS from '@univerjs-pro/bases/locale/en-US'
import BasesZhCN from '@univerjs-pro/bases/locale/zh-CN'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import DesignZhCN from '@univerjs/design/locale/zh-CN'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import DocsUIZhCN from '@univerjs/docs-ui/locale/zh-CN'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import UIZhCN from '@univerjs/ui/locale/zh-CN'

import { createData, PEOPLE } from './data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/bases-ui/lib/index.css'
import './styles.css'

import '@univerjs-pro/bases/facade'
import '@univerjs-pro/bases-ui/facade'
import '@univerjs/ui/facade'

export function createDemo(container: HTMLElement, darkMode = false) {
  const locale = document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US
  const root = document.createElement('div')
  root.className = 'base-records'
  container.append(root)
  const univer = new Univer({
    darkMode,
    locale,
    locales: {
      [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, BasesEnUS, BasesUIEnUS),
      [LocaleType.ZH_CN]: mergeLocales(DesignZhCN, UIZhCN, DocsUIZhCN, BasesZhCN, BasesUIZhCN),
    },
  })
  let disposed = false
  let api: FUniver
  let lifecycle: { dispose(): void } | undefined
  const demoWindow = window as Window & { univerAPI?: FUniver }
  function showStartupError(error: unknown) {
    root.dataset.error = String(error)
    const message = document.createElement('p')
    message.setAttribute('role', 'alert')
    message.textContent =
      locale === LocaleType.ZH_CN
        ? '艺术节 Base 未能启动。请重新加载；详细错误请查看控制台。'
        : 'The festival Base could not start. Reload to retry; details are in the console.'
    root.prepend(message)
  }
  function dispose() {
    if (disposed) return
    disposed = true
    lifecycle?.dispose()
    try {
      univer.dispose()
    } finally {
      if (demoWindow.univerAPI === api) delete demoWindow.univerAPI
      root.remove()
    }
  }
  try {
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, { container: root, ribbonType: 'grid' })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)
    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverLicensePlugin)
    univer.registerPlugin(UniverBasesPlugin)
    univer.registerPlugin(UniverBasesUIPlugin)
    api = FUniver.newAPI(univer)
    demoWindow.univerAPI = api
    let started = false
    lifecycle = api.addEvent(api.Event.LifeCycleChanged, ({ stage }) => {
      if (stage !== api.Enum.LifecycleStages.Rendered || started || disposed) return
      started = true
      void (async () => {
        const ui = api.getBaseUI()
        ui.setPersonOptions(PEOPLE)
        await ui.activateTable('tasks')
        if (disposed) return
        await ui.activateView('tasks-grid')
        if (disposed) return
        ui.openLeftSidebar()
        root.dataset.ready = 'true'
      })().catch((error) => {
        if (disposed) return
        showStartupError(error)
        console.error(error)
      })
    })
    api.createBase(createData())
    return { univerAPI: api, dispose }
  } catch (error) {
    dispose()
    root.replaceChildren()
    container.append(root)
    showStartupError(error)
    throw error
  }
}
