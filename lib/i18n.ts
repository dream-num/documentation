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
  hideLocale: 'always',
}

// translations
export const zhCN: Translations = {
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
  'home.slogan': '重塑工作流的全栈嵌入工具',
  'home.description': 'Univer 是一个前后端同构的全栈办公套件，具有高扩展性和高性能，旨在帮助开发者自由构建和编辑',
  'home.description.split': '、',
  'home.description.period': '。',
  'home.description.and': '和',
  'home.description.sheets': '电子表格',
  'home.description.docs': '文档',
  'home.description.slides': '演示文稿',
  'home.customer.title': 'Univer 为各行业团队与公司赋能，提升工作效率',
  'home.features.conbination.title': '丰富插件，塑造多元产品',
  'home.features.integration.title': '随处集成',
  'home.features.performance.title': '无与伦比的性能',
  'home.features.customizability.title': '一切皆可定制',
  'documentation.title': '文档',
  'ecosystem.title': '生态',
  'icons.title': 'Univer Icons',
  'icons.slogan': 'Univer 的图标库，提供丰富的图标资源',
  'showcase.title': '在线演示',
  'showcase.slogan': '通过案例，了解 Univer 的强大功能',
  'showcase.back': '返回',
  'blog.title': '博客',
  'blog.slogan': '在此探索 Univer 的新闻、架构和最佳实践',
  'blog.author': '作者',
  'blog.date': '发表日期',
  'blog.back': '返回',
  'banner.release': '已发布 →',
  'docs.header.edit-on-github': '在 GitHub 上编辑',
  'playground.click-to-show': '点击显示 demo',
  'playground.click-to-hide': '点击隐藏 demo',
}

const customEnUS: typeof customZhCN = {
  'home.slogan': 'Embedding server-driven productivity tools into Your Workflow',
  'home.description': 'Univer is a full-stack, isomorphic office suite with high extensibility and performance, designed to help developers build and edit ',
  'home.description.split': ', ',
  'home.description.period': ' freely.',
  'home.description.and': ' and ',
  'home.description.sheets': 'spreadsheets',
  'home.description.docs': 'documents',
  'home.description.slides': 'presentations',
  'home.customer.title': 'Trusted by teams and companies across industries',
  'home.features.conbination.title': 'Rich plugins for diverse products',
  'home.features.integration.title': 'Integration Anywhere',
  'home.features.performance.title': 'Unrivaled Performance',
  'home.features.customizability.title': 'Customize Everything',
  'documentation.title': 'Documentation',
  'ecosystem.title': 'Ecosystem',
  'icons.title': 'Univer Icons',
  'icons.slogan': 'An icon library for Univer, providing a rich set of icons',
  'showcase.title': 'Showcase',
  'showcase.slogan': 'Explore Univer\'s powerful features through online examples',
  'showcase.back': 'Back',
  'blog.title': 'Blog',
  'blog.slogan': 'Explore the latest news, architecture, and best practices of Univer',
  'blog.author': 'Author',
  'blog.date': 'Published Date',
  'blog.back': 'Back',
  'banner.release': 'has been released →',
  'docs.header.edit-on-github': 'Edit on GitHub',
  'playground.click-to-show': 'Click to show demo',
  'playground.click-to-hide': 'Click to hide demo',
}

export const customTranslations: Record<string, Record<string, string>> = {
  'zh-CN': customZhCN,
  'en-US': customEnUS,
}
