import type { LLMsOptions } from 'fumadocs-core/mdx-plugins/remark-llms'
import { createProcessor } from '@mdx-js/mdx'
import enUS from '@univerjs/engine-formula/locale/en-US'
import frFR from '@univerjs/engine-formula/locale/fr-FR'
import koKR from '@univerjs/engine-formula/locale/ko-KR'
import ruRU from '@univerjs/engine-formula/locale/ru-RU'
import zhCN from '@univerjs/engine-formula/locale/zh-CN'
import * as univerIcons from '@univerjs/icons'
import { frontmatter } from 'fumadocs-core/content/md/frontmatter'
import { mdxPreset } from 'fumadocs-core/content/mdx/preset-runtime'
import { remarkLLMs } from 'fumadocs-core/mdx-plugins/remark-llms'

import packageJson from '../../package.json'

type StringifyAgentMdx = NonNullable<LLMsOptions['stringify']>
type MdxElement = Extract<Parameters<StringifyAgentMdx>[0], { type: 'mdxJsxFlowElement' | 'mdxJsxTextElement' }>
type StaticValue = boolean | null | number | string | StaticValue[] | { [key: string]: StaticValue }

interface IEstreeNode {
  type: string
  [key: string]: unknown
}

interface IFormulaEntry {
  description: string
}

const AGENT_MDX_ELEMENTS = new Set([
  'APITable',
  'AutoTypeTable',
  'Callout',
  'CapacityCalculator',
  'Card',
  'Cards',
  'CodeBlockTab',
  'CodeBlockTabs',
  'CodeBlockTabsList',
  'CodeBlockTabsTrigger',
  'FormulaList',
  'IconsGallery',
  'IconsVersion',
  'IconWrapper',
  'Mermaid',
  'MetaData',
  'MigrationCell',
  'MigrationRow',
  'MigrationTable',
  'PlaygroundFrame',
  'RibbonStyle',
  'Step',
  'Steps',
  'Tab',
  'Tabs',
  'UIArchitecture',
])

const AGENT_HTML_ELEMENTS = new Set(['br', 'code', 'details', 'div', 'iframe', 'img', 'span', 'strong', 'summary'])
const AGENT_IMAGE_SOURCE = 'agent-image:'

const formulaLists: Record<string, Record<string, IFormulaEntry>> = {
  'en-US': enUS['engine-formula'].functionList,
  'fr-FR': frFR['engine-formula'].functionList,
  'ko-KR': koKR['engine-formula'].functionList,
  'ru-RU': ruRU['engine-formula'].functionList,
  'zh-CN': zhCN['engine-formula'].functionList,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectImageImports(tree: unknown) {
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
        if (
          isRecord(specifier) &&
          specifier.type === 'ImportDefaultSpecifier' &&
          isRecord(specifier.local) &&
          typeof specifier.local.name === 'string' &&
          /^__img\d+$/.test(specifier.local.name)
        ) {
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

function annotateImageSources(value: unknown, imports: ReadonlyMap<string, string>) {
  if (!isRecord(value)) return

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
    for (const child of value.children) annotateImageSources(child, imports)
  }
}

function remarkAgentImageSources() {
  return (tree: unknown) => {
    annotateImageSources(tree, collectImageImports(tree))
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

function getStaticRecords(value: StaticValue | undefined) {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord) as Array<Record<string, StaticValue>>
}

function escapeTableCell(value: unknown) {
  return String(value ?? '-')
    .replaceAll('|', '\\|')
    .replace(/\s*\n\s*/g, '<br>')
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

function renderParameterRows(parameters: Array<Record<string, StaticValue>>, parent = ''): string[] {
  return parameters.flatMap((parameter) => {
    const name = getString(parameter, 'name') ?? 'unnamed'
    const path = parent ? `${parent}.${name}` : name
    const row = `| \`${escapeTableCell(path)}\` | \`${escapeTableCell(parameter.type)}\` | ${parameter.required === true ? 'yes' : 'no'} | ${escapeTableCell(parameter.example)} | ${escapeTableCell(parameter.description)} |`
    return [row, ...renderParameterRows(getStaticRecords(parameter.properties), path)]
  })
}

function renderParameters(title: string, value: StaticValue | undefined) {
  const parameters = getStaticRecords(value)
  if (parameters.length === 0) return ''

  return [
    `##### ${title}`,
    '',
    '| Parameter | Type | Required | Example | Description |',
    '| --- | --- | --- | --- | --- |',
    ...renderParameterRows(parameters),
  ].join('\n')
}

function renderExample(title: string, value: StaticValue | undefined, language: string) {
  if (typeof value !== 'string' || value.length === 0) return ''
  return `##### ${title}\n\n\`\`\`${language}\n${value}\n\`\`\``
}

function renderApiTable(attributes: Record<string, StaticValue>) {
  const request = getStaticRecord(attributes.request, 'APITable.request')
  const response = getStaticRecord(attributes.response, 'APITable.response')
  const requestHeading = [getString(request, 'method'), getString(request, 'url') && `\`${getString(request, 'url')}\``]
    .filter(Boolean)
    .join(' ')
  const requestHeaders = getString(request, 'headers')

  return [
    `#### Request${requestHeading ? `: ${requestHeading}` : ''}`,
    requestHeaders ? `\nHeaders: \`${requestHeaders}\`` : '',
    renderParameters(`${getString(request, 'parametersType') ?? 'Request'} parameters`, request.parameters),
    renderExample('Request example', request.example, 'http'),
    '#### Response',
    getString(response, 'type') ? `\nContent type: \`${getString(response, 'type')}\`` : '',
    renderParameters('Response parameters', response.parameters),
    renderExample('Response example', response.example, 'json'),
  ]
    .filter(Boolean)
    .join('\n\n')
}

function renderMetaData(attributes: Record<string, StaticValue>) {
  const meta = getStaticRecord(attributes.meta, 'MetaData.meta')
  return `#### Package metadata\n\n\`\`\`json\n${JSON.stringify(
    {
      isPro: attributes.isPro === true,
      ...meta,
    },
    null,
    2,
  )}\n\`\`\``
}

function renderFormulaList(attributes: Record<string, StaticValue>) {
  const lang = getString(attributes, 'lang') ?? 'en-US'
  const list = formulaLists[lang] ?? formulaLists['en-US']
  const rows = Object.entries(list)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([name, item]) => `| \`${escapeTableCell(name)}\` | ${escapeTableCell(item.description)} |`)

  return [`#### Formula functions (${rows.length})`, '', '| Function | Description |', '| --- | --- |', ...rows].join(
    '\n',
  )
}

function renderIconsGallery() {
  const names = Object.keys(univerIcons).toSorted((a, b) => a.localeCompare(b))
  return [
    `#### Available icon components (${names.length})`,
    '',
    'Import these components from `@univerjs/icons`:',
    '',
    ...names.map((name) => `- \`${name}\``),
  ].join('\n')
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
  if (!name) return renderChildren(node, state, info)
  if (name === 'include') {
    throw new Error('Agent Markdown encountered an unexpanded <include> element')
  }
  if (!AGENT_MDX_ELEMENTS.has(name) && !AGENT_HTML_ELEMENTS.has(name)) {
    throw new Error(`Agent Markdown does not support the <${name}> element`)
  }

  if (name === 'Tabs') return renderTabs(node, state, info)
  if (name === 'CodeBlockTabs') return renderCodeBlockTabs(node, state, info)
  if (name === 'img') {
    const data = isRecord(node.data) ? node.data : undefined
    const source = typeof data?.agentImageSource === 'string' ? data.agentImageSource : undefined
    if (!source) throw new Error('Agent Markdown expected the preserved img source')
    const altAttribute = node.attributes.find(
      (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'alt',
    )
    const titleAttribute = node.attributes.find(
      (attribute) => attribute.type === 'mdxJsxAttribute' && attribute.name === 'title',
    )
    const alt = (typeof altAttribute?.value === 'string' ? altAttribute.value : '').replaceAll(']', '\\]')
    const title = typeof titleAttribute?.value === 'string' ? titleAttribute.value.replaceAll('"', '\\"') : undefined
    const href = `${AGENT_IMAGE_SOURCE}${encodeURIComponent(source)}`
    return `![${alt}](${href}${title ? ` "${title}"` : ''})`
  }

  const attributes = readAttributes(node)
  const children = renderChildren(node, state, info)

  switch (name) {
    case 'APITable':
      return renderApiTable(attributes)
    case 'AutoTypeTable': {
      const type = getString(attributes, 'type')?.trim()
      if (!type) throw new Error('Agent Markdown expected AutoTypeTable.type')
      return `#### ${getString(attributes, 'name') ?? 'Type'} source\n\n\`\`\`ts\n${type}\n\`\`\``
    }
    case 'Callout': {
      const label = [getString(attributes, 'type')?.toUpperCase() ?? 'NOTE', getString(attributes, 'title')]
        .filter(Boolean)
        .join(': ')
      return `> [!${label}]\n${indent(children, '> ')}`
    }
    case 'CapacityCalculator':
      return [
        '#### Capacity calculator model',
        '',
        '- Edit/save QPS depends on active documents and save frequency.',
        '- Collaborative broadcast QPS = edit/save QPS × (active users / active documents − 1).',
        '- Size node, Universer, and database capacity from the larger edit/save and collaboration workloads.',
      ].join('\n')
    case 'Card': {
      const title = getString(attributes, 'title') ?? (children || 'Documentation')
      const href = getString(attributes, 'href')
      const link = href ? `[${title}](${href})` : title
      return children && children !== title ? `- ${link}\n${indent(children, '  ')}` : `- ${link}`
    }
    case 'Cards':
    case 'CodeBlockTabsList':
    case 'Steps':
      return children
    case 'CodeBlockTab':
      return `#### ${getString(attributes, 'value') ?? 'Option'}\n\n${children}`
    case 'CodeBlockTabsTrigger':
      return ''
    case 'FormulaList':
      return renderFormulaList(attributes)
    case 'IconsGallery':
      return renderIconsGallery()
    case 'IconsVersion':
      return `\`${packageJson.dependencies['@univerjs/icons']}\``
    case 'IconWrapper':
      return attributes.type === 'pro' ? '**Univer Pro**' : children
    case 'Mermaid': {
      const chart = getString(attributes, 'chart')
      if (!chart) throw new Error('Agent Markdown expected Mermaid.chart')
      return `\`\`\`mermaid\n${chart}\n\`\`\``
    }
    case 'MetaData':
      return renderMetaData(attributes)
    case 'MigrationCell':
      return `- ${children.replaceAll('\n', '\n  ')}`
    case 'MigrationRow':
      return `#### ${getString(attributes, 'method') ?? 'Migration'}\n\n${children}`
    case 'MigrationTable': {
      const headers = Array.isArray(attributes.headers) ? attributes.headers.join(' / ') : 'API migration'
      return `### ${headers}\n\n${children}`
    }
    case 'PlaygroundFrame': {
      const slug = getString(attributes, 'slug')
      if (!slug) throw new Error('Agent Markdown expected PlaygroundFrame.slug')
      return `> Interactive example: [Open the playground](/playground/${slug})`
    }
    case 'RibbonStyle':
      return [
        '#### Ribbon layouts',
        '',
        '- `classic`: grouped tabs above the toolbar.',
        '- `collapsed`: compact tabs and tools on one row.',
        '- `simple`: an ungrouped, flat tool list.',
      ].join('\n')
    case 'Step':
      return `1.\n${indent(children, '   ')}`
    case 'Tab':
      return `#### ${getString(attributes, 'label') ?? 'Tab'}\n\n${children}`
    case 'UIArchitecture':
      return [
        '#### UI workbench slot tree',
        '',
        '- `CUSTOM_HEADER`',
        '- `TOOLBAR` and `HEADER_MENU`',
        '- `LEFT_SIDEBAR`',
        '- `HEADER`',
        '- `CONTENT`',
        '- right sidebar service',
        '- `FOOTER`',
        '- `GLOBAL`',
        '- `FLOATING` portal',
        '',
        'Register extensions with `IUIPartsService.registerComponent(part, factory)`.',
      ].join('\n')
    case 'br':
      return '  \n'
    case 'code':
      return `\`${children}\``
    case 'details':
    case 'div':
    case 'span':
      return children
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

export const agentMarkdownOptions = {
  headingIds: false,
  stringify: stringifyAgentMdx,
} satisfies LLMsOptions

const agentMarkdownProcessor = mdxPreset({
  rehypeCodeOptions: false,
  remarkPlugins: [
    remarkStripMdxComments,
    remarkAgentImageSources,
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
