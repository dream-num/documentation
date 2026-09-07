import CollaborationClientEnUS from '@univerjs-pro/collaboration-client/locale/en-US'
import {
  IAuthzIoService,
  IMentionIOService,
  IUndoRedoService,
  LocaleType,
  mergeLocales,
  Univer,
  UniverInstanceType,
} from '@univerjs/core'
import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US'
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import SheetsEnUS from '@univerjs/sheets/locale/en-US'
import UIEnUS from '@univerjs/ui/locale/en-US'

import {
  clearStoredCollaborationUnitId,
  CollaborationUnauthorizedError,
  createCollaborationClientConfig,
  ensureCollaborationSession,
  getCollaborationBootstrapState,
  redirectToCollaborationLogin,
  replaceLocationWithCollaborationUnit,
} from './config'
import { WORKBOOK_DATA } from './data'
import { registerCollaborationPlugins, registerCorePlugins } from './function'

import './styles.css'
import '@univerjs/design/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/collaboration-client-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'

function createOwner(container: HTMLElement, darkMode: boolean, enableCollaboration: boolean) {
  const univer = new Univer({
    darkMode,
    locale: LocaleType.EN_US,
    locales: {
      [LocaleType.EN_US]: mergeLocales(
        DesignEnUS,
        CollaborationClientEnUS,
        UIEnUS,
        DocsUIEnUS,
        SheetsEnUS,
        SheetsUIEnUS,
        SheetsFormulaUIEnUS,
        SheetsNumfmtUIEnUS,
      ),
    },
    override: enableCollaboration
      ? [
          [IAuthzIoService, null],
          [IUndoRedoService, null],
          [IMentionIOService, null],
        ]
      : [],
  })

  registerCorePlugins(univer, container)
  if (enableCollaboration) registerCollaborationPlugins(univer, createCollaborationClientConfig(true))
  const univerAPI = FUniver.newAPI(univer)
  if (!enableCollaboration) univer.createUnit(UniverInstanceType.UNIVER_SHEET, structuredClone(WORKBOOK_DATA))

  return { univer, univerAPI }
}

export function createDemo(container: HTMLElement, darkMode = false) {
  let disposed = false
  let owner: ReturnType<typeof createOwner> | undefined
  let lifecycle: { dispose(): void } | undefined
  container.dataset.ready = 'false'

  const mount = (enableCollaboration: boolean) => {
    if (disposed) return
    owner = createOwner(container, darkMode, enableCollaboration)
    container.dataset.mode = enableCollaboration ? 'collaboration' : 'local-fallback'
    lifecycle = owner.univerAPI.addEvent(owner.univerAPI.Event.LifeCycleChanged, ({ stage }) => {
      if (stage === owner?.univerAPI.Enum.LifecycleStages.Steady) container.dataset.ready = 'true'
    })
  }

  const ready = (async () => {
    const bootstrap = getCollaborationBootstrapState()
    if (!bootstrap.enableCollaboration) {
      mount(false)
      return
    }

    try {
      await ensureCollaborationSession()
      if (disposed || !bootstrap.unitId) return
      if (bootstrap.shouldUpdateUrl) {
        replaceLocationWithCollaborationUnit(bootstrap.unitId)
        return
      }
      await Promise.all([
        import('@univerjs-pro/collaboration-client/facade'),
        import('@univerjs-pro/collaboration-client-ui/facade'),
      ])
      mount(true)
    } catch (error) {
      if (disposed) return
      if (error instanceof CollaborationUnauthorizedError) {
        redirectToCollaborationLogin()
        return
      }
      clearStoredCollaborationUnitId()
      mount(false)
    }
  })()

  return {
    ready,
    dispose() {
      disposed = true
      lifecycle?.dispose()
      owner?.univer.dispose()
      delete container.dataset.mode
      delete container.dataset.ready
    },
  }
}
