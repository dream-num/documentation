import { defineConfig, z } from '@amamo/mdx'

const locales = {
  default: 'en-US',
  names: ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES'],
}
const documentSchema = z.object({
  title: z.string(),
  source: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
})

export default defineConfig({
  root: import.meta.dirname,
  manifests: {
    guidesNavigation: {
      collections: ['guides', 'server', 'ai'],
      output: '.amamo-mdx/guides-navigation.json',
      fields: { collection: 'collection', key: 'key', frontmatter: 'frontmatter' },
      sort: [{ field: 'key', direction: 'asc' }],
    },
  },
  collections: {
    guides: {
      directory: 'content/guides',
      locales,
      schema: documentSchema,
    },
    server: { directory: 'content/server', locales, schema: documentSchema },
    ai: { directory: 'content/ai', locales, schema: documentSchema },
    reference: {
      directory: 'content/reference',
      locales,
      schema: documentSchema,
    },
    blog: {
      directory: 'content/blog',
      locales,
      schema: documentSchema.extend({
        author: z.string(),
        date: z.iso.date(),
        deprecated: z.boolean().optional(),
      }),
    },
  },
  highlight: {
    provider: 'shiki',
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
    unknownLanguage: 'plain',
  },
  mdx: {
    extensions: {
      headingIds: true,
    },
    namespaceFootnotes: false,
  },
})
