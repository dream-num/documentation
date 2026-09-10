import {
  createMcpHandler,
  hostHeaderValidationResponse,
  McpServer,
  originValidationResponse,
} from '@modelcontextprotocol/server'
import { z } from 'zod'

import { searchIcons } from '@/lib/icons/catalog'
import catalog from '@/public/assets/icons/catalog.json'

export const runtime = 'nodejs'

const allowedHosts = ['docs.univer.ai', 'localhost', '127.0.0.1', '[::1]']
const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }

const handler = createMcpHandler(() => {
  const server = new McpServer(
    { name: 'univer-icons', version: catalog.version },
    {
      instructions:
        'Choose existing Univer Icons by purpose. Translate the user’s intent into short English search terms, then call search_icons. All query terms must match; shorten the query if there are no results. Call get_icon for the chosen component before generating React or Vue code. Never invent an export. This server searches metadata; it does not call a language model.',
    },
  )

  server.registerTool(
    'search_icons',
    {
      description:
        'Find Univer Icons by English purpose, alias, component name or product. Use short queries such as "duplicate" or "boards connector", not full sentences. Returns catalog order, not relevance scores. Narrow with color style or source subgroup; call get_icon for usage.',
      inputSchema: z.object({
        query: z.string().trim().min(1).max(200),
        group: z.enum(['all', 'single', 'double', 'multi']).default('all'),
        subgroup: z
          .enum([
            'all',
            'general',
            'diagram',
            'stroke-size',
            'brand',
            'chart',
            'currency',
            'function',
            'formula',
            'shape',
            'double',
            'multi',
          ])
          .default('all'),
        limit: z.number().int().min(1).max(50).default(12),
      }),
      annotations: readOnly,
    },
    ({ query, group, subgroup, limit }) => {
      const matches = searchIcons(query, group, subgroup)
      const result = {
        version: catalog.version,
        total: matches.length,
        truncated: matches.length > limit,
        icons: matches.slice(0, limit).map((icon) => ({
          componentName: icon.componentName,
          description: icon.description,
          group: icon.group,
          subgroup: icon.subgroup,
          products: icon.products,
        })),
      }
      return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result }
    },
  )

  server.registerTool(
    'get_icon',
    {
      description:
        'Read exact icon metadata, a named import, framework-specific usage and color/stroke guidance. Pass a componentName returned by search_icons.',
      inputSchema: z.object({
        componentName: z.string().trim().min(1).max(100),
        framework: z.enum(['react', 'vue']).default('react'),
      }),
      annotations: readOnly,
    },
    ({ componentName, framework }) => {
      const icon = catalog.icons.find((item) => item.componentName === componentName)
      if (!icon) {
        return {
          isError: true,
          content: [
            { type: 'text', text: `Unknown icon: ${componentName}. Use search_icons to find an existing component.` },
          ],
        }
      }
      const packageName = framework === 'react' ? '@univerjs/icons' : '@univerjs/icons-vue'
      const importStatement = `import { ${icon.componentName} } from '${packageName}'`
      const result = {
        version: catalog.version,
        source: catalog.source,
        icon,
        packageName,
        importStatement,
        example:
          framework === 'react'
            ? `${importStatement}\n\n<${icon.componentName} aria-hidden="true" style={{ fontSize: 20 }} />`
            : `<script setup>\n${importStatement}\n</script>\n\n<template>\n  <${icon.componentName} aria-hidden="true" :style="{ fontSize: '20px' }" />\n</template>`,
        colors:
          icon.group === 'multi'
            ? 'Multicolor artwork includes fixed fills; color and extend.colorChannel1 do not recolor every part.'
            : icon.group === 'double'
              ? 'Use CSS color for the primary channel and extend.colorChannel1 for the accent channel.'
              : 'Use CSS color for the single color channel.',
        strokes: `preserveStrokeWidth support: ${icon.preserveStrokeWidthSupport}. The SVG baseline is 16 × 16; keep strokes fixed only when the chosen icon supports it.`,
        accessibility:
          'This example is decorative. Put the accessible name on the containing button, or give a standalone meaningful icon an aria-label and role="img".',
        documentation: `https://docs.univer.ai/guides/icons/${framework}`,
        preview: 'https://docs.univer.ai/guides/icons/all-icons',
      }
      return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result }
    },
  )

  return server
})

export async function POST(request: Request) {
  const rejected =
    hostHeaderValidationResponse(request, allowedHosts) ?? originValidationResponse(request, allowedHosts)
  return rejected ?? handler.fetch(request)
}
