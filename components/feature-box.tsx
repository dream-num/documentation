'use client'

import { useTranslation } from '@/hooks/i18n'
import { usePathname } from 'next/navigation'

export default function FeatureBox() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]

  const t = useTranslation(locale, {
    'en-US': {
      features: [{
        title: '🚀 High Performance',
        description: 'Univer uses a rendering engine based on Canvas and a formula engine that supports Web Worker, ensuring high performance on large-scale data rendering and processing.',
      }, {
        title: '🧩 Plugin-based',
        description: 'The core functionality and capabilities of Univer are provided through plugins, allowing developers to freely combine the required functionality or create custom plugins to extend Univer.',
      }, {
        title: '🧙‍ Isomorphic',
        description: 'It can run both on browsers and Node.js (in the future, mobile devices as well), with the same API.',
      }, {
        title: '🪄 Customizable',
        description: 'Developers can customize the appearance and interaction of Univer by importing custom themes, icons, component libraries, etc.',
      }, {
        title: '🌍 Internationalization',
        description: 'Supports multiple languages, allowing developers to freely switch languages and customize language packs.',
      }, {
        title: '📖 Open Source',
        description: 'The core code of Univer OSS is open source under the Apache-2.0 license. Organizations and individuals are free to use its source code and npm package.',
      }, {
        title: '🌿 Rich Ecosystem',
        description: 'A rich ecosystem, with command-line tools, build tool plugins, example libraries, and more, to help developers get started quickly.',
      }, {
        title: '💬 Community Support',
        description: 'Provides Discord community and GitHub Discussions to facilitate developer communication and support.',
      }, {
        title: '📈 Continuous Updates',
        description: 'The Univer team will continue to update and maintain Univer to ensure its rich-feature, stability and reliability.',
      }, {
        title: '💼 Enterprise Edition',
        description: 'Provides a commercial version for enterprises with specific needs, including but not limited to multi-person collaborative editing and browsing, data connectors, and Live Share for collaborative browsing.',
      }],
    },
    'zh-CN': {
      features: [{
        title: '🚀 高性能',
        description: '基于 Canvas 的渲染引擎和公式引擎，支持 Web Worker，保证了高性能的同时，也能够支持大规模的数据处理。',
      }, {
        title: '🧩 插件化',
        description: 'Univer 的核心功能和能力都是通过插件的方式提供的，开发者可以自由组合所需功能或扩展自定义插件。',
      }, {
        title: '🧙‍♀️ 多端同构',
        description: '可以在桌面端浏览器和 Node.js 环境（未来还支持移动端浏览器）中运行，并提供相同的 API。',
      }, {
        title: '🪄 可定制',
        description: '通过导入自定义主题、图标、组件库等方式，开发者可以定制化 Univer 的外观和交互。',
      }, {
        title: '🌍 国际化',
        description: '支持多语言，开发者可以自由切换语言，也可以自定义语言包。',
      }, {
        title: '📖 开源',
        description: 'Univer OSS 的核心代码在 Apache-2.0 协议下开源，任何组织和个人都可以免费使用其源代码和 npm 包。',
      }, {
        title: '🌿 生态',
        description: '丰富的生态，借助命令行工具、构建工具插件、示例库等等，方便开发者快速上手。',
      }, {
        title: '💬 社区支持',
        description: '提供 Discord 社区和 GitHub Discussions，方便开发者交流和寻求帮助。',
      }, {
        title: '📈 持续更新',
        description: 'Univer 团队会持续更新和维护 Univer，保证其稳定性和可靠性。',
      }, {
        title: '💼 商业版',
        description: '为有特定需求的企业提供商业版，包括但不限于多人协同编辑和协同浏览、数据连接器、协同浏览（Live Share）等功能。',
      }],
    },
  })

  return (
    <ul
      className={`
        mt-6 grid grid-cols-1 gap-x-4 gap-y-6
        md:grid-cols-3
      `}
    >
      {t('features').map(feature => (
        <li key={feature.title}>
          <strong className="mb-2 block text-base font-semibold">{feature.title}</strong>
          <p className="text-sm leading-relaxed">{feature.description}</p>
        </li>
      ))}
    </ul>
  )
}
