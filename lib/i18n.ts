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

/**
 * ==================== Custom Translations ====================
 * These translations are used for specific components or pages
 * and can be extended or modified as needed.
 * =============================================================
 */

const customZhCN = {
  'documentation.title': '文档',
  'ecosystem.title': '生态',
  'icons.title': 'Univer Icons',
  'icons.slogan': 'Univer 的图标库，提供丰富的图标资源',
  'blog.title': '博客',
  'blog.slogan': '在此探索 Univer 的新闻、架构和最佳实践',
  'blog.author': '作者',
  'blog.date': '发表日期',
}

const customEnUS: typeof customZhCN = {
  'documentation.title': 'Documentation',
  'ecosystem.title': 'Ecosystem',
  'icons.title': 'Univer Icons',
  'icons.slogan': 'An icon library for Univer, providing a rich set of icons',
  'blog.title': 'Blog',
  'blog.slogan': 'Explore the latest news, architecture, and best practices of Univer',
  'blog.author': 'Author',
  'blog.date': 'Published Date',
}

export const customTranslations: Record<string, Record<string, string>> = {
  'zh-CN': customZhCN,
  'en-US': customEnUS,
}
