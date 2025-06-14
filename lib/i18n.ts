import type { I18nConfig } from 'fumadocs-core/i18n'
import type { Translations } from 'fumadocs-ui/i18n'

export const locales = [
  {
    name: 'English',
    locale: 'en-US',
  },
  {
    name: '简体中文',
    locale: 'zh-CN',
  },
]

export const i18n: I18nConfig = {
  defaultLanguage: 'en-US',
  languages: ['en-US', 'zh-CN'],
}

// translations
export const zhCN: Partial<Translations> = {
  search: '搜索',
  searchNoResult: '没有找到相关内容',
  toc: '目录',
  tocNoHeadings: '没有可用的目录',
  lastUpdate: '最后更新',
  chooseLanguage: '选择语言',
  nextPage: '下一页',
  previousPage: '上一页',
  chooseTheme: '选择主题',
  editOnGithub: '在 GitHub 上编辑',
}

export const translations: Record<string, Partial<Translations>> = {
  'zh-CN': zhCN,
}
