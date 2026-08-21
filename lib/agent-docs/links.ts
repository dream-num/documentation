import { withLocale } from '@/lib/locale-path'

export const agentDocsCollections = ['guides', 'reference', 'icons'] as const

export type AgentDocsCollection = (typeof agentDocsCollections)[number]

const SOURCE_REPOSITORY = 'dream-num/documentation'
const SOURCE_REF = (process.env.NEXT_PUBLIC_DOCS_SOURCE_REF ?? 'dev')
  .split('/')
  .map((segment) => encodeURIComponent(segment))
  .join('/')

export function getAgentMarkdownPath(lang: string, pageUrl: string) {
  return `${withLocale(lang, pageUrl)}.md`
}

export function getAgentDocsSourceUrl(collection: AgentDocsCollection, pagePath: string) {
  return `https://github.com/${SOURCE_REPOSITORY}/blob/${SOURCE_REF}/content/${collection}/${pagePath}`
}

export function getAgentDocsRawSourceUrl(collection: AgentDocsCollection, pagePath: string) {
  return `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_REF}/content/${collection}/${pagePath}`
}
