export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const

export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

export type InstallCommandOverride = { append: string; replace?: never } | { append?: never; replace: string }

const COMMANDS: Record<PackageManager, { command: string; devFlag: string }> = {
  bun: { command: 'bun add', devFlag: '-d' },
  npm: { command: 'npm install', devFlag: '-D' },
  pnpm: { command: 'pnpm add', devFlag: '-D' },
  yarn: { command: 'yarn add', devFlag: '-D' },
}

export function buildInstallCommand(
  manager: PackageManager,
  packages: string | readonly string[],
  dev: boolean,
  override?: InstallCommandOverride,
): string {
  if (override?.replace !== undefined) return override.replace

  const { command, devFlag } = COMMANDS[manager]
  const packageGroups = typeof packages === 'string' ? [packages] : packages

  return packageGroups
    .map((packageGroup) => [command, dev && devFlag, packageGroup, override?.append].filter(Boolean).join(' '))
    .join('\n')
}
