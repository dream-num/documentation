'use client'

import type { DocumentDataModel } from '@univerjs/core'
import { IUniverInstanceService, LocaleType, Univer, UniverInstanceType } from '@univerjs/core'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Terminal, TypingAnimation } from '@/components/magicui/terminal'
import { DOCUMENT_DATA } from '../code/data'

export default function Preview() {
  const [snapshots, setSnapshots] = useState<string>('')

  const { theme } = useTheme()

  useEffect(() => {
    const univer = new Univer({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: {},
      },
    })

    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverFormulaEnginePlugin)

    univer.registerPlugin(UniverDocsPlugin)

    univer.createUnit(UniverInstanceType.UNIVER_DOC, DOCUMENT_DATA)

    const injector = univer.__getInjector()
    const univerInstanceService = injector.get(IUniverInstanceService)

    const units = univerInstanceService.getAllUnitsForType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)

    const snapshots = units.map(unit => unit.getSnapshot())

    setSnapshots(JSON.stringify(snapshots, null, 2))

    return () => {
      univer.dispose()
    }
  }, [theme])

  return (
    <div className="h-full">
      <Terminal>
        <TypingAnimation duration={0}>{snapshots}</TypingAnimation>
      </Terminal>
    </div>
  )
}
