import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { globSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import * as icons from '@univerjs/icons'

const sourceRoot = resolve(process.argv[2] ?? '../univer-icons')
const { createSvgIconGroups } = await import(
  pathToFileURL(resolve(sourceRoot, 'packages/app/src/svg-catalogue.ts')).href
)
const sourcePackage = JSON.parse(readFileSync(resolve(sourceRoot, 'packages/icons/package.json'), 'utf8'))
const installedPackage = JSON.parse(
  readFileSync(new URL('../node_modules/@univerjs/icons/package.json', import.meta.url), 'utf8'),
)
assert.equal(sourcePackage.version, installedPackage.version, 'Source and installed Icons versions must match')
const files = globSync(`${sourceRoot}/packages/svg/{single,double,other}/*.svg`)
const groups = createSvgIconGroups(Object.fromEntries(files.map((file) => [file, readFileSync(file, 'utf8')])))
const entries = groups.flatMap((group) =>
  group.subgroups.flatMap((subgroup) =>
    subgroup.items.map((icon) => {
      assert(icon.name in icons, `Missing installed component: ${icon.name}`)
      return {
        group: icon.group,
        category: icon.category,
        description: icon.description,
        role: icon.role,
        aliases: icon.aliases,
        keywords: icon.keywords,
        products: icon.products,
        updatedVer: icon.updatedVer,
        preserveStrokeWidthSupport: icon.preserveStrokeWidthSupport,
        componentName: icon.name,
        name: icon.sourcePath.split('/').at(-1).replace('.svg', ''),
        subgroup: subgroup.id,
      }
    }),
  ),
)
assert.equal(entries.length, Object.keys(icons).length, 'Every installed icon must have catalog metadata')
const catalog = {
  version: installedPackage.version,
  source: {
    repository: 'https://github.com/dream-num/univer-icons',
    commit: execFileSync('git', ['-C', sourceRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  },
  icons: entries,
}
const destination = new URL('../public/assets/icons/catalog.json', import.meta.url)
mkdirSync(new URL('.', destination), { recursive: true })
writeFileSync(destination, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`Synced ${entries.length} icons from Univer Icons ${catalog.version}`)
