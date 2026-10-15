import pkg from '@/package.json'

export function IconsVersion({ label }: { label: string }) {
  const version = pkg.dependencies['@univerjs/icons']

  return (
    <p>
      {label} <code className="bg-muted rounded-sm px-1.5 py-0.5 text-xs font-semibold">{version}</code>
    </p>
  )
}
