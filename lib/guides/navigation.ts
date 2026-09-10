import type { ReactNode } from 'react'

export interface IGuideNavItem {
  id: string
  type: 'page' | 'folder' | 'link' | 'separator'
  name: string
  description?: ReactNode
  url?: string
  icon?: ReactNode
  external?: boolean
  children: IGuideNavItem[]
}

export interface IGuideNavigation {
  items: IGuideNavItem[]
  flatPages: IGuideNavItem[]
  activeTrail: IGuideNavItem[]
  previous?: IGuideNavItem
  next?: IGuideNavItem
}

interface IPageTreeNode {
  type?: string
  name?: ReactNode
  description?: ReactNode
  url?: string
  icon?: ReactNode
  external?: boolean
  children?: IPageTreeNode[]
  index?: IPageTreeNode
  $id?: string
}

const guideSdkSegments = ['guides', 'server', 'ai']

function getNodeId(node: IPageTreeNode) {
  const id = node.$id ?? node.url ?? (typeof node.name === 'string' ? node.name : undefined)
  if (!id) {
    throw new Error(`Unable to derive stable Guides navigation key for node type: ${node.type}`)
  }
  return id
}

function getNodeName(node: IPageTreeNode) {
  return typeof node.name === 'string' ? node.name : 'Untitled'
}

function normalizeNode(node: IPageTreeNode): IGuideNavItem {
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

function getRootItems(pageTree: IPageTreeNode | IPageTreeNode[]) {
  if (Array.isArray(pageTree)) {
    return pageTree
  }
  return pageTree.children ?? []
}

function flattenPages(items: IGuideNavItem[]): IGuideNavItem[] {
  return items.flatMap((item) => {
    if (item.type === 'page' && item.url) {
      return [item]
    }
    return flattenPages(item.children)
  })
}

function findTrail(items: IGuideNavItem[], pathname: string, trail: IGuideNavItem[] = []): IGuideNavItem[] {
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

export function isGuideNavItemActive(item: IGuideNavItem, pathname: string): boolean {
  if (item.url === pathname) return true
  return item.children.some((child) => isGuideNavItemActive(child, pathname))
}

export function getGuideNavItemHref(item: IGuideNavItem): string | undefined {
  if (item.url) return item.url

  for (const child of item.children) {
    const href = getGuideNavItemHref(child)
    if (href) return href
  }

  return undefined
}

function getGuideRootSegment(item: IGuideNavItem): string | undefined {
  const href = getGuideNavItemHref(item)
  return href?.match(/^(?:\/[a-z]{2}(?:-[A-Z]{2})?)?\/(guides|server|ai)(?:\/|$)/)?.[1]
}

export function getGuideSdkItems(items: IGuideNavItem[]): IGuideNavItem[] {
  const sdkBySegment = new Map<string, IGuideNavItem>()

  for (const item of items) {
    const segment = getGuideRootSegment(item)
    if (segment && guideSdkSegments.includes(segment)) {
      sdkBySegment.set(segment, item)
    }
  }

  return guideSdkSegments
    .map((segment) => sdkBySegment.get(segment))
    .filter((item): item is IGuideNavItem => Boolean(item))
}

export function getActiveGuideSdk(items: IGuideNavItem[], pathname: string): IGuideNavItem | undefined {
  return getGuideSdkItems(items).find((item) => isGuideNavItemActive(item, pathname))
}

export function getGuideProductItems(items: IGuideNavItem[]): IGuideNavItem[] {
  const web = getGuideSdkItems(items).find((item) => getGuideRootSegment(item) === 'guides')
  return (
    web?.children.filter((item) => {
      const href = getGuideNavItemHref(item)
      return item.type === 'folder' && /\/guides\/(sheets|docs|slides|boards|bases|pdfs|icons)(?:\/|$)/.test(href ?? '')
    }) ?? []
  )
}

export function getActiveGuideProduct(items: IGuideNavItem[], pathname: string) {
  return getGuideProductItems(items).find((item) => isGuideNavItemActive(item, pathname))
}

export function getGuideSidebarItems(items: IGuideNavItem[], pathname: string) {
  const product = getActiveGuideProduct(items, pathname)
  if (product) return product.children
  const sdk = getActiveGuideSdk(items, pathname)
  const products = getGuideProductItems(items)
  return sdk?.children.filter((item) => !products.includes(item)) ?? []
}

export function createGuideNavigation(pageTree: IPageTreeNode | IPageTreeNode[], pathname: string): IGuideNavigation {
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

export function createSdkPageTree(trees: Record<string, IPageTreeNode>[]) {
  return Object.fromEntries(
    Object.keys(trees[0]).map((locale) => [
      locale,
      {
        children: trees.map((tree, index) => ({
          ...tree[locale],
          $id: guideSdkSegments[index],
          type: 'folder',
          name: ['Web SDK', 'Server SDK', 'AI SDK'][index],
        })),
      },
    ]),
  )
}
