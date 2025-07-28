'use client'

import { LocaleType, mergeLocales, Univer, UniverInstanceType } from '@univerjs/core'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSlidesPlugin } from '@univerjs/slides'
import { UniverSlidesUIPlugin } from '@univerjs/slides-ui'
import SlidesUIEnUS from '@univerjs/slides-ui/locale/en-US'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { SLIDE_DATA } from '../code/data'

import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/slides-ui/lib/index.css'

export default function Preview() {
  const divRef = useRef<HTMLDivElement>(null!)

  const { theme } = useTheme()

  useEffect(() => {
    const univer = new Univer({
      darkMode: theme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(
          DesignEnUS,
          UIEnUS,
          DocsUIEnUS,
          SlidesUIEnUS,
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

    univer.registerPlugin(UniverDrawingPlugin)
    univer.registerPlugin(UniverSlidesPlugin)
    univer.registerPlugin(UniverSlidesUIPlugin)

    univer.createUnit(UniverInstanceType.UNIVER_SLIDE, SLIDE_DATA)
  }, [])

  return (
    <div ref={divRef} className="h-full" />
  )
}
