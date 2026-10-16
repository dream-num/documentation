'use client'

import {
  renderImageWatermark,
  renderTextWatermark,
  renderUserInfoWatermark,
  UniverRenderingContext,
} from '@univerjs/engine-render'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import type { IWatermarkSettings, WatermarkKind } from '@/lib/tools/watermark-generator'

interface IWatermarkPreviewProps {
  kind: WatermarkKind
  settings: IWatermarkSettings
  image: HTMLImageElement | null
  userName: string
}

export function WatermarkPreview({ kind, settings, image, userName }: IWatermarkPreviewProps) {
  const t = useTranslations('tools.watermark')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dense, setDense] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = canvas?.parentElement
    const context = canvas?.getContext('2d')
    if (!canvas || !container || !context) return

    function draw() {
      if (!canvas || !container || !context) return
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.round(container.clientWidth * ratio)
      canvas.height = Math.round(container.clientHeight * ratio)
      context.scale(ratio, ratio)
      const config = settings[kind]
      const ctx = new UniverRenderingContext(context)
      const text = kind === 'userInfo' ? (settings.userInfo.name ? `${userName} ` : '') : (settings.text.content ?? '')
      const font = kind === 'userInfo' ? settings.userInfo : settings.text
      ctx.font = `${font.italic ? 'italic ' : ''}${font.bold ? 'bold ' : ''}${font.fontSize}px Arial`
      const width = kind === 'image' ? settings.image.width : ctx.measureText(text).width
      const height =
        kind === 'image'
          ? settings.image.maintainAspectRatio
            ? settings.image.width / settings.image.originRatio
            : settings.image.height
          : font.fontSize
      const columns = Math.ceil(Math.max(0, canvas.width - config.x) / (width + config.spacingX))
      const rows = Math.ceil(Math.max(0, canvas.height - config.y) / (height + config.spacingY))
      // Bound work for extreme image ratios or near-zero-width text with no spacing.
      const tooDense = config.repeat && (kind === 'image' || Boolean(text)) && columns * rows > 10_000
      setDense(tooDense)
      if (tooDense) return

      if (kind === 'image') renderImageWatermark(ctx, settings.image, image)
      else if (kind === 'userInfo')
        renderUserInfoWatermark(ctx, settings.userInfo, { userID: 'preview', name: userName })
      else renderTextWatermark(ctx, settings.text)
    }

    const observer = new ResizeObserver(draw)
    observer.observe(container)
    draw()
    return () => observer.disconnect()
  }, [kind, settings, image, userName])

  return (
    <div>
      <div className="relative h-112 overflow-hidden bg-white bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-size-[100%_32px,96px_100%]">
        <canvas ref={canvasRef} className="absolute inset-0 size-full" role="img" aria-label={t('preview')} />
      </div>
      {dense && (
        <p role="alert" className="text-destructive border-t p-3 text-xs">
          {t('dense')}
        </p>
      )}
    </div>
  )
}
