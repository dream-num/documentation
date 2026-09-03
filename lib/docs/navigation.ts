import type { ReactNode } from 'react'

export interface IDocsNavItem {
  id: string
  type: 'page' | 'folder' | 'link' | 'separator'
  name: string
  url?: string
  icon?: ReactNode
  external?: boolean
  children: IDocsNavItem[]
}

export interface IDocsNavigation {
  items: IDocsNavItem[]
  flatPages: IDocsNavItem[]
  activeTrail: IDocsNavItem[]
  previous?: IDocsNavItem
  next?: IDocsNavItem
}

interface IPageTreeNode {
  type?: string
  name?: ReactNode
  url?: string
  icon?: ReactNode
  external?: boolean
  children?: IPageTreeNode[]
  index?: IPageTreeNode
  $id?: string
}

function getNodeId(node: IPageTreeNode) {
  const id = node.$id ?? node.url ?? (typeof node.name === 'string' ? node.name : undefined)
  if (!id) {
    throw new Error(`Unable to derive stable docs navigation key for node type: ${node.type}`)
  }
  return id
}

function getNodeName(node: IPageTreeNode) {
  return typeof node.name === 'string' ? node.name : 'Untitled'
}

function normalizeNode(node: IPageTreeNode): IDocsNavItem {
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

function getRootItems(pageTree: IPageTreeNode | IPageTreeNode[]) {
  if (Array.isArray(pageTree)) {
    return pageTree
  }
  return pageTree.children ?? []
}

function flattenPages(items: IDocsNavItem[]): IDocsNavItem[] {
  return items.flatMap((item) => {
    if (item.type === 'page' && item.url) {
      return [item]
    }
    return flattenPages(item.children)
  })
}

function findTrail(items: IDocsNavItem[], pathname: string, trail: IDocsNavItem[] = []): IDocsNavItem[] {
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

export function createDocsNavigation(pageTree: IPageTreeNode | IPageTreeNode[], pathname: string): IDocsNavigation {
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
