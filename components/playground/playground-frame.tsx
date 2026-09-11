'use client'

import { ExpandIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { clsx } from '@/lib/clsx'

import { ClickToShowButton } from './click-to-show-button'

interface IProps {
  slug: string
  lang: string
  clickToShow?: boolean
}

export function PlaygroundFrame({ slug, lang, clickToShow = false }: IProps) {
  const t = useTranslations()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState(1360)
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
        className={clsx(
          'block w-full border-0 bg-white transition-opacity dark:bg-neutral-950',
          iframeHeight > 0 ? 'opacity-100' : 'opacity-0',
        )}
        style={{ height: (iframeHeight || 100) + 'px' }}
        src={src}
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
  const buttonLabel = t('playground.fullscreen-preview')

  return (
    <div
      data-playground-frame
      className="rounded-lg border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
    >
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-3 py-2 dark:border-neutral-800">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t('playground.preview')}</span>
        <button
          type="button"
          onClick={toggleFullscreen}
          disabled={!iframeHeight}
          aria-label={buttonLabel}
          title={buttonLabel}
          className="inline-flex size-7 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 hover:dark:bg-neutral-800 hover:dark:text-neutral-200"
        >
          <ExpandIcon className="size-3.5" />
        </button>
      </div>
      {fullscreenError && (
        <p role="alert" className="px-3 py-2 text-sm">
          {lang === 'zh-CN'
            ? '浏览器未能进入全屏，请检查全屏权限后重试。'
            : 'The browser could not enter fullscreen. Check fullscreen permissions and try again.'}
        </p>
      )}
      <div className="p-1 md:p-2">
        {clickToShow ? (
          <ClickToShowButton showText={t('playground.click-to-show')} hideText={t('playground.click-to-hide')}>
            {sandbox}
          </ClickToShowButton>
        ) : (
          sandbox
        )}
      </div>
    </div>
  )
}
