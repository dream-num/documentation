import DotBadge from '@/components/dot-badge'
import ProTag from '@/components/pro-tag'

export default {
  'core': '核心功能',
  'filter': '筛选',
  'sort': '排序',
  'data-validation': '数据验证',
  'conditional-formatting': '条件格式',
  'hyperlink': '超链接',
  'floating-images': '图片',
  'watermark': '水印',
  'table': {
    title: <DotBadge>表格</DotBadge>,
  },
  'advanced-formula': {
    title: <ProTag>高阶公式</ProTag>,
  },
  'print': {
    title: <ProTag>打印</ProTag>,
  },
  'pivot-table': {
    title: <ProTag>数据透视表</ProTag>,
  },
  'sparkline': {
    title: <ProTag>迷你图</ProTag>,
  },
  'import-export': {
    title: <ProTag>导入导出</ProTag>,
  },
  'collaboration': {
    title: <ProTag>协同编辑</ProTag>,
  },
  'edit-history': {
    title: <ProTag>历史记录</ProTag>,
  },
  'chart': {
    title: (
      <ProTag>
        <DotBadge>图表</DotBadge>
      </ProTag>
    ),
  },
  // 'live-share': {
  //   title: <ProTag>Live Share</ProTag>,
  // },
  'thread-comment': '评论',
  'note': {
    title: <DotBadge>批注</DotBadge>,
  },
  'find-replace': '查找 & 替换',
  'crosshair': '十字高亮',
  'zen-editor': '禅编辑器',
  'uniscript': 'Uniscript',
}
