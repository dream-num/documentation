/* eslint-disable no-await-in-loop -- Load metadata in catalog order, never Preview/SDK runtime modules. */
import fs from 'node:fs'
import { registerHooks } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { prepareShowcaseSource } from '../showcase/source-files.ts'

export async function readShowcaseSources() {
  const root = path.resolve('.')
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (specifier === './preview')
        return { url: 'data:text/javascript,export default function Preview(){}', shortCircuit: true }
      if (specifier === '@/showcase/read-files')
        return { url: pathToFileURL(path.join(root, 'showcase/read-files.ts')).href, shortCircuit: true }
      if (context.parentURL === pathToFileURL(path.join(root, 'showcase/data.ts')).href && specifier.startsWith('./'))
        return { url: new URL(`${specifier}/index.ts`, context.parentURL).href, shortCircuit: true }
      return next(specifier, context)
    },
  })
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const versions = Object.fromEntries(
      Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).map((name) => [
        name,
        JSON.parse(fs.readFileSync(`node_modules/${name}/package.json`, 'utf8')).version,
      ]),
    )
    const { showcase } = await import('../showcase/data.ts')
    const cases = []
    for (const [slug, load] of Object.entries(showcase)) {
      const { files, metadata } = (await load()).default
      cases.push({ slug, metadata, authored: files, ...prepareShowcaseSource(files, versions) })
    }
    return cases
  } finally {
    hooks.deregister()
  }
}
