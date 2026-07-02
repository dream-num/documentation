'use client'

import type { Theme } from '@univerjs/themes'
import type { ReactNode } from 'react'
import { defaultTheme, greenTheme } from '@univerjs/themes'
import { CheckIcon, ClipboardIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'
import { ColorPickerPopover } from '@/components/color-picker-popover'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RealUniverPreview } from './real-univer-preview'

type ShadeKey = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
type ScaleKey = 'primary' | 'gray' | 'blue' | 'red' | 'orange' | 'yellow' | 'green' | 'jiqing' | 'indigo' | 'purple' | 'pink'
type LoopKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
type HighlightKey
  = | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'

type ThemeWithTokens = Theme & {
  highlight: {
    background: Record<HighlightKey, {
      color: string
      alpha: number
    }>
  }
}

type PresetKey = 'default' | 'green' | 'orange' | 'red' | 'purple'

const scaleKeys: ScaleKey[] = ['primary', 'gray', 'blue', 'red', 'orange', 'yellow', 'green', 'jiqing', 'indigo', 'purple', 'pink']
const shadeKeys: ShadeKey[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
const loopKeys: LoopKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
const highlightKeys: HighlightKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']

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

function createAccentTheme(theme: Theme, accent: ScaleKey): ThemeWithTokens {
  const normalizedTheme = normalizeTheme(theme)
  const primaryScale = normalizedTheme[accent]

  return {
    ...normalizedTheme,
    primary: { ...primaryScale },
    'loop-color': {
      ...normalizedTheme['loop-color'],
      1: `${accent}.500`,
      6: 'primary.500',
    },
    highlight: {
      background: {
        ...normalizedTheme.highlight.background,
        1: { color: `${accent}.500`, alpha: 0.28 },
        9: { color: `${accent}.500`, alpha: 0.14 },
      },
    },
  }
}

const presets: Array<{
  key: PresetKey
  accent: ScaleKey
  theme: ThemeWithTokens
}> = [
  {
    key: 'default',
    accent: 'primary',
    theme: normalizeTheme(defaultTheme),
  },
  {
    key: 'green',
    accent: 'green',
    theme: normalizeTheme(greenTheme),
  },
  {
    key: 'orange',
    accent: 'orange',
    theme: createAccentTheme(defaultTheme, 'orange'),
  },
  {
    key: 'red',
    accent: 'red',
    theme: createAccentTheme(defaultTheme, 'red'),
  },
  {
    key: 'purple',
    accent: 'purple',
    theme: createAccentTheme(defaultTheme, 'purple'),
  },
]

function resolveColor(theme: ThemeWithTokens, value: string) {
  const [scale, shade] = value.split('.') as [ScaleKey | undefined, ShadeKey | undefined]

  if (scale && shade && scale in theme && shade in theme[scale]) {
    return theme[scale][shade]
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

function alphaColor(theme: ThemeWithTokens, value: { color: string, alpha: number }) {
  const { r, g, b } = hexToRgb(resolveColor(theme, value.color))
  return `rgba(${r}, ${g}, ${b}, ${value.alpha})`
}

function updateScaleColor(theme: ThemeWithTokens, scale: ScaleKey, shade: ShadeKey, value: string): ThemeWithTokens {
  return {
    ...theme,
    [scale]: {
      ...theme[scale],
      [shade]: value,
    },
  }
}

function updateRootColor(theme: ThemeWithTokens, key: 'white' | 'black', value: string): ThemeWithTokens {
  return {
    ...theme,
    [key]: value,
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

function updateHighlight(theme: ThemeWithTokens, key: HighlightKey, value: { color?: string, alpha?: number }): ThemeWithTokens {
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
  const patch: Partial<ThemeWithTokens> = {}

  if (theme.white !== baseTheme.white) patch.white = theme.white
  if (theme.black !== baseTheme.black) patch.black = theme.black

  for (const scale of scaleKeys) {
    const scalePatch: Partial<Record<ShadeKey, string>> = {}

    for (const shade of shadeKeys) {
      if (theme[scale][shade] !== baseTheme[scale][shade]) {
        scalePatch[shade] = theme[scale][shade]
      }
    }

    if (Object.keys(scalePatch).length > 0) {
      patch[scale] = scalePatch as ThemeWithTokens[ScaleKey]
    }
  }

  const loopPatch: Partial<Record<LoopKey, string>> = {}
  for (const key of loopKeys) {
    if (theme['loop-color'][key] !== baseTheme['loop-color'][key]) {
      loopPatch[key] = theme['loop-color'][key]
    }
  }

  if (Object.keys(loopPatch).length > 0) {
    patch['loop-color'] = loopPatch as ThemeWithTokens['loop-color']
  }

  if (JSON.stringify(theme.highlight) !== JSON.stringify(baseTheme.highlight)) {
    patch.highlight = theme.highlight
  }

  return patch
}

function createCssTokens(theme: ThemeWithTokens) {
  const rows: Array<{ name: string, value: string, color?: string }> = [
    { name: '--univer-white', value: theme.white, color: theme.white },
    { name: '--univer-black', value: theme.black, color: theme.black },
  ]

  for (const scale of scaleKeys) {
    for (const shade of shadeKeys) {
      rows.push({
        name: `--univer-${scale}-${shade}`,
        value: theme[scale][shade],
        color: theme[scale][shade],
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

function FieldLabel({
  children,
}: {
  children: ReactNode
}) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <span className="flex h-9 items-center gap-2 rounded-md border bg-background px-2 shadow-xs">
        <ColorPickerPopover ariaLabel={label} value={value} onValueChange={onChange} />
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      </span>
    </label>
  )
}

function TokenRow({
  color,
  name,
  value,
}: {
  color?: string
  name: string
  value: string
}) {
  return (
    <div
      className="
        grid grid-cols-[minmax(0,1fr)_minmax(8rem,0.7fr)] items-center gap-3 border-b py-2 text-sm
        last:border-b-0
      "
    >
      <span className="flex min-w-0 items-center gap-2">
        {color
          ? <span className="size-4 shrink-0 rounded-sm border" style={{ backgroundColor: color }} />
          : null}
        <code className="truncate rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs">{name}</code>
      </span>
      <span className="truncate font-mono text-xs text-muted-foreground">{value}</span>
    </div>
  )
}

export function ThemeCustomizerTool({
  description,
  title,
}: {
  description: string
  title: string
}) {
  const t = useTranslations()
  const [presetKey, setPresetKey] = useState<PresetKey>('default')
  const [theme, setTheme] = useState(() => cloneTheme(presets[0].theme))
  const [darkMode, setDarkMode] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(presets[0].theme, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  const activePreset = presets.find(preset => preset.key === presetKey) ?? presets[0]
  const patch = useMemo(() => createThemePatch(activePreset.theme, theme), [activePreset.theme, theme])
  const tokenRows = useMemo(() => createCssTokens(theme), [theme])
  const cssText = useMemo(() => tokenRows.map(row => `  ${row.name}: ${row.value};`).join('\n'), [tokenRows])

  function applyTheme(nextTheme: ThemeWithTokens) {
    setTheme(nextTheme)
    setJsonDraft(JSON.stringify(nextTheme, null, 2))
    setJsonError(null)
  }

  function applyPreset(nextPresetKey: PresetKey) {
    const nextPreset = presets.find(preset => preset.key === nextPresetKey)
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
      <header className="border-b pb-4">
        <p className="text-sm font-medium text-muted-foreground">{t('tools.section')}</p>
        <h1 className="mt-2 text-3xl/tight font-semibold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-3xl text-base text-muted-foreground">{description}</p>
      </header>

      <div className="mt-4 space-y-4">
        <section className="min-w-0 rounded-lg border bg-card shadow-sm">
          <Tabs className="gap-0" defaultValue="palette">
            <div
              className="
                flex flex-wrap items-center justify-between gap-3 border-b px-3 py-2
                lg:flex-nowrap
              "
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-muted-foreground">{t('theme-customizer.presets')}</span>
                {presets.map(preset => (
                  <Button
                    className="h-8 gap-2"
                    key={preset.key}
                    size="sm"
                    type="button"
                    variant={preset.key === presetKey ? 'default' : 'outline'}
                    onClick={() => applyPreset(preset.key)}
                  >
                    <span
                      className="size-3 rounded-full border border-white/50"
                      style={{ backgroundColor: preset.theme[preset.accent][500] }}
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
                  onClick={() => setDarkMode(value => !value)}
                >
                  {darkMode ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
                  {darkMode ? t('theme-customizer.dark') : t('theme-customizer.light')}
                </Button>
              </div>
            </div>

            <TabsContent className="m-0 max-h-58 overflow-y-auto p-3" value="palette">
              <div
                className="
                  grid gap-4
                  xl:grid-cols-[18rem_minmax(0,1fr)]
                "
              >
                <section>
                  <h2 className="text-sm font-semibold">{t('theme-customizer.root')}</h2>
                  <div className="mt-3 grid gap-3">
                    <ColorField label="white" value={theme.white} onChange={value => applyTheme(updateRootColor(theme, 'white', value))} />
                    <ColorField label="black" value={theme.black} onChange={value => applyTheme(updateRootColor(theme, 'black', value))} />
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-semibold">{t('theme-customizer.palette')}</h2>
                  <div
                    className="
                      mt-3 grid gap-x-4 gap-y-3
                      xl:grid-cols-2
                    "
                  >
                    {scaleKeys.map(scale => (
                      <div key={scale}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <p className="text-sm font-medium capitalize">{scale}</p>
                          <code
                            className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                          >
                            --univer-
                            {scale}
                            -500
                          </code>
                        </div>
                        <div className="grid grid-cols-10 gap-1.5">
                          {shadeKeys.map(shade => (
                            <div className="group grid gap-1" key={shade}>
                              <span
                                className="
                                  h-6 rounded-sm border transition-transform
                                  group-hover:-translate-y-0.5
                                "
                                style={{ backgroundColor: theme[scale][shade] }}
                              />
                              <span className="flex justify-center">
                                <ColorPickerPopover
                                  ariaLabel={t('theme-customizer.choose-color', { label: `${scale} ${shade}` })}
                                  value={theme[scale][shade]}
                                  onValueChange={value => applyTheme(updateScaleColor(theme, scale, shade, value))}
                                />
                              </span>
                              <span className="text-center font-mono text-[9px] text-muted-foreground">{shade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </TabsContent>

            <TabsContent className="m-0 max-h-58 overflow-y-auto p-3" value="tokens">
              <div className="grid gap-4">
                <div>
                  <h2 className="text-sm font-semibold">{t('theme-customizer.design-tokens')}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{t('theme-customizer.token-intro')}</p>
                </div>
                <div className="max-h-44 overflow-y-auto rounded-md border px-3">
                  {tokenRows.map(row => (
                    <TokenRow color={row.color} key={row.name} name={row.name} value={row.value} />
                  ))}
                </div>

                <div
                  className="
                    grid gap-4
                    md:grid-cols-2
                  "
                >
                  <section>
                    <h3 className="text-sm font-semibold">{t('theme-customizer.loop-colors')}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {loopKeys.map(key => (
                        <label className="grid gap-1.5" key={key}>
                          <FieldLabel>
                            loop
                            {key}
                          </FieldLabel>
                          <select
                            className="h-9 rounded-md border bg-background px-2 text-sm shadow-xs"
                            value={theme['loop-color'][key]}
                            onChange={event => applyTheme(updateLoopColor(theme, key, event.target.value))}
                          >
                            {scaleKeys.flatMap(scale => shadeKeys.map(shade => `${scale}.${shade}`)).map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold">{t('theme-customizer.highlights')}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {highlightKeys.slice(0, 8).map(key => (
                        <label className="grid gap-1.5" key={key}>
                          <FieldLabel>
                            highlight
                            {key}
                          </FieldLabel>
                          <span className="flex items-center gap-2">
                            <select
                              className="h-9 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm shadow-xs"
                              value={theme.highlight.background[key].color}
                              onChange={event => applyTheme(updateHighlight(theme, key, { color: event.target.value }))}
                            >
                              {scaleKeys.flatMap(scale => shadeKeys.map(shade => `${scale}.${shade}`)).map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            <input
                              aria-label={`highlight ${key} alpha`}
                              className="w-16"
                              max={0.5}
                              min={0.05}
                              step={0.01}
                              type="range"
                              value={theme.highlight.background[key].alpha}
                              onChange={event => applyTheme(updateHighlight(theme, key, { alpha: Number(event.target.value) }))}
                            />
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </TabsContent>

            <TabsContent className="m-0 max-h-58 overflow-y-auto p-3" value="json">
              <div className="grid gap-3">
                <textarea
                  className="
                    h-42 resize-none rounded-md border bg-background p-3 font-mono text-xs shadow-xs outline-none
                    focus-visible:ring-2 focus-visible:ring-ring/50
                  "
                  spellCheck={false}
                  value={jsonDraft}
                  onChange={event => setJsonDraft(event.target.value)}
                />
                {jsonError ? <p className="text-sm text-destructive">{jsonError}</p> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={applyJson}>{t('theme-customizer.apply')}</Button>
                  <Button type="button" variant="outline" onClick={() => copyText('json', JSON.stringify(theme, null, 2))}>
                    {copied === 'json' ? <CheckIcon className="size-4" /> : <ClipboardIcon className="size-4" />}
                    {copied === 'json' ? t('theme-customizer.copied') : t('theme-customizer.copy-json')}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <section className="rounded-lg border bg-card p-3 shadow-sm">
          <Tabs defaultValue="sheets">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{t('theme-customizer.live-preview')}</h2>
                <p className="mt-1 text-xs text-muted-foreground">
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

        <div
          className="
            grid gap-4
            lg:grid-cols-2
          "
        >
          <section className="rounded-lg border bg-card p-4 shadow-sm">
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
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
              <code>{`const customTheme = ${JSON.stringify(theme, null, 2)}`}</code>
            </pre>
          </section>

          <section className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold">{t('theme-customizer.design-tokens')}</h2>
            <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
              <code>{`:root {\n${cssText}\n}`}</code>
            </pre>
          </section>
        </div>
      </div>
    </article>
  )
}
