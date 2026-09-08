import type { Localized, ProductId, ShowcaseMetadata } from './types'
import { localize, PRODUCT_IDS } from './types'

export const SECTION_IDS = [...PRODUCT_IDS, 'customization-integration'] as const
export type SectionId = (typeof SECTION_IDS)[number]

// Navigation aliases only; metadata, documentation and SDK locales retain product names.
export function treeLabel(value: string) {
  return value
    .replace(/^(?:Boards|白板)(?=$| as Host| 作为宿主)/, 'Canvases')
    .replace(/^(?:Bases|多维表格)(?=$| as Host| 作为宿主)/, 'Relational Tables')
}
export const INTEGRATION_PRODUCT_IDS = [
  'sheets',
  'docs-modern',
  'docs-traditional',
  'slides',
  'boards',
  'bases',
  'pdfs',
  'cross-product',
] as const
export type IntegrationProduct = (typeof INTEGRATION_PRODUCT_IDS)[number]

export function integrationProductFor(slug: string, product: ProductId): IntegrationProduct {
  if (
    [
      'embed/crm-quote-calculator',
      'embed/mount-dispose-remount',
      'embed/lazy-load-editor',
      'embed/multiple-isolated-instances',
      'embed/univer-events-to-host',
    ].includes(slug)
  )
    return 'sheets'
  return product === 'embed' ? 'cross-product' : product
}
export type DirectoryCategory =
  | 'features'
  | 'showcases'
  | 'performance'
  | 'product-embedding'
  | 'cross-file-formulas'
  | 'customization'
  | 'integrations'
export const HOST_IDS = ['sheets', 'docs-modern', 'docs-traditional', 'slides', 'boards', 'bases'] as const

const label = (en: string, zh: string): Localized<string> => ({ 'en-US': en, 'zh-CN': zh })
export const DIRECTORY_LABELS: Record<DirectoryCategory, Localized<string>> = {
  features: label('Features', '功能'),
  showcases: label('Showcases', '综合案例'),
  performance: label('Performance', '性能'),
  'product-embedding': label('Product Embedding', '产品嵌套'),
  'cross-file-formulas': label('Cross-file Formula References', '跨文件公式引用'),
  customization: label('Customization', '定制化'),
  integrations: label('Integration', '系统接入'),
}
export const HOST_LABELS: Record<string, Localized<string>> = {
  sheets: label('Sheets as Host', 'Sheets 作为宿主'),
  'docs-modern': label('Modern Docs as Host', '现代文档作为宿主'),
  'docs-traditional': label('Traditional Docs as Host', '传统文档作为宿主'),
  slides: label('Slides as Host', 'Slides 作为宿主'),
  boards: label('Boards as Host', 'Boards 作为宿主'),
  bases: label('Bases as Host', 'Bases 作为宿主'),
}
const GROUPS = {
  appearance: label('UI & Appearance', '界面与外观'),
  commands: label('Commands & Shortcuts', '命令与快捷键'),
  extensions: label('Rendering & Extensions', '渲染与扩展'),
  frameworks: label('Getting Started & Frameworks', '入门与框架'),
  lifecycle: label('Lifecycle & Performance', '生命周期与性能'),
  events: label('Host Events & Data Exchange', '宿主事件与数据交换'),
  applications: label('Application Scenarios', '应用场景'),
  samples: label('Large Samples', '大型样张'),
  benchmarks: label('Benchmarks', '性能基准'),
  memory: label('Lifecycle & Memory', '生命周期与内存'),
}
interface Composition {
  container: ProductId
  mode: string
  sources: string[]
  targets: string[]
  child: string
}
// Reviewed navigation relationships, separate from acceptance/status evidence.
// Host always means the outer editor, including cross-file formula examples.
export const COMPOSITIONS: Record<string, Composition> = {
  'embed/slides-in-sheets-float': { container: 'sheets', mode: 'float', sources: [], targets: [], child: 'slides' },
  'embed/slides-in-sheets-tab': { container: 'sheets', mode: 'tab', sources: [], targets: [], child: 'slides' },
  'embed/docs-in-sheets-float': { container: 'sheets', mode: 'float', sources: [], targets: [], child: 'docs-modern' },
  'embed/docs-in-sheets-tab': { container: 'sheets', mode: 'tab', sources: [], targets: [], child: 'docs-modern' },
  'embed/bases-in-sheets-float': { container: 'sheets', mode: 'float', sources: [], targets: [], child: 'bases' },
  'embed/bases-in-sheets-tab': { container: 'sheets', mode: 'tab', sources: [], targets: [], child: 'bases' },
  'embed/boards-in-sheets-float': { container: 'sheets', mode: 'float', sources: [], targets: [], child: 'boards' },
  'embed/boards-in-sheets-tab': { container: 'sheets', mode: 'tab', sources: [], targets: [], child: 'boards' },
  'embed/sheets-in-docs-block': { container: 'docs-modern', mode: 'block', sources: [], targets: [], child: 'sheets' },
  'embed/bases-in-docs-block': { container: 'docs-modern', mode: 'block', sources: [], targets: [], child: 'bases' },
  'embed/slides-in-docs-block': { container: 'docs-modern', mode: 'block', sources: [], targets: [], child: 'slides' },
  'embed/boards-in-docs-block': { container: 'docs-modern', mode: 'block', sources: [], targets: [], child: 'boards' },
  'embed/sheets-in-slides-float': { container: 'slides', mode: 'float', sources: [], targets: [], child: 'sheets' },
  'embed/sheets-in-slides-tab': { container: 'slides', mode: 'tab', sources: [], targets: [], child: 'sheets' },
  'embed/bases-in-slides-float': { container: 'slides', mode: 'float', sources: [], targets: [], child: 'bases' },
  'embed/bases-in-slides-tab': { container: 'slides', mode: 'tab', sources: [], targets: [], child: 'bases' },
  'embed/docs-in-slides-float': { container: 'slides', mode: 'float', sources: [], targets: [], child: 'docs-modern' },
  'embed/docs-in-slides-tab': { container: 'slides', mode: 'tab', sources: [], targets: [], child: 'docs-modern' },
  'embed/boards-in-slides-float': { container: 'slides', mode: 'float', sources: [], targets: [], child: 'boards' },
  'embed/boards-in-slides-tab': { container: 'slides', mode: 'tab', sources: [], targets: [], child: 'boards' },
  'embed/sheets-in-bases-tab': { container: 'bases', mode: 'tab', sources: [], targets: [], child: 'sheets' },
  'embed/docs-in-bases-tab': { container: 'bases', mode: 'tab', sources: [], targets: [], child: 'docs-modern' },
  'embed/slides-in-bases-tab': { container: 'bases', mode: 'tab', sources: [], targets: [], child: 'slides' },
  'embed/boards-in-bases-tab': { container: 'bases', mode: 'tab', sources: [], targets: [], child: 'boards' },
  'embed/sheets-in-boards-float': { container: 'boards', mode: 'float', sources: [], targets: [], child: 'sheets' },
  'embed/docs-in-boards-float': { container: 'boards', mode: 'float', sources: [], targets: [], child: 'docs-modern' },
  'embed/slides-in-boards-float': { container: 'boards', mode: 'float', sources: [], targets: [], child: 'slides' },
  'embed/bases-in-boards-float': { container: 'boards', mode: 'float', sources: [], targets: [], child: 'bases' },
  'embed/sheets-in-traditional-docs-block': {
    container: 'docs-traditional',
    mode: 'block',
    sources: [],
    targets: [],
    child: 'sheets',
  },
  'embed/bases-in-traditional-docs-block': {
    container: 'docs-traditional',
    mode: 'block',
    sources: [],
    targets: [],
    child: 'bases',
  },
  'embed/slides-in-traditional-docs-block': {
    container: 'docs-traditional',
    mode: 'block',
    sources: [],
    targets: [],
    child: 'slides',
  },
  'embed/boards-in-traditional-docs-block': {
    container: 'docs-traditional',
    mode: 'block',
    sources: [],
    targets: [],
    child: 'boards',
  },
  'embed/mixed-in-sheets': { container: 'sheets', mode: 'mixed', sources: [], targets: [], child: 'mixed' },
  'embed/mixed-in-docs-modern': { container: 'docs-modern', mode: 'mixed', sources: [], targets: [], child: 'mixed' },
  'embed/mixed-in-docs-traditional': {
    container: 'docs-traditional',
    mode: 'mixed',
    sources: [],
    targets: [],
    child: 'mixed',
  },
  'embed/mixed-in-slides': { container: 'slides', mode: 'mixed', sources: [], targets: [], child: 'mixed' },
  'embed/mixed-in-bases': { container: 'bases', mode: 'mixed', sources: [], targets: [], child: 'mixed' },
  'embed/mixed-in-boards': { container: 'boards', mode: 'mixed', sources: [], targets: [], child: 'mixed' },
  'embed/formula-shape': {
    container: 'slides',
    mode: 'formula-shape',
    sources: ['sheets', 'bases'],
    targets: [],
    child: 'sheets+bases',
  },
  'embed/formula-customrange': {
    container: 'docs-modern',
    mode: 'formula-customrange',
    sources: ['sheets', 'bases'],
    targets: [],
    child: 'sheets+bases',
  },
  'embed/sheet-to-modern-doc': {
    container: 'docs-modern',
    mode: 'formula-inline-formula',
    sources: ['sheets'],
    targets: ['docs-modern'],
    child: 'sheets',
  },
  'embed/base-to-modern-doc': {
    container: 'docs-modern',
    mode: 'formula-inline-formula',
    sources: ['bases'],
    targets: ['docs-modern'],
    child: 'bases',
  },
  'embed/sheet-to-traditional-doc': {
    container: 'docs-traditional',
    mode: 'formula-inline-formula',
    sources: ['sheets'],
    targets: ['docs-traditional'],
    child: 'sheets',
  },
  'embed/base-to-traditional-doc': {
    container: 'docs-traditional',
    mode: 'formula-inline-formula',
    sources: ['bases'],
    targets: ['docs-traditional'],
    child: 'bases',
  },
  'embed/mixed-to-traditional-doc': {
    container: 'docs-traditional',
    mode: 'formula-inline-formula',
    sources: ['sheets', 'bases'],
    targets: ['docs-traditional'],
    child: 'sheets+bases',
  },
  'embed/sheet-to-slides-float': {
    container: 'slides',
    mode: 'formula-formula-shape',
    sources: ['sheets'],
    targets: ['slides'],
    child: 'sheets',
  },
  'embed/base-to-slides-float': {
    container: 'slides',
    mode: 'formula-formula-shape',
    sources: ['bases'],
    targets: ['slides'],
    child: 'bases',
  },
  'embed/sheet-to-boards-float': {
    container: 'boards',
    mode: 'formula-formula-shape',
    sources: ['sheets'],
    targets: ['boards'],
    child: 'sheets',
  },
  'embed/base-to-boards-float': {
    container: 'boards',
    mode: 'formula-formula-shape',
    sources: ['bases'],
    targets: ['boards'],
    child: 'bases',
  },
  'embed/mixed-to-boards': {
    container: 'boards',
    mode: 'formula-formula-shape',
    sources: ['sheets', 'bases'],
    targets: ['boards'],
    child: 'sheets+bases',
  },
  'embed/base-to-chart': {
    container: 'sheets',
    mode: 'formula-sheet-range-chart',
    sources: ['bases'],
    targets: ['charts'],
    child: 'bases',
  },
  'embed/mixed-to-chart': {
    container: 'sheets',
    mode: 'formula-sheet-range-chart',
    sources: ['sheets', 'bases'],
    targets: ['charts'],
    child: 'sheets+bases',
  },
  'embed/slides-in-sheets-formula-float': {
    container: 'sheets',
    mode: 'formula-formula-shape',
    sources: ['sheets'],
    targets: ['slides'],
    child: 'slides',
  },
  'embed/slides-in-sheets-formula-tab': {
    container: 'sheets',
    mode: 'formula-formula-shape',
    sources: ['sheets'],
    targets: ['slides'],
    child: 'slides',
  },
  'embed/slides-in-bases-formula-tab': {
    container: 'bases',
    mode: 'formula-formula-shape',
    sources: ['bases'],
    targets: ['slides'],
    child: 'slides',
  },
  'embed/docs-in-sheets-formula-float': {
    container: 'sheets',
    mode: 'formula-inline-formula',
    sources: ['sheets'],
    targets: ['docs-modern'],
    child: 'docs-modern',
  },
  'embed/docs-in-sheets-formula-tab': {
    container: 'sheets',
    mode: 'formula-inline-formula',
    sources: ['sheets'],
    targets: ['docs-modern'],
    child: 'docs-modern',
  },
  'embed/docs-in-bases-formula-tab': {
    container: 'bases',
    mode: 'formula-inline-formula',
    sources: ['bases'],
    targets: ['docs-modern'],
    child: 'docs-modern',
  },
  'embed/boards-in-sheets-formula-float': {
    container: 'sheets',
    mode: 'formula-formula-shape',
    sources: ['sheets'],
    targets: ['boards'],
    child: 'boards',
  },
  'embed/boards-in-sheets-formula-tab': {
    container: 'sheets',
    mode: 'formula-formula-shape',
    sources: ['sheets'],
    targets: ['boards'],
    child: 'boards',
  },
  'embed/boards-in-bases-formula-tab': {
    container: 'bases',
    mode: 'formula-formula-shape',
    sources: ['bases'],
    targets: ['boards'],
    child: 'boards',
  },
  'embed/sheet-to-slides-tab': {
    container: 'slides',
    mode: 'formula-formula-shape',
    sources: ['sheets'],
    targets: ['slides'],
    child: 'sheets',
  },
  'embed/base-to-slides-tab': {
    container: 'slides',
    mode: 'formula-formula-shape',
    sources: ['bases'],
    targets: ['slides'],
    child: 'bases',
  },
  'embed/sheet-to-many-products': {
    container: 'sheets',
    mode: 'formula-multi-output',
    sources: ['sheets'],
    targets: ['docs-modern', 'slides', 'boards', 'charts'],
    child: 'mixed',
  },
  'embed/mixed-to-many-products': {
    container: 'bases',
    mode: 'formula-multi-output',
    sources: ['sheets', 'bases'],
    targets: ['docs-modern', 'slides', 'boards', 'charts'],
    child: 'mixed',
  },
  'embed/base-sheet-calculation-chain': {
    container: 'sheets',
    mode: 'formula-calculation-chain',
    sources: ['bases', 'sheets'],
    targets: ['docs-modern', 'slides', 'boards', 'charts'],
    child: 'mixed',
  },
}

export function categoriesFor(section: SectionId): DirectoryCategory[] {
  if (section === 'embed') return ['product-embedding', 'cross-file-formulas', 'showcases']
  if (section === 'customization-integration') return ['customization', 'integrations']
  return ['features', 'showcases', 'performance']
}

export function directoryPlacement(slug: string, metadata: ShowcaseMetadata, product: ProductId) {
  const composition = COMPOSITIONS[slug]
  if (composition) {
    const formula = composition.mode.includes('formula')
    const multiOutput = composition.targets.length > 1
    const host = composition.container
    const category: DirectoryCategory =
      composition.mode === 'mixed' || multiOutput ? 'showcases' : formula ? 'cross-file-formulas' : 'product-embedding'
    return { section: 'embed' as SectionId, category, group: HOST_LABELS[host], composition, host }
  }
  let category: DirectoryCategory = metadata.category === 'showcases' ? 'showcases' : 'features'
  let section: SectionId = product
  let group = metadata.group ?? label('Core Editing', '基础编辑')
  if (['sheets/big-data', 'docs/big-data', 'docs-modern/long-document'].includes(slug)) {
    category = 'performance'
    group = GROUPS.samples
  } else if (
    /\/(custom-canvas|custom-header|custom-menu|custom-formula|custom-shortcuts|watermark|hide-headers)$/.test(slug) ||
    slug === 'sheets/permission'
  ) {
    section = 'customization-integration'
    category = 'customization'
    group = /custom-canvas|custom-formula/.test(slug)
      ? GROUPS.extensions
      : /custom-menu|custom-shortcuts/.test(slug)
        ? GROUPS.commands
        : GROUPS.appearance
  } else if (
    slug.startsWith('embed/') ||
    slug === 'sheets/custom-event' ||
    (metadata.category === 'integrations' && slug !== 'sheets/univer-pro-import-export') ||
    (!metadata.category && /via-|\/lit$/.test(slug))
  ) {
    section = 'customization-integration'
    category = 'integrations'
    group = /mount-dispose|lazy-load|multiple-isolated/.test(slug)
      ? GROUPS.lifecycle
      : /events-to-host|custom-event|migrate-from/.test(slug)
        ? GROUPS.events
        : /crm-|collaboration/.test(slug)
          ? GROUPS.applications
          : GROUPS.frameworks
  } else if (slug === 'sheets/univer-pro-import-export') {
    group = label('Files & Output', '文件与输出')
  }
  return { section, category, group, composition: undefined, host: undefined }
}

export function directoryGroups(section: SectionId, category: DirectoryCategory, existing: string[], locale: string) {
  let predefined: Localized<string>[] = []
  if (section === 'embed') predefined = HOST_IDS.map((host) => HOST_LABELS[host])
  else if (category === 'customization') predefined = [GROUPS.appearance, GROUPS.commands, GROUPS.extensions]
  else if (category === 'integrations')
    predefined = [GROUPS.frameworks, GROUPS.lifecycle, GROUPS.events, GROUPS.applications]
  else if (category === 'performance') predefined = [GROUPS.samples, GROUPS.benchmarks, GROUPS.memory]
  return [...new Set([...predefined.map((value) => localize(value, locale, '')), ...existing])]
}
