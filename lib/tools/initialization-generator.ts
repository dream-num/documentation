import catalog from './plugin-catalog.json' with { type: 'json' }

export const SDK_VERSION = catalog.version
export const PRODUCTS = ['sheets', 'docs', 'slides', 'bases', 'boards', 'pdfs'] as const
export type Product = (typeof PRODUCTS)[number]
export const SDK_LOCALES = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES'] as const
export interface IGeneratorOptions {
  product: Product
  mode: 'plugin' | 'preset'
  locale: (typeof SDK_LOCALES)[number]
  mobile: boolean
  features: string[]
  umd: boolean
}
interface IPlugin {
  package: string
  dependencies: string[]
  locale?: boolean
  css?: boolean
  facade?: boolean
  mobile?: string
  available?: boolean
}
export interface IFeature {
  id: string
  label: string
  plugins: string[]
  requiresLicense: boolean
  preset?: string
}
const plugins: Record<string, IPlugin> = catalog.plugins
const basePlugins: Record<Product, string[]> = {
  sheets: ['UniverUIPlugin', 'UniverSheetsUIPlugin', 'UniverSheetsNumfmtUIPlugin', 'UniverSheetsFormulaUIPlugin'],
  docs: ['UniverUIPlugin', 'UniverDocsUIPlugin'],
  slides: ['UniverUIPlugin', 'UniverSlidesUIPlugin'],
  bases: ['UniverUIPlugin', 'UniverBasesUIPlugin'],
  boards: ['UniverUIPlugin', 'UniverBoardsUIPlugin'],
  pdfs: ['UniverUIPlugin', 'UniverPdfsUIPlugin'],
}
const productTypes: Record<Product, string> = {
  sheets: 'UNIVER_SHEET',
  docs: 'UNIVER_DOC',
  slides: 'UNIVER_SLIDE',
  bases: 'UNIVER_BASE',
  boards: 'UNIVER_BOARD',
  pdfs: 'UNIVER_PDF',
}
const presetFeatures = new Set([
  'sheets-filter',
  'sheets-sort',
  'sheets-data-validation',
  'sheets-conditional-formatting',
  'sheets-hyper-link',
  'sheets-note',
  'sheets-table',
  'sheets-thread-comment',
  'sheets-drawing',
  'sheets-find-replace',
  'docs-hyper-link',
  'docs-drawing',
  'docs-thread-comment',
])

function requiresLicense(name: string, visited = new Set<string>()): boolean {
  if (name === 'UniverLicensePlugin') return true
  if (visited.has(name)) return false
  visited.add(name)
  return plugins[name].dependencies.some((dependency) => requiresLicense(dependency, visited))
}

export function getFeatures(product: Product): IFeature[] {
  const groups = new Map<string, IFeature>()
  for (const [name, plugin] of Object.entries(plugins)) {
    if (name.includes('Mobile')) continue
    const shortName = plugin.package.split('/')[1]
    if (
      !shortName.startsWith(`${product}-`) ||
      [`${product}-ui`, 'sheets-numfmt', 'sheets-numfmt-ui', 'sheets-formula', 'sheets-formula-ui'].includes(shortName)
    )
      continue
    const id = shortName.replace(/-ui$/, '')
    const feature = groups.get(id) ?? {
      id,
      label: id.slice(product.length + 1),
      plugins: [],
      requiresLicense: false,
      ...(presetFeatures.has(id) ? { preset: id } : {}),
    }
    feature.plugins.push(name)
    feature.requiresLicense ||= requiresLicense(name)
    groups.set(id, feature)
  }
  const shared: [string, string[]][] = [
    ['collaboration', ['UniverCollaborationClientUIPlugin', ...(product === 'pdfs' ? ['UniverPdfEditorPlugin'] : [])]],
    ['network', ['UniverNetworkPlugin']],
    ['action-recorder', ['UniverActionRecorderPlugin']],
    ['web-component', ['UniverWebComponentAdapterPlugin']],
    ['vue-adapter', ['UniverVue3AdapterPlugin']],
    ...(product !== 'pdfs'
      ? ([
          ['watermark', ['UniverWatermarkPlugin']],
          ['embed', ['UniverEmbedUIPlugin']],
          ['resources', ['UniverResourcesUIPlugin']],
        ] as [string, string[]][])
      : []),
    ...(product === 'sheets'
      ? ([
          ['advanced-formula', ['UniverProFormulaEnginePlugin']],
          ['range-preprocess', ['UniverRangePreprocessPlugin']],
        ] as [string, string[]][])
      : []),
    ...(product !== 'pdfs'
      ? ([
          ['comment-storage', ['UniverThreadCommentResourcePlugin']],
          ['comment-server', ['UniverThreadCommentDataSourcePlugin']],
        ] as [string, string[]][])
      : []),
  ]
  for (const [id, roots] of shared) {
    if (groups.has(`${product}-${id}`)) continue
    groups.set(id, {
      id,
      label: id,
      plugins: roots,
      requiresLicense: roots.some((name) => requiresLicense(name)),
    })
  }
  return [...groups.values()]
}

export function resolvePlugins(options: IGeneratorOptions): string[] {
  const features = getFeatures(options.product)
  const selected = options.features.map((id) => {
    const feature = features.find((item) => item.id === id)
    if (!feature) throw new Error(`Unsupported feature: ${id}`)
    if (options.mobile && feature.plugins.some((name) => name.includes('UI') && !plugins[name].mobile))
      throw new Error(`${id} does not support mobile mode`)
    return feature
  })
  const roots = [...basePlugins[options.product], ...selected.flatMap((feature) => feature.plugins)]
  if (selected.some((feature) => feature.id === 'comment-server')) roots.push('UniverCollaborationClientUIPlugin')
  if (selected.some((feature) => feature.id === 'comment-storage' || feature.id === 'comment-server')) {
    const comments = features.find((feature) => feature.id === `${options.product}-thread-comment`)
    if (comments) roots.push(...comments.plugins)
  }
  if (selected.some((feature) => feature.id === 'embed') && selected.some((feature) => feature.id === 'collaboration'))
    roots.push('UniverCollaborationEmbedPlugin')
  const all = new Set<string>()
  const visit = (name: string) => {
    if (options.mobile && name !== 'UniverDocsUIPlugin') name = plugins[name]?.mobile ?? name
    if (all.has(name)) return
    const item = plugins[name]
    if (!item) throw new Error(`Unknown plugin dependency: ${name}`)
    all.add(name)
    item.dependencies.forEach(visit)
  }
  roots.forEach(visit)
  if (all.has('UniverCollaborationClientPlugin')) {
    roots.push('UniverCollaborationClientUIPlugin')
    visit('UniverCollaborationClientUIPlugin')
  }
  for (const name of all)
    if (!plugins[name].available) throw new Error(`${name} is not available in SDK ${SDK_VERSION}`)
  // The Pro formula engine replaces the core engine under the same plugin name.
  const canonical = (name: string) => {
    if (name === 'UniverFormulaEnginePlugin' && all.has('UniverProFormulaEnginePlugin'))
      return 'UniverProFormulaEnginePlugin'
    return options.mobile && name !== 'UniverDocsUIPlugin' ? (plugins[name]?.mobile ?? name) : name
  }
  const ordered: string[] = []
  const visited = new Set<string>()
  const order = (raw: string) => {
    const name = canonical(raw)
    if (visited.has(name)) return
    visited.add(name)
    plugins[name].dependencies.forEach(order)
    ordered.push(name)
  }
  roots.forEach(order)
  return ordered
}

export function getFeatureAvailability(feature: IFeature, options: IGeneratorOptions): 'version' | 'mobile' | null {
  if (options.mobile && feature.plugins.some((name) => name.includes('UI') && !plugins[name].mobile)) return 'mobile'
  try {
    resolvePlugins({ ...options, features: [feature.id] })
    return null
  } catch {
    return 'version'
  }
}

export function getProjectRequirements(options: IGeneratorOptions) {
  const names = resolvePlugins(options)
  return {
    license: names.includes('UniverLicensePlugin'),
    collaboration: names.includes('UniverCollaborationClientPlugin'),
    exchange: names.some((name) => name.startsWith('UniverExchangeClient')),
    history: names.includes('UniverEditHistoryPlugin'),
  }
}

export function generateProject(options: IGeneratorOptions): Record<string, string> {
  if (!PRODUCTS.includes(options.product) || !SDK_LOCALES.includes(options.locale))
    throw new Error('Unsupported product or locale')
  if (options.mode === 'preset' && !['sheets', 'docs'].includes(options.product))
    throw new Error('Presets are available for Sheets and Docs')
  if (options.mobile && (options.mode !== 'plugin' || options.product !== 'sheets'))
    throw new Error('This SDK version supports mobile generation for Sheets plugin mode')
  const names = resolvePlugins(options)
  const requirements = getProjectRequirements(options)
  const selectedFeatures = getFeatures(options.product).filter((feature) => options.features.includes(feature.id))
  const loadMethod = {
    sheets: 'loadSheetAsync',
    docs: 'loadDocAsync',
    bases: 'loadBaseAsync',
    slides: 'loadSlideAsync',
    boards: 'loadBoardAsync',
    pdfs: 'loadPdfAsync',
  }[options.product]
  const locale = options.locale.replace('-', '_').toUpperCase()
  const imports: string[] = []
  const styles = new Set<string>()
  const locales: string[] = []
  const dependencies: Record<string, string> = { react: '19.3.0', 'react-dom': '19.3.0', rxjs: '7.8.2' }
  const config: Record<string, string> = {
    UniverUIPlugin: '{ container }',
    UniverMobileUIPlugin: '{ container }',
    UniverLicensePlugin: '{ license: options.license }',
    UniverCollaborationClientPlugin: '{ socketService: BrowserCollaborationSocketService, ...options.collaboration }',
    UniverCollaborationClientUIPlugin: `{ enableDocumentCollaborationUI: ${['sheets', 'docs'].includes(options.product)} }`,
    UniverExchangeClientPlugin: 'options.exchange',
    UniverExchangeClientMobileUIPlugin: 'options.exchange',
    UniverEditHistoryPlugin: 'options.history',
  }
  const addLocale = (pkg: string, directory: 'locale' | 'locales') => {
    const name = `${pkg
      .split('/')[1]
      .split('-')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join('')}Locale`
    imports.push(`import ${name} from '${pkg}/${directory}/${options.locale}'`)
    locales.push(name)
  }
  const addAssets = (pkg: string, metadata: IPlugin) => {
    dependencies[pkg] = SDK_VERSION
    if (metadata.locale) addLocale(pkg, 'locale')
    if (metadata.css) styles.add(`import '${pkg}/lib/index.css'`)
    if (metadata.facade) imports.push(`import '${pkg}/facade'`)
  }
  const addPlugins = (pluginNames: string[]) => {
    const added = new Set<string>()
    for (const name of pluginNames) {
      const item = plugins[name]
      imports.push(
        `import { ${name}${requirements.collaboration && name === 'UniverCollaborationClientUIPlugin' ? ', BrowserCollaborationSocketService' : ''} } from '${item.package}'`,
      )
      if (!added.has(item.package)) {
        added.add(item.package)
        addAssets(item.package, item)
      }
    }
  }
  let initialization: string
  if (options.mode === 'plugin') {
    dependencies['@univerjs/core'] = SDK_VERSION
    imports.push(
      `import { Univer, UniverInstanceType, LocaleType, mergeLocales${requirements.collaboration ? ', IAuthzIoService, IMentionIOService, IUndoRedoService' : ''} } from '@univerjs/core'`,
      "import { FUniver } from '@univerjs/core/facade'",
    )
    addAssets('@univerjs/design', { package: '@univerjs/design', dependencies: [], locale: true, css: true })
    addPlugins(names)
    const register = names
      .map((name) => `  univer.registerPlugin(${name}${config[name] ? `, ${config[name]}` : ''})`)
      .join('\n')
    initialization = `  const univer = new Univer({\n    locale: LocaleType.${locale},\n    locales: {\n      [LocaleType.${locale}]: mergeLocales(\n        ${locales.join(',\n        ')},\n      ),\n    },\n${requirements.collaboration ? '    override: [[IUndoRedoService, null], [IAuthzIoService, null], [IMentionIOService, null]],\n' : ''}  })\n${register}\n  const univerAPI = FUniver.newAPI(univer)\n${requirements.collaboration ? `  // Load an existing server document by its Unit ID.\n  const ready = univerAPI.getCollaboration().${loadMethod}(options.unitId)` : `  univer.createUnit(UniverInstanceType.${productTypes[options.product]}, options.snapshot ?? {})`}`
  } else {
    dependencies['@univerjs/presets'] = SDK_VERSION
    imports.push("import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'")
    const selectedPresets = selectedFeatures.filter((feature) => feature.preset)
    const covered = new Set([
      ...resolvePlugins({ ...options, features: selectedPresets.map((feature) => feature.id) }),
      'UniverNetworkPlugin',
      'UniverFormulaEnginePlugin',
    ])
    const additional = names.filter((name) => !covered.has(name))
    const replaceFormula = additional.includes('UniverProFormulaEnginePlugin')
    const presets = [`${options.product}-core`, ...selectedPresets.map((feature) => feature.preset!)].map(
      (name, index) => {
        const pkg = `@univerjs/preset-${name}`
        const factory = `Univer${name
          .split('-')
          .map((word) => word[0].toUpperCase() + word.slice(1))
          .join('')}Preset`
        dependencies[pkg] = SDK_VERSION
        imports.push(`import { ${factory} } from '${pkg}'`)
        addLocale(pkg, 'locales')
        styles.add(`import '${pkg}/lib/index.css'`)
        const presetConfig =
          index === 0
            ? '{ container }'
            : requirements.collaboration && name.endsWith('-drawing')
              ? '{ collaboration: true }'
              : ''
        return `${factory}(${presetConfig})`
      },
    )
    addPlugins(additional)
    let preparation = ''
    if (replaceFormula) {
      preparation = `  const corePreset = ${presets[0]}\n  corePreset.plugins = corePreset.plugins.filter((entry) => {\n    const plugin = Array.isArray(entry) ? entry[0] : entry\n    return plugin.pluginName !== UniverProFormulaEnginePlugin.pluginName\n  })\n  corePreset.plugins.unshift([UniverLicensePlugin, { license: options.license }], UniverProFormulaEnginePlugin)\n`
      presets[0] = 'corePreset'
    }
    const extra = additional
      .filter((name) => !replaceFormula || !['UniverLicensePlugin', 'UniverProFormulaEnginePlugin'].includes(name))
      .map((name) => (config[name] ? `[${name}, ${config[name]}]` : name))
    initialization = `${preparation}  const { univer, univerAPI } = createUniver({\n    locale: LocaleType.${locale},\n    locales: {\n      [LocaleType.${locale}]: mergeLocales(\n        ${locales.join(',\n        ')},\n      ),\n    },\n    presets: [\n      ${presets.join(',\n      ')},\n    ],\n${extra.length ? `    plugins: [\n      ${extra.join(',\n      ')},\n    ],\n` : ''}${requirements.collaboration ? '    collaboration: true,\n' : ''}  })\n${requirements.collaboration ? `  const ready = univerAPI.getCollaboration().${loadMethod}(options.unitId)` : `  univerAPI.${options.product === 'sheets' ? 'createWorkbook' : 'createDocument'}(options.snapshot ?? {})`}`
  }
  const guards = [
    ...(requirements.license
      ? ["  if (!options.license) throw new Error('Pass your Univer client license in options.license')"]
      : []),
    ...(requirements.collaboration
      ? [
          "  if (!options.collaboration || !options.unitId) throw new Error('Configure options.collaboration and a server-created options.unitId')",
        ]
      : []),
    ...(requirements.exchange
      ? ["  if (!options.exchange) throw new Error('Configure the Server SDK endpoints in options.exchange')"]
      : []),
    ...(requirements.history
      ? ["  if (!options.history) throw new Error('Configure options.history.historyServerUrl')"]
      : []),
  ].join('\n')
  const entry = `${imports.join('\n')}\n\n${[...styles].join('\n')}\n\nexport function mount(container, options = {}) {\n${guards}${guards ? '\n' : ''}${initialization}\n  return { univer, univerAPI, ${requirements.collaboration ? 'ready, ' : ''}dispose: () => univer.dispose() }\n}\n`
  const mountOptions = {
    ...(requirements.license ? { license: 'REPLACE_WITH_YOUR_CLIENT_LICENSE' } : {}),
    ...(requirements.collaboration
      ? {
          unitId: 'REPLACE_WITH_SERVER_UNIT_ID',
          collaboration: {
            snapshotServerUrl: 'http://localhost:8000/universer-api/snapshot',
            collabSubmitChangesetUrl: 'http://localhost:8000/universer-api/comb',
            collabWebSocketUrl: 'ws://localhost:8000/universer-api/comb/connect',
            wsSessionTicketUrl: 'http://localhost:8000/universer-api/user/session-ticket',
            authzUrl: 'http://localhost:8000/universer-api/authz',
          },
        }
      : {}),
    ...(requirements.exchange
      ? {
          exchange: {
            uploadFileServerUrl: 'http://localhost:8000/universer-api/file/upload',
            importServerUrl: 'http://localhost:8000/universer-api/exchange/import',
            exportServerUrl: 'http://localhost:8000/universer-api/exchange/export',
            getTaskServerUrl: 'http://localhost:8000/universer-api/exchange/task',
            downloadEndpointUrl: 'http://localhost:8000',
            signUrlServerUrl: 'http://localhost:8000/universer-api/file/sign-url',
          },
        }
      : {}),
    ...(requirements.history ? { history: { historyServerUrl: 'http://localhost:8000/universer-api/history' } } : {}),
  }
  const html = `<!doctype html>\n<html lang="${options.locale}">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Univer ${options.product}</title>\n  <style>html, body, #app { margin: 0; width: 100%; height: 100%; }</style>\n${options.umd ? '  <link rel="stylesheet" href="./dist/univer.css">\n' : ''}</head>\n<body>\n  <div id="app"></div>\n${options.umd ? '  <script src="./dist/univer.umd.js"></script>\n  <script>\n    const editor = UniverBundle.mount' : '  <script type="module">\n    import { mount } from \'./src/univer.js\'\n    const editor = mount'}(document.getElementById('app')${Object.keys(mountOptions).length ? `, ${JSON.stringify(mountOptions, null, 2)}` : ''})\n${requirements.collaboration ? '    editor.ready.catch(console.error)\n' : ''}  </script>\n</body>\n</html>\n`
  const files: Record<string, string> = {
    'README.md': `# Univer ${options.product}\n\nSDK: ${SDK_VERSION}\n\n\`\`\`sh\nnpm install\n${options.umd ? 'npm run build\n' : ''}npm run dev\n\`\`\`\n\n${options.umd ? 'Build output: `dist/univer.umd.js` and `dist/univer.css`. Load both files, then call `UniverBundle.mount(container, options)`. React and SDK dependencies are bundled.\n\n' : 'Edit `src/univer.js` to customize plugin configuration. Run `npm run build` for a production site.\n\n'}The returned editor exposes \`univer\`, \`univerAPI\`, and \`dispose()\`. ${requirements.collaboration ? 'Pass `options.unitId` to load a server document.' : 'Pass `options.snapshot` to open local data.'} Call \`dispose()\` when removing the editor.\n${requirements.license ? '\nReplace the client license placeholder in `index.html` with your own license.\n' : ''}${requirements.collaboration || requirements.exchange || requirements.history ? '\n## Server SDK integration\n\nThe endpoint URLs in `index.html` are placeholders. Implement the corresponding backend with Univer Server SDK and replace the URLs with your own routes. Configure authentication, CORS, and file storage in your application.\n\n- https://docs.univer.ai/en-US/server/collaboration/quick-start\n- https://docs.univer.ai/en-US/server/import-export\n' : ''}${requirements.collaboration ? '\nCreate the document on your backend and set `unitId`. `editor.ready` resolves when the document loads; local empty snapshots do not join collaboration.\n' : ''}`,

    'package.json': `${JSON.stringify({ name: `univer-${options.product}-starter`, private: true, type: 'module', scripts: { dev: 'vite --host 127.0.0.1', build: 'vite build', ...(options.umd ? {} : { preview: 'vite preview --host 127.0.0.1' }) }, dependencies, devDependencies: { vite: '8.3.0' } }, null, 2)}\n`,
    'src/univer.js': entry,
    'index.html': html,
    'vite.config.js': `import { defineConfig } from 'vite'\n\nexport default defineConfig({\n  define: { 'process.env.NODE_ENV': JSON.stringify('production') },\n${options.umd ? "  build: {\n    lib: { entry: 'src/univer.js', name: 'UniverBundle', formats: ['umd'], fileName: () => 'univer.umd.js', cssFileName: 'univer' },\n  },\n" : ''}})\n`,
  }
  return files
}

export function createProjectScript(files: Record<string, string>) {
  return `import { mkdir, writeFile } from 'node:fs/promises'\nimport { dirname, join } from 'node:path'\n\nconst directory = 'univer-starter'\nconst files = ${JSON.stringify(files, null, 2)}\nawait mkdir(directory) // Refuse to overwrite an existing project.\nfor (const [name, content] of Object.entries(files)) {\n  const path = join(directory, name)\n  await mkdir(dirname(path), { recursive: true })\n  await writeFile(path, content, { flag: 'wx' })\n}\nconsole.log('Created univer-starter. Run: cd univer-starter && npm install && npm run build')\n`
}
