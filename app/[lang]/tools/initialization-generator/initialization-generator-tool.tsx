'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import type { IGeneratorOptions, Product } from '@/lib/tools/initialization-generator'
import type messages from '@/messages/en-US'
import { CodePreview } from '@/components/tools/code-preview'
import { FileActions } from '@/components/tools/file-actions'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  createProjectScript,
  generateProject,
  getFeatures,
  getFeatureAvailability,
  getProjectRequirements,
  PRODUCTS,
  SDK_LOCALES,
  SDK_VERSION,
} from '@/lib/tools/initialization-generator'

export function InitializationGeneratorTool() {
  const t = useTranslations('tools')
  const locale = useLocale()
  const [options, setOptions] = useState<IGeneratorOptions>({
    product: 'sheets',
    mode: 'plugin',
    locale: SDK_LOCALES.includes(locale as IGeneratorOptions['locale'])
      ? (locale as IGeneratorOptions['locale'])
      : 'en-US',
    mobile: false,
    features: [],
    umd: false,
  })
  const [file, setFile] = useState('src/univer.js')
  const [query, setQuery] = useState('')
  const files = useMemo(() => generateProject(options), [options])
  const features = getFeatures(options.product)
  const requirements = getProjectRequirements(options)
  const content = files[file] ?? ''
  const featureLabel = (name: string) => {
    const key = `feature-labels.${name as keyof (typeof messages.tools)['feature-labels']}` as const
    return t.has(key)
      ? t(key)
      : name
          .split('-')
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join(' ')
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{t('initialization-generator')}</h1>
        <Badge variant="outline" className="font-mono">
          {SDK_VERSION}
        </Badge>
      </div>
      <div className="grid items-start gap-3 @min-[48rem]/tools:grid-cols-[260px_minmax(0,1fr)]">
        <section className="space-y-3 rounded-md border p-3">
          <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-2">
            <label id="product-label" className="text-xs font-medium">
              {t('product')}
            </label>
            <Select
              value={options.product}
              onValueChange={(product) =>
                product &&
                setOptions({
                  ...options,
                  product: product as Product,
                  mode: ['sheets', 'docs'].includes(product) ? options.mode : 'plugin',
                  mobile: product === 'sheets' && options.mobile,
                  features: [],
                })
              }
            >
              <SelectTrigger size="sm" aria-labelledby="product-label" className="w-full">
                <SelectValue>
                  {options.product === 'pdfs' ? 'PDF' : options.product[0].toUpperCase() + options.product.slice(1)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product === 'pdfs' ? 'PDF' : product[0].toUpperCase() + product.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label id="mode-label" className="text-xs font-medium">
              {t('mode')}
            </label>
            <Select
              value={options.mode}
              onValueChange={(mode) =>
                mode &&
                setOptions({
                  ...options,
                  mode: mode as IGeneratorOptions['mode'],
                  mobile: false,
                })
              }
            >
              <SelectTrigger size="sm" aria-labelledby="mode-label" className="w-full">
                <SelectValue>{t(options.mode)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plugin">{t('plugin')}</SelectItem>
                <SelectItem value="preset" disabled={!['sheets', 'docs'].includes(options.product)}>
                  {t('preset')}
                </SelectItem>
              </SelectContent>
            </Select>
            <label id="locale-label" className="text-xs font-medium">
              {t('language')}
            </label>
            <Select
              value={options.locale}
              onValueChange={(language) =>
                language && setOptions({ ...options, locale: language as IGeneratorOptions['locale'] })
              }
            >
              <SelectTrigger size="sm" aria-labelledby="locale-label" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SDK_LOCALES.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {options.product === 'sheets' && options.mode === 'plugin' && (
            <div className="flex items-center gap-2 text-xs">
              <Checkbox
                id="generator-mobile"
                checked={options.mobile}
                onCheckedChange={(mobile) =>
                  setOptions({
                    ...options,
                    mobile,
                    features: options.features.filter((id) => {
                      const feature = features.find((item) => item.id === id)
                      return feature && !getFeatureAvailability(feature, { ...options, mobile })
                    }),
                  })
                }
              />
              <label htmlFor="generator-mobile">{t('mobile')}</label>
            </div>
          )}
          <fieldset className="border-t pt-2">
            <legend className="px-1 text-xs font-medium">{t('features')}</legend>
            <Input
              type="search"
              aria-label={t('features')}
              placeholder={t('features')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="mb-2 h-8 text-xs"
            />
            <div className="max-h-80 space-y-1 overflow-y-auto p-1">
              {features
                .filter((feature) =>
                  `${featureLabel(feature.label)} ${feature.id} ${feature.plugins.join(' ')}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((feature) => (
                  <div
                    key={feature.id}
                    className="flex min-h-7 items-center gap-2 text-xs"
                    title={feature.plugins.join(', ')}
                  >
                    <Checkbox
                      id={`feature-${feature.id}`}
                      checked={options.features.includes(feature.id)}
                      disabled={Boolean(getFeatureAvailability(feature, options))}
                      onCheckedChange={(checked) =>
                        setOptions({
                          ...options,
                          features: checked
                            ? [...options.features, feature.id]
                            : options.features.filter((id) => id !== feature.id),
                        })
                      }
                    />
                    <label htmlFor={`feature-${feature.id}`} className="flex-1">
                      {featureLabel(feature.label)}
                    </label>
                    {getFeatureAvailability(feature, options) && (
                      <span className="text-muted-foreground text-[10px]">
                        {t(`unavailable-${getFeatureAvailability(feature, options) as 'version' | 'mobile'}`)}
                      </span>
                    )}
                    {feature.requiresLicense && (
                      <Badge variant="outline" className="px-1 py-0 text-[10px]">
                        {t('license-required')}
                      </Badge>
                    )}
                  </div>
                ))}
            </div>
          </fieldset>
          <div className="flex items-center gap-2 border-t pt-3 text-xs font-medium">
            <Checkbox
              id="generator-umd"
              checked={options.umd}
              onCheckedChange={(umd) => setOptions({ ...options, umd })}
            />
            <label htmlFor="generator-umd">{t('umd')}</label>
          </div>
          {requirements.license && <p className="text-muted-foreground text-xs leading-5">{t('license-note')}</p>}
        </section>
        <section className="min-w-0 space-y-3">
          <div className="overflow-hidden rounded-md border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
              <Select value={file} onValueChange={(name) => name && setFile(name)}>
                <SelectTrigger size="sm" aria-label={t('files')} className="font-mono text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(files).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FileActions key={`${file}-${content}`} content={content} name={file.split('/').pop() ?? file} />
            </div>
            <CodePreview
              code={content}
              language={
                file.endsWith('.json')
                  ? 'json'
                  : file.endsWith('.html')
                    ? 'html'
                    : file.endsWith('.md')
                      ? 'markdown'
                      : 'javascript'
              }
              label={file}
              className="h-112"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FileActions
              content={createProjectScript(files)}
              name="create-univer-project.mjs"
              downloadLabel={t('download-project')}
              showCopy={false}
            />
          </div>
          <CodePreview
            code={`node create-univer-project.mjs\ncd univer-starter\nnpm install\nnpm run ${options.umd ? 'build\nnpm run dev' : 'dev'}`}
            language="bash"
            className="bg-muted/40 rounded-md"
          />
        </section>
      </div>
    </div>
  )
}
