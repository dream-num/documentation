/* eslint-disable no-await-in-loop -- Exercise one native document, selection and history sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/doc-fonts')
const origin = process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'
const slug = 'docs-traditional/fonts-fallback-and-glyphs'
const url = process.env.SHOWCASE_DEMO_URL || `${origin}/en-US/playground/${slug}`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1200 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
const report = { passed: false, checks: [], errors: [], families: [] }
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
const demo = page.locator('.font-demo')
const field = (name) => demo.locator(`[data-input="${name}"]`)
const button = (name) => demo.locator(`[data-action="${name}"]`)
const read = async () => JSON.parse(await demo.locator('output').textContent())
const sample = (state, id = 'EN') => state.samples.find((item) => item.id === id)
const wait = async () => {
  await page.locator('.font-demo[data-ready="true"]').waitFor({ timeout: 90000 })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    )
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}
const click = async (name, error = false) => {
  await button(name).click()
  await wait()
  assert.equal(
    await demo.locator('[role="alert"]').isVisible(),
    error,
    await demo.locator('[role="alert"]').textContent(),
  )
  return read()
}
const capture = async (name) => {
  await wait()
  await demo.screenshot({ path: path.join(directory, `${name}.png`) })
}
try {
  await page.goto(url, { waitUntil: 'load', timeout: 180000 })
  await wait()
  const baseline = await read()
  assert.equal(await demo.locator('[role="alert"]').isVisible(), false)
  assert.ok(
    baseline.snapshot.drawings['alder-baseline-reference'].transforms?.length,
    'Baseline snapshot waits for actual drawing layout',
  )
  assert.equal(baseline.pageCount, 12)
  assert.equal(baseline.samples.length, 6)
  assert.ok(baseline.samples.every((item) => item.present && item.glyph.width > 0))
  assert.equal(baseline.snapshot.body.tables.length, 1)
  assert.equal(baseline.snapshot.body.customBlocks[0].blockId, 'alder-baseline-reference')
  assert.match(baseline.localFaceProbes.missing, /unavailable/)
  assert.match(baseline.glyphCoverage, /Not inferred/)
  const native = demo.locator('[data-u-comp="workbench-layout"], [data-u-comp="app-layout"]').first()
  report.styles = await native.evaluate((el) => ({
    background: getComputedStyle(el).backgroundColor,
    theme: getComputedStyle(el).getPropertyValue('--univer-gray-0').trim(),
  }))
  assert.deepEqual(report.styles, { background: 'rgb(255, 255, 255)', theme: '#FFFFFF' })
  await capture('baseline')
  await demo.locator('.font-controls > summary').click()
  assert.ok(await button('font').isDisabled())
  assert.ok(await button('style').isDisabled())
  assert.ok(await button('undo').isDisabled())
  report.checks.push(
    'Twelve native pages, six distinct samples, native table/figure, official white workbench and honest missing-face diagnostic',
  )

  for (const [id, family] of [
    ['serif', 'Georgia, serif'],
    ['mono', 'Courier New, monospace'],
    ['missing', 'Univer Missing Font 2027, Georgia, serif'],
  ]) {
    await field('font').selectOption(id)
    const changed = await click('font')
    assert.equal(sample(changed).style.ff, family)
    assert.equal(
      sample(changed).glyph.requestedFamily.replaceAll('"', ''),
      family,
      'Native renderer may quote multi-word CSS families',
    )
    assert.equal(sample(changed).style.fs, 13)
    assert.equal(changed.snapshot.body.dataStream, baseline.snapshot.body.dataStream)
    assert.deepEqual(
      changed.samples.slice(1).map((s) => s.style),
      baseline.samples.slice(1).map((s) => s.style),
    )
    assert.ok(await button('font').isDisabled())
    report.families.push({ id, glyph: sample(changed).glyph })
    await demo.locator('.font-controls > summary').click()
    await capture(id)
    await demo.locator('.font-controls > summary').click()
  }
  assert.notEqual(
    report.families[0].glyph.width,
    report.families[1].glyph.width,
    'Native Latin glyph metrics change between serif and monospace',
  )
  assert.equal(
    report.families[0].glyph.width,
    report.families[2].glyph.width,
    'Missing-primary stack and explicit serif fallback agree for this Latin glyph on this browser',
  )
  await field('size').fill('20')
  await field('weight').selectOption('1')
  const styled = await click('style')
  assert.equal(sample(styled).style.fs, 20)
  assert.equal(sample(styled).style.bl, 1)
  assert.ok(sample(styled).glyph.width > report.families[2].glyph.width)
  const undone = await click('undo')
  assert.equal(sample(undone).style.fs, 13)
  assert.equal(sample(undone).style.bl, 0)
  assert.deepEqual(sample(await click('redo')).style, sample(styled).style)
  for (const invalid of ['7', '33', '']) {
    const before = (await read()).snapshot
    await field('size').fill(invalid)
    assert.deepEqual((await click('style', true)).snapshot, before)
  }
  assert.deepEqual((await click('invalid', true)).snapshot, styled.snapshot)
  assert.match(await demo.locator('[role="alert"]').textContent(), /Invalid document text range/)
  assert.deepEqual((await click('reload')).snapshot, styled.snapshot)
  const downloadEvent = page.waitForEvent('download')
  await click('download')
  const download = await downloadEvent
  assert.equal(download.suggestedFilename(), 'alder-typography.json')
  await download.saveAs(path.join(directory, download.suggestedFilename()))
  assert.deepEqual(
    JSON.parse(await fs.readFile(path.join(directory, download.suggestedFilename()), 'utf8')),
    styled.snapshot,
  )
  report.checks.push(
    'Four font stacks, isolated family patches, native glyph metric changes, size/weight history, atomic invalid inputs and exact full-resource reload/download',
  )

  assert.deepEqual((await click('reset')).snapshot, baseline.snapshot)
  const selected = await click('select')
  assert.equal(selected.selection[0].startOffset, sample(selected).range.startOffset)
  assert.equal(selected.selection[0].endOffset, sample(selected).range.endOffset)
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type(' native')
  await page.waitForFunction(() =>
    JSON.parse(document.querySelector('.font-demo output').textContent).samples[0].text.endsWith(' native'),
  )
  await field('font').selectOption('mono')
  assert.match(sample(await click('font')).text, / native$/)
  await click('select')
  await page.keyboard.type('Unmarked native specimen')
  await page.waitForFunction(
    () => JSON.parse(document.querySelector('.font-demo output').textContent).samples[0].present === false,
  )
  assert.ok(await button('select').isDisabled())
  assert.ok(await button('font').isDisabled())
  assert.ok(await button('style').isDisabled())
  assert.ok(sample(await click('undo')).present)
  await click('reset')
  await click('select')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await page.keyboard.type('[EN] Duplicate native marker')
  await page.waitForFunction(
    () => JSON.parse(document.querySelector('.font-demo output').textContent).samples[0].present === false,
  )
  assert.ok(await button('select').isDisabled(), 'Duplicate marker cannot silently select the first paragraph')
  assert.ok(await button('style').isDisabled())
  await click('reset')
  report.scriptStyles = []
  for (const id of ['EN', 'CJK', 'RTL', 'ACCENTS', 'SYMBOL', 'GLYPH']) {
    await field('sample').selectOption(id)
    for (const [font, family] of [
      ['serif', 'Georgia, serif'],
      ['mono', 'Courier New, monospace'],
      ['missing', 'Univer Missing Font 2027, Georgia, serif'],
    ]) {
      await field('font').selectOption(font)
      const applied = await click('font')
      assert.equal(sample(applied, id).style.ff, family)
      assert.equal(sample(applied, id).glyph.size, 13)
      assert.equal(sample(applied, id).text, sample(baseline, id).text)
      assert.equal(applied.snapshot.body.dataStream, baseline.snapshot.body.dataStream)
      report.scriptStyles.push({ id, font, requestedFamily: sample(applied, id).glyph.requestedFamily })
    }
  }
  report.checks.push(
    'Duplicate native marker disables ambiguous targets; all six multilingual specimens accept three alternate families without text loss (not glyph coverage certification)',
  )
  await click('reset')
  await field('scope').selectOption('report')
  await field('font').selectOption('serif')
  const full = await click('font')
  assert.ok(full.samples.every((s) => s.style.ff === 'Georgia, serif'))
  assert.equal(full.snapshot.body.dataStream, baseline.snapshot.body.dataStream)
  for (const key of ['source', 'docTransform', 'title', 'description', 'layoutType', 'wrapText'])
    assert.deepEqual(
      full.snapshot.drawings['alder-baseline-reference'][key],
      baseline.snapshot.drawings['alder-baseline-reference'][key],
      `Figure ${key} survives repagination; viewport transforms may move`,
    )
  assert.deepEqual(full.snapshot.body.customBlocks, baseline.snapshot.body.customBlocks)
  assert.ok(
    full.snapshot.body.textRuns.every((run) => run.ts.ff === 'Georgia, serif'),
    'Whole-body style also reaches headings and native table text',
  )
  assert.ok(await button('font').isDisabled())
  report.checks.push(
    'Native selection/typing changes real text, marker removal disables stale targets, Undo restores them, and whole-report styling reaches table text without changing the figure',
  )

  for (const name of ['default', 'boundary', 'empty', 'error']) {
    let first
    for (let repeat = 0; repeat < 2; repeat++) {
      await field('fixture').selectOption(name)
      const state = await click('fixture', name === 'error')
      if (first) assert.deepEqual(state.snapshot, first)
      first = state.snapshot
      assert.equal(state.loadedFixture, name)
      assert.ok(await button('undo').isDisabled())
      if (name === 'empty') {
        assert.ok(state.samples.every((s) => !s.present))
        assert.ok(await button('style').isDisabled())
      } else if (name === 'boundary') assert.equal(sample(state).style.fs, 32)
      else assert.deepEqual(state.snapshot, baseline.snapshot)
    }
  }
  assert.deepEqual((await click('reset')).snapshot, baseline.snapshot)
  report.narrow = []
  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.waitForFunction(() => {
      const root = document.querySelector('.font-demo')
      const state = JSON.parse(root.querySelector('output').textContent)
      const expected = Math.min(1, Math.max(0.1, (root.querySelector('.font-editor').clientWidth - 24) / 874))
      return Math.abs(state.zoomRatio - expected) < 0.001
    })
    await wait()
    assert.ok(await demo.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), 'Host does not overflow horizontally')
    const fitted = await read()
    assert.deepEqual(fitted.snapshot.body, baseline.snapshot.body, 'View zoom is not a text-size or pagination edit')
    assert.deepEqual(fitted.snapshot.documentStyle, baseline.snapshot.documentStyle)
    assert.equal(fitted.pageCount, 12)
    const paperWidth = await demo
      .locator('.font-editor canvas')
      .first()
      .evaluate((canvas) => {
        const { width: bitmapWidth, height } = canvas
        const pixels = canvas.getContext('2d').getImageData(0, 0, bitmapWidth, height).data
        let longest = 0
        for (let y = 25; y < Math.min(height, 350); y += 4) {
          let run = 0
          for (let x = 0; x < bitmapWidth; x++) {
            const p = (y * bitmapWidth + x) * 4
            run = pixels[p] > 253 && pixels[p + 1] > 253 && pixels[p + 2] > 253 && pixels[p + 3] > 253 ? run + 1 : 0
            longest = Math.max(longest, run)
          }
        }
        return (longest * canvas.getBoundingClientRect().width) / bitmapWidth
      })
    assert.ok(
      Math.abs(paperWidth - 794 * fitted.zoomRatio) < 6,
      `Native paper pixels fit: ${paperWidth} versus ${794 * fitted.zoomRatio}`,
    )
    report.narrow.push({ width, zoomRatio: fitted.zoomRatio, paperWidth })
    await demo.locator('.font-controls > summary').click()
    await capture(`fit-${width}`)
    await demo.locator('.font-controls > summary').click()
    await field('zoom').selectOption('actual')
    await wait()
    assert.equal((await read()).zoomRatio, 1)
    assert.deepEqual((await read()).snapshot.body, baseline.snapshot.body)
    await field('zoom').selectOption('fit')
    await wait()
    await field('font').selectOption('mono')
    await button('font').focus()
    await page.keyboard.press('Enter')
    await wait()
    const edited = await read()
    assert.equal(sample(edited).style.ff, 'Courier New, monospace')
    assert.equal(sample(edited).style.fs, 13)
    assert.deepEqual((await click('reload')).snapshot.body, edited.snapshot.body)
    assert.equal((await read()).zoomRatio, fitted.zoomRatio)
    assert.deepEqual((await click('reset')).snapshot.body, baseline.snapshot.body)
  }
  await click('invalid', true)
  const errorBeforeResize = await demo.locator('[role="alert"]').textContent()
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.waitForFunction(() => JSON.parse(document.querySelector('.font-demo output').textContent).zoomRatio > 0.4)
  await wait()
  assert.equal(
    await demo.locator('[role="alert"]').isVisible(),
    true,
    'Automatic fitting does not dismiss an SDK error',
  )
  assert.equal(await demo.locator('[role="alert"]').textContent(), errorBeforeResize)
  assert.deepEqual((await read()).snapshot.body, baseline.snapshot.body)
  await click('reset')
  report.checks.push(
    'Four repeatable states; fit/100% native zoom and actual paper pixels at 760/390/320 px; unchanged body/page geometry; keyboard style, narrow reload and Reset; automatic resize preserves errors',
  )
  if (process.env.SHOWCASE_DETAILS === '1') {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const [locale, title, labels] of [
      ['en-US', 'Fonts, Fallback, and Glyphs', ['Variants', 'Actions', 'States']],
      ['zh-CN', '字体、回退与字形', ['变体', '操作', '状态']],
    ]) {
      const response = await page.goto(`${new URL(url).origin}/${locale}/showcase/${slug}`, {
        waitUntil: 'load',
        timeout: 180000,
      })
      assert.equal(response.status(), 200)
      await page.getByRole('heading', { level: 1, name: title, exact: true }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      assert.equal(await page.locator('aside').getByRole('button', { expanded: true }).count(), 3)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first().locator('.font-demo')
      const ready = () =>
        embedded.locator('.font-controls > fieldset:not([disabled])').waitFor({ state: 'attached', timeout: 120000 })
      await ready()
      await embedded.locator('.font-controls > summary').click()
      await embedded.locator('[data-input=font]').selectOption('mono')
      await embedded.locator('[data-action=font]').click()
      await ready()
      assert.equal(
        sample(JSON.parse(await embedded.locator('output').textContent())).style.ff,
        'Courier New, monospace',
      )
      await embedded.locator('[data-action=undo]').click()
      await ready()
      assert.equal(sample(JSON.parse(await embedded.locator('output').textContent())).style.ff, 'Arial, sans-serif')
      await embedded.locator('.font-controls > summary').click()
      await page.screenshot({ path: path.join(directory, `guide-${locale}.png`) })
    }
    report.checks.push(
      'English/Chinese card-free detail pages, four-level navigation and real embedded font/history actions',
    )
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'failure-state.json'),
    JSON.stringify(await read().catch(() => null), null, 2),
  )
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
assert.ok(report.passed, report.failure)
