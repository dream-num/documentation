import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import Preview from './preview'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const metadata = {
  product: 'sheets' as const,
  category: 'integrations' as const,
  group: { 'en-US': 'Collaboration and embedding', 'zh-CN': '协同与嵌入' },
  packages: [
    '@univerjs/core',
    '@univerjs/design',
    '@univerjs/ui',
    '@univerjs/docs-ui',
    '@univerjs/sheets',
    '@univerjs/sheets-ui',
    '@univerjs/sheets-formula-ui',
    '@univerjs/sheets-numfmt-ui',
    '@univerjs-pro/collaboration-client',
    '@univerjs-pro/collaboration-client-ui',
  ],
  apis: [
    { name: 'UniverCollaborationClientPlugin / UniverCollaborationClientUIPlugin' },
    { name: 'FUniver.newAPI()' },
    { name: 'Univer.createUnit() / Univer.dispose()' },
    { name: 'FUniver.Event.LifeCycleChanged / LifecycleStages.Steady' },
  ],
  guide: {
    overview: {
      'en-US':
        'Inspect the real Pro collaboration client registration without requiring a backend for the default demo. A local workbook opens when no unit query is provided; an explicit ?unit= enables the documented Universer connection path.',
      'zh-CN':
        '在默认示例不依赖后端的前提下检查真实 Pro 协同客户端注册。未提供 unit 查询参数时打开本地工作簿；显式 ?unit= 才启用文档中的 Universer 连接路径。',
    },
    tryIt: {
      'en-US': [
        'Open the normal exported URL and verify the local-fallback workbook loads without collaboration requests or redirects.',
        'Inspect createCollaborationClientConfig() to map authorization, snapshot, changeset, WebSocket, file and formula-limit endpoints.',
        'With your own Universer backend and authenticated session, add ?unit=<id>&type=2 to connect two tabs to the same unit.',
      ],
      'zh-CN': [
        '打开普通导出 URL，确认本地 fallback 工作簿无需协同请求或重定向即可加载。',
        '检查 createCollaborationClientConfig() 对授权、快照、变更集、WebSocket、文件和公式限制端点的映射。',
        '准备自己的 Universer 后端与登录会话后，添加 ?unit=<id>&type=2，让两个标签页连接同一 unit。',
      ],
    },
    expected: {
      'en-US':
        'The default frontend-only path is a runnable SDK setup and local editor, not simulated multi-user synchronization. Real presence and changeset sync require the explicitly configured backend.',
      'zh-CN':
        '默认纯前端路径是可运行的 SDK 配置和本地编辑器，不模拟多用户同步。真实在线状态与变更集同步需要显式配置的后端。',
    },
  },
  variants: [
    { id: 'local', label: { 'en-US': 'Frontend-only local fallback', 'zh-CN': '纯前端本地 fallback' } },
    { id: 'configured', label: { 'en-US': 'Explicit Universer unit', 'zh-CN': '显式 Universer unit' } },
    { id: 'endpoints', label: { 'en-US': 'HTTP / WebSocket endpoint map', 'zh-CN': 'HTTP / WebSocket 端点映射' } },
    { id: 'auth', label: { 'en-US': 'Authenticated / unauthorized session', 'zh-CN': '已登录 / 未授权会话' } },
  ],
  actions: [
    { id: 'local-load', label: { 'en-US': 'Load local workbook', 'zh-CN': '加载本地工作簿' } },
    { id: 'connect', label: { 'en-US': 'Connect explicit unit', 'zh-CN': '连接显式 unit' } },
    { id: 'native-edit', label: { 'en-US': 'Edit through native Sheets UI', 'zh-CN': '通过原生 Sheets UI 编辑' } },
  ],
  states: [
    { id: 'fallback', label: { 'en-US': 'Local fallback', 'zh-CN': '本地 fallback' } },
    { id: 'collaboration', label: { 'en-US': 'Collaboration configured', 'zh-CN': '已配置协同' } },
    { id: 'login', label: { 'en-US': 'Login required', 'zh-CN': '需要登录' } },
  ],
  title: {
    'en-US': 'Collaboration',
    'zh-CN': '协同编辑',
    'zh-TW': '協同編輯',
    'ja-JP': '共同編集',
  },
  description: {
    'en-US':
      'Register the real Pro collaboration client with a frontend-only local default and an explicit backend-enabled unit path.',
    'zh-CN': '注册真实 Pro 协同客户端；默认运行纯前端本地模式，并保留显式启用后端 unit 的路径。',
    'zh-TW': '註冊真實 Pro 協同用戶端；預設執行純前端本機模式，並保留明確啟用後端 unit 的路徑。',
    'ja-JP':
      '実際の Pro コラボレーションクライアントを登録し、既定ではフロントエンドのみ、明示的な unit ではバックエンド接続を使用します。',
  },
  tags: {
    'en-US': ['Univer Sheets', 'Univer SDK Pro', 'Plugin Mode'],
    'zh-CN': ['Univer Sheets', 'Univer SDK Pro', '插件模式'],
    'zh-TW': ['Univer Sheets', 'Univer SDK Pro', '外掛模式'],
    'ja-JP': ['Univer Sheets', 'Univer SDK Pro', 'プラグインモード'],
  },
}

export const files = {
  '/reference/preview.tsx.txt': fs.readFileSync(path.resolve(__dirname, './preview/main.tsx'), 'utf-8'),
  '/src/index.ts': fs.readFileSync(path.resolve(__dirname, './code/index.ts'), 'utf-8'),
  '/src/create-demo.ts': fs.readFileSync(path.resolve(__dirname, './code/create-demo.ts'), 'utf-8'),
  '/src/styles.css': fs.readFileSync(path.resolve(__dirname, './code/styles.css'), 'utf-8'),
  '/src/config.ts': fs.readFileSync(path.resolve(__dirname, './code/config.ts'), 'utf-8'),
  '/src/data.ts': fs.readFileSync(path.resolve(__dirname, './code/data.ts'), 'utf-8'),
  '/src/function.ts': fs.readFileSync(path.resolve(__dirname, './code/function.ts'), 'utf-8'),
}

export default {
  metadata,
  files,
  Preview,
}
