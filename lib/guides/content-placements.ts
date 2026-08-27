const guideContentPlacements = new Map([
  ['docs/ui/themes', 'fundamentals/ui/themes'],
  ['pdfs/ui/themes', 'fundamentals/ui/themes'],
  ['sheets/ui/themes', 'fundamentals/ui/themes'],
  ['slides/ui/themes', 'fundamentals/ui/themes'],
])

export function getGuideContentPlacementTarget(slug: string[] | undefined) {
  return slug ? guideContentPlacements.get(slug.join('/')) : undefined
}

export function getGuideContentPlacementTargetFromUrl(url: string) {
  const match = url.match(/^\/guides\/(.+)$/)
  return match ? guideContentPlacements.get(match[1]) : undefined
}

export function getGuideContentPlacementSlugs() {
  return [...guideContentPlacements.keys()].map((path) => path.split('/'))
}

export function resolveGuideContentSlug(slug: string[] | undefined) {
  const target = getGuideContentPlacementTarget(slug)
  return target ? target.split('/') : slug
}
