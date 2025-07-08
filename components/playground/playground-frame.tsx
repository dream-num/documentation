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
    // eslint-disable-next-line react-dom/no-missing-iframe-sandbox
    <iframe
      ref={iframeRef}
      className={clsx('h-fit w-full', {
        'opacity-0': iframeHeight === 0,
        'opacity-100': iframeHeight > 0,
      })}
      style={{
        height: `${iframeHeight || 100}px`,
      }}
      src={`/${lang}/playground/${slug}`}
      loading="lazy"
    />
  )

  if (clickToShow) {
    return (
      <ClickToShowButton
        showText={customTranslations[lang]['playground.click-to-show']}
        hideText={customTranslations[lang]['playground.click-to-hide']}
      >
        {sandbox}
      </ClickToShowButton>
    )
  }

  return sandbox
}
