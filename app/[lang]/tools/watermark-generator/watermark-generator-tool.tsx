'use client'

import { RotateCcwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { IWatermarkSettings, WatermarkKind, WatermarkOutput } from '@/lib/tools/watermark-generator'
import { ColorPickerPopover } from '@/components/color-picker-popover'
import { CodePreview } from '@/components/tools/code-preview'
import { FileActions } from '@/components/tools/file-actions'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/i18n/navigation'
import { DEFAULT_WATERMARK_SETTINGS, generateWatermarkCode } from '@/lib/tools/watermark-generator'

const WatermarkPreview = dynamic(() => import('./watermark-preview').then((module) => module.WatermarkPreview), {
  ssr: false,
})

export function WatermarkGeneratorTool() {
  const t = useTranslations('tools.watermark')
  const tools = useTranslations('tools')
  const [kind, setKind] = useState<WatermarkKind>('text')
  const [settings, setSettings] = useState<IWatermarkSettings>(() => structuredClone(DEFAULT_WATERMARK_SETTINGS))
  const [output, setOutput] = useState<WatermarkOutput>('plugin')
  const [userName, setUserName] = useState('Alex Chen')
  const [loadedImage, setLoadedImage] = useState<{ url: string; image: HTMLImageElement | null }>({
    url: '',
    image: null,
  })
  const [uploadError, setUploadError] = useState(false)
  const uploadRevision = useRef(0)
  const imageUrl = settings.image.url
  const image = loadedImage.url === imageUrl ? loadedImage.image : null
  const imageFailed = Boolean(imageUrl) && loadedImage.url === imageUrl && !image
  const imagePending = Boolean(imageUrl) && loadedImage.url !== imageUrl
  const canExport = kind !== 'image' || Boolean(image)
  const config = settings[kind]
  const fontKind = kind === 'userInfo' ? 'userInfo' : 'text'
  const font = settings[fontKind]
  const code = generateWatermarkCode(kind, settings, output)
  const json = generateWatermarkCode(kind, settings, 'json')

  useEffect(() => {
    if (!imageUrl) return
    const nextImage = new Image()
    const controller = new AbortController()
    nextImage.addEventListener(
      'load',
      () => {
        if (!nextImage.naturalWidth || !nextImage.naturalHeight) {
          setLoadedImage({ url: imageUrl, image: null })
          return
        }
        const originRatio = nextImage.naturalWidth / nextImage.naturalHeight
        setLoadedImage({ url: imageUrl, image: nextImage })
        setSettings((current) => ({
          ...current,
          image: {
            ...current.image,
            originRatio,
            height: current.image.maintainAspectRatio ? current.image.width / originRatio : current.image.height,
          },
        }))
      },
      { signal: controller.signal },
    )
    nextImage.addEventListener('error', () => setLoadedImage({ url: imageUrl, image: null }), {
      signal: controller.signal,
    })
    nextImage.src = imageUrl
    return () => controller.abort()
  }, [imageUrl])

  function update<T extends WatermarkKind>(type: T, patch: Partial<IWatermarkSettings[T]>) {
    setSettings((current) => ({ ...current, [type]: { ...current[type], ...patch } }))
  }

  function resizeImage(dimension: 'width' | 'height', value: number) {
    if (!Number.isFinite(value) || value < 1) return
    const imageSettings = settings.image
    update('image', {
      [dimension]: value,
      ...(imageSettings.maintainAspectRatio
        ? dimension === 'width'
          ? { height: value / imageSettings.originRatio }
          : { width: value * imageSettings.originRatio }
        : {}),
    })
  }

  function upload(file?: File) {
    const revision = ++uploadRevision.current
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/bmp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setUploadError(true)
      return
    }
    setUploadError(false)
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (revision === uploadRevision.current && typeof reader.result === 'string')
        update('image', { url: reader.result })
    })
    reader.addEventListener('error', () => {
      if (revision === uploadRevision.current) setUploadError(true)
    })
    reader.readAsDataURL(file)
  }

  function reset() {
    uploadRevision.current++
    setSettings(structuredClone(DEFAULT_WATERMARK_SETTINGS))
    setUserName('Alex Chen')
    setUploadError(false)
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{tools('watermark-generator')}</h1>
          <p className="text-muted-foreground text-sm">{tools('watermark-generator-description')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcwIcon />
          {t('reset')}
        </Button>
      </header>
      <div className="grid items-start gap-4 @min-[52rem]/tools:grid-cols-[280px_minmax(0,1fr)]">
        <section aria-label={t('settings')} className="space-y-4 rounded-md border p-4">
          <Tabs
            value={kind}
            onValueChange={(value) => {
              setKind(value as WatermarkKind)
              if (value === 'userInfo' && output === 'facade') setOutput('plugin')
            }}
          >
            <TabsList className="w-full" aria-label={t('type')}>
              {(['text', 'image', 'userInfo'] as const).map((type) => (
                <TabsTrigger key={type} value={type}>
                  {t(type)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {kind === 'text' && (
            <div className="space-y-1.5">
              <label htmlFor="watermark-content" className="text-xs font-medium">
                {t('content')}
              </label>
              <Input
                id="watermark-content"
                value={settings.text.content}
                maxLength={500}
                onChange={(event) => update('text', { content: event.target.value })}
              />
            </div>
          )}

          {kind === 'userInfo' && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-xs leading-5">{t('user-note')}</p>
              <div className="flex items-center gap-2 text-xs">
                <Checkbox
                  id="watermark-name"
                  checked={settings.userInfo.name}
                  onCheckedChange={(name) => update('userInfo', { name })}
                />
                <label htmlFor="watermark-name">{t('name')}</label>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="watermark-user-name" className="text-xs font-medium">
                  {t('sample-name')}
                </label>
                <Input
                  id="watermark-user-name"
                  value={userName}
                  maxLength={100}
                  onChange={(event) => setUserName(event.target.value)}
                />
              </div>
            </div>
          )}

          {kind === 'image' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="watermark-url" className="text-xs font-medium">
                  {t('url')}
                </label>
                <Input
                  id="watermark-url"
                  value={imageUrl}
                  placeholder="https://example.com/logo.png"
                  onChange={(event) => {
                    uploadRevision.current++
                    setUploadError(false)
                    update('image', { url: event.target.value })
                  }}
                  aria-invalid={imageFailed}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="watermark-upload" className="text-xs font-medium">
                  {t('upload')}
                </label>
                <Input
                  id="watermark-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/bmp"
                  className="text-xs"
                  onChange={(event) => {
                    upload(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
                <p className="text-muted-foreground text-xs leading-5">{t('upload-note')}</p>
                {uploadError && (
                  <p role="alert" className="text-destructive text-xs">
                    {t('upload-error')}
                  </p>
                )}
                {imageFailed && (
                  <p role="alert" className="text-destructive text-xs">
                    {t('image-error')}
                  </p>
                )}
                {imagePending && (
                  <p role="status" className="text-muted-foreground text-xs">
                    {t('loading')}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['width', 'height'] as const).map((dimension) => (
                  <div key={dimension} className="space-y-1.5">
                    <label htmlFor={`watermark-${dimension}`} className="text-xs font-medium">
                      {t(dimension)} (px)
                    </label>
                    <Input
                      id={`watermark-${dimension}`}
                      type="number"
                      min={1}
                      step="any"
                      value={Number(settings.image[dimension].toFixed(2))}
                      onChange={(event) => resizeImage(dimension, event.target.valueAsNumber)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Checkbox
                  id="watermark-ratio"
                  checked={settings.image.maintainAspectRatio}
                  onCheckedChange={(maintainAspectRatio) =>
                    update('image', {
                      maintainAspectRatio,
                      ...(maintainAspectRatio ? { height: settings.image.width / settings.image.originRatio } : {}),
                    })
                  }
                />
                <label htmlFor="watermark-ratio">{t('keep-ratio')}</label>
              </div>
              {image && (
                <p className="text-muted-foreground text-xs">
                  {t('ratio')}: {settings.image.originRatio.toFixed(3)}
                </p>
              )}
            </div>
          )}

          {kind !== 'image' && (
            <fieldset className="space-y-3 border-t pt-3">
              <legend className="px-1 text-xs font-medium">{t('font')}</legend>
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-1.5">
                  <label htmlFor="watermark-font-size" className="text-xs">
                    {t('font-size')} (px)
                  </label>
                  <Input
                    id="watermark-font-size"
                    type="number"
                    min={8}
                    max={200}
                    value={font.fontSize}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber
                      if (Number.isFinite(value)) update(fontKind, { fontSize: Math.min(200, Math.max(8, value)) })
                    }}
                  />
                </div>
                <ColorPickerPopover
                  ariaLabel={t('color')}
                  value={font.color}
                  onValueChange={(color) => update(fontKind, { color })}
                  className="mb-1"
                />
              </div>
              <div className="flex flex-wrap gap-4">
                {(['bold', 'italic'] as const).map((property) => (
                  <div key={property} className="flex items-center gap-2 text-xs">
                    <Checkbox
                      id={`watermark-${property}`}
                      checked={font[property]}
                      onCheckedChange={(value) => update(fontKind, { [property]: value })}
                    />
                    <label htmlFor={`watermark-${property}`}>{t(property)}</label>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <label id="watermark-direction-label" className="text-xs">
                  {t('direction')}
                </label>
                <Select
                  value={font.direction}
                  onValueChange={(direction) =>
                    direction && update(fontKind, { direction: direction as typeof font.direction })
                  }
                >
                  <SelectTrigger aria-labelledby="watermark-direction-label" className="w-full">
                    <SelectValue>{t(font.direction)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(['ltr', 'rtl', 'inherit'] as const).map((direction) => (
                      <SelectItem key={direction} value={direction}>
                        {t(direction)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
          )}

          <fieldset className="space-y-4 border-t pt-3">
            <legend className="px-1 text-xs font-medium">{t('layout')}</legend>
            <div className="flex items-center gap-2 text-xs">
              <Checkbox
                id="watermark-repeat"
                checked={config.repeat}
                onCheckedChange={(repeat) => update(kind, { repeat })}
              />
              <label htmlFor="watermark-repeat">{t('repeat')}</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['x', 'y', 'spacingX', 'spacingY'] as const).map((property) => (
                <div key={property} className="space-y-1.5">
                  <label htmlFor={`watermark-${property}`} className="text-xs">
                    {t(property)} (px)
                  </label>
                  <Input
                    id={`watermark-${property}`}
                    type="number"
                    min={0}
                    step={1}
                    value={config[property]}
                    disabled={!config.repeat && (property === 'spacingX' || property === 'spacingY')}
                    onChange={(event) => {
                      const value = event.target.valueAsNumber
                      if (Number.isFinite(value)) update(kind, { [property]: Math.max(0, value) })
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{t('rotate')}</span>
                <output>{config.rotate}°</output>
              </div>
              <Slider
                aria-label={t('rotate')}
                min={-180}
                max={180}
                step={1}
                value={config.rotate}
                onValueChange={(rotate) => update(kind, { rotate })}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>{t('opacity')}</span>
                <output>{Math.round(config.opacity * 100)}%</output>
              </div>
              <Slider
                aria-label={t('opacity')}
                min={0}
                max={1}
                step={0.01}
                value={config.opacity}
                onValueChange={(opacity) => update(kind, { opacity })}
              />
            </div>
          </fieldset>
        </section>

        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-md border" aria-label={t('preview')}>
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
              <h2 className="text-sm font-medium">{t('preview')}</h2>
              <span className="text-muted-foreground text-xs">{t('preview-note')}</span>
            </div>
            {kind === 'image' && !image && (
              <p className="text-muted-foreground border-b p-3 text-xs">{t('image-empty')}</p>
            )}
            <WatermarkPreview kind={kind} settings={settings} image={image} userName={userName} />
          </section>
          <section className="overflow-hidden rounded-md border" aria-label={t('output')}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
              <Select value={output} onValueChange={(value) => value && setOutput(value as WatermarkOutput)}>
                <SelectTrigger size="sm" aria-label={t('output')}>
                  <SelectValue>
                    {output === 'plugin' || output === 'preset'
                      ? tools(output)
                      : output === 'json'
                        ? 'JSON'
                        : 'Facade API'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plugin">{tools('plugin')}</SelectItem>
                  <SelectItem value="preset">{tools('preset')}</SelectItem>
                  <SelectItem value="facade" disabled={kind === 'userInfo'}>
                    Facade API
                  </SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
              {canExport && (
                <FileActions key={`${output}-${code}`} content={code} downloadContent={json} name="watermark.json" />
              )}
            </div>
            <p className="text-muted-foreground border-b px-3 py-2 text-xs leading-5">
              {t(output === 'preset' ? 'preset-note' : output === 'facade' ? 'facade-note' : 'plugin-note')}
            </p>
            {canExport ? (
              <CodePreview
                code={code}
                language={output === 'json' ? 'json' : 'typescript'}
                label={t('output')}
                className="max-h-100"
              />
            ) : (
              <p className="text-muted-foreground p-4 text-sm">{t('image-empty')}</p>
            )}
          </section>
          <Link
            href="/guides/sheets/features/watermark"
            className="text-muted-foreground inline-block text-xs underline underline-offset-4"
          >
            {t('documentation')}
          </Link>
        </div>
      </div>
    </div>
  )
}
