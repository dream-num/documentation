import { spawn } from 'node:child_process'
import process from 'node:process'
import { chromium } from 'playwright'

const PORT = 3999
const BASE_URL = `http://localhost:${PORT}`
const OUTPUT_DIR = 'public/assets/showcase'

const keys = [
  'sheets/slim-via-plugin',
  'sheets/slim-via-preset',
  'sheets/basic-via-plugin',
  'sheets/basic-via-preset',
  'sheets/lit',
  'sheets/node-via-plugin',
  'sheets/big-data',
  'sheets/csv-import-plugin',
  'sheets/custom-canvas',
  'sheets/custom-header',
  'sheets/custom-menu',
  'sheets/custom-formula',
  'sheets/custom-shortcuts',
  'sheets/custom-event',
  'sheets/permission',
  'sheets/images',
  'sheets/hyper-link',
  'sheets/find-replace',
  'sheets/notes',
  'sheets/crosshair-highlighting',
  'sheets/watermark',
  'sheets/charts',
  'sheets/shapes',
  'sheets/print',
  'sheets/migrate-from-luckysheet',
  'sheets/cross-workbook-formula',
  'sheets/read-only',
  'sheets/mobile-via-plugin',
  'docs/slim-via-plugin',
  'docs/slim-via-preset',
  'docs/lit',
  'docs/node-via-plugin',
  'docs/big-data',
  'docs/watermark',
  'slides/basic-via-plugin',
]

// Start the Next.js standalone server
const server = spawn('node', ['.next/standalone/server.js'], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'pipe',
})

await new Promise((resolve) => {
  server.stdout.on('data', (data) => {
    const msg = data.toString()
    if (msg.includes('Ready') || msg.includes('started') || msg.includes('http://')) {
      resolve()
    }
  })
  server.stderr.on('data', () => {})
  setTimeout(resolve, 5000)
})

console.log('Server started on', BASE_URL)

const browser = await chromium.launch({ headless: true })

for (const key of keys) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()
  const url = `${BASE_URL}/playground/${key}`
  console.log(`[${keys.indexOf(key) + 1}/${keys.length}] Screenshotting: ${key}`)

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

    // Inject h-160 style since Tailwind v4 may not include it in build
    await page.addStyleTag({
      content: '.h-160 { height: 640px !important; min-height: 640px !important; }',
    })

    // Wait for canvas inside the preview area
    await page.waitForFunction(() => {
      const preview = document.querySelector('.h-160')
      if (!preview)
        return false
      return preview.querySelector('canvas') !== null
    }, { timeout: 20000 })

    // Extra wait for Univer to fully render
    await page.waitForTimeout(4000)

    // Screenshot the preview area
    const previewEl = await page.locator('.h-160').first()
    await previewEl.screenshot({
      path: `${OUTPUT_DIR}/${key.replace(/\//g, '-')}.png`,
    })
    console.log(`  -> Saved ${key}`)
  }
  catch (err) {
    console.error(`  -> Failed ${key}:`, err.message)
    // Fallback: screenshot top 640px
    try {
      await page.screenshot({
        path: `${OUTPUT_DIR}/${key.replace(/\//g, '-')}.png`,
        clip: { x: 0, y: 0, width: 1280, height: 640 },
      })
      console.log(`  -> Fallback saved ${key}`)
    }
    catch {}
  }
  finally {
    await context.close()
  }
}

await browser.close()
server.kill()
console.log('All screenshots done')
