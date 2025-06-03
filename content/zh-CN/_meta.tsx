import { ShareRangeSingle } from '@univerjs/icons'
import ProductSelector from '@/components/product-selector'

export default {
  selector: {
    title: <ProductSelector />,
    type: 'separator',
  },
  introduction: {
    type: 'page',
    title: '简介',
  },
  sheets: {
    type: 'page',
    title: '📊 Sheets',
    href: '/guides/sheets',
  },
  docs: {
    type: 'page',
    title: '📝 Docs',
    href: '/guides/docs',
  },
  playground: {
    type: 'page',
    title: '在线演示',
    theme: {
      toc: false,
    },
  },
  // ai: {
  //   type: 'page',
  //   title: '🤖 AI',
  //   href: '/guides/ai',
  // },
  guides: {
    display: 'children',
  },
  reference: {
    type: 'page',
    title: (
      <span className="flex items-center gap-1 whitespace-nowrap">
        API 参考
        <sup><ShareRangeSingle /></sup>
      </span>
    ),
    href: 'https://reference.univer.ai/zh-CN',
  },
  blog: {
    type: 'page',
    title: '博客',
  },
}
