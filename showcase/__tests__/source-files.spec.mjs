import assert from 'node:assert/strict'

import { prepareShowcaseSource } from '../source-files.ts'

const authored = {
  '/src/index.ts': "import { createDemo } from './create-demo'\nimport '@univerjs/preset-docs-core/lib/index.css'\n",
  '/src/create-demo.ts':
    "import {\n  createUniver,\n  LocaleType\n} from '@univerjs/presets'\nconst locale = LocaleType.EN_US\n",
  '/src/styles.css': '.feature { display: flex; color: blue; }\n',
  '/reference/preview.tsx.txt': "import { useTheme } from 'next-themes'\n",
}
const versions = { '@univerjs/presets': '1.0.0-rc.0', '@univerjs/preset-docs-core': '1.0.0-rc.0' }
const result = prepareShowcaseSource(authored, versions)
for (const [filename, content] of Object.entries(authored)) assert.equal(result.files[filename], content)
assert.deepEqual(result.dependencies, versions)
assert.deepEqual(JSON.parse(result.files['/package.json']).dependencies, versions)
assert.equal(JSON.parse(result.files['/package.json']).scripts.dev, 'vite')
assert.equal(JSON.parse(result.files['/package.json']).scripts.build, 'vite build')
assert.match(result.files['/index.html'], /src="\/src\/index.ts"/)
assert.equal(Object.keys(result.files).filter((name) => name.endsWith('/styles.css')).length, 1)
assert.throws(() => prepareShowcaseSource({ '/x.ts': "import 'missing-package'" }, {}), /Missing dependency version/)
assert.throws(() => prepareShowcaseSource({ 'src/x.ts': 'one', '/src/x.ts': 'two' }, {}), /Conflicting source/)
assert.equal(prepareShowcaseSource({ '/src/styles.css': '' }, {}).files['/src/styles.css'], '')
const typedExport = prepareShowcaseSource(
  { '/src/index.ts': "import Papa from 'papaparse'\n" },
  {
    papaparse: '5.7.0',
    '@types/papaparse': '5.5.2',
    '@types/react': '19.2.18',
  },
)
const typeDependencies = JSON.parse(typedExport.files['/package.json']).devDependencies
assert.equal(typeDependencies['@types/papaparse'], '5.5.2')
assert.ok(!('@types/react' in typeDependencies))
console.log('PASS source preservation, dependency selection and invalid source rejection')
