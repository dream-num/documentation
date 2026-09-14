'use client'

import { ChevronDownIcon, ExpandIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { clsx } from '@/lib/clsx'

interface IProps {
  slug: string
  lang: string
  clickToShow?: boolean
}

export function PlaygroundFrame({ slug, lang, clickToShow = false }: IProps) {
  const t = useTranslations()
  const contentId = useId()
  const [expanded, setExpanded] = useState(!clickToShow)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState(600)
  const [fullscreenError, setFullscreenError] = useState(false)
  const src = `${process.env.NEXT_PUBLIC_SHOWCASES_ORIGIN || 'https://office.univer.ai'}/${lang}/playground/${slug}`
  const frameOrigin = new URL(src).origin

  const measureFrame = useCallback(() => {
    if (document.fullscreenElement === iframeRef.current) return
    iframeRef.current?.contentWindow?.postMessage({ type: 'measure' }, frameOrigin)
  }, [frameOrigin])

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (
        document.fullscreenElement !== iframeRef.current &&
        event.source === iframeRef.current?.contentWindow &&
        event.origin === frameOrigin &&
        event.data?.type === 'setHeight' &&
        typeof event.data.height === 'number' &&
        Number.isFinite(event.data.height) &&
        event.data.height > 0
      )
        setIframeHeight(event.data.height)
    }
    const onFullscreenChange = () =>
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'fullscreen', active: document.fullscreenElement === iframeRef.current },
        frameOrigin,
      )
    document.addEventListener('fullscreenchange', onFullscreenChange)
    window.addEventListener('message', eventHandler)
    measureFrame()
    return () => {
      window.removeEventListener('message', eventHandler)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
    }
  }, [measureFrame, frameOrigin])

  const toggleFullscreen = async () => {
    setFullscreenError(false)
    try {
      const frame = iframeRef.current
      if (!frame) return
      await frame.requestFullscreen()
      frame.contentWindow?.postMessage({ type: 'fullscreen', active: true }, frameOrigin)
    } catch {
      setFullscreenError(true)
    }
  }

  const sandbox = (
    <div className="overflow-hidden bg-white dark:bg-neutral-950">
      <iframe
        ref={iframeRef}
        title={t('playground.preview')}
        onLoad={measureFrame}
        className="block w-full border-0 bg-white dark:bg-neutral-950"
        style={{ height: iframeHeight }}
        src={src}
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
  const buttonLabel = t('playground.fullscreen-preview')

  return (
    <div data-playground-frame className="border-border bg-background my-4 overflow-hidden rounded-md border">
      <div
        className={clsx('flex min-h-9 items-center justify-between gap-2 px-2', expanded && 'border-border border-b')}
      >
        {clickToShow ? (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((value) => !value)}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex min-h-9 items-center gap-1.5 rounded px-1 text-xs font-medium focus-visible:outline-2"
          >
            <ChevronDownIcon
              aria-hidden="true"
              className={clsx('size-3.5 transition-transform', !expanded && '-rotate-90')}
            />
            {t(expanded ? 'playground.click-to-hide' : 'playground.click-to-show')}
          </button>
        ) : (
          <span className="text-muted-foreground px-1 text-xs font-medium">{t('playground.demo')}</span>
        )}
        <button
          type="button"
          onClick={toggleFullscreen}
          disabled={!expanded}
          aria-label={buttonLabel}
          title={buttonLabel}
          className="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-ring inline-flex size-7 items-center justify-center rounded transition-colors focus-visible:outline-2 disabled:invisible"
        >
          <ExpandIcon aria-hidden="true" className="size-3.5" />
        </button>
      </div>
      {fullscreenError && (
        <p role="alert" className="px-3 py-2 text-sm">
          {lang === 'zh-CN'
            ? '浏览器未能进入全屏，请检查全屏权限后重试。'
            : 'The browser could not enter fullscreen. Check fullscreen permissions and try again.'}
        </p>
      )}
      <div id={contentId} hidden={!expanded}>
        {sandbox}
      </div>
    </div>
  )
}
