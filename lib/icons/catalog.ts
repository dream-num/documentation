import catalog from '../../public/assets/icons/catalog.json' with { type: 'json' }

export function searchIcons(query: string, group = 'all', subgroup = 'all') {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  return catalog.icons.filter((icon) => {
    if (group !== 'all' && icon.group !== group) return false
    if (subgroup !== 'all' && icon.subgroup !== subgroup) return false
    const text = [
      icon.componentName,
      icon.name,
      icon.description,
      icon.category,
      icon.role,
      ...icon.aliases,
      ...icon.keywords,
      ...icon.products,
    ]
      .join(' ')
      .toLowerCase()
    return terms.every((term) => text.includes(term))
  })
}
