import { remarkInstall } from 'fumadocs-docgen'
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'
import { z } from 'zod'

export default defineConfig({
  mdxOptions: {
    // MDX options
    remarkPlugins: [remarkInstall],
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
    schema: frontmatterSchema.extend({
      author: z.string(),
      date: z.string().date().or(z.date()),
    }),
  },
  meta: {
    schema: metaSchema,
  },
})
