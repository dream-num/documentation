/* eslint-disable no-await-in-loop -- Exercise the same capture gate with independent browser fixtures. */
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { captureShowcase } from './screenshot-showcase.mjs'

// Synthetic HTML tests the capture contract, not SDK styling or product behavior.
await fs.mkdir('test-results', { recursive: true })
const directory = await fs.mkdtemp(path.resolve('test-results/screenshot-contract-'))
const browser = await chromium.launch()
const checks = []
try {
  for (const args of [[], ['sheets/not-a-demo']]) {
    const run = spawnSync(process.execPath, ['scripts/screenshot-showcase.mjs', ...args], { encoding: 'utf8' })
    assert.equal(run.status, 1)
    assert.match(run.stderr, /Select at least one|Unknown Showcase/)
    assert.doesNotMatch(
      run.stdout,
      /Capturing from|Evidence:/,
      'Reject invalid selection before capturing or creating output',
    )
  }
  for (const [name, css, script, expected] of [
    ['white', '', '', true],
    ['fade', '@keyframes reveal { from { opacity: 0 } to { opacity: 1 } } .h-160 { animation: reveal 0.4s }', '', true],
    ['transparent', '[data-u-comp] { background: transparent }', '', false],
    ['ancestor-opacity', '.h-160 { opacity: 0.4 }', '', false],
    ['missing-css', '.univer-flex { display: block }', '', false],
    ['missing-theme', '[data-u-comp] { --univer-gray-0: initial }', '', false],
    ['console-error', '', 'console.error("fixture error")', false],
    ['runtime-error', '', 'throw new Error("fixture crash")', false],
    ['formula-only', '', 'document.querySelector("canvas").height = 27', false],
    [
      'delayed-canvas',
      '',
      'document.querySelector("canvas").height = 27; setTimeout(() => document.querySelector("canvas").height = 400, 300)',
      true,
    ],
    ['not-ready', '', 'document.querySelector("[data-ready]").dataset.ready = "false"', false],
    ['missing-editor', '', 'document.querySelector("[data-u-comp]").remove()', false],
    [
      'loading-overlay',
      '',
      'document.querySelector(".h-160").insertAdjacentHTML("beforeend", \'<header data-u-comp="workbench-skeleton-toolbar">Loading</header>\')',
      false,
    ],
    [
      'settled-overlay',
      '',
      'document.querySelector(".h-160").insertAdjacentHTML("beforeend", \'<header data-u-comp="workbench-skeleton-toolbar">Loading</header>\'); setTimeout(() => document.querySelector("header").remove(), 300)',
      true,
    ],
  ]) {
    const context = await browser.newContext({ colorScheme: 'light' })
    try {
      const page = await context.newPage()
      await page.route('http://capture.test/**', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: `<style>
          .h-160 { height: 640px }
          [data-u-comp] { height: 640px; background: white; --univer-gray-0: #FFFFFF }
          .univer-flex { display: flex } ${css}
          </style><div data-showcase-preview class="h-160"><div data-ready="true" data-u-comp="workbench-layout">
          <div class="univer-flex"><canvas width="600" height="400"></canvas></div></div></div>
          <script>${script}</script>`,
        }),
      )
      const result = await captureShowcase(page, {
        slug: `test/${name}`,
        origin: 'http://capture.test',
        directory,
        timeout: 3000,
      })
      assert.equal(result.passed, expected, `${name}: ${result.failure}`)
      const exists = await fs.stat(path.join(directory, `test-${name}.png`)).then(
        () => true,
        () => false,
      )
      assert.equal(exists, expected, 'A failed capture must not save a success-looking fallback image')
      if (expected) {
        assert.ok(result.styles.opacity.every((value) => value === '1'))
        assert.ok((await fs.readFile(path.join(directory, result.image))).subarray(1, 4).equals(Buffer.from('PNG')))
      }
      checks.push(result)
    } finally {
      await context.close()
    }
  }
} finally {
  await browser.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(checks, null, 2))
}
console.log(`PASS ${checks.length} screenshot contract cases; evidence: ${directory}`)
