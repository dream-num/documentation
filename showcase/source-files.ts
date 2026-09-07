import type { Files } from '@/components/playground/playground'

// Keep authored source byte-for-byte intact. Localized prose belongs in metadata,
// not in search-and-replace transformations of the code the Preview executes.
export function prepareShowcaseSource(files: Files, packageVersions: Record<string, string>) {
  const source: Files = {}
  for (const [filename, code] of Object.entries(files)) {
    const normalized = `/${filename.replace(/^\/+/, '')}`
    if (normalized in source && source[normalized] !== code) throw new Error(`Conflicting source: ${normalized}`)
    source[normalized] = code
  }
  const dependencies: Record<string, string> = {}
  for (const [filename, code] of Object.entries(source)) {
    if (!/\.[cm]?[jt]sx?$/.test(filename)) continue
    // Top-level static imports/re-exports, including multiline bindings and CSS.
    const imports = code.matchAll(
      /^\s*(?:import\s+(?:type\s+)?(?:[\w*$,{}\s]+\s+from\s*)?|export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s*)['"]([^'"]+)['"]/gm,
    )
    for (const [, specifier] of imports) {
      if (specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('node:')) continue
      const packageName = specifier.startsWith('@')
        ? specifier.split('/').slice(0, 2).join('/')
        : specifier.split('/')[0]
      if (!packageVersions[packageName]) throw new Error(`Missing dependency version: ${packageName} (${filename})`)
      dependencies[packageName] = packageVersions[packageName]
    }
  }
  // Carry installed DefinitelyTyped packages for the dependencies actually used
  // by this export (for example Papa Parse), not all documentation dev tooling.
  const typeDependencies = Object.fromEntries(
    Object.keys(dependencies)
      .map((name) => `@types/${name.startsWith('@') ? name.slice(1).replace('/', '__') : name}`)
      .filter((name) => packageVersions[name])
      .map((name) => [name, packageVersions[name]]),
  )
  source['/package.json'] ??= JSON.stringify(
    {
      name: 'univer-showcase',
      version: '1.0.0',
      private: true,
      type: 'module',
      main: 'src/index.ts',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      engines: { node: '^20.19.0 || >=22.12.0' },
      dependencies,
      devDependencies: { vite: '8.2.2', ...typeDependencies },
    },
    null,
    2,
  )
  source['/pnpm-workspace.yaml'] ??= 'allowBuilds:\n  protobufjs: true\n'
  source['/src/vite-env.d.ts'] ??= '/// <reference types="vite/client" />\n'
  source['/index.html'] ??=
    '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="icon" href="data:,"><title>Univer SDK</title></head><body><div id="app"></div><script type="module" src="/src/index.ts"></script></body></html>\n'
  source['/src/styles.css'] ??= 'html, body, #app { height: 100%; margin: 0; padding: 0; }\n'
  return { files: source, dependencies }
}
