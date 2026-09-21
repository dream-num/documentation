'use client'

import type { Theme } from '@univerjs/themes'
import {
  darkBlueTheme,
  defaultTheme,
  greenTheme,
  orangeTheme,
  purpleTheme,
  redTheme,
  yellowTheme,
} from '@univerjs/themes'
import { CheckIcon, ClipboardIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

import { ColorPickerPopover } from '@/components/color-picker-popover'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { RealUniverPreview } from './real-univer-preview'

type ShadeKey = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
type GrayShadeKey = '0' | ShadeKey | '1000'
type ScaleKey =
  | 'primary'
  | 'gray'
  | 'blue'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'jiqing'
  | 'indigo'
  | 'purple'
  | 'pink'
type LoopKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
type HighlightKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14' | '15' | '16'

type ThemeWithTokens = Theme & {
  highlight: {
    background: Record<
      HighlightKey,
      {
        color: string
        alpha: number
      }
    >
  }
}

type PresetKey = 'default' | 'dark-blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'

const scaleKeys: ScaleKey[] = [
  'primary',
  'gray',
  'blue',
  'red',
  'orange',
  'yellow',
  'green',
  'jiqing',
  'indigo',
  'purple',
  'pink',
]
const shadeKeys: ShadeKey[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const grayShadeKeys: GrayShadeKey[] = ['0', ...shadeKeys, '1000']
const loopKeys: LoopKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const highlightKeys: HighlightKey[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
]

const fallbackHighlight: ThemeWithTokens['highlight'] = {
  background: {
    1: { color: 'purple.500', alpha: 0.3 },
    2: { color: 'red.500', alpha: 0.3 },
    3: { color: 'orange.400', alpha: 0.3 },
    4: { color: 'green.400', alpha: 0.3 },
    5: { color: 'blue.500', alpha: 0.3 },
    6: { color: 'primary.500', alpha: 0.3 },
    7: { color: 'pink.500', alpha: 0.3 },
    8: { color: 'gray.400', alpha: 0.3 },
    9: { color: 'purple.500', alpha: 0.15 },
    10: { color: 'red.500', alpha: 0.15 },
    11: { color: 'orange.400', alpha: 0.15 },
    12: { color: 'green.400', alpha: 0.15 },
    13: { color: 'blue.500', alpha: 0.15 },
    14: { color: 'primary.500', alpha: 0.15 },
    15: { color: 'pink.500', alpha: 0.15 },
    16: { color: 'gray.400', alpha: 0.15 },
  },
}

function cloneTheme(theme: ThemeWithTokens): ThemeWithTokens {
  return JSON.parse(JSON.stringify(theme)) as ThemeWithTokens
}

function normalizeTheme(theme: Theme): ThemeWithTokens {
  const source = theme as ThemeWithTokens

  return {
    ...cloneTheme({
      ...(theme as ThemeWithTokens),
      highlight: source.highlight ?? fallbackHighlight,
    }),
  }
}

const presets: Array<{
  key: PresetKey
  theme: ThemeWithTokens
}> = [
  {
    key: 'default',
    theme: normalizeTheme(defaultTheme),
  },
  {
    key: 'dark-blue',
    theme: normalizeTheme(darkBlueTheme),
  },
  {
    key: 'green',
    theme: normalizeTheme(greenTheme),
  },
  {
    key: 'orange',
    theme: normalizeTheme(orangeTheme),
  },
  {
    key: 'purple',
    theme: normalizeTheme(purpleTheme),
  },
  {
    key: 'red',
    theme: normalizeTheme(redTheme),
  },
  {
    key: 'yellow',
    theme: normalizeTheme(yellowTheme),
  },
]

function resolveColor(theme: ThemeWithTokens, value: string) {
  const [scaleName, shade] = value.split('.')
  const scale = scaleKeys.find((key) => key === scaleName)

  if (scale && shade) {
    const scaleValues = theme[scale] as unknown as Record<string, string>
    return scaleValues[shade] ?? value
  }

  return value
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    return { r: 70, g: 106, b: 247 }
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  }
}

function alphaColor(theme: ThemeWithTokens, value: { color: string; alpha: number }) {
  const { r, g, b } = hexToRgb(resolveColor(theme, value.color))
  return `rgba(${r}, ${g}, ${b}, ${value.alpha})`
}

function updateScaleColor(
  theme: ThemeWithTokens,
  scale: ScaleKey,
  shade: GrayShadeKey,
  value: string,
): ThemeWithTokens {
  return {
    ...theme,
    [scale]: {
      ...theme[scale],
      [shade]: value,
    },
  }
}

function updateLoopColor(theme: ThemeWithTokens, key: LoopKey, value: string): ThemeWithTokens {
  return {
    ...theme,
    'loop-color': {
      ...theme['loop-color'],
      [key]: value,
    },
  }
}

function updateHighlight(
  theme: ThemeWithTokens,
  key: HighlightKey,
  value: { color?: string; alpha?: number },
): ThemeWithTokens {
  return {
    ...theme,
    highlight: {
      background: {
        ...theme.highlight.background,
        [key]: {
          ...theme.highlight.background[key],
          ...value,
        },
      },
    },
  }
}

function createThemePatch(baseTheme: ThemeWithTokens, theme: ThemeWithTokens) {
  const patch: Record<string, unknown> = {}

  for (const scale of scaleKeys) {
    const scalePatch: Record<string, string> = {}
    const scaleShadeKeys = scale === 'gray' ? grayShadeKeys : shadeKeys
    const baseScale = baseTheme[scale] as unknown as Record<string, string>
    const currentScale = theme[scale] as unknown as Record<string, string>

    for (const shade of scaleShadeKeys) {
      if (currentScale[shade] !== baseScale[shade]) {
        scalePatch[shade] = currentScale[shade]
      }
    }

    if (Object.keys(scalePatch).length > 0) {
      patch[scale] = scalePatch
    }
  }

  const loopPatch: Partial<Record<LoopKey, string>> = {}
  for (const key of loopKeys) {
    if (theme['loop-color'][key] !== baseTheme['loop-color'][key]) {
      loopPatch[key] = theme['loop-color'][key]
    }
  }

  if (Object.keys(loopPatch).length > 0) {
    patch['loop-color'] = loopPatch
  }

  if (JSON.stringify(theme.highlight) !== JSON.stringify(baseTheme.highlight)) {
    patch.highlight = theme.highlight
  }

  return patch
}

function createCssTokens(theme: ThemeWithTokens) {
  const rows: Array<{ name: string; value: string; color?: string }> = []

  for (const scale of scaleKeys) {
    const scaleShadeKeys = scale === 'gray' ? grayShadeKeys : shadeKeys
    const currentScale = theme[scale] as unknown as Record<string, string>

    for (const shade of scaleShadeKeys) {
      rows.push({
        name: `--univer-${scale}-${shade}`,
        value: currentScale[shade],
        color: currentScale[shade],
      })
    }
  }

  for (const key of loopKeys) {
    rows.push({
      name: `--univer-loop-color-${key}`,
      value: theme['loop-color'][key],
      color: resolveColor(theme, theme['loop-color'][key]),
    })
  }

  for (const key of highlightKeys) {
    rows.push({
      name: `--univer-highlight-bg-${key}`,
      value: `${theme.highlight.background[key].color} / ${theme.highlight.background[key].alpha}`,
      color: alphaColor(theme, theme.highlight.background[key]),
    })
  }

  return rows
}

function ThemeColorSelect({
  label,
  theme,
  value,
  onValueChange,
}: {
  label: string
  theme: ThemeWithTokens
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Select value={value} onValueChange={(color) => color && onValueChange(color)}>
      <SelectTrigger aria-label={label} size="sm" className="w-full min-w-0 gap-1 px-2 font-mono text-xs shadow-none">
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-sm border"
          style={{ backgroundColor: resolveColor(theme, value) }}
        />
        <SelectValue className="min-w-0 flex-1">{value}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {scaleKeys.flatMap((scale) =>
          (scale === 'gray' ? grayShadeKeys : shadeKeys).map((shade) => {
            const color = `${scale}.${shade}`
            return (
              <SelectItem key={color} value={color} className="font-mono text-xs">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-sm border"
                  style={{ backgroundColor: resolveColor(theme, color) }}
                />
                {color}
              </SelectItem>
            )
          }),
        )}
      </SelectContent>
    </Select>
  )
}

function TokenRow({ color, name, value }: { color?: string; name: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 border-b py-1.5 font-mono text-xs">
      <dt className="flex min-w-0 items-center gap-1.5">
        {color ? <span className="size-3 shrink-0 rounded-sm border" style={{ backgroundColor: color }} /> : null}
        <span className="truncate" title={name}>
          {name}
        </span>
      </dt>
      <dd className="text-muted-foreground shrink-0">{value}</dd>
    </div>
  )
}

export function ThemeCustomizerTool({ title }: { title: string }) {
  const t = useTranslations()
  const [presetKey, setPresetKey] = useState<PresetKey>('default')
  const [theme, setTheme] = useState(() => cloneTheme(presets[0].theme))
  const [darkMode, setDarkMode] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(presets[0].theme, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  const activePreset = presets.find((preset) => preset.key === presetKey) ?? presets[0]
  const patch = useMemo(() => createThemePatch(activePreset.theme, theme), [activePreset.theme, theme])
  const tokenRows = useMemo(() => createCssTokens(theme), [theme])
  const cssText = useMemo(() => tokenRows.map((row) => `  ${row.name}: ${row.value};`).join('\n'), [tokenRows])

  function applyTheme(nextTheme: ThemeWithTokens) {
    setTheme(nextTheme)
    setJsonDraft(JSON.stringify(nextTheme, null, 2))
    setJsonError(null)
  }

  function applyPreset(nextPresetKey: PresetKey) {
    const nextPreset = presets.find((preset) => preset.key === nextPresetKey)
    if (!nextPreset) return

    setPresetKey(nextPreset.key)
    applyTheme(cloneTheme(nextPreset.theme))
  }

  async function copyText(kind: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(kind)
    window.setTimeout(setCopied, 1400, null)
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(jsonDraft) as Theme
      applyTheme(normalizeTheme(parsed))
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON')
    }
  }

  return (
    <article className="min-w-0">
      <h1 className="text-xl font-semibold">{title}</h1>

      <div className="mt-4 space-y-4">
        <section className="bg-card rounded-lg border p-3 shadow-sm">
          <Tabs defaultValue="sheets">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{t('theme-customizer.live-preview')}</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {darkMode ? t('theme-customizer.dark') : t('theme-customizer.light')}
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="sheets">{t('theme-customizer.sheets')}</TabsTrigger>
                <TabsTrigger value="docs">{t('theme-customizer.docs')}</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent className="mt-3" value="sheets">
              <RealUniverPreview darkMode={darkMode} kind="sheets" theme={theme} />
            </TabsContent>
            <TabsContent className="mt-3" value="docs">
              <RealUniverPreview darkMode={darkMode} kind="docs" theme={theme} />
            </TabsContent>
          </Tabs>
        </section>

        <section className="bg-card min-w-0 rounded-lg border shadow-sm">
          <Tabs className="gap-0" defaultValue="palette">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-muted-foreground mr-1 text-xs font-medium">{t('theme-customizer.presets')}</span>
                {presets.map((preset) => (
                  <Button
                    aria-pressed={preset.key === presetKey}
                    className="h-8 gap-2"
                    key={preset.key}
                    size="sm"
                    type="button"
                    variant={preset.key === presetKey ? 'default' : 'outline'}
                    onClick={() => applyPreset(preset.key)}
                  >
                    <span
                      className="size-3 rounded-full border border-white/50"
                      style={{ backgroundColor: preset.theme.primary[500] }}
                    />
                    {t(`theme-customizer.preset.${preset.key}`)}
                  </Button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <TabsList>
                  <TabsTrigger value="palette">{t('theme-customizer.palette')}</TabsTrigger>
                  <TabsTrigger value="tokens">{t('theme-customizer.design-tokens')}</TabsTrigger>
                  <TabsTrigger value="json">{t('theme-customizer.json')}</TabsTrigger>
                </TabsList>
                <Button
                  aria-pressed={darkMode}
                  className="h-9"
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setDarkMode((value) => !value)}
                >
                  {darkMode ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
                  {darkMode ? t('theme-customizer.dark') : t('theme-customizer.light')}
                </Button>
              </div>
            </div>

            <TabsContent className="m-0 p-3" value="palette">
              <div className="grid gap-x-6 gap-y-3 @min-[48rem]/tools:grid-cols-2">
                {scaleKeys.map((scale) => (
                  <div key={scale} className="grid min-w-0 gap-1.5 @min-[56rem]/tools:grid-cols-[4rem_minmax(0,1fr)]">
                    <p className="text-sm font-medium capitalize @min-[56rem]/tools:pt-1.5">{scale}</p>
                    <div className="grid grid-cols-12 gap-1">
                      {(scale === 'gray' ? grayShadeKeys : shadeKeys).map((shade) => (
                        <div className="grid min-w-0 gap-1" key={shade}>
                          <ColorPickerPopover
                            ariaLabel={t('theme-customizer.choose-color', { label: `${scale} ${shade}` })}
                            className="h-8 w-full rounded-sm shadow-none"
                            value={(theme[scale] as unknown as Record<GrayShadeKey, string>)[shade]}
                            onValueChange={(value) => applyTheme(updateScaleColor(theme, scale, shade, value))}
                          />
                          <span className="text-muted-foreground text-center font-mono text-[10px] leading-3">
                            {shade}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent className="m-0 p-3" value="tokens">
              <div className="space-y-4">
                <div className="grid gap-4 @min-[48rem]/tools:grid-cols-2">
                  <fieldset className="min-w-0">
                    <legend className="mb-2 text-sm font-medium">{t('theme-customizer.loop-colors')}</legend>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {loopKeys.map((key) => (
                        <div className="flex min-w-0 items-center gap-2" key={key}>
                          <span className="text-muted-foreground w-4 shrink-0 text-right font-mono text-xs">{key}</span>
                          <ThemeColorSelect
                            label={`${t('theme-customizer.loop-colors')} ${key}`}
                            theme={theme}
                            value={theme['loop-color'][key]}
                            onValueChange={(value) => applyTheme(updateLoopColor(theme, key, value))}
                          />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="min-w-0">
                    <legend className="mb-2 text-sm font-medium">{t('theme-customizer.highlights')}</legend>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      {highlightKeys.slice(0, 8).map((key) => (
                        <div className="flex min-w-0 items-start gap-2" key={key}>
                          <span className="text-muted-foreground w-4 shrink-0 pt-2 text-right font-mono text-xs">
                            {key}
                          </span>
                          <div className="min-w-0 flex-1 space-y-2">
                            <ThemeColorSelect
                              label={`${t('theme-customizer.highlights')} ${key}`}
                              theme={theme}
                              value={theme.highlight.background[key].color}
                              onValueChange={(value) => applyTheme(updateHighlight(theme, key, { color: value }))}
                            />
                            <div className="flex items-center gap-2">
                              <Slider
                                aria-label={`highlight ${key} alpha`}
                                min={0.05}
                                max={0.5}
                                step={0.01}
                                value={theme.highlight.background[key].alpha}
                                onValueChange={(value) => applyTheme(updateHighlight(theme, key, { alpha: value }))}
                              />
                              <span className="text-muted-foreground text-[10px] leading-3 tabular-nums">
                                {Math.round(theme.highlight.background[key].alpha * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <dl className="grid gap-x-6 @min-[40rem]/tools:grid-cols-2 @min-[64rem]/tools:grid-cols-3">
                  {tokenRows.map((row) => (
                    <TokenRow color={row.color} key={row.name} name={row.name} value={row.value} />
                  ))}
                </dl>
              </div>
            </TabsContent>

            <TabsContent className="m-0 p-3" value="json">
              <div className="grid gap-3">
                <Textarea
                  aria-label={t('theme-customizer.json')}
                  className="field-sizing-fixed h-64 resize-y p-3 font-mono text-xs"
                  spellCheck={false}
                  value={jsonDraft}
                  onChange={(event) => setJsonDraft(event.target.value)}
                />
                {jsonError ? <p className="text-destructive text-sm">{jsonError}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={applyJson}>
                    {t('theme-customizer.apply')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyText('json', JSON.stringify(theme, null, 2))}
                  >
                    {copied === 'json' ? <CheckIcon className="size-4" /> : <ClipboardIcon className="size-4" />}
                    {copied === 'json' ? t('theme-customizer.copied') : t('theme-customizer.copy-json')}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <div className="grid grid-cols-1 gap-4 @min-[48rem]/tools:grid-cols-2">
          <section className="bg-card min-w-0 rounded-lg border p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">{t('theme-customizer.export')}</h2>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => copyText('patch', JSON.stringify(patch, null, 2))}
              >
                {copied === 'patch' ? <CheckIcon className="size-4" /> : <ClipboardIcon className="size-4" />}
                {copied === 'patch' ? t('theme-customizer.copied') : t('theme-customizer.copy-patch')}
              </Button>
            </div>
            <pre className="bg-muted max-h-64 overflow-auto rounded-md p-3 text-xs">
              <code>{`const customTheme = ${JSON.stringify(theme, null, 2)}`}</code>
            </pre>
          </section>

          <section className="bg-card min-w-0 rounded-lg border p-4 shadow-sm">
            <h2 className="text-sm font-semibold">{t('theme-customizer.design-tokens')}</h2>
            <pre className="bg-muted mt-3 max-h-64 overflow-auto rounded-md p-3 text-xs">
              <code>{`:root {\n${cssText}\n}`}</code>
            </pre>
          </section>
        </div>
      </div>
    </article>
  )
}
