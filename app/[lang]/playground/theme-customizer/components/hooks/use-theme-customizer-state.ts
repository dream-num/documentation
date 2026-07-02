'use client'

import type { Theme } from '@univerjs/themes'
import type { EditorMode, LoopColorKey, ThemeScaleKey, ThemeShadeKey, TokenDensity } from '../types'
import { defaultTheme } from '@univerjs/themes'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { COLOR_SCALE_KEYS, CORE_SCALE_KEYS, THEME_PRESETS } from '../constants'
import { cloneTheme, formatTheme, mergeThemePatch, updateLoopColor, updateScaleColor, updateThemeRootColor } from '../theme-utils'

export function useThemeCustomizerState() {
  const t = useTranslations()
  const [theme, setTheme] = useState<Theme>(() => cloneTheme(defaultTheme))
  const [editorMode, setEditorMode] = useState<EditorMode>('tokens')
  const [tokenDensity, setTokenDensity] = useState<TokenDensity>('core')
  const [darkMode, setDarkMode] = useState(false)
  const [jsonDraft, setJsonDraft] = useState(() => formatTheme(defaultTheme))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('univer-dark', darkMode)
    document.body.classList.toggle('univer-dark', darkMode)

    return () => {
      document.documentElement.classList.remove('univer-dark')
      document.body.classList.remove('univer-dark')
    }
  }, [darkMode])

  const visibleScaleKeys = useMemo(() => (
    tokenDensity === 'core' ? CORE_SCALE_KEYS : COLOR_SCALE_KEYS
  ), [tokenDensity])

  function applyTheme(nextTheme: Theme) {
    setTheme(nextTheme)
    setJsonDraft(formatTheme(nextTheme))
    setJsonError(null)
  }

  function handleScaleColorChange(scale: ThemeScaleKey, shade: ThemeShadeKey, value: string) {
    applyTheme(updateScaleColor(theme, scale, shade, value))
  }

  function handleRootColorChange(key: 'white' | 'black', value: string) {
    applyTheme(updateThemeRootColor(theme, key, value))
  }

  function handleLoopColorChange(key: LoopColorKey, value: string) {
    applyTheme(updateLoopColor(theme, key, value))
  }

  function handlePresetApply(presetKey: 'default' | 'green') {
    const preset = THEME_PRESETS.find(item => item.key === presetKey)

    if (!preset) {
      return
    }

    applyTheme(cloneTheme(preset.theme))
  }

  function handleJsonChange(value: string) {
    setJsonDraft(value)

    try {
      const parsedValue = JSON.parse(value) as unknown
      const mergedTheme = mergeThemePatch(theme, parsedValue)

      if (!mergedTheme) {
        setJsonError(t('theme-customizer.json-object-required'))
        return
      }

      setTheme(mergedTheme)
      setJsonError(null)
    } catch {
      setJsonError(t('theme-customizer.json-parse-failed'))
    }
  }

  async function handleCopyTheme() {
    if (!navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(formatTheme(theme))
    setCopied(true)

    window.setTimeout(() => {
      setCopied(false)
    }, 1600)
  }

  return {
    copyLabel: copied ? t('theme-customizer.copied') : t('theme-customizer.copy-json'),
    darkMode,
    editorMode,
    jsonDraft,
    jsonError,
    theme,
    tokenDensity,
    visibleScaleKeys,
    setDarkMode,
    setEditorMode,
    setJsonDraft,
    setTokenDensity,
    handleCopyTheme,
    handleJsonChange,
    handleLoopColorChange,
    handlePresetApply,
    handleRootColorChange,
    handleScaleColorChange,
  }
}
