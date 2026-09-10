import type { ComponentProps, ReactNode } from 'react'
import {
  SiCss,
  SiGnubash,
  SiHtml5,
  SiJavascript,
  SiJson,
  SiLatex,
  SiMdx,
  SiReact,
  SiTypescript,
  SiVuedotjs,
} from '@icons-pack/react-simple-icons'
import { CodeXml } from 'lucide-react'
import { isValidElement } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { clsx } from '@/lib/clsx'

import { CollapsibleCode } from './collapsible-code'
import { CopyCodeButton } from './copy-code-button'

type CodeBlockProps = ComponentProps<'pre'> & { 'data-language'?: string; 'data-meta'?: string }

export function InlineCode({ className, ...props }: ComponentProps<'code'>) {
  return (
    <code
      className={clsx(
        'bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-sm font-medium wrap-anywhere',
        className,
      )}
      {...props}
    />
  )
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
      const props = node.props as { children?: ReactNode; className?: string }
      const text = extractText(props.children)
      return props.className?.split(/\s+/).includes('line') ? `${text}\n` : text
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
      vue: 'Vue',
      tex: 'LaTeX',
    }

    return labels[language] ?? language.toUpperCase()
  }

  const code = extractText(children).trim()
  const languageName = dataLanguage ?? className?.match(/(?:^|\s)language-(\S+)/)?.[1] ?? findLanguage(children)
  const language = formatLanguage(languageName)
  const languageIcons: Record<string, typeof SiTypescript> = {
    Bash: SiGnubash,
    CSS: SiCss,
    HTML: SiHtml5,
    JavaScript: SiJavascript,
    JSON: SiJson,
    JSX: SiReact,
    LaTeX: SiLatex,
    MDX: SiMdx,
    Shell: SiGnubash,
    TSX: SiReact,
    TypeScript: SiTypescript,
    Vue: SiVuedotjs,
  }
  const LanguageIcon = languageIcons[language] ?? CodeXml
  const metadataTitle = metadata?.match(/(?:^|\s)(?:title|filename)=(["'])(.*?)\1/u)?.[2]

  return (
    <div
      className="group relative my-6 overflow-hidden rounded-lg border border-(--separator) bg-(--code) shadow-sm"
      data-code-block
    >
      <div className="bg-muted/50 flex h-9 items-center justify-between border-b border-[var(--separator)] px-2">
        <span className="text-muted-foreground inline-flex items-center gap-2 px-2 text-sm font-medium">
          <LanguageIcon aria-hidden="true" className="size-3.5 shrink-0" />
          {language}
        </span>
        <CopyCodeButton code={code} />
      </div>
      <CollapsibleCode collapsible={code.split(/\r?\n/).length > 20}>
        <pre
          className={clsx(
            `min-w-full overflow-x-auto py-4 font-mono text-sm/5 [&_code]:bg-transparent [&_code]:p-0`,
            className,
          )}
          data-language={dataLanguage}
          data-meta={metadata}
          style={style}
          title={title ?? metadataTitle}
          {...props}
        >
          {children}
        </pre>
      </CollapsibleCode>
    </div>
  )
}
