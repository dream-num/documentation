import type { Theme } from '@univerjs/themes'

import type { LoopColorKey, ThemeScaleKey, ThemeShadeKey } from './types'
import { COLOR_SCALE_KEYS, COLOR_SHADE_KEYS, GRAY_SHADE_KEYS, LOOP_COLOR_KEYS } from './constants'

export function cloneTheme(theme: Theme): Theme {
  return JSON.parse(JSON.stringify(theme)) as Theme
}

export function normalizeHexColor(value: string): string | null {
  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  const prefixedValue = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`
  const shortHexMatch = prefixedValue.match(/^#([0-9a-f]{3})$/i)

  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }

  if (/^#[0-9a-f]{6}$/i.test(prefixedValue)) {
    return prefixedValue.toUpperCase()
  }

  return null
}

export function formatTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 4)
}

export function mergeThemePatch(baseTheme: Theme, patch: unknown): Theme | null {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return null
  }

  const nextTheme = cloneTheme(baseTheme)
  const record = patch as Record<string, unknown>

  for (const scale of COLOR_SCALE_KEYS) {
    const scalePatch = record[scale]

    if (!scalePatch || typeof scalePatch !== 'object' || Array.isArray(scalePatch)) {
      continue
    }

    const scaleRecord = scalePatch as Record<string, unknown>
    const nextScale = nextTheme[scale] as unknown as Record<string, string>
    const shadeKeys = scale === 'gray' ? GRAY_SHADE_KEYS : COLOR_SHADE_KEYS

    for (const shade of shadeKeys) {
      if (typeof scaleRecord[shade] === 'string') {
        nextScale[shade] = scaleRecord[shade]
      }
    }
  }

  const loopColorPatch = record['loop-color']

  if (loopColorPatch && typeof loopColorPatch === 'object' && !Array.isArray(loopColorPatch)) {
    const loopRecord = loopColorPatch as Record<string, unknown>
    const mergedLoopColor = { ...(nextTheme['loop-color'] as Record<string, string>) }

    for (const key of LOOP_COLOR_KEYS) {
      if (typeof loopRecord[key] === 'string') {
        mergedLoopColor[key] = loopRecord[key] as string
      }
    }

    nextTheme['loop-color'] = mergedLoopColor as Theme['loop-color']
  }

  return nextTheme
}

export function updateScaleColor(theme: Theme, scale: ThemeScaleKey, shade: ThemeShadeKey, value: string): Theme {
  return {
    ...theme,
    [scale]: {
      ...theme[scale],
      [shade]: value,
    },
  } as Theme
}

export function updateThemeRootColor(theme: Theme, key: 'white' | 'black', value: string): Theme {
  const shade = key === 'white' ? 0 : 1000

  return {
    ...theme,
    gray: {
      ...theme.gray,
      [shade]: value,
    },
  }
}

export function updateLoopColor(theme: Theme, key: LoopColorKey, value: string): Theme {
  return {
    ...theme,
    'loop-color': {
      ...theme['loop-color'],
      [key]: value,
    },
  } as Theme
}
