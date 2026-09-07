/* eslint-disable no-await-in-loop -- Exercise one viewer's ordered lifecycle without compiling other demos. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import {
  EVIDENCE_SVG,
  PAGE_TITLES,
  PENDING_SIGNOFF,
  REVIEWED_SIGNOFF,
} from '../showcase/pdfs/create-load-viewer/code/data.ts'

const url = process.env.SHOWCASE_DEMO_URL || 'http://localhost:3030/en-US/playground/pdfs/create-load-viewer'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-lifecycle')
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 }, colorScheme: 'light' })
const errors = [],
  results = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  const root = page.locator('.pdf-lifecycle')
  const idle = () =>
    root.locator('.lifecycle-controls > fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
  const read = async () => JSON.parse(await root.locator('output').textContent())
  const click = async (name, expectedError) => {
    await root.getByRole('button', { name, exact: true }).click()
    await idle()
    if (expectedError) assert.match(await root.locator(':scope > [role=alert]').textContent(), expectedError)
    else assert.equal(await root.locator(':scope > [role=alert]').isVisible(), false)
    return read()
  }
  const canvas = (id) => root.locator(`[data-pdf-active-page-id="${id}"] > canvas`).first()
  const settle = () =>
    page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const showPage = async (index) => {
    const target = (await read()).pages[index].id
    const input = root.locator('[data-pdf-footer] input[aria-label="Page"]')
    await input.fill(String(index + 1))
    await input.press('Enter')
    await page.waitForFunction(
      (id) => JSON.parse(document.querySelector('.pdf-lifecycle output').textContent).activePageId === id,
      target,
    )
    await root.locator(`[data-pdf-active-page-id="${target}"]`).waitFor()
    return read()
  }
  await idle()
  await root.locator('.lifecycle-controls > summary').click()
  let state = await read()
  assert.equal(state.pageCount, 4)
  assert.equal(state.mounts, 1)
  assert.equal(decision(state), PENDING_SIGNOFF)
  assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=redo]').isDisabled(), true)
  assert.equal(
    await root.locator('[data-action=inspect]').count(),
    0,
    'Readback updates without a duplicate refresh button',
  )
  assert.deepEqual(
    state.pages.map((item, index) => item.text.find((entry) => entry.id === `title-${index}`).text),
    PAGE_TITLES,
  )
  assert.equal(state.pages[1].tables, 1)
  assert.equal(state.pages[2].images, 1)
  const baseline = structuredClone(state.snapshot)
  assert.ok(
    JSON.stringify(baseline).includes(Buffer.from(EVIDENCE_SVG).toString('base64')),
    'Snapshot embeds original image bytes',
  )
  const styles = await root.evaluate((host) => {
    const editor = host.querySelector('.pdf-viewer')
    const rules = []
    const visit = (list) => {
      for (const rule of list) {
        if (rule.selectorText?.includes('.pdf-lifecycle')) rules.push(rule.selectorText)
        if (rule.cssRules) visit(rule.cssRules)
      }
    }
    for (const sheet of document.styleSheets) visit(sheet.cssRules)
    const collisions = [...editor.querySelectorAll('button,input,select,textarea,[role=status]')].flatMap((control) =>
      rules.filter((selector) => control.matches(selector)),
    )
    const button = [...editor.querySelectorAll('button')].find((item) => item.textContent.trim() === 'New')
    return {
      collisions,
      background: getComputedStyle(button).backgroundColor,
      radius: getComputedStyle(button).borderRadius,
    }
  })
  assert.deepEqual(styles.collisions, [])
  assert.equal(styles.background, 'rgb(44, 83, 241)')
  assert.equal(styles.radius, '8px')
  results.push({ nativeStyles: styles })
  for (let index = 0; index < 4; index++) {
    state = await showPage(index)
    assert.equal(state.activePageId, state.pages[index].id)
    const native = canvas(state.activePageId)
    await native.waitFor()
    const dimensions = await native.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
      bufferWidth: element.width,
      bufferHeight: element.height,
    }))
    assert.ok(dimensions.width > 100 && dimensions.height > 100)
    assert.ok(dimensions.bufferWidth > 100 && dimensions.bufferHeight > 100)
    await assertRightMargin(native)
    await native.screenshot({ path: path.join(directory, `page-${index + 1}.png`) })
    results.push({ page: index + 1, dimensions })
  }
  const imagePixel = async () => {
    await showPage(2)
    await page.waitForFunction(
      () => {
        const host = document.querySelector('.pdf-lifecycle')
        const nativeCanvas = host.querySelector('[data-pdf-active-page-id] > canvas')
        if (!nativeCanvas) return false
        // A point well inside the schematic's green inspection bin.
        const pixel = nativeCanvas
          .getContext('2d')
          .getImageData(
            Math.round((nativeCanvas.width * 120) / 595.276),
            Math.round((nativeCanvas.height * 282) / 841.89),
            1,
            1,
          ).data
        return (
          Math.abs(pixel[0] - 209) < 5 &&
          Math.abs(pixel[1] - 250) < 5 &&
          Math.abs(pixel[2] - 229) < 5 &&
          pixel[3] === 255
        )
      },
      null,
      { timeout: 20000 },
    )
  }
  await imagePixel()
  state = await click('Set review decision')
  assert.equal(decision(state), REVIEWED_SIGNOFF)
  assert.equal(await root.locator('[data-action=review]').isDisabled(), true)
  state = await click('Undo')
  assert.equal(decision(state), PENDING_SIGNOFF)
  assert.equal(await root.locator('[data-action=review]').isDisabled(), false)
  state = await click('Redo')
  assert.equal(decision(state), REVIEWED_SIGNOFF)
  assert.equal(await root.locator('[data-action=review]').isDisabled(), true)
  await assertRightMargin(canvas(state.activePageId))
  await canvas(state.activePageId).screenshot({ path: path.join(directory, 'reviewed.png') })
  const native = canvas(state.activePageId)
  await root.locator('.lifecycle-controls > summary').click()
  await settle()
  const bounds = await native.boundingBox()
  await page.mouse.dblclick(bounds.x + (bounds.width * 85) / 595.276, bounds.y + (bounds.height * 365) / 841.89)
  await page.waitForFunction(() => document.activeElement?.matches('[data-pdf-text-input]'))
  const typedDecision = 'Decision: hold for label verification'
  await page.keyboard.press('Control+A')
  await page.keyboard.insertText(typedDecision)
  await root.locator('.lifecycle-controls > summary').click()
  await page.waitForFunction(
    (text) =>
      JSON.parse(document.querySelector('.pdf-lifecycle output').textContent).pages[3].text.find(
        (item) => item.id === 'signoff',
      ).text === text,
    typedDecision,
  )
  assert.equal(await root.locator('[data-action=review]').isDisabled(), false)
  state = await click('Undo')
  assert.equal(decision(state), REVIEWED_SIGNOFF)
  assert.equal(await root.locator('[data-action=review]').isDisabled(), true)
  state = await click('Redo')
  assert.equal(decision(state), typedDecision)
  results.push({ decisionHistory: true, nativeTyping: true, duplicateDecisionDisabled: true })
  const edited = structuredClone(state.snapshot)
  state = await click('Reject invalid snapshot', /has no document/)
  assert.deepEqual(state.snapshot, edited)
  assert.equal(state.mounts, 1)
  assert.equal(state.disposals, 0)
  assert.equal(await root.locator('[data-action=undo]').isDisabled(), false)
  assert.equal(await root.locator('[data-action=redo]').isDisabled(), true)
  const download = page.waitForEvent('download')
  await click('Download snapshot')
  const downloaded = await download
  const snapshotPath = path.join(directory, 'kestrel-audit-snapshot.json')
  await downloaded.saveAs(snapshotPath)
  assert.deepEqual(JSON.parse(await fs.readFile(snapshotPath, 'utf8')), edited)
  for (let cycle = 1; cycle <= 3; cycle++) {
    state = await click('Dispose viewer')
    assert.equal(state.mounted, false)
    assert.equal(state.disposals, cycle)
    assert.equal(state.disposedRuntimeAttached, false, 'Disposed Univer must release the PDF runtime record')
    assert.equal(await root.locator('.pdf-viewer canvas').count(), 0)
    assert.equal(await root.locator('.pdf-viewer [data-u-comp="workbench-layout"]').count(), 0)
    assert.deepEqual(state.snapshot, edited)
    assert.equal(await root.getByRole('button', { name: 'Dispose viewer', exact: true }).isDisabled(), true)
    for (const action of ['review', 'undo', 'redo', 'download'])
      assert.equal(await root.locator(`[data-action=${action}]`).isDisabled(), true)
    state = await click('Remount saved snapshot')
    assert.equal(state.mounts, cycle + 1)
    assert.equal(state.pageCount, 4)
    assert.equal(decision(state), typedDecision)
    assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
    assert.equal(await root.locator('[data-action=redo]').isDisabled(), true)
    assert.deepEqual(state.snapshot, edited, 'Remount preserves the complete SDK snapshot')
    await imagePixel()
    assert.equal(await root.locator('.pdf-viewer [data-u-comp="workbench-layout"]').count(), 1)
  }
  results.push({ remountCycles: 3, invalidLoadPreserved: true, imagePixels: true, snapshotDownload: true })
  state = await click('Load audit packet / Reset')
  assert.deepEqual(state.snapshot, baseline)
  state = await click('New blank PDF')
  assert.equal(state.pageCount, 1)
  assert.deepEqual(state.pages[0].text, [])
  const blank = structuredClone(state.snapshot)
  assert.equal(await root.locator('[data-action=review]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=undo]').isDisabled(), true)
  assert.equal(await root.locator('[data-action=redo]').isDisabled(), true)
  state = await click('New blank PDF')
  assert.deepEqual(state.snapshot, blank, 'Repeated blank creation preserves every cached snapshot field')
  state = await click('Dispose viewer')
  state = await click('Remount saved snapshot')
  assert.deepEqual(state.snapshot, blank)
  await click('Load audit packet / Reset')
  const enabled = root.locator('.lifecycle-controls > fieldset button:enabled')
  await enabled.first().focus()
  for (let index = 0; index < (await enabled.count()); index++) {
    assert.ok(await enabled.nth(index).evaluate((element) => element === document.activeElement))
    await page.keyboard.press('Tab')
  }
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await showPage(2)
    const layout = await root.evaluate((element) => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }))
    assert.ok(layout.scrollWidth <= layout.width + 2)
    await root.screenshot({ path: path.join(directory, `width-${width}.png`) })
    results.push({ width, layout })
  }
  await page.setViewportSize({ width: 1500, height: 1100 })
  await click('Load audit packet / Reset')
  await root.locator('.lifecycle-controls > summary').click()
  await settle()
  await root.screenshot({ path: path.join(directory, 'viewer.png') })
  const footer = await root.locator('[data-pdf-footer]').boundingBox()
  const hostBounds = await root.boundingBox()
  assert.ok(
    footer.y + footer.height <= hostBounds.y + hostBounds.height + 1,
    'Collapsed host controls must leave the native footer inside the preview',
  )
  if (new URL(url).pathname.includes('/playground/')) {
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator(`.pdf-lifecycle[data-theme=${theme}][data-ready=true]`).waitFor({ timeout: 120000 })
      await idle()
      state = await read()
      assert.equal(state.pageCount, 4)
      assert.equal(decision(state), PENDING_SIGNOFF)
      await root.screenshot({ path: path.join(directory, `theme-${theme}.png`) })
    }
    for (const [locale, title, variants, actions, states] of [
      ['en-US', 'Create and Load a PDF Viewer', 'Variants', 'Actions', 'States'],
      ['zh-CN', '创建与加载 PDF 查看器', '变体', '操作', '状态'],
    ]) {
      const response = await page.goto(`${new URL(url).origin}/${locale}/showcase/pdfs/create-load-viewer`, {
        waitUntil: 'domcontentloaded',
        timeout: 120000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { name: title, exact: true, level: 1 }).waitFor()
      for (const name of [variants, actions, states])
        assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      assert.equal(await page.locator('aside').getByRole('link', { name: title, exact: true }).count(), 1)
      const iframe = page.locator('iframe').first()
      await iframe.scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first().locator('.pdf-lifecycle')
      await embedded
        .locator('.lifecycle-controls > fieldset:not([disabled])')
        .waitFor({ state: 'attached', timeout: 120000 })
      await embedded.locator('.lifecycle-controls > summary').click()
      await embedded.getByRole('button', { name: 'Set review decision', exact: true }).click()
      await embedded.locator('.lifecycle-controls > fieldset:not([disabled])').waitFor({ state: 'attached' })
      assert.equal(decision(JSON.parse(await embedded.locator('output').textContent())), REVIEWED_SIGNOFF)
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 1000 })
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      }
      await page.setViewportSize({ width: 1500, height: 1100 })
      results.push({ detailLocale: locale, embeddedDecision: true, narrowPageOverflow: false })
    }
  }
  assert.deepEqual(errors, [])
  await fs.writeFile(
    path.join(directory, 'report.json'),
    JSON.stringify({ status: 'passed', errors, results }, null, 2),
  )
  console.log(
    'PASS PDF lifecycle: four native pages, table/image, decision, disposal/remount, invalid load, reset, blank and narrow views',
  )
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure.json'),
    JSON.stringify({ message: error.message, errors, results }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}

function decision(state) {
  return state.pages[3]?.text.find((item) => item.id === 'signoff')?.text
}

async function assertRightMargin(nativeCanvas) {
  const count = await nativeCanvas.evaluate((element) => {
    const pixels = element.getContext('2d').getImageData(0, 0, element.width, element.height).data
    let ink = 0
    // Original A4 fixture: body frames end at 552pt. The rightmost 25pt
    // is a clear margin, not a place where clipped long lines may spill.
    for (let y = Math.ceil((element.height * 160) / 841.89); y < (element.height * 760) / 841.89; y++) {
      for (let x = Math.ceil((element.width * 570) / 595.276); x < element.width; x++) {
        const offset = (y * element.width + x) * 4
        if (pixels[offset + 3] > 128 && Math.min(...pixels.slice(offset, offset + 3)) < 180) ink++
      }
    }
    return ink
  })
  assert.equal(count, 0, 'Authored PDF body text must not spill into the page-edge margin')
}
