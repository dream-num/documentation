/* eslint-disable no-await-in-loop -- Request only the selected demos, sequentially, to limit compilation and memory. */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import process from 'node:process'

import { chromium } from 'playwright'

const baseURL = process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'
const cases = [
  'docs-modern/company-knowledge-base',
  'slides/product-launch',
  'slides/technical-architecture-overview',
  'bases/content-pipeline',
]
const selected = process.argv.slice(2)
for (const slug of selected) assert.ok(cases.includes(slug), `Unknown regression case: ${slug}`)
const browser = await chromium.launch({ executablePath: chromium.executablePath() })
try {
  for (const slug of selected.length ? selected : cases) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(process.env.SHOWCASE_DEMO_URL || `${baseURL}/en-US/playground/${slug}`, {
      waitUntil: 'domcontentloaded',
      timeout: 300000,
    })
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 60000 })
    const click = (name) => page.getByRole('button', { name, exact: true }).click()
    if (slug === 'bases/content-pipeline') {
      const canvas = page.locator('[data-u-comp="base-canvas-root"] [data-u-comp="render-canvas"]')
      assert.equal(await canvas.count(), 1, 'Discarded React mounts must not leave an overlay canvas')
      await page.locator('.content-pipeline[data-ready=true]').waitFor()
      assert.equal(
        await page.evaluate(
          () => window.univerAPI.getBase('content-pipeline-base').getTableById('content').getRecords().length,
        ),
        12,
      )
      await page.evaluate(() => {
        const table = window.univerAPI.getBase('content-pipeline-base').getTableById('content')
        const [record] = table.addRecords([
          {
            values: {
              asset: 'Analyst briefing deck',
              status: 'Planned',
              owner: 'Maya Chen',
              channel: 'Slides',
              progress: 20,
              publishDate: 1789516800000,
            },
          },
        ])
        if (!record) throw new Error('Briefing insert failed')
      })
      for (const view of ['board', 'grid'])
        await page.evaluate((id) => window.univerAPI.getBaseUI().activateView(id), view)
      assert.equal(
        await page.evaluate(
          () => window.univerAPI.getBase('content-pipeline-base').getTableById('content').getRecords().length,
        ),
        13,
      )
      assert.equal(await canvas.count(), 1)
      assert.equal(await page.getByRole('button', { name: 'Reset', exact: true }).count(), 0)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await canvas.first().waitFor({ state: 'visible' })
      assert.equal(await canvas.count(), 1)
    } else if (slug.endsWith('company-knowledge-base')) {
      await page.locator('.knowledge-demo[data-ready=true]').waitFor()
      const documentText = () => page.evaluate(() => window.univerAPI.getActiveDocument().save().body.dataStream)
      await page.evaluate(() => {
        const doc = window.univerAPI.getActiveDocument()
        const paragraph = doc.getParagraphs().find((item) => item.getText().startsWith('Last reviewed:'))
        if (!paragraph) throw new Error('Missing review paragraph')
        paragraph.setText('Last reviewed: 2027-01-15 · Fresh')
      })
      await click('API Standards')
      assert.match(await documentText(), /Last reviewed: 2027-01-12/)
      await click('Engineering Handbook')
      assert.match(
        await documentText(),
        /Last reviewed: 2027-01-15 · Fresh/,
        'Switching pages must preserve the reviewed snapshot',
      )
      await click('Legacy Deployment Guide')
      assert.match(await documentText(), /Last reviewed: 2026-06-30/)
      assert.equal(await page.getByRole('button', { name: 'Mark reviewed', exact: true }).count(), 0)
      assert.equal(await page.getByRole('button', { name: 'Reset space', exact: true }).count(), 0)
    } else if (slug.endsWith('product-launch')) {
      const launch = page.locator('.product-launch')
      await page.locator('.product-launch[data-ready=true]').waitFor()
      const recipes = [
        ...fs.readFileSync('showcase/slides/product-launch/README.md', 'utf8').matchAll(/```ts\r?\n([\s\S]*?)```/g),
      ].map((match) => match[1])
      assert.equal(recipes.length, 22)
      // This small regression checks current-model navigation, not full native acceptance.
      // The dedicated test retains strict Undo failures and verifies actual canvas paint.
      for (const index of [0, 4, 1]) await page.evaluate((source) => new Function(source)(), recipes[index])
      const rollout = () =>
        page.evaluate(() => {
          const saved = window.univerAPI.getActivePresentation().save()
          return {
            count: saved.slideOrder.length,
            active: saved.activeSlideId,
            label: saved.slides.rollout.elements['ga-date'].shapeData.shapeText.text,
            marker: saved.slides.rollout.elements['ga-marker'].transform.left,
          }
        })
      assert.deepEqual(await rollout(), {
        count: 11,
        active: 'rollout',
        label: 'MAR 10\nGeneral availability',
        marker: 842,
      })
      const repeated = await page.evaluate(() => {
        try {
          window.atlasDelayGA()
          return 'unexpected success'
        } catch (error) {
          return error.message
        }
      })
      assert.equal(repeated, 'GA date already moved')
      assert.equal((await rollout()).label, 'MAR 10\nGeneral availability')
      assert.equal(await launch.locator('.launch-tools, fieldset, details, pre').count(), 0)
      assert.equal(await page.getByRole('button', { name: 'Reset deck', exact: true }).count(), 0)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.locator('.product-launch[data-ready=true]').waitFor()
      assert.equal((await rollout()).label, 'MAR 03\nGeneral availability')
    } else {
      await page.waitForFunction(() => window.univerAPI?.getPresentation('technical-architecture') != null)
      const result = await page.evaluate(() => {
        const deck = window.univerAPI.getPresentation('technical-architecture')
        const slide = deck.getSlideById('component-map')
        slide.getElementById('data-layer').setAbsolutePosition(735, 405)
        slide.getElementById('data-flow').setTransform({ left: 735, top: 350 })
        slide.getElementById('validation').getText().setText('Layout: Local Data Layer and label moved')
        return deck.save()
      })
      assert.equal(result.slideOrder.length, 3)
      assert.ok(
        JSON.stringify(result.slides['component-map'].elements['validation']).includes(
          'Local Data Layer and label moved',
        ),
      )
      assert.equal(await page.getByRole('button', { name: 'Move local data layer', exact: true }).count(), 0)
      assert.equal(await page.getByRole('button', { name: 'Reset diagram', exact: true }).count(), 0)
    }
    assert.deepEqual(errors, [], `${slug}: browser errors`)
    console.log(`PASS ${slug}`)
    await page.close()
  }
} finally {
  await browser.close()
}
