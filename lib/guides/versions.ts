import packageJson from '@/package.json'

export interface GuideVersion {
  label: string
  value: string
  status: 'current' | 'archived'
  isCurrent: boolean
  href?: string
}

const currentVersion = `v${packageJson.version}`

export const guideVersions: GuideVersion[] = [
  {
    label: currentVersion,
    value: currentVersion,
    status: 'current',
    isCurrent: true,
  },
  {
    label: 'v0.25.x',
    value: 'v0.25.x',
    status: 'archived',
    isCurrent: false,
    href: 'https://dream-num.github.io/documentation/v0.25/',
  },
]
