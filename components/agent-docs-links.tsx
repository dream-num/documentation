import { withLocale } from '@/lib/locale-path'

interface IProps {
  collection: 'guides' | 'icons' | 'reference'
  lang: string
  pageUrl: string
}

export function AgentDocsLinks({ collection, lang, pageUrl }: IProps) {
  return (
    <>
      <link href={withLocale(lang, `${pageUrl}.md`)} rel="alternate" type="text/markdown" />
      <link href={withLocale(lang, `/${collection}/llms.txt`)} rel="describedby" type="text/plain" />
    </>
  )
}
