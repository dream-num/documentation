import pkg from '../../package.json'

export function IconsVersion() {
  const version = pkg.dependencies?.['@univerjs/icons'] ?? 'unknown'

  return (
    <code className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-semibold">
      {version}
    </code>
  )
}
