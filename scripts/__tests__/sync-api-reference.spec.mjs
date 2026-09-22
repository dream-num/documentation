import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'

import { API } from 'typescript/unstable/sync'

import { emitSourceDeclarations, readClasses, readFacadeSurface } from '../sync-api-reference.mjs'

test('documents current exports and signatures without installed or stale built declarations', () => {
  const temporary = mkdtempSync(join(tmpdir(), 'reference-source-test-'))
  const api = new API()
  try {
    const core = join(temporary, 'core')
    const pro = join(temporary, 'pro')
    const files = {
      'core/packages/sheets/package.json': '{"name":"@univerjs/sheets"}',
      'core/packages/sheets/src/index.ts': 'export interface IWorksheetData { backgroundImage?: { source: string } }',
      'core/packages/sheets/src/facade/index.ts': `
        function Inject(): ParameterDecorator { return () => {} }
        export class FWorksheet {
          constructor(@Inject() service: unknown) {}
          setHyperLink(url: string, label?: string, tooltip?: string): boolean { return !!url }
        }
      `,
      'core/packages/sheets/lib/types/facade/index.d.ts':
        'export declare class FWorksheet { setHyperLink(url: string): boolean }',
      'pro/packages/pivot-chart/package.json': '{"name":"@univerjs-pro/pivot-chart"}',
      'pro/packages/pivot-chart/src/index.ts': 'export interface IPivotChart { id: string }',
      'pro/packages/pivot-chart/src/facade/index.ts': `
        export class FSheetPivotChart { getId(): string { return 'chart' } }
        /** @internal */
        export class FInternalChart { reset(): void {} }
      `,
    }
    for (const [path, content] of Object.entries(files)) {
      const file = join(temporary, path)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, content)
    }
    const packages = emitSourceDeclarations([core, pro], temporary)
    const entries = packages.map(({ typesDirectory }) => join(typesDirectory, 'facade/index.d.ts'))
    const config = join(temporary, 'reference-tsconfig.json')
    writeFileSync(
      config,
      JSON.stringify({
        compilerOptions: { noEmit: true, types: [] },
        files: [...entries, ...packages.map(({ directory }) => join(directory, 'src/facade/index.ts'))],
      }),
    )
    const project = api.updateSnapshot({ openProjects: [config] }).getProject(config)
    const classes = entries.flatMap((file) => readClasses(project.program.getSourceFile(file), { file }))
    const source = project.program.getSourceFile(join(core, 'packages/sheets/src/facade/index.ts'))
    assert.equal(
      readClasses(source, { file: source.fileName })[0].members.some(({ name }) => name === 'service'),
      false,
    )
    const surface = readFacadeSurface(project, classes, entries)
    assert.deepEqual(surface.map(({ name }) => name).toSorted(), ['FSheetPivotChart', 'FWorksheet'])
    const method = surface.find(({ name }) => name === 'FWorksheet').members[0].nodes[0]
    assert.deepEqual(
      method.parameters.map(({ name }) => name.getText()),
      ['url', 'label', 'tooltip'],
    )
    assert.match(readFileSync(join(packages[0].typesDirectory, 'index.d.ts'), 'utf8'), /backgroundImage\?/)
  } finally {
    api.close()
    rmSync(temporary, { recursive: true, force: true })
  }
})
