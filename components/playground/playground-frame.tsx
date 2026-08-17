'use client'

import process from 'node:process'
import { ExpandIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { clsx } from '@/lib/clsx'
import { customTranslations, localizePath } from '@/lib/i18n'
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
  const [isFullscreen, setIsFullscreen] = useState(false)

  const src = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${localizePath(`/playground/${slug}`, lang)}`

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

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

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
        src={src}
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
    <>
      <div
        className="
          rounded-lg border border-neutral-200/80 bg-white shadow-sm
          dark:border-neutral-800 dark:bg-neutral-950
        "
      >
        {/* Toolbar */}
        <div
          className="
            flex items-center justify-between border-b border-neutral-200/80 px-3 py-2
            dark:border-neutral-800
          "
        >
          <span
            className="
              text-xs font-medium text-neutral-500
              dark:text-neutral-400
            "
          >
            Preview
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="
                inline-flex size-7 items-center justify-center rounded-sm text-neutral-500 transition-colors
                hover:bg-neutral-100 hover:text-neutral-800
                dark:text-neutral-400
                dark:hover:bg-neutral-800 dark:hover:text-neutral-200
              "
              title="Fullscreen preview"
            >
              <ExpandIcon className="size-3.5" />
            </button>
          </div>
        </div>

        <div
          className="
            p-1
            md:p-2
          "
        >
          {content}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          className="
            fixed inset-0 z-50 flex flex-col bg-white
            dark:bg-neutral-950
          "
        >
          <div
            className="
              flex items-center justify-between border-b border-neutral-200/80 px-4 py-2
              dark:border-neutral-800
            "
          >
            <span
              className="
                text-sm font-medium text-neutral-700
                dark:text-neutral-300
              "
            >
              Preview
            </span>
            <div className="flex items-center gap-2">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  text-xs text-neutral-500 transition-colors
                  hover:text-neutral-800
                  dark:text-neutral-400
                  dark:hover:text-neutral-200
                "
              >
                Open in new tab
              </a>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="
                  inline-flex size-8 items-center justify-center rounded-md text-neutral-500 transition-colors
                  hover:bg-neutral-100 hover:text-neutral-800
                  dark:text-neutral-400
                  dark:hover:bg-neutral-800 dark:hover:text-neutral-200
                "
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <iframe
              className="
                size-full bg-white
                dark:bg-neutral-950
              "
              src={src}
            />
          </div>
        </div>
      )}
    </>
  )
}
