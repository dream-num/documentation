import DotBadge from '@/components/dot-badge'
import ProTag from '@/components/pro-tag'

export default {
  'core': 'Core',
  'filter': 'Filter',
  'sort': 'Sort',
  'data-validation': 'Data Validation',
  'conditional-formatting': 'Conditional Formatting',
  'hyperlink': 'Hyperlink',
  'floating-images': 'Images',
  'watermark': 'Watermark',
  'table': {
    title: <DotBadge>Table</DotBadge>,
  },
  'advanced-formula': {
    title: <ProTag>Advanced Formula</ProTag>,
  },
  'print': {
    title: <ProTag>Print</ProTag>,
  },
  'pivot-table': {
    title: <ProTag>Pivot Table</ProTag>,
  },
  'sparkline': {
    title: <ProTag>Sparkline</ProTag>,
  },
  'import-export': {
    title: <ProTag>Import & Export</ProTag>,
  },
  'collaboration': {
    title: <ProTag>Collaborative Editing</ProTag>,
  },
  'edit-history': {
    title: <ProTag>Edit History</ProTag>,
  },
  'chart': {
    title: (
      <ProTag>
        <DotBadge>Charts</DotBadge>
      </ProTag>
    ),
  },
  // 'live-share': {
  //   title: <ProTag>Live Share</ProTag>,
  // },
  'thread-comment': 'Thread Comment',
  'note': {
    title: <DotBadge>Annotation</DotBadge>,
  },
  'find-replace': 'Find & Replace',
  'crosshair': 'Crosshair Highlight',
  'zen-editor': 'Zen Editor',
  'uniscript': 'Uniscript',
}
