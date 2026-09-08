import type { ShowcaseMetadata } from './types'
import {
  directoryPlacement,
  DIRECTORY_LABELS,
  integrationProductFor,
  type IntegrationProduct,
  type DirectoryCategory,
  type SectionId,
} from './directory'
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
  boards: { label: { 'en-US': 'Canvases', 'zh-CN': 'Canvases' }, color: 'amber' },
  bases: { label: { 'en-US': 'Relational Tables', 'zh-CN': 'Relational Tables' }, color: 'violet' },
  pdfs: { label: { 'en-US': 'PDFs', 'zh-CN': 'PDF' }, color: 'red' },
  embed: { label: { 'en-US': 'Compose & Embed', 'zh-CN': '组合与嵌套' }, color: 'cyan' },
}

export interface ShowcaseCatalogItem {
  image?: string
  slug: string
  title: string
  description: string
  tags: string[]
  searchText: string
  product: ProductId
  productName: string
  section: SectionId
  sectionName: string
  integrationProduct?: IntegrationProduct
  integrationProductName?: string
  composition?: ReturnType<typeof directoryPlacement>['composition']
  host?: string
  category: DirectoryCategory
  group: string
  index: number
}

export function resolveProduct(slug: string, metadata: ShowcaseMetadata): ProductId {
  if (metadata.product) return metadata.product
  const root = slug.split('/')[0]
  if (root === 'docs') return 'docs-modern'
  return PRODUCT_IDS.includes(root as ProductId) ? (root as ProductId) : 'embed'
}

export function createCatalogItem(
  slug: string,
  metadata: ShowcaseMetadata,
  locale: string,
  index: number,
): ShowcaseCatalogItem {
  const product = resolveProduct(slug, metadata)
  const placement = directoryPlacement(slug, metadata, product)
  const { section, category, composition } = placement
  const integrationProduct = section === 'customization-integration' ? integrationProductFor(slug, product) : undefined
  const storyTitle = localize(metadata.title, locale, slug)
  const readableProduct = (id: string) =>
    id === 'charts' ? (locale === 'zh-CN' ? '图表' : 'Charts') : productLabel(id as ProductId, locale)
  const title =
    category === 'cross-file-formulas' && composition
      ? `${composition.sources.map(readableProduct).join(' + ')} → ${(composition.targets.length ? composition.targets : [composition.container]).map(readableProduct).join(' + ')} · ${storyTitle}`
      : storyTitle
  const description = localize(metadata.description, locale, '')
  const tags = localize(metadata.tags, locale, [])
  const group = localize(placement.group, locale, '')

  return {
    image: metadata.image,
    slug,
    title,
    description,
    tags,
    searchText: [
      title,
      ...Object.values(metadata.title),
      ...Object.values(metadata.description),
      ...Object.values(metadata.tags).flat(),
      ...Object.values(placement.group),
      ...Object.values(DIRECTORY_LABELS[category]),
      sectionLabel(section, locale),
      integrationProduct ? integrationProductLabel(integrationProduct, locale) : '',
      ...(composition ? [composition.container, ...composition.sources, ...composition.targets, composition.mode] : []),
    ]
      .join(' ')
      .toLocaleLowerCase(),
    product: resolveProduct(slug, metadata),
    productName: productLabel(resolveProduct(slug, metadata), locale),
    section,
    sectionName: sectionLabel(section, locale),
    integrationProduct,
    integrationProductName: integrationProduct ? integrationProductLabel(integrationProduct, locale) : undefined,
    composition,
    host: placement.host,
    category,
    group,
    index,
  }
}

export function productLabel(product: ProductId, locale: string) {
  return localize<string>(PRODUCT_CONFIG[product].label, locale, product)
}

export function categoryLabel(category: DirectoryCategory, locale: string) {
  return localize<string>(DIRECTORY_LABELS[category], locale, category)
}

export function sectionLabel(section: SectionId, locale: string) {
  return section === 'customization-integration'
    ? localize({ 'en-US': 'Customization & Integration', 'zh-CN': '定制化与系统接入' }, locale, section)
    : productLabel(section, locale)
}

export function integrationProductLabel(product: IntegrationProduct, locale: string) {
  return product === 'cross-product'
    ? localize({ 'en-US': 'Cross-product', 'zh-CN': '综合（跨产品）' }, locale, product)
    : productLabel(product, locale)
}
