'use client'

import { BookTextIcon, SheetIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Spinner from '@/components/animata/spinner'
import { BorderBeam } from '@/components/magicui/border-beam'
import { clsx } from '@/lib/clsx'

export default function Univer() {
  const iframeRef = useRef<HTMLIFrameElement>(null!)

  const [type, setType] = useState<'sheets' | 'docs'>('sheets')
  const [steady, setSteady] = useState(false)

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (event.data.type === 'lifecycle' && event.data.stage === 'steady') {
        setSteady(true)
      }
    }

    window.addEventListener('message', eventHandler)

    return () => {
      setSteady(false)

      window.removeEventListener('message', eventHandler)
    }
  }, [])

  function handleChangeType(newType: 'sheets' | 'docs') {
    setSteady(false)
    setType(newType)
  }

  return (
    <div className="w-full">
      <link rel="prerender" href="/playground/miscs/sheets" />
      <link rel="prerender" href="/playground/miscs/docs" />

      <header className="mb-4 flex justify-center gap-4">
        <div
          className={`
            flex gap-2 rounded-full bg-white p-1 text-sm font-medium shadow-md
            dark:bg-neutral-800
            [&_button]:flex [&_button]:cursor-pointer [&_button]:items-center [&_button]:gap-2 [&_button]:rounded-full
            [&_button]:px-2 [&_button]:py-1 [&_button]:transition-all [&_button]:duration-300
            [&_svg]:size-4
          `}
        >
          <button
            className={clsx('text-green-600', {
              'bg-green-600 text-white': type === 'sheets',
              'hover:bg-green-50 dark:hover:bg-green-900 dark:hover:text-neutral-200': type !== 'sheets',
            })}
            type="button"
            onClick={() => handleChangeType('sheets')}
          >
            <SheetIcon />
            <span
              className={`
                hidden
                md:inline
              `}
            >
              Univer Sheets
            </span>
          </button>
          <button
            className={clsx('text-blue-600', {
              'bg-blue-600 text-white': type === 'docs',
              'hover:bg-blue-50 dark:hover:bg-blue-900 dark:hover:text-neutral-200': type !== 'docs',
            })}
            type="button"
            onClick={() => handleChangeType('docs')}
          >
            <BookTextIcon />
            <span
              className={`
                hidden
                md:inline
              `}
            >
              Univer Docs
            </span>
          </button>
        </div>
      </header>

      <div
        className="relative mx-auto h-161 w-320 max-w-full overflow-hidden rounded-xl p-px shadow-xl"
      >
        {/* Mask */}
        <div
          className={clsx(`
            absolute inset-0 flex size-full items-center justify-center bg-white/20
            dark:bg-black/20
          `, {
            'pointer-events-auto -z-1 opacity-0': steady,
          })}
        >
          <div className="absolute inset-0 size-full backdrop-blur-sm" />
          <Spinner className="z-1" />
        </div>

        {/* Univer Container */}
        {/* eslint-disable-next-line react-dom/no-missing-iframe-sandbox */}
        <iframe
          ref={iframeRef}
          className={clsx('pointer-events-none size-full opacity-0 blur-3xl transition-all duration-500', {
            'pointer-events-auto opacity-100 blur-none': steady,
          })}
          src={`/playground/miscs/${type}`}
        />

        <BorderBeam
          delay={0}
          size={600}
          borderWidth={2}
          className="from-transparent via-green-500 to-transparent"
        />
        <BorderBeam
          delay={10}
          size={600}
          borderWidth={2}
          className="from-transparent via-blue-500 to-transparent"
        />
      </div>
    </div>
  )
}
