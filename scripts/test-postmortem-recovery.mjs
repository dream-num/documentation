/* eslint-disable no-await-in-loop -- Independent owner transitions are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const output = process.env.SHOWCASE_RESULTS_DIR || 'test-results/postmortem-recovery'
await fs.mkdir(output, { recursive: true })
const source = (await readShowcaseSources()).find((item) => item.slug === 'docs-modern/incident-postmortem')
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-postmortem-recovery-'))
for (const [name, content] of Object.entries(source.files)) {
  const file = path.join(directory, name.slice(1))
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, content)
}
await fs.appendFile(
  path.join(directory, 'src/index.ts'),
  '\nwindow.recoveryFactory = createIncidentPostmortemDemo; window.recoveryOwner = demo;\n',
)
const pkg = JSON.parse(source.files['/package.json'])
for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
  const link = path.join(directory, 'node_modules', name)
  await fs.mkdir(path.dirname(link), { recursive: true })
  await fs.symlink(
    name === 'vite'
      ? 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
      : path.resolve('node_modules', name),
    link,
    'junction',
  )
}
const { build, preview } = await import(pathToFileURL(path.join(directory, 'node_modules/vite/dist/node/index.js')))
await build({ configFile: false, root: directory, logLevel: 'error' })
const server = await preview({
  configFile: false,
  root: directory,
  preview: { host: '127.0.0.1', port: 4418, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { directory, passed: false, gates: {}, errors: [] }
page.on('pageerror', (error) => report.errors.push(String(error)))
const snapshot = () => page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getActiveDocument().save())))
async function ready() {
  await page.waitForFunction(() => {
    const canvas = document.getElementById('univer-doc-main-canvas')
    if (!canvas?.width) return false
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    let ink = 0
    for (let i = 0; i < pixels.length; i += 4)
      if (pixels[i + 3] > 200 && pixels[i] < 180 && pixels[i + 1] < 180 && pixels[i + 2] < 180) ink++
    return ink > 2000
  })
}
async function gate(name, check) {
  try {
    await check()
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, error: String(error) }
  }
}
try {
  await page.goto('http://127.0.0.1:4418')
  await ready()
  await page.mouse.dblclick(520, 235)
  await page.keyboard.press('Home')
  await page.keyboard.type('Recovered ')
  const saved = await snapshot()
  assert.ok(saved.body.dataStream.includes('Recovered '))
  await gate('same-id-full-owner-reconstruction', async () => {
    await page.evaluate((data) => {
      window.recoveryOwner.dispose()
      window.recoveryOwner = window.recoveryFactory(document.getElementById('app'), false, undefined, data)
    }, saved)
    await ready()
    const actual = await snapshot()
    await fs.writeFile(path.join(output, 'restored.json'), JSON.stringify(actual, null, 2))
    await page.screenshot({ path: path.join(output, 'restored.png') })
    assert.deepEqual(actual, saved)
  })
  await gate('fresh-native-edit-after-recovery', async () => {
    await page.mouse.dblclick(520, 235)
    await page.keyboard.press('Home')
    await page.keyboard.type('Again ')
    assert.ok((await snapshot()).body.dataStream.includes('Again '))
  })
  await gate('invalid-snapshot-preserves-owner', async () => {
    const before = await snapshot()
    assert.equal(
      await page.evaluate(() => {
        try {
          window.recoveryFactory(document.getElementById('app'), false, undefined, { id: '' })
          return false
        } catch {
          return true
        }
      }),
      true,
    )
    assert.deepEqual(await snapshot(), before)
    assert.equal(await page.locator('.incident-postmortem-demo').count(), 1)
  })
  await gate('pre-ready-double-disposal', async () => {
    await page.evaluate(() => {
      window.recoveryOwner.dispose()
      const pending = window.recoveryFactory(document.getElementById('app'))
      pending.dispose()
      pending.dispose()
    })
    await page.waitForTimeout(500)
    assert.equal(await page.locator('.incident-postmortem-demo').count(), 0)
    assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
    assert.deepEqual(report.errors, [])
  })
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = Object.values(report.gates).every((value) => value.passed)
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}
assert.ok(report.passed)
