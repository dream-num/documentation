/* eslint-disable no-await-in-loop -- Keep development-server compilation bounded during locale checks. */
import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'

const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'

test('Office SDK overview keeps direct SDK links and an agent-readable version', async () => {
  const response = await fetch(`${origin}/zh-CN/docs`)
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.match(html, /<h1[^>]*>Office SDK 总览<\/h1>/)
  assert.ok(!html.includes('nav-tree-office-sdks'), 'The sidebar should not repeat SDK shortcuts')
  for (const path of ['/guides/sheets', '/server', '/ai']) {
    assert.ok(html.includes(`href="/zh-CN${path}"`), `Missing SDK entry: ${path}`)
  }

  const markdown = await fetch(`${origin}/zh-CN/docs.md`)
  assert.equal(markdown.status, 200)
  assert.match(markdown.headers.get('content-type'), /text\/markdown/)
  assert.match(await markdown.text(), /Office SDK 总览/)
})

test('homepage start buttons lead to the Office SDK overview', async () => {
  const response = await fetch(`${origin}/zh-CN`)
  assert.equal(response.status, 200)
  const html = await response.text()
  const startLinks = [...html.matchAll(/<a\b[^>]*href="\/zh-CN\/docs\/overview"[^>]*>[\s\S]*?<\/a>/g)]
  assert.ok(startLinks.length >= 2, 'Hero and closing CTA should both open the overview')
  assert.ok(
    startLinks.some(([link]) => link.includes('开始使用')),
    'Hero needs the start label',
  )
})

test('overview remains available in the default locale and untranslated locales', async () => {
  for (const path of ['/docs', '/ja-JP/docs']) {
    const response = await fetch(`${origin}${path}`)
    assert.equal(response.status, 200, path)
    assert.match(await response.text(), /<h1[^>]*>Office SDK overview<\/h1>/)
  }
})

test('Office SDK category roots redirect to Overview while Get started is a separate page', async () => {
  for (const suffix of ['', '.md']) {
    const response = await fetch(`${origin}/zh-CN/docs${suffix}`, { redirect: 'manual' })
    assert.equal(response.status, 307)
    assert.equal(new URL(response.headers.get('location'), origin).pathname, `/zh-CN/docs/overview${suffix}`)
  }
  const locales = [
    ['', 'Get started'],
    ['/zh-CN', '快速开始'],
    ['/zh-TW', '快速開始'],
    ['/ja-JP', 'はじめに'],
    ['/ko-KR', '시작하기'],
    ['/fr-FR', 'Bien démarrer'],
    ['/ru-RU', 'Начало работы'],
    ['/es-ES', 'Primeros pasos'],
  ]
  for (const [prefix, title] of locales) {
    const response = await fetch(`${origin}${prefix}/docs/get-started`)
    assert.equal(response.status, 200, prefix)
    const html = await response.text()
    assert.ok(html.includes(`>${title}</h1>`), `${prefix}: localized title`)
    for (const target of [
      '/guides/sheets/getting-started/installation',
      '/server/collaboration/quick-start',
      '/ai/content-operations',
      '/llms.txt',
      '/docs/examples/cli',
      '/docs/examples/deepseek-harness',
      '/docs/examples/cli-sdk',
    ])
      assert.ok(html.includes(`href="${prefix}${target}"`), `${prefix}: ${target}`)
    assert.ok(!html.includes('href="/api/sdk-prompt"'), 'Pass a docs index link instead of copying full SDK docs')
    assert.ok(html.includes('univer-workspace'))
    assert.ok(!html.includes('localhost:3031') && !html.includes('127.0.0.1:3031'))

    const markdown = await fetch(`${origin}${prefix}/docs/get-started.md`)
    assert.equal(markdown.status, 200)
    const text = await markdown.text()
    assert.ok(text.includes(`https://docs.univer.ai${prefix}/llms.txt`), `${prefix}: prompt index`)
    assert.equal(
      text.match(/```text/g)?.length,
      6,
      `${prefix}: one template, three prompts, and two conversation requests`,
    )
    for (const command of [
      'create doc --name',
      'inspect --unit UNIT_ID',
      'execute --unit UNIT_ID --file edit.js',
      'open --unit UNIT_ID',
    ])
      assert.ok(text.includes(command), `${prefix}: missing you-cli command ${command}`)
    assert.match(text, /```mermaid/)
    assert.ok(!text.includes('https://docs.univer.ai/api/sdk-prompt'))
  }
})
