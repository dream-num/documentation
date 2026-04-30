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
  CollaborationUnauthorizedError,
  createCollaborationClientConfig,
  createCollaborationSheetUnit,
  ensureCollaborationSession,
  getCollaborationBootstrapState,
  persistCollaborationUnitId,
  redirectToCollaborationLogin,
  replaceLocationWithCollaborationUnit,
} from './config'
import { WORKBOOK_DATA } from './data'
import { registerCollaborationPlugins, registerCorePlugins } from './function'

import '@univerjs-pro/collaboration-client/facade'
import '@univerjs-pro/collaboration-client-ui/facade'

import '@univerjs/design/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/collaboration-client-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'

async function bootstrap() {
  const bootstrapState = getCollaborationBootstrapState()

  try {
    if (bootstrapState.enableCollaboration) {
      await ensureCollaborationSession()

      let unitId = bootstrapState.unitId

      if (!unitId) {
        unitId = await createCollaborationSheetUnit()
      }

      if (unitId) {
        persistCollaborationUnitId(unitId)

        if (bootstrapState.shouldUpdateUrl) {
          replaceLocationWithCollaborationUnit(unitId)
          return
        }
      }
    }
  } catch (error) {
    if (error instanceof CollaborationUnauthorizedError) {
      redirectToCollaborationLogin()
      return
    }

    throw error
  }

  const univer = new Univer({
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
    override: [
      [IAuthzIoService, null],
      [IUndoRedoService, null],
      [IMentionIOService, null],
    ],
  })

  registerCorePlugins(univer, 'app')
  registerCollaborationPlugins(univer, createCollaborationClientConfig(bootstrapState.enableCollaboration))

  if (bootstrapState.enableCollaboration) {
    FUniver.newAPI(univer)
    return
  }

  univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA)
}

void bootstrap()
