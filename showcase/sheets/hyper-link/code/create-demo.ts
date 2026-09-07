import type { IWorkbookData } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import coreEnUS from '@univerjs/preset-sheets-core/locales/en-US'
import coreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN'
import { UniverSheetsHyperLinkPreset } from '@univerjs/preset-sheets-hyper-link'
import linkEnUS from '@univerjs/preset-sheets-hyper-link/locales/en-US'
import linkZhCN from '@univerjs/preset-sheets-hyper-link/locales/zh-CN'
import { createUniver, LifecycleStages, LocaleType, mergeLocales } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

import '@univerjs/preset-sheets-core/lib/index.css'
import '@univerjs/preset-sheets-hyper-link/lib/index.css'
import './styles.css'

export function httpUrl(value: string) {
  const url = new URL(value)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password)
    throw new Error('Only absolute HTTP(S) URLs without credentials are accepted by this host.')
  return value
}

export function createDemo(container: HTMLElement, darkMode = false, saved?: IWorkbookData) {
  if (
    saved !== undefined &&
    (saved?.id !== 'driftwood-links' ||
      !Array.isArray(saved.sheetOrder) ||
      saved.sheetOrder.length !== 2 ||
      !['index', 'workshop'].every((id) => saved.sheetOrder.includes(id)) ||
      saved.sheetOrder.some((id) => {
        const sheet = saved.sheets?.[id]
        return (
          !sheet ||
          sheet.id !== id ||
          !sheet.cellData ||
          typeof sheet.cellData !== 'object' ||
          Array.isArray(sheet.cellData) ||
          ![sheet.rowCount, sheet.columnCount].every(
            (value) => typeof value === 'number' && Number.isInteger(value) && value > 0,
          )
        )
      }))
  )
    throw new Error('Restore a Driftwood snapshot with both original sheet IDs and positive dimensions')
  const root = document.createElement('div')
  root.className = 'hyperlink-demo'
  root.dataset.ready = 'false'
  const error = document.createElement('p')
  error.role = 'alert'
  error.hidden = true
  const editor = document.createElement('div')
  editor.className = 'hyperlink-editor'
  root.append(error, editor)
  container.append(root)
  let disposed = false
  const { univer, univerAPI } = createUniver({
    darkMode,
    locale: document.documentElement.lang === 'zh-CN' ? LocaleType.ZH_CN : LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(coreEnUS, linkEnUS),
      [LocaleType.ZH_CN]: mergeLocales(coreZhCN, linkZhCN),
    },
    presets: [
      UniverSheetsCorePreset({ ribbonType: 'grid', container: editor }),
      UniverSheetsHyperLinkPreset({
        urlHandler: {
          navigateToOtherWebsite: (url) => {
            if (disposed) return
            try {
              httpUrl(url)
              error.hidden = true
              window.open(url, '_blank', 'noopener,noreferrer')
            } catch (cause) {
              error.textContent =
                (document.documentElement.lang === 'zh-CN' ? '导航已阻止：' : 'Navigation blocked: ') +
                (cause instanceof Error ? cause.message : String(cause))
              error.hidden = false
            }
          },
        },
      }),
    ],
  })
  const owner = window as typeof window & { univerAPI?: typeof univerAPI }
  owner.univerAPI = univerAPI
  const markReady = () => {
    if (!disposed && univerAPI.getCurrentLifecycleStage() >= LifecycleStages.Steady) root.dataset.ready = 'true'
  }
  const lifecycle = univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, markReady)
  univerAPI.createWorkbook(structuredClone(saved ?? WORKBOOK_DATA))
  markReady()
  return {
    univerAPI,
    dispose() {
      if (disposed) return
      disposed = true
      lifecycle.dispose()
      if (owner.univerAPI === univerAPI) delete owner.univerAPI
      univer.dispose()
      root.remove()
    },
  }
}
