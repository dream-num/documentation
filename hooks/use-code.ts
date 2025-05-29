import { useTheme } from 'nextra-theme-docs'
import { useEffect, useState } from 'react'
import { codeToHtml } from 'shiki'

interface CodeHighlightOptions {
  code: string
  lang: string
  themeName?: {
    light: string
    dark: string
  }
  codeLanguage?: string
}

export function useCodeHighlight({
  code,
  lang,
  themeName = {
    light: 'catppuccin-latte',
    dark: 'catppuccin-macchiato',
  },
  codeLanguage = 'typescript',
}: CodeHighlightOptions) {
  const [codeWithHighlight, setCodeWithHighlight] = useState('')
  const { theme } = useTheme()

  useEffect(() => {
    const [language, region] = lang.split('-')

    const codeWithLocale = code
      .replace(
        /EN_US/g,
        `${language.toUpperCase()}_${region.toUpperCase()}`,
      )
      .replace(
        /EnUS/g,
        `${language[0].toUpperCase()}${language.slice(1)}${region.toUpperCase()}`,
      )
      .replace(
        /en-US/g,
        lang,
      )

    codeToHtml(codeWithLocale, {
      theme: theme === 'dark' ? themeName.dark : themeName.light,
      lang: codeLanguage,
    }).then((html) => {
      setCodeWithHighlight(html)
    })
  }, [theme, lang, code, codeLanguage, themeName])

  return codeWithHighlight
}
