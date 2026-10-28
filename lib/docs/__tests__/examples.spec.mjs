/* eslint-disable no-await-in-loop -- Keep locale fixtures ordered and avoid loading every MDX source at once. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const locales = ['', '.zh-CN', '.zh-TW', '.ja-JP', '.ko-KR', '.es-ES', '.fr-FR', '.ru-RU']
const projects = ['workspace', 'workspace-desktop', 'cli', 'deepseek-harness', 'workbuddy', 'openclaw']

test('all locales expose six standalone examples with separate Workspace and Desktop guides', async () => {
  for (const suffix of locales) {
    const meta = JSON.parse(
      await readFile(new URL(`../../../content/docs/examples/meta${suffix}.json`, import.meta.url), 'utf8'),
    )
    assert.deepEqual(
      meta.pages.filter((page) => projects.includes(page)),
      projects,
    )
    for (const project of projects) {
      const source = await readFile(
        new URL(`../../../content/docs/examples/${project}${suffix}.mdx`, import.meta.url),
        'utf8',
      )
      assert.ok(source.includes('[Univer Office SDK](/docs/overview)'), `${project}${suffix}`)
      assert.ok(source.includes('[#quick-start]') || source.includes('id="quick-start"'), `${project}${suffix}`)
      assert.ok(source.includes('[#skills]'), `${project}${suffix}`)
    }
    const workspace = await readFile(
      new URL(`../../../content/docs/examples/workspace${suffix}.mdx`, import.meta.url),
      'utf8',
    )
    for (const anchor of ['entry-points', 'cli-start', 'web-apps'])
      assert.ok(workspace.includes(`[#${anchor}]`), `${suffix}: ${anchor}`)
    assert.ok(workspace.includes('id="desktop-start"'), `${suffix}: preserve existing Desktop links`)
    assert.ok(workspace.includes('](/docs/examples/workspace-desktop)'), suffix)
    assert.ok(!workspace.includes('## Workspace Desktop'), `${suffix}: keep the detailed guide separate`)
    assert.ok(workspace.includes('uvw skills get html-view'), suffix)
    const details = workspace.match(/<details>[\s\S]*?<\/details>/)?.[0]
    assert.ok(details?.includes('uvw auth login --complete'), suffix)
    assert.ok(!details.includes('<details open'), suffix)

    const desktop = await readFile(
      new URL(`../../../content/docs/examples/workspace-desktop${suffix}.mdx`, import.meta.url),
      'utf8',
    )
    for (const anchor of [
      'why-desktop',
      'workflow',
      'quick-start',
      'skills',
      'first-task',
      'web-apps',
      'build-your-own',
    ])
      assert.ok(desktop.includes(`[#${anchor}]`), `${suffix}: Desktop ${anchor}`)
    for (const target of ['#connect-to-a-local-workspace', '#model-credentials', 'apps/agent/desktop/README.md'])
      assert.ok(desktop.includes(target), `${suffix}: Desktop ${target}`)
    assert.ok(desktop.includes('Codex') && desktop.includes('Claude Code'), suffix)
    assert.ok(desktop.includes('<Mermaid chart='), suffix)
    const index = await readFile(new URL(`../../../content/docs/examples/index${suffix}.mdx`, import.meta.url), 'utf8')
    assert.ok(index.includes('## Workspace Desktop'), suffix)
    assert.ok(index.includes('](/docs/examples/workspace-desktop)'), suffix)
  }
})
