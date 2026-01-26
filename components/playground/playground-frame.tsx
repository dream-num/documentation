'use client'

import { useEffect, useRef, useState } from 'react'
import { clsx } from '@/lib/clsx'
import { customTranslations } from '@/lib/i18n'
import { ClickToShowButton } from './click-to-show-button'

interface IProps {
  slug: string
  lang: string
  clickToShow?: boolean
}

export function PlaygroundFrame(props: IProps) {
  const { lang, slug, clickToShow = false } = props

  const iframeRef = useRef<HTMLIFrameElement>(null!)
  const [iframeHeight, setIframeHeight] = useState<number>(0)

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (event.data.type === 'setHeight') {
        setIframeHeight(event.data.height)
      }
    }

    window.addEventListener('message', eventHandler)

    return () => {
      window.removeEventListener('message', eventHandler)
    }
  }, [])

  const sandbox = (
    <div
      className="
        overflow-hidden bg-white
        dark:bg-neutral-950
      "
    >
      <iframe
        ref={iframeRef}
        className={clsx(
          `
            h-fit w-full bg-white transition-opacity duration-300 ease-out
            dark:bg-neutral-950
          `,
          {
            'opacity-0': iframeHeight === 0,
            'opacity-100': iframeHeight > 0,
          },
        )}
        style={{
          height: `${iframeHeight || 100}px`,
        }}
        src={`/${lang}/playground/${slug}`}
        loading="lazy"
      />
    </div>
  )

  const content = clickToShow
    ? (
        <ClickToShowButton
          showText={customTranslations[lang]['playground.click-to-show']}
          hideText={customTranslations[lang]['playground.click-to-hide']}
        >
          {sandbox}
        </ClickToShowButton>
      )
    : (
        sandbox
      )

  return (
    <div
      className="
        relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white
        shadow-[0_1px_0_rgba(15,23,42,0.06),0_16px_40px_rgba(15,23,42,0.12)]
        dark:border-neutral-800/70 dark:bg-neutral-950
      "
    >
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(900px_circle_at_0%_0%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(900px_circle_at_100%_0%,rgba(16,185,129,0.14),transparent_45%)]
          dark:bg-[radial-gradient(900px_circle_at_0%_0%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(900px_circle_at_100%_0%,rgba(16,185,129,0.18),transparent_45%)]
        "
      />
      <div className="relative">
        <div
          className="
            flex items-center justify-between border-b border-neutral-200/70 bg-neutral-50/80 px-4 py-2 text-[11px]
            font-semibold tracking-[0.2em] text-neutral-500 uppercase
            dark:border-neutral-800/70 dark:bg-neutral-900/70 dark:text-neutral-400
          "
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-400/80" />
              <span className="size-2 rounded-full bg-amber-400/80" />
              <span className="size-2 rounded-full bg-emerald-400/80" />
            </div>
            <span
              className="
                hidden
                sm:inline
              "
            >
              Playground
            </span>
          </div>
          <span
            className="
              rounded-full border border-neutral-200/70 bg-white/80 px-3 py-1 text-xs font-semibold text-neutral-600
              dark:border-neutral-800 dark:bg-neutral-950/70 dark:text-neutral-300
            "
          >
            Live preview
          </span>
        </div>
        <div
          className="
            p-2
            md:p-3
          "
        >
          {content}
        </div>
      </div>
    </div>
  )
}
