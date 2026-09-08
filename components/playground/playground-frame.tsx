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

export function PlaygroundFrame({ slug, lang, clickToShow = false }: IProps) {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenError, setFullscreenError] = useState(false)
  const src = '/' + lang + '/playground/' + slug

  const measureFrame = useCallback(() => {
    if (document.fullscreenElement === containerRef.current) return
    // Recover an initial resize notification sent before parent hydration.
    const frameDocument = iframeRef.current?.contentDocument
    const height = frameDocument?.URL !== 'about:blank' ? frameDocument?.documentElement.scrollHeight : 0
    if (height && Number.isFinite(height)) setIframeHeight(height)
  }, [])

  const syncFullscreen = useCallback(() => {
    const active = document.fullscreenElement === containerRef.current
    // Same-origin, existing frame: change presentation without reloading the SDK owner.
    iframeRef.current?.contentDocument?.documentElement.toggleAttribute('data-showcase-preview-only', active)
    setIsFullscreen(active)
  }, [])

  useEffect(() => {
    const eventHandler = (event: MessageEvent) => {
      if (
        document.fullscreenElement !== containerRef.current &&
        event.source === iframeRef.current?.contentWindow &&
        event.origin === window.location.origin &&
        event.data?.type === 'setHeight' &&
        typeof event.data.height === 'number' &&
        Number.isFinite(event.data.height) &&
        event.data.height > 0
      )
        setIframeHeight(event.data.height)
    }
    window.addEventListener('message', eventHandler)
    document.addEventListener('fullscreenchange', syncFullscreen)
    measureFrame()
    return () => {
      window.removeEventListener('message', eventHandler)
      document.removeEventListener('fullscreenchange', syncFullscreen)
    }
  }, [measureFrame, syncFullscreen])

  const toggleFullscreen = async () => {
    setFullscreenError(false)
    try {
      if (document.fullscreenElement === containerRef.current) await document.exitFullscreen()
      else await containerRef.current?.requestFullscreen()
    } catch {
      setFullscreenError(true)
    }
  }

  const sandbox = (
    <div className={clsx('overflow-hidden bg-white dark:bg-neutral-950', isFullscreen && 'h-full min-h-0')}>
      <iframe
        ref={iframeRef}
        title={t('playground.preview')}
        onLoad={() => {
          syncFullscreen()
          measureFrame()
        }}
        className={clsx(
          'block w-full border-0 bg-white transition-opacity dark:bg-neutral-950',
          iframeHeight > 0 || isFullscreen ? 'opacity-100' : 'opacity-0',
        )}
        style={{ height: isFullscreen ? '100%' : (iframeHeight || 100) + 'px' }}
        src={src}
        loading="lazy"
        allowFullScreen
      />
    </div>
  )
  const buttonLabel = isFullscreen
    ? lang === 'zh-CN'
      ? '退出全屏'
      : 'Exit fullscreen'
    : t('playground.fullscreen-preview')

  return (
    <div
      ref={containerRef}
      data-playground-frame
      className={clsx(
        'rounded-lg border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950',
        isFullscreen && 'flex h-dvh w-screen flex-col overflow-hidden rounded-none border-0',
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/80 px-3 py-2 dark:border-neutral-800">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{t('playground.preview')}</span>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={buttonLabel}
          title={buttonLabel}
          className="inline-flex size-7 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          {isFullscreen ? <XIcon className="size-3.5" /> : <ExpandIcon className="size-3.5" />}
        </button>
      </div>
      {fullscreenError && (
        <p role="alert" className="px-3 py-2 text-sm">
          {lang === 'zh-CN'
            ? '浏览器未能进入全屏，请检查全屏权限后重试。'
            : 'The browser could not enter fullscreen. Check fullscreen permissions and try again.'}
        </p>
      )}
      <div className={isFullscreen ? 'min-h-0 flex-1 overflow-hidden' : 'p-1 md:p-2'}>
        {clickToShow ? (
          <ClickToShowButton
            showText={t('playground.click-to-show')}
            hideText={t('playground.click-to-hide')}
            expanded={isFullscreen}
          >
            {sandbox}
          </ClickToShowButton>
        ) : (
          sandbox
        )}
      </div>
    </div>
  )
}
