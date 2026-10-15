import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'

await test('interactive guides publish readable Agent Markdown in every locale', async () => {
  const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
  const guides = [
    ['sheets/features/core/freeze', 'Frozen panes stay visible'],
    ['sheets/features/core/default-style', 'Cell backgrounds override'],
    ['sheets/features/core/numfmt', 'Number formatting changes the display, not the stored number'],
    ['sheets/features/filter', 'Filtering hides records without deleting them'],
    ['sheets/features/sort', 'Filtering hides records without deleting them'],
    ['docs/features/images', 'Image wrapping:'],
    ['bases/features/core/views', 'Grid, kanban, and calendar views share the same table records'],
  ]
  await Promise.all(
    ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'es-ES', 'ru-RU'].map(async (locale) => {
      await Promise.all(
        guides.map(async ([path, explanation]) => {
          const url = `${origin}/api/agent-docs/${locale}/guides/${path}.md`
          const response = await fetch(url)
          assert.equal(response.status, 200, url)
          const markdown = await response.text()
          assert.ok(markdown.includes(explanation), `${url} must retain the illustration's meaning`)
          assert.doesNotMatch(
            markdown,
            /<(FreezeDemo|StylePriorityDemo|NumberFormatDemo|FilterSortDemo|ImageWrapDemo|ViewsDemo)\b/,
          )
        }),
      )
    }),
  )
})
