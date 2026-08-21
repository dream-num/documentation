import { createHash } from 'node:crypto'

import type { Locale } from '@/i18n/routing'
import type { AgentDocsCollection } from '@/lib/agent-docs/links'
import { isAppLocale } from '@/i18n/locale-config'
import { routing } from '@/i18n/routing'
import {
  agentDocsCollections,
  getAgentDocsRawSourceUrl,
  getAgentDocsSourceUrl,
  getAgentMarkdownPath,
} from '@/lib/agent-docs/links'
import { withLocale } from '@/lib/locale-path'
import { guides, icons, reference } from '@/lib/source'

import packageJson from '../../package.json'

interface IAgentDocsRequest {
  asset: string[]
  lang: string
}

interface IAgentDocsArtifact {
  body: string
  canonicalPath: string
  contentLanguage: Locale
  contentType: 'text/markdown; charset=utf-8' | 'text/plain; charset=utf-8'
  describedByPath: string
  digest: string
  humanPath?: string
}

interface IAgentDocsStaticParam {
  asset: string[]
  lang: Locale
}

interface IAgentDocsPublication {
  enumerate: () => Promise<IAgentDocsStaticParam[]>
  publish: (request: IAgentDocsRequest) => Promise<IAgentDocsArtifact | undefined>
}

type GuidesPage = (typeof guides)['$inferPage']
type IconsPage = (typeof icons)['$inferPage']
type ReferencePage = (typeof reference)['$inferPage']
type AgentDocsPage = GuidesPage | IconsPage | ReferencePage

type AgentDocsTarget =
  | {
      collection?: AgentDocsCollection
      kind: 'index'
    }
  | {
      collection: AgentDocsCollection
      kind: 'page'
      slug: string[]
    }

const AGENT_IMAGE_SOURCE = 'agent-image:'
const DOCS_ORIGIN = 'https://docs.univer.ai'
const MARKDOWN_LINK_DESTINATION = /(\]\()([^\s)]+)([^)]*\))/g
const MARKDOWN_IMAGE_DESTINATION = /(!\[[^\]]*\]\()([^\s)]+)([^)]*\))/g
const MARKDOWN_DELIMITER_ENTITY = /&#x(?:60|2a);/i
const RAW_MDX_COMMENT = /\{\/\*|\*\/\}/
const RAW_MDX_ELEMENT = /<\/?[A-Z][A-Za-z0-9.]*(?:\s|\/?>)/
let staticParamsPromise: Promise<IAgentDocsStaticParam[]> | undefined

function isAgentDocsCollection(value: string): value is AgentDocsCollection {
  return agentDocsCollections.includes(value as AgentDocsCollection)
}

function parseTarget(asset: string[]): AgentDocsTarget | undefined {
  if (asset.some((segment) => !segment || segment === '.' || segment === '..' || segment.includes('/'))) {
    return undefined
  }

  if (asset.length === 1 && asset[0] === 'llms.txt') {
    return { kind: 'index' }
  }

  if (asset.length === 2 && isAgentDocsCollection(asset[0]) && asset[1] === 'llms.txt') {
    return { collection: asset[0], kind: 'index' }
  }

  if (asset.length === 1 && asset[0].endsWith('.md')) {
    const collection = asset[0].slice(0, -3)
    if (!isAgentDocsCollection(collection)) return undefined
    return { collection, kind: 'page', slug: [] }
  }

  const [collection, ...slug] = asset
  const lastSegment = slug.at(-1)
  if (!collection || !isAgentDocsCollection(collection) || !lastSegment?.endsWith('.md')) {
    return undefined
  }

  slug[slug.length - 1] = lastSegment.slice(0, -3)
  if (slug.some((segment) => !segment)) return undefined
  return { collection, kind: 'page', slug }
}

function getPages(collection: AgentDocsCollection, lang: Locale): AgentDocsPage[] {
  switch (collection) {
    case 'guides':
      return guides.getPages(lang)
    case 'icons':
      return icons.getPages(lang)
    case 'reference':
      return reference.getPages(lang)
  }
}

function getPage(collection: AgentDocsCollection, slug: string[], lang: Locale): AgentDocsPage | undefined {
  switch (collection) {
    case 'guides':
      return guides.getPage(slug, lang)
    case 'icons':
      return icons.getPage(slug, lang)
    case 'reference':
      return reference.getPage(slug, lang)
  }
}

function resolveHref(collection: AgentDocsCollection, href: string, page: AgentDocsPage) {
  switch (collection) {
    case 'guides':
      return guides.resolveHref(href, page as GuidesPage)
    case 'icons':
      return icons.resolveHref(href, page as IconsPage)
    case 'reference':
      return reference.resolveHref(href, page as ReferencePage)
  }
}

function getContentLocale(path: string): Locale {
  const withoutExtension = path.replace(/\.mdx?$/, '')
  for (const locale of routing.locales) {
    if (withoutExtension.endsWith(`.${locale}`)) return locale
  }
  return routing.defaultLocale
}

function getCollectionIndexPath(lang: Locale, collection: AgentDocsCollection) {
  return withLocale(lang, `/${collection}/llms.txt`)
}

function getRootIndexPath(lang: Locale) {
  return withLocale(lang, '/llms.txt')
}

function getPageAsset(collection: AgentDocsCollection, page: AgentDocsPage) {
  if (page.slugs.length === 0) return [`${collection}.md`]
  const slug = [...page.slugs]
  slug[slug.length - 1] = `${slug.at(-1)}.md`
  return [collection, ...slug]
}

function getDigest(body: string) {
  return `"${createHash('sha256').update(body).digest('base64url')}"`
}

function oneLine(value: string | undefined) {
  return value?.replace(/\s+/g, ' ').trim()
}

function restoreMarkdownDelimiters(markdown: string) {
  // fumadocs-core 16.14.5 drops handler `peek` metadata while stringifying,
  // which encodes otherwise balanced Markdown delimiters as HTML entities.
  return markdown.replace(/&#x60;/gi, '`').replace(/&#x2a;/gi, '*')
}

function demoteBodyHeadings(markdown: string) {
  let fence: { length: number; marker: '`' | '~' } | undefined

  return markdown
    .split('\n')
    .map((line) => {
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
      if (fenceMatch) {
        const marker = fenceMatch[1][0] as '`' | '~'
        if (!fence) fence = { length: fenceMatch[1].length, marker }
        else if (fence.marker === marker && fenceMatch[1].length >= fence.length) fence = undefined
        return line
      }

      return fence ? line : line.replace(/^# /, '## ')
    })
    .join('\n')
    .trim()
}

function rewriteInternalHref(href: string, lang: Locale, collection: AgentDocsCollection, page: AgentDocsPage) {
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return href

  let candidate = href
  if (href.startsWith('http://') || href.startsWith('https://')) {
    const url = new URL(href)
    if (url.origin !== DOCS_ORIGIN) return href
    candidate = `${url.pathname}${url.search}${url.hash}`
  } else if (href.startsWith('./') || href.startsWith('../')) {
    candidate = resolveHref(collection, href, page)
  }

  const match = candidate.match(/^([^?#]+)(\?[^#]*)?(#.*)?$/)
  if (!match) return href
  const [, pathname, search = '', hash = ''] = match
  const absolutePathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  const unlocalizedPath = routing.locales.reduce(
    (value, locale) => value.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/',
    absolutePathname,
  )
  const withoutSourceExtension = unlocalizedPath.replace(/\.mdx?$/, '').replace(/\/+$/, '')
  const [, collectionSegment, ...slug] = withoutSourceExtension.split('/')
  const targetCollection = agentDocsCollections.find((name) => name === collectionSegment)
  if (!targetCollection) return href
  if (!getPage(targetCollection, slug, lang)) {
    throw new Error(`Agent Markdown found a broken internal link in ${page.path}: ${href}`)
  }

  const markdownPath = `${withoutSourceExtension}.md`
  return `${DOCS_ORIGIN}${withLocale(lang, markdownPath)}${search}${hash}`
}

function rewriteInternalLinks(markdown: string, lang: Locale, collection: AgentDocsCollection, page: AgentDocsPage) {
  return markdown.replace(
    MARKDOWN_LINK_DESTINATION,
    (_match, prefix: string, href: string, suffix: string) =>
      `${prefix}${rewriteInternalHref(href, lang, collection, page)}${suffix}`,
  )
}

function rewriteImageSources(markdown: string, collection: AgentDocsCollection, page: AgentDocsPage) {
  const sourceDirectory = page.path.includes('/') ? page.path.slice(0, page.path.lastIndexOf('/') + 1) : ''
  const baseUrl = getAgentDocsRawSourceUrl(collection, sourceDirectory)

  return markdown.replace(MARKDOWN_IMAGE_DESTINATION, (_match, prefix: string, href: string, suffix: string) => {
    if (!href.startsWith(AGENT_IMAGE_SOURCE)) return `${prefix}${href}${suffix}`
    const source = decodeURIComponent(href.slice(AGENT_IMAGE_SOURCE.length))
    return `${prefix}${new URL(source, baseUrl).href}${suffix}`
  })
}

function removeInlineCode(line: string) {
  let delimiterLength = 0
  let result = ''

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== '`') {
      if (delimiterLength === 0) result += line[index]
      continue
    }

    let end = index + 1
    while (line[end] === '`') end += 1
    const runLength = end - index
    if (delimiterLength === 0) delimiterLength = runLength
    else if (runLength === delimiterLength) delimiterLength = 0
    index = end - 1
  }

  return result
}

function inspectMarkdownStructure(markdown: string) {
  let fence: { length: number; marker: '`' | '~' } | undefined
  let h1Count = 0
  let rawMdx: string | undefined

  for (const line of markdown.split('\n')) {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1][0] as '`' | '~'
      if (!fence) fence = { length: fenceMatch[1].length, marker }
      else if (fence.marker === marker && fenceMatch[1].length >= fence.length) fence = undefined
      continue
    }

    if (fence) continue
    if (line.startsWith('# ')) h1Count += 1
    const visibleLine = removeInlineCode(line)
    if (RAW_MDX_COMMENT.test(visibleLine) || RAW_MDX_ELEMENT.test(visibleLine)) rawMdx = line
  }

  return { h1Count, rawMdx }
}

function validatePageBody(body: string, canonicalPath: string) {
  if (!body.trim()) throw new Error(`Agent Markdown generated an empty page for ${canonicalPath}`)
  if (body.includes('\0')) throw new Error(`Agent Markdown left a placeholder in ${canonicalPath}`)
  if (body.includes(AGENT_IMAGE_SOURCE)) throw new Error(`Agent Markdown left an unresolved image in ${canonicalPath}`)
  if (MARKDOWN_DELIMITER_ENTITY.test(body)) {
    throw new Error(`Agent Markdown left an encoded Markdown delimiter in ${canonicalPath}`)
  }
  const { h1Count, rawMdx } = inspectMarkdownStructure(body)
  if (rawMdx) throw new Error(`Agent Markdown left raw MDX in ${canonicalPath}: ${rawMdx}`)

  if (h1Count !== 1) {
    throw new Error(`Agent Markdown expected exactly one H1 in ${canonicalPath}, received ${h1Count}`)
  }
}

async function renderPage(
  lang: Locale,
  collection: AgentDocsCollection,
  page: AgentDocsPage,
): Promise<IAgentDocsArtifact> {
  const humanPath = withLocale(lang, page.url)
  const canonicalPath = getAgentMarkdownPath(lang, page.url)
  const describedByPath = getCollectionIndexPath(lang, collection)
  const contentLanguage = getContentLocale(page.path)
  const processed = restoreMarkdownDelimiters(await page.data.getText('processed'))
  const bodyMarkdown = rewriteInternalLinks(
    rewriteImageSources(demoteBodyHeadings(processed), collection, page),
    lang,
    collection,
    page,
  )
  const description = oneLine(page.data.description)
  const fallback =
    contentLanguage === lang
      ? undefined
      : `> Language fallback: requested \`${lang}\`; content is \`${contentLanguage}\`.`
  const sourceUrl = getAgentDocsSourceUrl(collection, page.path)
  const body = [
    `# ${page.data.title}`,
    description ? `> ${description}` : undefined,
    fallback,
    `- Human documentation: [${DOCS_ORIGIN}${humanPath}](${DOCS_ORIGIN}${humanPath})`,
    `- Agent Markdown: [${DOCS_ORIGIN}${canonicalPath}](${DOCS_ORIGIN}${canonicalPath})`,
    `- Requested language: \`${lang}\``,
    `- Content language: \`${contentLanguage}\``,
    `- Documentation version: \`${packageJson.version}\``,
    `- Source: [${page.path}](${sourceUrl})`,
    '---',
    bodyMarkdown,
  ]
    .filter((value) => value !== undefined && value !== '')
    .join('\n\n')
    .concat('\n')

  validatePageBody(body, canonicalPath)
  return {
    body,
    canonicalPath,
    contentLanguage,
    contentType: 'text/markdown; charset=utf-8',
    describedByPath,
    digest: getDigest(body),
    humanPath,
  }
}

function renderRootIndex(lang: Locale): IAgentDocsArtifact {
  const canonicalPath = getRootIndexPath(lang)
  const body = [
    '# Univer Documentation',
    '',
    '> Agent-readable guides, API reference, and icon documentation for Univer.',
    '',
    `- Language: \`${lang}\``,
    `- Documentation version: \`${packageJson.version}\``,
    '',
    '## Collections',
    '',
    ...agentDocsCollections.map(
      (collection) => `- [${collection}](${DOCS_ORIGIN}${getCollectionIndexPath(lang, collection)})`,
    ),
    '',
  ].join('\n')

  return {
    body,
    canonicalPath,
    contentLanguage: lang,
    contentType: 'text/plain; charset=utf-8',
    describedByPath: canonicalPath,
    digest: getDigest(body),
  }
}

function renderCollectionIndex(lang: Locale, collection: AgentDocsCollection): IAgentDocsArtifact {
  const canonicalPath = getCollectionIndexPath(lang, collection)
  const pages = getPages(collection, lang).toSorted((a, b) => a.url.localeCompare(b.url))
  const body = [
    `# Univer ${collection}`,
    '',
    `> Agent-readable index for the ${collection} collection.`,
    '',
    `- Language: \`${lang}\``,
    `- Documentation version: \`${packageJson.version}\``,
    `- Parent index: [${DOCS_ORIGIN}${getRootIndexPath(lang)}](${DOCS_ORIGIN}${getRootIndexPath(lang)})`,
    '',
    '## Pages',
    '',
    ...pages.map((page) => {
      const description = oneLine(page.data.description)
      const contentLocale = getContentLocale(page.path)
      const fallback = contentLocale === lang ? '' : ` _(content in ${contentLocale})_`
      return `- [${page.data.title}](${DOCS_ORIGIN}${getAgentMarkdownPath(lang, page.url)})${description ? `: ${description}` : ''}${fallback}`
    }),
    '',
  ].join('\n')

  return {
    body,
    canonicalPath,
    contentLanguage: lang,
    contentType: 'text/plain; charset=utf-8',
    describedByPath: getRootIndexPath(lang),
    digest: getDigest(body),
  }
}

async function publish({ asset, lang: langInput }: IAgentDocsRequest) {
  if (!isAppLocale(langInput)) return undefined
  const lang = langInput
  const target = parseTarget(asset)
  if (!target) return undefined

  if (target.kind === 'index') {
    return target.collection ? renderCollectionIndex(lang, target.collection) : renderRootIndex(lang)
  }

  const page = getPage(target.collection, target.slug, lang)
  if (!page) return undefined
  return renderPage(lang, target.collection, page)
}

async function enumerate() {
  if (staticParamsPromise) return staticParamsPromise

  staticParamsPromise = (async () => {
    const params: IAgentDocsStaticParam[] = []
    const keys = new Set<string>()

    for (const lang of routing.locales) {
      const indexAssets = [['llms.txt'], ...agentDocsCollections.map((collection) => [collection, 'llms.txt'])]
      for (const asset of indexAssets) params.push({ asset, lang })

      for (const collection of agentDocsCollections) {
        for (const page of getPages(collection, lang)) {
          const asset = getPageAsset(collection, page)
          const key = `${lang}/${asset.join('/')}`
          if (keys.has(key)) throw new Error(`Agent Markdown found a duplicate artifact: ${key}`)
          keys.add(key)
          params.push({ asset, lang })
        }
      }
    }

    return params
  })()

  return staticParamsPromise
}

export const agentDocsPublication: IAgentDocsPublication = {
  enumerate,
  publish,
}
