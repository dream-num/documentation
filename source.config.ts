import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRemoveLineBreak,
  transformerRemoveNotationEscape,
} from '@shikijs/transformers'
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from 'fumadocs-mdx/config'
// import lastModified from 'fumadocs-mdx/plugins/last-modified'
import { z } from 'zod'

export default defineConfig({
  // plugins: [lastModified()],
  mdxOptions: {
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      addLanguageClass: true,
      transformers: [
        transformerMetaHighlight({
          className: 'line-highlighted',
        }),
        transformerMetaWordHighlight({
          className: 'word-highlighted',
        }),
        transformerNotationHighlight({
          classActiveLine: 'line-highlighted',
        }),
        transformerNotationDiff({
          classLineAdd: 'line-diff-add',
          classLineRemove: 'line-diff-remove',
        }),
        transformerNotationFocus({
          classActiveLine: 'line-focused',
        }),
        transformerNotationErrorLevel({
          classMap: {
            error: ['line-highlighted', 'line-error'],
            warning: ['line-highlighted', 'line-warning'],
            info: ['line-highlighted', 'line-info'],
          },
        }),
        transformerNotationWordHighlight({
          classActiveWord: 'word-highlighted',
          classActivePre: 'has-word-highlighted',
        }),
        transformerRemoveLineBreak(),
        transformerRemoveNotationEscape(),
      ],
    },
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

export const icons = defineDocs({
  dir: './content/icons',
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
