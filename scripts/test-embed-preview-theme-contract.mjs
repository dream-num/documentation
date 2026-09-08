import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

// Source contract only. Runtime acceptance is tracked separately by selected case.
const slugs = [
  'bases-in-docs-block',
  'bases-in-sheets-tab',
  'bases-in-sheets-float',
  'boards-in-docs-block',
  'boards-in-sheets-tab',
  'boards-in-sheets-float',
  'docs-in-sheets-float',
  'docs-in-sheets-tab',
  'sheets-in-docs-block',
  'sheets-in-slides-float',
  'slides-in-docs-block',
  'slides-in-sheets-float',
  'slides-in-sheets-tab',
]
await Promise.all(
  slugs.map(async (slug) => {
    const directory = `showcase/embed/${slug}`
    const [preview, factory] = await Promise.all([
      fs.readFile(`${directory}/preview/main.tsx`, 'utf8'),
      fs.readFile(`${directory}/code/create-demo.ts`, 'utf8'),
    ])
    assert.match(
      preview,
      /demoRef\.current\?\.univerAPI\.toggleDarkMode\(darkModeRef\.current\)/,
      `${slug}: toggle the retained owner`,
    )
    assert.match(
      preview,
      /createDemo\(containerRef\.current, darkModeRef\.current\)/,
      `${slug}: initialize once with the latest theme`,
    )
    assert.doesNotMatch(
      preview,
      /createDemo\([^\n]*resolvedTheme|if\s*\(!resolvedTheme\)/,
      `${slug}: do not recreate on theme resolution`,
    )
    assert.match(preview, /demoRef\.current = undefined/, `${slug}: clear the disposed owner reference`)
    const initial = factory.indexOf("root.dataset.ready = 'false'")
    assert.ok(
      initial >= 0 && initial < factory.indexOf('container.append(root)'),
      `${slug}: pending state exists before insertion`,
    )
    assert.match(factory, /root\.dataset\.ready = 'true'/)
    assert.match(factory, /root\.dataset\.error = String\(error\)/, `${slug}: do not hide source failures`)
  }),
)
console.log(`PASS ${slugs.length} Embed preview theme/readiness source contracts; not full runtime certification`)
