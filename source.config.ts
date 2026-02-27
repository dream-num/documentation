import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'
// import lastModified from 'fumadocs-mdx/plugins/last-modified'
import { z } from 'zod'

export default defineConfig({
  // plugins: [lastModified()],
  mdxOptions: {
  },
})

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.vercel.app/docs/mdx/collections#define-docs
export const guides = defineDocs({
  dir: './content/guides',
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
})

export const reference = defineDocs({
  dir: './content/reference',
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
})

export const blog = defineDocs({
  dir: './content/blog',
  docs: {
    files: [
      '**/*.mdx',
      '!weekly-*.mdx',
    ],
    schema: frontmatterSchema.extend({
      author: z.string(),
      date: z.iso.date().or(z.date()),
      deprecated: z.boolean().optional(),
    }),
  },
  meta: {
    schema: metaSchema,
  },
})
