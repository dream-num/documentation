import { defaultTheme, greenTheme } from '@univerjs/themes'

import type { IThemePreset, ThemeScaleKey, ThemeShadeKey } from './types'

export const PREVIEW_CONTAINER_ID = 'theme-customizer-preview'

export const COLOR_SHADE_KEYS: ThemeShadeKey[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
export const GRAY_SHADE_KEYS = ['0', ...COLOR_SHADE_KEYS, '1000'] as const
export const COLOR_SCALE_KEYS: ThemeScaleKey[] = [
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
export const CORE_SCALE_KEYS: ThemeScaleKey[] = ['primary', 'gray', 'blue', 'green', 'red']
export const LOOP_COLOR_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

export const LOOP_COLOR_OPTIONS = COLOR_SCALE_KEYS.flatMap((scale) =>
  COLOR_SHADE_KEYS.map((shade) => ({
    label: `${scale}.${shade}`,
    value: `${scale}.${shade}`,
  })),
)

export const THEME_PRESETS: IThemePreset[] = [
  { key: 'default', theme: defaultTheme },
  { key: 'green', theme: greenTheme },
]
