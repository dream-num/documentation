import type { AgentDocsCollection } from '@/lib/agent-docs/links'
import { getAgentMarkdownPath } from '@/lib/agent-docs/links'
import { withLocale } from '@/lib/locale-path'

interface IProps {
  collection: AgentDocsCollection
  lang: string
  pageUrl: string
}

export function AgentDocsLinks({ collection, lang, pageUrl }: IProps) {
  return (
    <>
      <link href={getAgentMarkdownPath(lang, pageUrl)} rel="alternate" type="text/markdown" />
      <link href={withLocale(lang, `/${collection}/llms.txt`)} rel="describedby" type="text/plain" />
    </>
  )
}
