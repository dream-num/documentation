'use client'

import { LocaleType, merge, Univer, UniverInstanceType } from '@univerjs/core'
// import { FUniver } from '@univerjs/core/facade'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { useEffect, useRef } from 'react'
import { DOCUMENT_DATA } from '../code/data'

import '@univerjs/engine-formula/facade'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  useEffect(() => {
    const univer = new Univer({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: merge(
          {},
          DesignEnUS,
          UIEnUS,
          DocsUIEnUS,
        ),
      },
    })

    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverFormulaEnginePlugin)
    univer.registerPlugin(UniverUIPlugin, {
      container: divRef.current,
    })
    univer.registerPlugin(UniverDocsPlugin)
    univer.registerPlugin(UniverDocsUIPlugin)

    univer.createUnit(UniverInstanceType.UNIVER_DOC, DOCUMENT_DATA)

    // const univerAPI = FUniver.newAPI(univer)
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
