import ProductSelector from '@/components/product-selector'
import { ShareRangeSingle } from '@univerjs/icons'

export default {
  selector: {
    title: <ProductSelector />,
    type: 'separator',
  },
  introduction: {
    type: 'page',
    title: 'Introduction',
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
    title: 'Playground',
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
        API Reference
        <sup><ShareRangeSingle /></sup>
      </span>
    ),
    href: 'https://reference.univer.ai/en-US',
  },
  blog: {
    type: 'page',
    title: 'Blog',
  },
}
