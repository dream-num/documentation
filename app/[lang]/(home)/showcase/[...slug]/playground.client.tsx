'use client'

import { useEffect, useRef, useState } from 'react'
import { clsx } from '@/lib/clsx'

interface IProps {
  slug: string[]
  lang: string
}

export function PlaygroundFrame(props: IProps) {
  const { lang, slug } = props

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

  return (
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
      src={`/${lang}/playground/${slug.join('/')}`}
      loading="lazy"
    />
  )
}
