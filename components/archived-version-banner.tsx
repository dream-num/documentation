import { Banner } from 'fumadocs-ui/components/banner'
import { ArrowUpRightIcon } from 'lucide-react'

import { localizePath } from '@/lib/i18n'

const labels: Record<string, { message: string, link: string }> = {
  'en-US': { message: 'You are viewing the archived v0.25.x documentation.', link: 'Read the latest docs' },
  'zh-CN': { message: '你正在阅读 v0.25.x 旧版文档。', link: '查看新版文档' },
  'zh-TW': { message: '你正在閱讀 v0.25.x 舊版文件。', link: '查看新版文件' },
  'ja-JP': { message: 'v0.25.x の旧バージョンのドキュメントです。', link: '最新版を見る' },
}

export function ArchivedVersionBanner({ lang }: { lang: string }) {
  const label = labels[lang]

  return (
    <Banner height="3rem" role="region" aria-label={label.message}>
      <p
        className="
          text-xs
          sm:text-sm
        "
      >
        {label.message}
        {' '}
        <a
          className="
            inline-flex items-center gap-1 font-semibold underline underline-offset-4
            focus-visible:outline-2
          "
          href={`https://docs.univer.ai${localizePath('/', lang)}`}
        >
          {label.link}
          <ArrowUpRightIcon aria-hidden className="size-3.5" />
        </a>
      </p>
    </Banner>
  )
}
