import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import process from 'node:process'

import { BooleanNumber, HorizontalAlign } from '@univerjs/core'
import { RangeThemeStyle } from '@univerjs/sheets'
import { chromium } from 'playwright'

// Compare rendered cells against Univer's actual preset builders and style resolver.
const source = await readFile('../univer/packages/sheets/src/models/range-themes/build-in-theme.factory.ts', 'utf8')
const compiled = stripTypeScriptTypes(source.replace(/^import .*;$/gm, '').replaceAll('export ', ''))
const themes = new Function('RangeThemeStyle', 'BooleanNumber', 'HorizontalAlign', `${compiled}; return buildInThemes`)(
  RangeThemeStyle,
  BooleanNumber,
  HorizontalAlign,
)
themes.push(
  new RangeThemeStyle('default', {
    headerRowStyle: { bg: { rgb: 'rgb(68,114,196)' } },
    firstRowStyle: { bg: { rgb: 'rgb(217,225,242)' } },
  }),
)
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
  await page.goto(`${origin}/zh-CN/guides/sheets/features/core/range-theme`)
  const demo = page.getByRole('region', { name: 'Range themes', exact: true })
  await demo.waitFor()
  await themes.reduce(async (previous, theme) => {
    await previous
    const [family, color] = theme.getName().split('-')
    await demo.getByRole('tab', { name: family, exact: true }).click()
    if (color) await demo.getByRole('button', { name: color, exact: true }).click()
    const cells = await demo
      .getByRole('img', { name: theme.getName(), exact: true })
      .locator(':scope > div')
      .evaluateAll((elements) => elements.map((element) => element.style.backgroundColor))
    const expected = Array.from({ length: 30 }, (_, index) => {
      const row = Math.floor(index / 5)
      const column = index % 5
      return theme.getStyle(row, column, row === 5, column === 4, false)?.bg?.rgb || 'rgb(255, 255, 255)'
    })
    assert.deepEqual(
      cells.map((value) => value.replaceAll(' ', '')),
      expected.map((value) => value.replaceAll(' ', '')),
      theme.getName(),
    )
  }, Promise.resolve())
  await page.setViewportSize({ width: 390, height: 844 })
  await demo.getByRole('tab', { name: 'middle', exact: true }).click()
  assert.ok(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth))
  await demo.screenshot({ path: '/tmp/range-theme-demo.png' })
  await page.goto(`${origin}/en-US/guides/sheets/features/core/defined-names`)
  const names = page.getByRole('region', { name: 'Name manager', exact: true })
  await names.locator('summary').click()
  await names.getByRole('button', { name: 'Name manager', exact: true }).click()
  await names.getByRole('complementary', { name: 'Name manager', exact: true }).waitFor()
  await names.getByRole('button', { name: 'Close name manager', exact: true }).click()
  assert.equal(await names.getByRole('complementary').count(), 0)
  assert.deepEqual(errors, [])
  console.log('31 themes match Univer cell styles; mobile, localized name manager and hydration checks passed.')
} finally {
  await browser.close()
}
