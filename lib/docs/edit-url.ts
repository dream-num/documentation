const branchByCollection = {
  guides: 'dev',
  reference: 'v1',
  icons: 'dev',
  blog: 'dev',
} as const

export type DocsCollection = keyof typeof branchByCollection

export function getDocsEditUrl(collection: DocsCollection, path: string) {
  const branch = branchByCollection[collection]
  return `https://github.com/dream-num/univer-documentation/tree/${branch}/content/${collection}/${path}`
}
