import type { ReactNode } from 'react'

export interface GuideNavItem {
  id: string
  type: 'page' | 'folder' | 'link' | 'separator'
  name: string
  description?: ReactNode
  url?: string
  icon?: ReactNode
  external?: boolean
  children: GuideNavItem[]
}

export interface GuideNavigation {
  items: GuideNavItem[]
  flatPages: GuideNavItem[]
  activeTrail: GuideNavItem[]
  previous?: GuideNavItem
  next?: GuideNavItem
}

interface PageTreeNode {
  type?: string
  name?: ReactNode
  description?: ReactNode
  url?: string
  icon?: ReactNode
  external?: boolean
  children?: PageTreeNode[]
  index?: PageTreeNode
  $id?: string
}

const guideProductSegments = ['sheets', 'docs', 'slides', 'boards', 'bases']
const guideStandaloneSegments = ['pro', 'recipes']

function getNodeId(node: PageTreeNode) {
  const id = node.$id ?? node.url ?? (typeof node.name === 'string' ? node.name : undefined)
  if (!id) {
    throw new Error(`Unable to derive stable Guides navigation key for node type: ${node.type}`)
  }
  return id
}

function getNodeName(node: PageTreeNode) {
  return typeof node.name === 'string' ? node.name : 'Untitled'
}

function normalizeNode(node: PageTreeNode): GuideNavItem {
  const id = getNodeId(node)

  if (node.type === 'page') {
    return {
      id,
      type: 'page',
      name: getNodeName(node),
      url: node.url,
      icon: node.icon,
      children: [],
    }
  }

  if (node.type === 'folder') {
    const children = [...(node.index ? [normalizeNode(node.index)] : []), ...(node.children ?? []).map(normalizeNode)]

    return {
      id,
      type: 'folder',
      name: getNodeName(node),
      description: node.description,
      url: node.index?.url,
      icon: node.icon,
      children,
    }
  }

  if (node.type === 'separator') {
    return {
      id,
      type: 'separator',
      name: typeof node.name === 'string' ? node.name : '',
      icon: node.icon,
      children: [],
    }
  }

  if (node.type === 'link') {
    return {
      id,
      type: 'link',
      name: getNodeName(node),
      url: node.url,
      icon: node.icon,
      external: node.external,
      children: [],
    }
  }

  throw new Error(`Unknown Guides page-tree node type: ${node.type}`)
}

function getRootItems(pageTree: PageTreeNode | PageTreeNode[]) {
  if (Array.isArray(pageTree)) {
    return pageTree
  }
  return pageTree.children ?? []
}

function flattenPages(items: GuideNavItem[]): GuideNavItem[] {
  return items.flatMap((item) => {
    if (item.type === 'page' && item.url) {
      return [item]
    }
    return flattenPages(item.children)
  })
}

function findTrail(items: GuideNavItem[], pathname: string, trail: GuideNavItem[] = []): GuideNavItem[] {
  for (const item of items) {
    const nextTrail = [...trail, item]
    if (item.url === pathname) {
      return nextTrail
    }

    const matched = findTrail(item.children, pathname, nextTrail)
    if (matched.length > 0) {
      return matched
    }
  }

  return []
}

export function isGuideNavItemActive(item: GuideNavItem, pathname: string): boolean {
  if (item.url === pathname) return true
  return item.children.some((child) => isGuideNavItemActive(child, pathname))
}

export function getGuideNavItemHref(item: GuideNavItem): string | undefined {
  if (item.url) return item.url

  for (const child of item.children) {
    const href = getGuideNavItemHref(child)
    if (href) return href
  }

  return undefined
}

function getGuideRootSegment(item: GuideNavItem): string | undefined {
  const href = getGuideNavItemHref(item)
  return href?.match(/^(?:\/[a-z]{2}(?:-[A-Z]{2})?)?\/guides\/([^/]+)/)?.[1]
}

export function getGuideProductItems(items: GuideNavItem[]): GuideNavItem[] {
  const productBySegment = new Map<string, GuideNavItem>()

  for (const item of items) {
    const segment = getGuideRootSegment(item)
    if (segment && guideProductSegments.includes(segment)) {
      productBySegment.set(segment, item)
    }
  }

  return guideProductSegments
    .map((segment) => productBySegment.get(segment))
    .filter((item): item is GuideNavItem => Boolean(item))
}

export function getActiveGuideProduct(items: GuideNavItem[], pathname: string): GuideNavItem | undefined {
  return getGuideProductItems(items).find((item) => isGuideNavItemActive(item, pathname))
}

export function getGuideStandaloneItems(items: GuideNavItem[]): GuideNavItem[] {
  const standaloneBySegment = new Map<string, GuideNavItem>()

  for (const item of items) {
    const segment = getGuideRootSegment(item)
    if (segment && guideStandaloneSegments.includes(segment)) {
      standaloneBySegment.set(segment, item)
    }
  }

  return guideStandaloneSegments
    .map((segment) => standaloneBySegment.get(segment))
    .filter((item): item is GuideNavItem => Boolean(item))
}

export function getActiveGuideStandaloneItem(items: GuideNavItem[], pathname: string): GuideNavItem | undefined {
  return getGuideStandaloneItems(items).find((item) => isGuideNavItemActive(item, pathname))
}

export function createGuideNavigation(pageTree: PageTreeNode | PageTreeNode[], pathname: string): GuideNavigation {
  const items = getRootItems(pageTree).map(normalizeNode)
  const flatPages = flattenPages(items)
  const activeTrail = findTrail(items, pathname)
  const activeIndex = flatPages.findIndex((item) => item.url === pathname)

  return {
    items,
    flatPages,
    activeTrail,
    previous: activeIndex > 0 ? flatPages[activeIndex - 1] : undefined,
    next: activeIndex >= 0 && activeIndex < flatPages.length - 1 ? flatPages[activeIndex + 1] : undefined,
  }
}
