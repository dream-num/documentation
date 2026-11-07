'use client'

import type { ILanguagePack } from '@univerjs/core'
import type { FUniver } from '@univerjs/core/facade'
import { UniverLicensePlugin } from '@univerjs-pro/license'
import { LocaleType, mergeLocales, Univer } from '@univerjs/core'
import DesignEnUS from '@univerjs/design/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import { UniverDrawingPlugin } from '@univerjs/drawing'
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui'
import DrawingUIEnUS from '@univerjs/drawing-ui/locale/en-US'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverUIPlugin } from '@univerjs/ui'
import UIEnUS from '@univerjs/ui/locale/en-US'
import { AnimatePresence, motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/animata/spinner'
import { clsx } from '@/lib/clsx'
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/drawing-ui/lib/index.css'
import '@univerjs/ui/facade'
import '@univerjs/docs-ui/facade'

export interface IUniverCanvasProps {
  initialize: (univer: Univer) => { api: FUniver; onRendered?: () => void | Promise<void> }
  locales?: ILanguagePack
}

export function UniverCanvas({ initialize, locales }: IUniverCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [steady, setSteady] = useState(false)
  const [error, setError] = useState<Error>()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme || !containerRef.current) return
    let disposed = false
    setSteady(false)
    const univer = new Univer({
      darkMode: resolvedTheme === 'dark',
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(DesignEnUS, UIEnUS, DocsUIEnUS, DrawingUIEnUS, locales ?? {}),
      },
    })

    function reportError(cause: unknown) {
      if (!disposed) setError(cause instanceof Error ? cause : new Error(String(cause)))
    }

    try {
      univer.registerPlugin(UniverRenderEnginePlugin)
      univer.registerPlugin(UniverUIPlugin, { container: containerRef.current, ribbonType: 'grid' })
      univer.registerPlugin(UniverDocsPlugin)
      univer.registerPlugin(UniverDocsUIPlugin)
      univer.registerPlugin(UniverDrawingPlugin)
      univer.registerPlugin(UniverDrawingUIPlugin)
      univer.registerPlugin(UniverLicensePlugin, { license: process.env.NEXT_PUBLIC_CLIENT_LICENSE_TEXT })
      const { api, onRendered } = initialize(univer)
      api.addEvent(api.Event.LifeCycleChanged, async (event) => {
        if (event.stage !== api.Enum.LifecycleStages.Rendered) return
        try {
          await onRendered?.()
          if (!disposed) setSteady(true)
        } catch (cause) {
          reportError(cause)
        }
      })
    } catch (cause) {
      reportError(cause)
    }

    return () => {
      disposed = true
      univer.dispose()
    }
  }, [initialize, locales, resolvedTheme])

  if (error) throw error

  return (
    <div className="relative size-full" aria-busy={!steady}>
      <AnimatePresence>
        {!steady && (
          <motion.div
            className="pointer-events-auto absolute inset-0 z-10 flex size-full items-center justify-center bg-(--landing-surface)"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Spinner />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={clsx(
          'relative z-1 size-full transition-opacity duration-200',
          steady ? 'opacity-100' : 'opacity-35',
        )}
      >
        <div ref={containerRef} className="home-univer-demo h-full" />
      </div>
    </div>
  )
}
