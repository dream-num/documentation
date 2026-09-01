import { defineConfig, z } from '@amamo/mdx'

const locales = {
  default: 'en-US',
  names: ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES'],
}
const documentSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
})

export default defineConfig({
  root: import.meta.dirname,
  collections: {
    guides: {
      directory: 'content/guides',
      locales,
      schema: documentSchema,
    },
    reference: {
      directory: 'content/reference',
      locales,
      schema: documentSchema,
    },
    icons: {
      directory: 'content/icons',
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
