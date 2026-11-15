import {
  createMcpHandler,
  hostHeaderValidationResponse,
  McpServer,
  originValidationResponse,
} from '@modelcontextprotocol/server'
import { z } from 'zod'
import { routing } from '@/i18n/routing'
import { agentDocsCollections } from '@/lib/agent-docs/links'
import { agentDocsPublication } from '@/lib/agent-docs/publication'
import { searchDocumentation } from '@/lib/guides/search-server'
import { stripLocalePrefix, withLocale } from '@/lib/locale-path'
import {
  generateProject,
  getFeatureAvailability,
  getFeatures,
  getProjectRequirements,
  PRODUCTS,
  SDK_LOCALES,
  SDK_VERSION,
} from '@/lib/tools/initialization-generator'
import packageJson from '@/package.json'

export const runtime = 'nodejs'

const origin = 'https://docs.univer.ai'
const allowedHosts = ['docs.univer.ai', 'localhost', '127.0.0.1', '[::1]']
const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }

const handler = createMcpHandler(() => {
  const server = new McpServer(
    { name: 'univer-docs', version: packageJson.version },
    {
      instructions:
        'Help developers integrate Univer SDK using current official guides, API references and initialization templates. First inspect the target project and its installed SDK versions. Search for the task, then read the relevant guides and API pages with get_doc; follow nextLine until you have the complete relevant content. A search snippet or a Facade method alone does not establish plugin availability. Use list_features before generate_setup for browser initialization. Generated files target their returned SDK version and are templates, not executed or tested changes to the user’s project. Preserve existing versions and integration mode unless asked to change them. For Node, framework lifecycle, collaboration and file conversion, read the corresponding guides. Verify the resulting application in the user’s environment. This server reads published content and generates files in memory; it does not execute user code or call a language model.',
    },
  )

  server.registerTool(
    'search_docs',
    {
      description:
        'Search official Univer guides, examples and API references. Use short topic queries or an exact API name such as FUniver.createWorkbook. Set scope to reference for API signatures, guides for integration, server for backend services, or ai for agent tooling. Read matching pages with get_doc before implementing.',
      inputSchema: z.object({
        query: z.string().trim().min(1).max(200),
        scope: z.enum(['all', ...agentDocsCollections]).default('all'),
        locale: z.enum(routing.locales).default('en-US'),
        limit: z.number().int().min(1).max(30).default(10),
      }),
      annotations: readOnly,
    },
    async ({ query, scope, locale, limit }) => {
      try {
        const matches = await searchDocumentation(query, locale, scope === 'all' ? [...agentDocsCollections] : [scope])
        const result = {
          version: packageJson.version,
          locale,
          results: matches.slice(0, limit).map((match) => ({
            title: match.title,
            path: stripLocalePrefix(match.url),
            url: `${origin}${withLocale(locale, stripLocalePrefix(match.url))}`,
            excerpt: match.content,
            scope: match.source,
          })),
        }
        return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result }
      } catch (error) {
        console.error('MCP documentation search failed', error)
        return { isError: true, content: [{ type: 'text', text: 'Documentation search is unavailable. Retry later.' }] }
      }
    },
  )

  server.registerTool(
    'get_doc',
    {
      description:
        'Read a published Univer page as Markdown, including code examples and source/version metadata. Pass a page path returned by search_docs, for example /guides/sheets/getting-started/installation. Anchors and .md suffixes are accepted; locale is selected separately. Continue from nextLine to read long pages. Only published documentation is readable; arbitrary URLs and local files are not accepted.',
      inputSchema: z.object({
        path: z.string().trim().startsWith('/').max(1000),
        locale: z.enum(routing.locales).default('en-US'),
        startLine: z.number().int().min(1).default(1),
        lineCount: z.number().int().min(1).max(400).default(200),
      }),
      annotations: readOnly,
    },
    async ({ path, locale, startLine, lineCount }) => {
      const pathname = stripLocalePrefix(path.split('#')[0]).replace(/\/$/, '').replace(/\.md$/, '')
      try {
        const artifact = await agentDocsPublication.publish({
          lang: locale,
          asset: `${pathname.slice(1)}.md`.split('/'),
        })
        if (!artifact) {
          return {
            isError: true,
            content: [{ type: 'text', text: 'Page not found. Use a published path from search_docs.' }],
          }
        }
        const lines = artifact.body.trimEnd().split('\n')
        if (startLine > lines.length) {
          return {
            isError: true,
            content: [{ type: 'text', text: `startLine exceeds the page length (${lines.length} lines).` }],
          }
        }
        const end = Math.min(startLine - 1 + lineCount, lines.length)
        const result = {
          version: packageJson.version,
          locale: artifact.contentLanguage,
          url: `${origin}${artifact.humanPath}`,
          markdownUrl: `${origin}${artifact.canonicalPath}`,
          startLine,
          totalLines: lines.length,
          nextLine: end < lines.length ? end + 1 : null,
          markdown: lines.slice(startLine - 1, end).join('\n'),
        }
        return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result }
      } catch (error) {
        console.error('MCP documentation read failed', error)
        return {
          isError: true,
          content: [{ type: 'text', text: 'This documentation page is unavailable. Retry later.' }],
        }
      }
    },
  )

  server.registerTool(
    'list_features',
    {
      description:
        'List feature IDs accepted by generate_setup for a Univer browser editor, with availability and license requirements from the initialization generator catalog. Use returned IDs rather than guessing package or plugin names. This catalog does not describe Node runtime support.',
      inputSchema: z.object({
        product: z.enum(PRODUCTS),
        mobile: z.boolean().default(false),
      }),
      annotations: readOnly,
    },
    ({ product, mobile }) => {
      const options = { product, mobile, mode: 'plugin' as const, locale: 'en-US' as const, features: [], umd: false }
      const result = {
        version: SDK_VERSION,
        product,
        mobile,
        features: getFeatures(product).map((feature) =>
          Object.assign(feature, {
            unavailableReason: mobile && product !== 'sheets' ? 'mobile' : getFeatureAvailability(feature, options),
          }),
        ),
      }
      return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result }
    },
  )

  server.registerTool(
    'generate_setup',
    {
      description:
        'Generate the same browser starter files as the Univer initialization generator: exact dependencies, plugin/preset registration, Facade imports, CSS, locales and required configuration. Returns file contents without writing or executing them. Use list_features for IDs. Read framework guides to adapt mounting and disposal; use Node guides for headless work. Presets support Sheets/Docs; mobile generation supports Sheets plugin mode.',
      inputSchema: z.object({
        product: z.enum(PRODUCTS),
        mode: z.enum(['plugin', 'preset']).default('plugin'),
        locale: z.enum(SDK_LOCALES).default('en-US'),
        mobile: z.boolean().default(false),
        features: z.array(z.string().trim().min(1).max(100)).max(50).default([]),
      }),
      annotations: readOnly,
    },
    (input) => {
      try {
        const options = { ...input, umd: false }
        const files = generateProject(options)
        const result = { version: SDK_VERSION, requirements: getProjectRequirements(options), files }
        return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result }
      } catch (error) {
        return {
          isError: true,
          content: [{ type: 'text', text: error instanceof Error ? error.message : 'Unable to generate this setup.' }],
        }
      }
    },
  )

  return server
})

export async function POST(request: Request) {
  const rejected =
    hostHeaderValidationResponse(request, allowedHosts) ?? originValidationResponse(request, allowedHosts)
  return rejected ?? handler.fetch(request)
}
