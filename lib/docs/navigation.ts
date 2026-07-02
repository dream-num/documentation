import type { ReactNode } from 'react'

export interface DocsNavItem {
  id: string
  type: 'page' | 'folder' | 'link' | 'separator'
  name: string
  url?: string
  icon?: ReactNode
  external?: boolean
  children: DocsNavItem[]
}

export interface DocsNavigation {
  items: DocsNavItem[]
  flatPages: DocsNavItem[]
  activeTrail: DocsNavItem[]
  previous?: DocsNavItem
  next?: DocsNavItem
}

interface PageTreeNode {
  type?: string
  name?: ReactNode
  url?: string
  icon?: ReactNode
  external?: boolean
  children?: PageTreeNode[]
  index?: PageTreeNode
  $id?: string
}

function getNodeId(node: PageTreeNode) {
  const id = node.$id ?? node.url ?? (typeof node.name === 'string' ? node.name : undefined)
  if (!id) {
    throw new Error(`Unable to derive stable docs navigation key for node type: ${node.type}`)
  }
  return id
}

function getNodeName(node: PageTreeNode) {
  return typeof node.name === 'string' ? node.name : 'Untitled'
}

function normalizeNode(node: PageTreeNode): DocsNavItem {
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
    const children = [
      ...(node.index ? [normalizeNode(node.index)] : []),
      ...(node.children ?? []).map(normalizeNode),
    ]

    return {
      id,
      type: 'folder',
      name: getNodeName(node),
      url: node.index?.url,
      icon: node.icon,
      children,
    }
  }

  if (node.type === 'separator') {
    return {
      id,
      type: 'separator',
      name: getNodeName(node),
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

  throw new Error(`Unknown docs page-tree node type: ${node.type}`)
}

function getRootItems(pageTree: PageTreeNode | PageTreeNode[]) {
  if (Array.isArray(pageTree)) {
    return pageTree
  }
  return pageTree.children ?? []
}

function flattenPages(items: DocsNavItem[]): DocsNavItem[] {
  return items.flatMap((item) => {
    if (item.type === 'page' && item.url) {
      return [item]
    }
    return flattenPages(item.children)
  })
}

function findTrail(
  items: DocsNavItem[],
  pathname: string,
  trail: DocsNavItem[] = [],
): DocsNavItem[] {
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

export function createDocsNavigation(
  pageTree: PageTreeNode | PageTreeNode[],
  pathname: string,
): DocsNavigation {
  const items = getRootItems(pageTree).map(normalizeNode)
  const flatPages = flattenPages(items)
  const activeTrail = findTrail(items, pathname)
  const activeIndex = flatPages.findIndex(item => item.url === pathname)

  return {
    items,
    flatPages,
    activeTrail,
    previous: activeIndex > 0 ? flatPages[activeIndex - 1] : undefined,
    next: activeIndex >= 0 && activeIndex < flatPages.length - 1
      ? flatPages[activeIndex + 1]
      : undefined,
  }
}
