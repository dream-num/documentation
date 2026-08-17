import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const outDir = 'out'
const basePath = '/documentation/v0.25'
const locales = ['zh-CN', 'zh-TW', 'ja-JP']
const sharedPaths = [
  `${basePath}/_next/`,
  `${basePath}/assets/`,
  `${basePath}/favicon.ico`,
]

async function getHtmlFiles(path) {
  const files = []

  for (const entry of await readdir(path, { withFileTypes: true })) {
    const entryPath = join(path, entry.name)

    if (entry.isDirectory()) {
      files.push(...await getHtmlFiles(entryPath))
    }
    else if (entry.name.endsWith('.html')) {
      files.push(entryPath)
    }
  }

  return files
}

const failures = []
let checkedUrls = 0

for (const locale of locales) {
  const localePath = join(outDir, locale)
  const localePrefix = `${basePath}/${locale}`

  for (const file of await getHtmlFiles(localePath)) {
    const html = await readFile(file, 'utf8')

    for (const [, attribute, url] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
      if (!url.startsWith('/') || url.startsWith('//') || sharedPaths.some(path => url.startsWith(path))) {
        continue
      }

      checkedUrls++
      const localizedPath = url.slice(localePrefix.length)
      const hasLocale = url === localePrefix || url.startsWith(`${localePrefix}/`)
      const hasDuplicateLocale = locales.some(candidate => localizedPath === `/${candidate}` || localizedPath.startsWith(`/${candidate}/`))

      if (!hasLocale || hasDuplicateLocale) {
        failures.push(`${relative(outDir, file)}: ${attribute}="${url}"`)
      }
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Found ${failures.length} non-localized internal URLs:\n${failures.slice(0, 20).join('\n')}`)
}

console.log(`Verified ${checkedUrls} localized internal URLs`)
