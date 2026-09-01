import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { isValidElement } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'

import { CopyCodeButton } from './copy-code-button'

type CodeBlockProps = ComponentProps<'pre'> & { 'data-language'?: string; 'data-meta'?: string }

export function InlineCode({ className, ...props }: ComponentProps<'code'>) {
  return <code className={clsx('bg-muted rounded-sm px-1.5 py-0.5 font-mono text-sm', className)} {...props} />
}

export function CodeBlockTabs({ children, className, defaultValue, ...props }: ComponentProps<typeof Tabs>) {
  function findFirstTabValue(node: ReactNode): string | undefined {
    const nodes = Array.isArray(node) ? node : [node]

    for (const child of nodes) {
      if (!isValidElement<{ value?: unknown; children?: ReactNode }>(child)) continue

      if (typeof child.props.value === 'string') return child.props.value

      const value = findFirstTabValue(child.props.children)
      if (value) return value
    }
  }

  return (
    <Tabs
      className={clsx('bg-card my-6 gap-0 overflow-hidden rounded-md border', className)}
      defaultValue={defaultValue ?? findFirstTabValue(children)}
      {...props}
    >
      {children}
    </Tabs>
  )
}

export function CodeBlockTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={clsx('bg-muted/60 h-auto w-full justify-start overflow-x-auto rounded-none border-b p-1', className)}
      {...props}
    />
  )
}

export function CodeBlockTabsTrigger({ className, ...props }: ComponentProps<typeof TabsTrigger>) {
  return <TabsTrigger className={clsx('flex-none px-3 py-1.5', className)} {...props} />
}

export function CodeBlockTab({ className, ...props }: ComponentProps<typeof TabsContent>) {
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
  'data-language': dataLanguage,
  'data-meta': metadata,
  style,
  title,
  ...props
}: CodeBlockProps) {
  function extractText(node: ReactNode): string {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(extractText).join('')
    if (node && typeof node === 'object' && 'props' in node) {
      return extractText((node.props as { children?: ReactNode }).children)
    }
    return ''
  }

  function findLanguage(node: ReactNode): string | undefined {
    const nodes = Array.isArray(node) ? node : [node]

    for (const child of nodes) {
      if (!isValidElement<{ className?: unknown; children?: ReactNode }>(child)) continue

      if (typeof child.props.className === 'string') {
        const language = child.props.className.match(/(?:^|\s)language-(\S+)/)?.[1]
        if (language) return language
      }

      const language = findLanguage(child.props.children)
      if (language) return language
    }
  }

  function countCodeLines(node: ReactNode): number {
    const nodes = Array.isArray(node) ? node : [node]
    let count = 0

    for (const child of nodes) {
      if (typeof child === 'string' || typeof child === 'number' || !child) continue

      if (Array.isArray(child)) {
        count += countCodeLines(child)
        continue
      }

      if (!isValidElement<{ className?: unknown; children?: ReactNode }>(child)) continue

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

  const code = extractText(children).trim()
  const languageName = dataLanguage ?? className?.match(/(?:^|\s)language-(\S+)/)?.[1] ?? findLanguage(children)
  const language = formatLanguage(languageName)
  const metadataTitle = metadata?.match(/(?:^|\s)(?:title|filename)=(["'])(.*?)\1/u)?.[2]
  const lineCount = countCodeLines(children)
  const lineNumberWidth = `${Math.max(2, String(Math.max(1, lineCount)).length)}ch`
  const preStyle: CSSProperties & { '--code-line-number-width': string } = {
    ...style,
    '--code-line-number-width': lineNumberWidth,
  }

  return (
    <div className="group bg-card relative my-6 overflow-hidden rounded-lg border shadow-sm" data-code-block>
      <div className="bg-muted/45 flex h-9 items-center justify-between border-b px-4">
        <span className="text-muted-foreground font-mono text-xs font-medium">{language}</span>
        <CopyCodeButton code={code} />
      </div>
      <pre
        className={clsx(`overflow-x-auto py-4 text-[13px]/6 [&_code]:bg-transparent [&_code]:p-0`, className)}
        data-language={dataLanguage}
        data-meta={metadata}
        style={preStyle}
        title={title ?? metadataTitle}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
