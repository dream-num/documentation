import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { isValidElement } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'
import { CopyCodeButton } from './copy-code-button'

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    const props = node.props as { children?: ReactNode }
    return extractText(props.children)
  }
  return ''
}

function findFirstTabValue(node: ReactNode): string | undefined {
  const children = Array.isArray(node) ? node : [node]

  for (const child of children) {
    if (!isValidElement<{ value?: unknown, children?: ReactNode }>(child)) continue

    if (typeof child.props.value === 'string') {
      return child.props.value
    }

    const value = findFirstTabValue(child.props.children)
    if (value) return value
  }

  return undefined
}

function findLanguage(node: ReactNode): string | undefined {
  const children = Array.isArray(node) ? node : [node]

  for (const child of children) {
    if (!isValidElement<{ className?: unknown, children?: ReactNode }>(child)) continue

    if (typeof child.props.className === 'string') {
      const language = child.props.className.match(/(?:^|\s)language-(\S+)/)?.[1]
      if (language) return language
    }

    const language = findLanguage(child.props.children)
    if (language) return language
  }

  return undefined
}

function countCodeLines(node: ReactNode): number {
  const children = Array.isArray(node) ? node : [node]
  let count = 0

  for (const child of children) {
    if (typeof child === 'string' || typeof child === 'number' || !child) continue

    if (Array.isArray(child)) {
      count += countCodeLines(child)
      continue
    }

    if (!isValidElement<{ className?: unknown, children?: ReactNode }>(child)) continue

    if (typeof child.props.className === 'string' && child.props.className.split(/\s+/).includes('line')) {
      count += 1
      continue
    }

    count += countCodeLines(child.props.children)
  }

  return count
}

function formatLanguage(language?: string) {
  if (!language) return 'text'

  const labels: Record<string, string> = {
    bash: 'Bash',
    css: 'CSS',
    html: 'HTML',
    javascript: 'JavaScript',
    js: 'JavaScript',
    json: 'JSON',
    jsx: 'JSX',
    mdx: 'MDX',
    sh: 'Shell',
    shell: 'Shell',
    ts: 'TypeScript',
    tsx: 'TSX',
    typescript: 'TypeScript',
  }

  return labels[language] ?? language.toUpperCase()
}

export function InlineCode({
  className,
  ...props
}: ComponentProps<'code'>) {
  return (
    <code
      className={clsx('rounded-sm bg-muted px-1.5 py-0.5 font-mono text-sm', className)}
      {...props}
    />
  )
}

export function CodeBlockTabs({
  children,
  className,
  defaultValue,
  ...props
}: ComponentProps<typeof Tabs>) {
  return (
    <Tabs
      className={clsx('my-6 gap-0 overflow-hidden rounded-md border bg-card', className)}
      defaultValue={defaultValue ?? findFirstTabValue(children)}
      {...props}
    >
      {children}
    </Tabs>
  )
}

export function CodeBlockTabsList({
  className,
  ...props
}: ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={clsx(
        'h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-muted/60 p-1',
        className,
      )}
      {...props}
    />
  )
}

export function CodeBlockTabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={clsx('flex-none px-3 py-1.5', className)}
      {...props}
    />
  )
}

export function CodeBlockTab({
  className,
  ...props
}: ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent
      className={clsx(
        'm-0',
        '[&_pre]:rounded-none [&_pre]:border-0',
        '*:data-code-block:my-0 *:data-code-block:rounded-none *:data-code-block:border-0 *:data-code-block:shadow-none',
        className,
      )}
      {...props}
    />
  )
}

export function CodeBlock({
  className,
  children,
  style,
  ...props
}: ComponentProps<'pre'>) {
  const code = extractText(children).trim()
  const language = formatLanguage(findLanguage(children))
  const lineCount = countCodeLines(children)
  const lineNumberWidth = `${Math.max(2, String(Math.max(1, lineCount)).length)}ch`
  const preStyle: CSSProperties & { '--code-line-number-width': string } = {
    ...style,
    '--code-line-number-width': lineNumberWidth,
  }

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg border bg-card shadow-sm" data-code-block>
      <div className="flex h-10 items-center justify-between border-b bg-muted/45 px-4">
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {language}
        </span>
        <CopyCodeButton code={code} />
      </div>
      <pre
        className={clsx(
          `
            overflow-x-auto py-4 text-[13px]/6
            [&_code]:bg-transparent [&_code]:p-0
          `,
          className,
        )}
        style={preStyle}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
