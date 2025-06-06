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
    title: (
      <span title="源码地址: https://github.com/dream-num/univer-documentation/tree/dev/showcase">
        在线演示
      </span>
    ),
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
