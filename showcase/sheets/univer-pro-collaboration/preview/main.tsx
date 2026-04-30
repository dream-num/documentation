'use client'

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
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import {
  clearStoredCollaborationUnitId,
  CollaborationUnauthorizedError,
  createCollaborationClientConfig,
  createCollaborationSheetUnit,
  ensureCollaborationSession,
  getCollaborationBootstrapState,
  persistCollaborationUnitId,
  redirectToCollaborationLogin,
  replaceLocationWithCollaborationUnit,
} from '../code/config'
import { WORKBOOK_DATA } from '../code/data'
import { registerCollaborationPlugins, registerCorePlugins } from '../code/function'

import '@univerjs-pro/collaboration-client/facade'
import '@univerjs-pro/collaboration-client-ui/facade'

import '@univerjs/design/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs-pro/collaboration-client-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/ui/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  useEffect(() => {
    if (!divRef.current) {
      return
    }

    const bootstrapState = getCollaborationBootstrapState()

    async function prepareCollaborationLocation() {
      if (!bootstrapState.enableCollaboration) {
        return {
          ready: true,
          source: bootstrapState.source,
          unitId: null as string | null,
        }
      }

      await ensureCollaborationSession()

      let unitId = bootstrapState.unitId
      let source = bootstrapState.source

      if (!unitId) {
        unitId = await createCollaborationSheetUnit()
        source = 'create'
      }

      if (!unitId) {
        return {
          ready: false,
          source,
          unitId,
        }
      }

      persistCollaborationUnitId(unitId)

      if (bootstrapState.shouldUpdateUrl || source !== 'query') {
        replaceLocationWithCollaborationUnit(unitId)

        return {
          ready: false,
          source,
          unitId,
        }
      }

      return {
        ready: true,
        source,
        unitId,
      }
    }

    let univerAPI: ReturnType<typeof FUniver.newAPI> | null = null

    async function load() {
      try {
        const locationState = await prepareCollaborationLocation()

        if (!locationState.ready) {
          return
        }

        const univer = new Univer({
          darkMode: theme === 'dark',
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

        registerCorePlugins(univer, divRef.current)
        registerCollaborationPlugins(univer, createCollaborationClientConfig(bootstrapState.enableCollaboration))

        univerAPI = FUniver.newAPI(univer)

        if (bootstrapState.enableCollaboration && locationState.unitId) {
          return
        }

        univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA)
      } catch (error) {
        console.error(error)

        if (error instanceof CollaborationUnauthorizedError) {
          redirectToCollaborationLogin()
          return
        }

        clearStoredCollaborationUnitId()

        const univer = new Univer({
          darkMode: theme === 'dark',
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

        registerCorePlugins(univer, divRef.current)
        registerCollaborationPlugins(univer, createCollaborationClientConfig(false))
        univerAPI = FUniver.newAPI(univer)
        univer.createUnit(UniverInstanceType.UNIVER_SHEET, WORKBOOK_DATA)
      }
    }

    void load()

    return () => {
      univerAPI?.dispose()
    }
  }, [theme])

  return <div ref={divRef} className="h-full" />
}
