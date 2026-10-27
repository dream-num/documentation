import type { LLMsOptions } from 'fumadocs-core/mdx-plugins/remark-llms'
import { createProcessor } from '@mdx-js/mdx'
import { frontmatter } from 'fumadocs-core/content/md/frontmatter'
import { mdxPreset } from 'fumadocs-core/content/mdx/preset-runtime'
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms'
import { buildInstallCommand, PACKAGE_MANAGERS } from '../../components/mdx/install-command'

type StringifyAgentMdx = NonNullable<LLMsOptions['stringify']>
type MdxElement = Extract<Parameters<StringifyAgentMdx>[0], { type: 'mdxJsxFlowElement' | 'mdxJsxTextElement' }>
type StaticValue = boolean | null | number | string | StaticValue[] | { [key: string]: StaticValue }

interface IEstreeNode {
  type: string
  [key: string]: unknown
}

const AGENT_MDX_ELEMENTS = new Set([
  'Callout',
  'Card',
  'Cards',
  'FeatureComparison',
  'SdkPrompt',
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'InstallTabs',
  'Mermaid',
  'MetaData',
  'PlaygroundFrame',
  'Step',
  'Steps',
  'Tab',
  'Tabs',
])

const AGENT_HTML_ELEMENTS = new Set([
  'br',
  'code',
  'details',
  'div',
  'iframe',
  'img',
  'small',
  'span',
  'strong',
  'summary',
])
const AGENT_IMAGE_SOURCE = 'agent-image:'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectMdxImports(tree: unknown) {
  const imports = new Map<string, string>()
  if (!isRecord(tree) || !Array.isArray(tree.children)) return imports

  for (const child of tree.children) {
    if (!isRecord(child) || child.type !== 'mdxjsEsm' || !isRecord(child.data) || !isRecord(child.data.estree)) {
      continue
    }

    const body = child.data.estree.body
    if (!Array.isArray(body)) continue
    for (const statement of body) {
      if (!isRecord(statement) || statement.type !== 'ImportDeclaration' || !isRecord(statement.source)) continue
      const source = statement.source.value
      if (typeof source !== 'string' || !Array.isArray(statement.specifiers)) continue

      for (const specifier of statement.specifiers) {
        if (isRecord(specifier) && isRecord(specifier.local) && typeof specifier.local.name === 'string') {
          imports.set(specifier.local.name, source)
        }
      }
    }
  }

  return imports
}

function removeMdxComments(value: unknown) {
  if (!isRecord(value) || !Array.isArray(value.children)) return

  const children = value.children.filter((child) => {
    if (!isRecord(child) || (child.type !== 'mdxFlowExpression' && child.type !== 'mdxTextExpression')) return true
    return typeof child.value !== 'string' || !/^\/\*[\s\S]*\*\/$/.test(child.value.trim())
  })
  value.children = children
  for (const child of children) removeMdxComments(child)
}

function annotateMdxImports(value: unknown, imports: ReadonlyMap<string, string>) {
  if (!isRecord(value)) return

  if (
    (value.type === 'mdxJsxFlowElement' || value.type === 'mdxJsxTextElement') &&
    typeof value.name === 'string' &&
    imports.has(value.name.split('.')[0])
  ) {
    const data = isRecord(value.data) ? value.data : {}
    data.agentImportedComponent = true
    value.data = data
  }

  if (
    (value.type === 'mdxJsxFlowElement' || value.type === 'mdxJsxTextElement') &&
    value.name === 'img' &&
    Array.isArray(value.attributes)
  ) {
    const src = value.attributes.find(
      (attribute) => isRecord(attribute) && attribute.type === 'mdxJsxAttribute' && attribute.name === 'src',
    )
    if (isRecord(src) && isRecord(src.value) && isRecord(src.value.data) && isRecord(src.value.data.estree)) {
      const body = src.value.data.estree.body
      const statement = Array.isArray(body) ? body[0] : undefined
      const expression = isRecord(statement) ? statement.expression : undefined
      const source =
        isRecord(expression) && typeof expression.name === 'string' ? imports.get(expression.name) : undefined
      if (source) {
        const data = isRecord(value.data) ? value.data : {}
        data.agentImageSource = source
        value.data = data
      }
    }
  }

  if (Array.isArray(value.children)) {
    for (const child of value.children) annotateMdxImports(child, imports)
  }
}

function remarkAgentMdxImports() {
  return (tree: unknown) => {
    annotateMdxImports(tree, collectMdxImports(tree))
  }
}

function remarkStripMdxComments() {
  return (tree: unknown) => {
    removeMdxComments(tree)
  }
}

function getNode(value: unknown, context: string): IEstreeNode {
  if (!isRecord(value) || typeof value.type !== 'string') {
    throw new Error(`Agent Markdown cannot statically evaluate ${context}`)
  }

  return value as IEstreeNode
}

function getNodeArray(value: unknown, context: string): IEstreeNode[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`Agent Markdown expected an array while evaluating ${context}`)
  }

  return value.map((item) => getNode(item, context))
}

function getPropertyName(node: IEstreeNode, context: string) {
  if (node.type === 'Identifier' && typeof node.name === 'string') {
    return node.name
  }

  if (node.type === 'Literal' && (typeof node.value === 'number' || typeof node.value === 'string')) {
    return String(node.value)
  }

  throw new Error(`Agent Markdown only supports static property names in ${context}`)
}

function getJsxName(node: unknown) {
  const name = getNode(node, 'JSX element name')
  if (name.type === 'JSXIdentifier' && typeof name.name === 'string') {
    return name.name
  }

  return 'component'
}

function evaluateJsxChildren(value: unknown, context: string): string {
  if (!Array.isArray(value)) {
    throw new TypeError(`Agent Markdown expected JSX children in ${context}`)
  }

  return value
    .map((child) => {
      const node = getNode(child, context)
      switch (node.type) {
        case 'JSXElement':
        case 'JSXFragment':
          return String(evaluateStaticExpression(node, context))
        case 'JSXExpressionContainer':
          return String(evaluateStaticExpression(getNode(node.expression, context), context))
        case 'JSXText':
          return typeof node.value === 'string' ? node.value : ''
        default:
          throw new Error(`Agent Markdown does not support ${node.type} inside JSX in ${context}`)
      }
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

function evaluateJsonStringify(node: IEstreeNode, context: string): string {
  const callee = getNode(node.callee, context)
  if (callee.type !== 'MemberExpression' || callee.computed === true) {
    throw new Error(`Agent Markdown only permits JSON.stringify() calls in ${context}`)
  }

  const object = getNode(callee.object, context)
  const property = getNode(callee.property, context)
  if (
    object.type !== 'Identifier' ||
    object.name !== 'JSON' ||
    property.type !== 'Identifier' ||
    property.name !== 'stringify'
  ) {
    throw new Error(`Agent Markdown only permits JSON.stringify() calls in ${context}`)
  }

  const args = getNodeArray(node.arguments, context)
  if (args.length < 1 || args.length > 3) {
    throw new Error(`Agent Markdown received an invalid JSON.stringify() call in ${context}`)
  }

  const value = evaluateStaticExpression(args[0], context)
  const replacer = args[1] ? evaluateStaticExpression(args[1], context) : null
  const space = args[2] ? evaluateStaticExpression(args[2], context) : undefined
  if (replacer !== null || (space !== undefined && typeof space !== 'number' && typeof space !== 'string')) {
    throw new Error(`Agent Markdown only permits a null replacer and static spacing in ${context}`)
  }

  return JSON.stringify(value, null, space) ?? ''
}

function evaluateStaticExpression(input: unknown, context: string): StaticValue {
  const node = getNode(input, context)

  switch (node.type) {
    case 'ArrayExpression':
      if (!Array.isArray(node.elements) || node.elements.some((element) => element === null)) {
        throw new Error(`Agent Markdown does not support sparse arrays in ${context}`)
      }
      return node.elements.map((element) => evaluateStaticExpression(element, context))
    case 'CallExpression':
      return evaluateJsonStringify(node, context)
    case 'JSXElement': {
      const opening = getNode(node.openingElement, context)
      const text = evaluateJsxChildren(node.children, context)
      return text || getJsxName(opening.name)
    }
    case 'JSXFragment':
      return evaluateJsxChildren(node.children, context)
    case 'Literal':
      if (
        node.value === null ||
        typeof node.value === 'boolean' ||
        typeof node.value === 'number' ||
        typeof node.value === 'string'
      ) {
        return node.value
      }
      throw new Error(`Agent Markdown does not support this literal in ${context}`)
    case 'ObjectExpression': {
      const result: Record<string, StaticValue> = {}
      for (const propertyValue of getNodeArray(node.properties, context)) {
        if (
          propertyValue.type !== 'Property' ||
          propertyValue.computed === true ||
          propertyValue.kind !== 'init' ||
          propertyValue.method === true ||
          propertyValue.shorthand === true
        ) {
          throw new Error(`Agent Markdown only supports ordinary object properties in ${context}`)
        }

        const key = getPropertyName(getNode(propertyValue.key, context), context)
        result[key] = evaluateStaticExpression(propertyValue.value, context)
      }
      return result
    }
    case 'TemplateLiteral': {
      const expressions = getNodeArray(node.expressions, context)
      if (expressions.length > 0) {
        throw new Error(`Agent Markdown does not support interpolated templates in ${context}`)
      }

      return getNodeArray(node.quasis, context)
        .map((quasi) => {
          const value = isRecord(quasi.value) ? quasi.value : undefined
          return typeof value?.cooked === 'string' ? value.cooked : String(value?.raw ?? '')
        })
        .join('')
    }
    default:
      throw new Error(`Agent Markdown does not support ${node.type} expressions in ${context}`)
  }
}

function readAttributes(node: MdxElement) {
  const result: Record<string, StaticValue> = {}

  for (const attribute of node.attributes) {
    if (attribute.type === 'mdxJsxExpressionAttribute') {
      throw new Error(`Agent Markdown does not support spread attributes on ${node.name ?? 'an MDX fragment'}`)
    }

    if (attribute.value == null) {
      result[attribute.name] = true
    } else if (typeof attribute.value === 'string') {
      result[attribute.name] = attribute.value
    } else {
      const program = attribute.value.data?.estree
      const statement = program?.body[0]
      if (!statement || statement.type !== 'ExpressionStatement') {
        throw new Error(`Agent Markdown could not read ${node.name}.${attribute.name}`)
      }
      result[attribute.name] = evaluateStaticExpression(statement.expression, `${node.name}.${attribute.name}`)
    }
  }

  return result
}

function getString(record: Record<string, StaticValue>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : undefined
}

function getStaticRecord(value: StaticValue | undefined, context: string): Record<string, StaticValue> {
  if (!isRecord(value)) {
    throw new TypeError(`Agent Markdown expected structured data for ${context}`)
  }

  return value as Record<string, StaticValue>
}

function indent(value: string, prefix: string) {
  return value
    .trim()
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n')
}

function renderChildren(
  node: MdxElement,
  state: Parameters<StringifyAgentMdx>[2],
  info: Parameters<StringifyAgentMdx>[3],
) {
  return (
    node.type === 'mdxJsxFlowElement' ? state.containerFlow(node, info) : state.containerPhrasing(node, info)
  ).trim()
}

function renderMetaData(attributes: Record<string, StaticValue>) {
  const meta = getStaticRecord(attributes.meta, 'MetaData.meta')
  return `#### Package metadata\n\n\`\`\`json\n${JSON.stringify(
    {
      ...meta,
    },
    null,
    2,
  )}\n\`\`\``
}

function renderInstallTabs(attributes: Record<string, StaticValue>) {
  const packageValue = attributes.packages
  const packages =
    typeof packageValue === 'string'
      ? packageValue
      : Array.isArray(packageValue) && packageValue.every((value): value is string => typeof value === 'string')
        ? packageValue
        : undefined
  if (!packages) throw new Error('Agent Markdown expected InstallTabs.packages')
  if (attributes.dev !== undefined && typeof attributes.dev !== 'boolean') {
    throw new TypeError('Agent Markdown expected InstallTabs.dev to be boolean')
  }

  const overrides =
    attributes.overrides === undefined ? {} : getStaticRecord(attributes.overrides, 'InstallTabs.overrides')
  return PACKAGE_MANAGERS.map((manager) => {
    const value = overrides[manager]
    const override = value === undefined ? undefined : getStaticRecord(value, `InstallTabs.overrides.${manager}`)
    const append = override ? getString(override, 'append') : undefined
    const replace = override ? getString(override, 'replace') : undefined
    if (append && replace) {
      throw new Error(`Agent Markdown received both append and replace for InstallTabs.overrides.${manager}`)
    }

    const command = buildInstallCommand(
      manager,
      packages,
      attributes.dev === true,
      replace ? { replace } : append ? { append } : undefined,
    )
    return `#### ${manager}\n\n\`\`\`shell\n${command}\n\`\`\``
  }).join('\n\n')
}

function renderTabs(node: MdxElement, state: Parameters<StringifyAgentMdx>[2], info: Parameters<StringifyAgentMdx>[3]) {
  const attributes = readAttributes(node)
  const labels = Array.isArray(attributes.items) ? attributes.items.filter((item) => typeof item === 'string') : []
  const tabs = node.children.filter(
    (child): child is MdxElement =>
      (child.type === 'mdxJsxFlowElement' || child.type === 'mdxJsxTextElement') && child.name === 'Tab',
  )

  if (tabs.length === 0) {
    throw new Error('Agent Markdown found Tabs without Tab children')
  }

  return tabs
    .map((tab, index) => {
      const tabAttributes = readAttributes(tab)
      const label = getString(tabAttributes, 'label') ?? labels[index]
      if (!label) {
        throw new Error(`Agent Markdown could not determine the label for Tab ${index + 1}`)
      }
      return `#### ${label}\n\n${renderChildren(tab, state, info)}`
    })
    .join('\n\n')
}

function renderCodeBlockTabs(
  node: MdxElement,
  state: Parameters<StringifyAgentMdx>[2],
  info: Parameters<StringifyAgentMdx>[3],
) {
  const tabs = node.children.filter(
    (child): child is MdxElement =>
      (child.type === 'mdxJsxFlowElement' || child.type === 'mdxJsxTextElement') && child.name === 'CodeBlockTab',
  )

  return tabs
    .map((tab, index) => {
      const label = getString(readAttributes(tab), 'value') ?? `Option ${index + 1}`
      return `#### ${label}\n\n${renderChildren(tab, state, info)}`
    })
    .join('\n\n')
}

const stringifyAgentMdx: StringifyAgentMdx = (node, _parent, state, info) => {
  if (node.type !== 'mdxJsxFlowElement' && node.type !== 'mdxJsxTextElement') {
    return
  }

  const name = node.name
  const data = isRecord(node.data) ? node.data : undefined
  if (!name) return renderChildren(node, state, info)
  if (data?.agentImportedComponent) return
  if (name === 'include') {
    throw new Error('Agent Markdown encountered an unexpanded <include> element')
  }
  if (!AGENT_MDX_ELEMENTS.has(name) && !AGENT_HTML_ELEMENTS.has(name)) {
    throw new Error(`Agent Markdown does not support the <${name}> element`)
  }

  if (name === 'Tabs') return renderTabs(node, state, info)
  if (name === 'CodeBlockTabs') return renderCodeBlockTabs(node, state, info)
  if (name === 'img') {
    const preservedSource = typeof data?.agentImageSource === 'string' ? data.agentImageSource : undefined
    const srcAttribute = node.attributes.find(
      (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'src',
    )
    const literalSource = typeof srcAttribute?.value === 'string' ? srcAttribute.value : undefined
    const source = preservedSource ?? (literalSource?.startsWith('/assets/') ? literalSource : undefined)
    if (!source) throw new Error('Agent Markdown expected the preserved img source')
    const altAttribute = node.attributes.find(
      (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'alt',
    )
    const titleAttribute = node.attributes.find(
      (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'title',
    )
    const alt = (typeof altAttribute?.value === 'string' ? altAttribute.value : '').replaceAll(']', '\\]')
    const title = typeof titleAttribute?.value === 'string' ? titleAttribute.value.replaceAll('"', '\\"') : undefined
    const href = preservedSource ? `${AGENT_IMAGE_SOURCE}${encodeURIComponent(source)}` : source
    return `![${alt}](${href}${title ? ` "${title}"` : ''})`
  }

  const attributes = readAttributes(node)
  const children = renderChildren(node, state, info)

  switch (name) {
    case 'Callout': {
      const label = [getString(attributes, 'type')?.toUpperCase() ?? 'NOTE', getString(attributes, 'title')]
        .filter(Boolean)
        .join(': ')
      return `> [!${label}]\n${indent(children, '> ')}`
    }
    case 'Card': {
      const title = getString(attributes, 'title') ?? (children || 'Documentation')
      const href = getString(attributes, 'href')
      const link = href ? `[${title}](${href})` : title
      return children && children !== title ? `- ${link}\n${indent(children, '  ')}` : `- ${link}`
    }
    case 'Cards':
    case 'FeatureComparison':
    case 'CodeBlockTabsList':
    case 'Steps':
      return children
    case 'CodeBlockTab':
      return `#### ${getString(attributes, 'value') ?? 'Option'}\n\n${children}`
    case 'CodeBlockTabsTrigger':
      return ''
    case 'InstallTabs':
      return renderInstallTabs(attributes)
    case 'Mermaid': {
      const chart = getString(attributes, 'chart')
      if (!chart) throw new Error('Agent Markdown expected Mermaid.chart')
      return `\`\`\`mermaid\n${chart}\n\`\`\``
    }
    case 'MetaData':
      return renderMetaData(attributes)
    case 'PlaygroundFrame': {
      const slug = getString(attributes, 'slug')
      if (!slug) throw new Error('Agent Markdown expected PlaygroundFrame.slug')
      return `> Interactive example: [Open the playground](/playground/${slug})`
    }
    case 'SdkPrompt':
      return '[View SDK prompt](https://docs.univer.ai/api/sdk-prompt)'
    case 'Step':
      return `1.\n${indent(children, '   ')}`
    case 'Tab':
      return `#### ${getString(attributes, 'label') ?? 'Tab'}\n\n${children}`
    case 'br':
      return '  \n'
    case 'code':
      return `\`${children}\``
    case 'details':
    case 'div':
    case 'span':
      return children
    case 'small':
      return ` ${children}`
    case 'iframe': {
      const src = getString(attributes, 'src')
      return src ? `[Embedded media](${src})` : children
    }
    case 'strong':
      return `**${children}**`
    case 'summary':
      return `#### ${children}`
    default:
      throw new Error(`Agent Markdown has no renderer for <${name}>`)
  }
}

const agentMarkdownOptions = {
  headingIds: false,
  filterElement: (node) => (isRecord(node.data) && node.data.agentImportedComponent ? 'children-only' : true),
  stringify: stringifyAgentMdx,
} satisfies LLMsOptions

const agentMarkdownProcessor = mdxPreset({
  rehypeCodeOptions: false,
  remarkPlugins: [
    remarkStripMdxComments,
    remarkAgentMdxImports,
    [remarkLLMs, { ...agentMarkdownOptions, _data: true }],
  ],
  remarkStructureOptions: false,
}).then((options) => createProcessor(options))

export async function renderAgentMarkdown(source: string, filePath: string) {
  const processor = await agentMarkdownProcessor
  const file = await processor.process({ path: filePath, value: frontmatter(source).content })
  if (typeof file.data.markdown !== 'string') {
    throw new Error(`Agent Markdown was not generated for ${filePath}`)
  }
  return file.data.markdown
}
