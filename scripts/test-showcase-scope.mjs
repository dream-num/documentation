import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import process from 'node:process'

import scopeLoader from './showcase-scope-loader.cjs'

const source = fs.readFileSync('showcase/data.ts', 'utf8')
const selected = ['bases/content-pipeline']
const scoped = scopeLoader.filterRegistry(source, selected)
assert.deepEqual(
  [...scoped.matchAll(/import\('\.\/([^']+)'\)/g)].map((match) => match[1]),
  selected,
)
assert.equal(scoped.split('\n').length, source.split(/\r?\n/).length, 'Preserve line numbers')
assert.doesNotMatch(scoped, /sheets\/big-data|slides\/|pdfs\//)
assert.throws(() => scopeLoader.filterRegistry(source, []), /at least one/)
assert.throws(() => scopeLoader.filterRegistry(source, ['bases/not-a-demo']), /Unknown Showcase/)
for (const newline of ['\n', '\r\n']) {
  const wrapped = `'a/one': () =>${newline}  import('./a/one'),${newline}'b/two': () => import('./b/two'),`
  const result = scopeLoader.filterRegistry(wrapped, ['a/one'])
  assert.deepEqual(
    [...result.matchAll(/import\('([^']+)'\)/g)].map((match) => match[1]),
    ['./a/one'],
  )
  assert.equal(result.split('\n').length, wrapped.split(newline).length)
  assert.doesNotMatch(scopeLoader.filterRegistry(wrapped, ['b/two']), /a\/one/)
}
let audit
scopeLoader.createScopeAudit(selected).apply({
  name: 'test',
  hooks: {
    afterCompile: {
      tap: (_, callback) => {
        audit = callback
      },
    },
  },
})
audit({ modules: [{ resource: '/repo/showcase/bases/content-pipeline/index.ts' }] })
assert.throws(
  () => audit({ modules: [{ resource: 'C:\\repo\\showcase\\sheets\\big-data\\preview\\main.tsx' }] }),
  /Unselected demo/,
)
console.log('PASS scoped registry, invalid selections, and actual webpack-module audit')

// Import the actual wrapped config in a child: Amamo starts a watcher which must not keep this test alive.
execFileSync(
  process.execPath,
  [
    '--no-warnings',
    '--input-type=module',
    '-e',
    `
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
try {
  const require = createRequire(import.meta.url);
  const CssPlugin = require('next/dist/build/webpack/plugins/mini-css-extract-plugin').default;
  const originalInsert = function nextStyleRegistration() {};
  const cssPlugin = new CssPlugin({ insert: originalInsert });
  const { default: factory } = await import('./next.config.mts');
  const config = await factory('phase-development-server', { defaultConfig: {} });
  const input = {
    context: process.cwd(),
    cache: { type: 'filesystem', version: 'next-native-version', buildDependencies: { config: ['next.config.mts'] } },
    module: { rules: [{ oneOf: [] }] }, plugins: [cssPlugin], resolve: { alias: {} }
  };
  const output = config.webpack(input, { dev: true, isServer: false, dir: process.cwd(), defaultLoaders: { babel: {} } });
  assert.equal(output.cache.version, 'next-native-version|showcase:' + process.env.UNIVER_SHOWCASE_DEMOS);
  assert.deepEqual(output.cache.buildDependencies.lockfile, [path.resolve('pnpm-lock.yaml')]);
  assert.ok(output.cache.buildDependencies.config.includes('next.config.mts'));
  assert.equal(cssPlugin.options.insert, undefined);
  assert.equal(cssPlugin.runtimeOptions.insert, undefined);
  for (const options of [{ dev: false, isServer: false }, { dev: true, isServer: true }]) {
    const untouched = new CssPlugin({ insert: originalInsert });
    config.webpack({ ...input, plugins: [untouched] }, { ...options, dir: process.cwd(), defaultLoaders: { babel: {} } });
    assert.equal(untouched.options.insert, originalInsert, 'Production/server CSS insertion must stay unchanged');
    assert.equal(untouched.runtimeOptions.insert, originalInsert);
  }
  assert.throws(() => config.webpack({ ...input, plugins: [] }, { dev: true, isServer: false }), /Next CSS runtime changed/);
  console.log('PASS actual Next cache retains framework version and tracks patched dependency lockfile');
  console.log('PASS real CSS plugin uses standard insertion only for development client builds');
  process.exit(0);
} catch (error) { console.error(error); process.exit(1); }
`,
  ],
  { stdio: 'inherit', env: { ...process.env, UNIVER_SHOWCASE_DEMOS: selected.join(',') } },
)
