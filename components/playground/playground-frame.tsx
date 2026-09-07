'use client'

import { ExpandIcon, XIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clsx } from '@/lib/clsx'
import { ClickToShowButton } from './click-to-show-button'

interface IProps {
  slug: string
  lang: string
  clickToShow?: boolean
}

export function PlaygroundFrame(props: IProps) {
  const { slug, clickToShow = false } = props
  const t = useTranslations()

  const iframeRef = useRef<HTMLIFrameElement>(null!)
  const [iframeHeight, setIframeHeight] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const src = `/playground/${slug}`

  const measureFrame = useCallback(() => {
    // The child can send its first resize before this parent hydrates.
    // Read our same-origin frame on load and after subscribing to recover that missed event.
    const frameDocument = iframeRef.current?.contentDocument
    const height = frameDocument?.URL !== 'about:blank' ? frameDocument?.documentElement.scrollHeight : 0
    if (height && Number.isFinite(height)) setIframeHeight(height)
  }, [])

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (
        event.source === iframeRef.current?.contentWindow &&
        event.origin === window.location.origin &&
        event.data?.type === 'setHeight' &&
        typeof event.data.height === 'number' &&
        Number.isFinite(event.data.height) &&
        event.data.height > 0
      ) {
        setIframeHeight(event.data.height)
      }
    }

    window.addEventListener('message', eventHandler)
    measureFrame()

    return () => {
      window.removeEventListener('message', eventHandler)
    }
  }, [measureFrame])

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
        onLoad={measureFrame}
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
          showText={t('playground.click-to-show')}
          hideText={t('playground.click-to-hide')}
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
            {t('playground.preview')}
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
              title={t('playground.fullscreen-preview')}
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
