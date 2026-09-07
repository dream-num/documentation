import type { ShowcaseCategory, ShowcaseMetadata } from './types'
import { localize, PRODUCT_IDS, type ProductId } from './types'

export const PRODUCT_CONFIG: Record<
  ProductId,
  {
    label: Record<string, string>
    color: string
  }
> = {
  sheets: { label: { 'en-US': 'Sheets', 'zh-CN': '电子表格' }, color: 'emerald' },
  'docs-modern': { label: { 'en-US': 'Modern Docs', 'zh-CN': '现代文档' }, color: 'blue' },
  'docs-traditional': { label: { 'en-US': 'Traditional Docs', 'zh-CN': '传统文档' }, color: 'indigo' },
  slides: { label: { 'en-US': 'Slides', 'zh-CN': '演示文稿' }, color: 'rose' },
  boards: { label: { 'en-US': 'Boards', 'zh-CN': '白板' }, color: 'amber' },
  bases: { label: { 'en-US': 'Bases', 'zh-CN': '多维表格' }, color: 'violet' },
  pdfs: { label: { 'en-US': 'PDFs', 'zh-CN': 'PDF' }, color: 'red' },
  embed: { label: { 'en-US': 'Embed', 'zh-CN': '嵌入集成' }, color: 'cyan' },
}

export const CATEGORY_LABELS: Record<ShowcaseCategory, Record<string, string>> = {
  features: { 'en-US': 'Features', 'zh-CN': '功能' },
  showcases: { 'en-US': 'Showcases', 'zh-CN': '综合案例' },
  integrations: { 'en-US': 'Integrations', 'zh-CN': '集成' },
}

const integrationSlugs = /(?:via-|\blit\b|\bnode\b|mobile|collaboration|import-export|migrate|embed)/

export interface ShowcaseCatalogItem {
  image?: string
  slug: string
  title: string
  description: string
  tags: string[]
  searchText: string
  product: ProductId
  productName: string
  category: ShowcaseCategory
  group: string
  index: number
}

export function resolveProduct(slug: string, metadata: ShowcaseMetadata): ProductId {
  if (metadata.product) return metadata.product
  const root = slug.split('/')[0]
  if (root === 'docs') return 'docs-modern'
  return PRODUCT_IDS.includes(root as ProductId) ? (root as ProductId) : 'embed'
}

export function resolveCategory(slug: string, metadata: ShowcaseMetadata): ShowcaseCategory {
  return metadata.category ?? (integrationSlugs.test(slug) ? 'integrations' : 'features')
}

function inferGroup(slug: string, category: ShowcaseCategory) {
  if (category === 'integrations') return { 'en-US': 'Frameworks and delivery', 'zh-CN': '框架与交付' }
  if (/big-data|cross-workbook/.test(slug)) return { 'en-US': 'Scale and calculation', 'zh-CN': '规模与计算' }
  if (/custom-|watermark|header|crosshair|hide-headers/.test(slug)) return { 'en-US': 'Customization', 'zh-CN': '定制' }
  if (/chart|shape|image|outline/.test(slug)) return { 'en-US': 'Visual content', 'zh-CN': '可视内容' }
  if (/permission|read-only/.test(slug)) return { 'en-US': 'Security', 'zh-CN': '安全' }
  if (/print|export|import|csv/.test(slug)) return { 'en-US': 'Files and output', 'zh-CN': '文件与输出' }
  return { 'en-US': 'Core editing', 'zh-CN': '核心编辑' }
}

export function createCatalogItem(
  slug: string,
  metadata: ShowcaseMetadata,
  locale: string,
  index: number,
): ShowcaseCatalogItem {
  const category = resolveCategory(slug, metadata)
  const title = localize(metadata.title, locale, slug)
  const description = localize(metadata.description, locale, '')
  const tags = localize(metadata.tags, locale, [])
  const group = localize(metadata.group ?? inferGroup(slug, category), locale, '')

  return {
    image: metadata.image,
    slug,
    title,
    description,
    tags,
    searchText: [
      ...Object.values(metadata.title),
      ...Object.values(metadata.description),
      ...Object.values(metadata.tags).flat(),
      ...Object.values(metadata.group ?? {}),
    ]
      .join(' ')
      .toLocaleLowerCase(),
    product: resolveProduct(slug, metadata),
    productName: productLabel(resolveProduct(slug, metadata), locale),
    category,
    group,
    index,
  }
}

export function productLabel(product: ProductId, locale: string) {
  return localize<string>(PRODUCT_CONFIG[product].label, locale, product)
}

export function categoryLabel(category: ShowcaseCategory, locale: string) {
  return localize<string>(CATEGORY_LABELS[category], locale, category)
}
