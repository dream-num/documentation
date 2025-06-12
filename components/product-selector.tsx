'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/hooks/i18n'
import clsx from '@/lib/clsx'

function Icon() {
  return (
    <svg
      className="text-gray-500"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 9L12 5L8 9M8 15L12 19L16 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function ProductSelector() {
  const pathname = usePathname()

  const btnRef = useRef<HTMLAnchorElement>(null)
  const [visible, setVisible] = useState(false)

  const locale = pathname.split('/')[1]

  const t = useTranslation(locale, {
    'zh-CN': {
      introduction: '简介',
      guides: '指南',
      univerai: '表答 AI',
    },
    'en-US': {
      introduction: 'Introduction',
      guides: 'Guides',
      univerai: 'Univer AI',
    },
  })

  const routeMap = [{
    pathPrefix: '/introduction',
    title: 'Univer',
    desc: t('introduction'),
    icon: '🌌',
    color: '41, 122, 122',
  }, {
    pathPrefix: '/guides/sheets',
    title: 'Univer Sheets',
    desc: `${t('guides')} / Univer Sheets`,
    icon: '📊',
    color: '47, 117, 56',
  }, {
    pathPrefix: '/guides/docs',
    title: 'Univer Docs',
    desc: `${t('guides')} / Univer Docs`,
    icon: '📝',
    color: '16, 73, 147',
  // }, {
  //   pathPrefix: '/guides/ai',
  //   title: `${t('univerai')}`,
  //   desc: `${t('guides')} / ${t('univerai')}`,
  //   icon: '🤖',
  //   color: '145, 18, 18',
  }]

  const route = routeMap.find((item) => {
    const [_, lang] = pathname.split('/')
    return pathname.startsWith(`/${lang}${item.pathPrefix}`)
  })

  useEffect(() => {
    function clickOutside(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return

      setVisible(false)
    }

    document.addEventListener('click', clickOutside)
    return () => document.removeEventListener('click', clickOutside)
  }, [])

  if (!route) return null

  function handleToggleVisible(e: React.MouseEvent) {
    e.stopPropagation()
    setVisible(!visible)
  }

  return (
    <section className="relative -left-2 w-[calc(100%+16px)]">
      <a
        ref={btnRef}
        className={`
          flex w-full cursor-pointer items-center justify-between gap-2 rounded-md p-2 transition-all duration-200
          ease-in-out
          hover:bg-gray-200
          dark:hover:bg-primary-100/5
        `}
        onClick={handleToggleVisible}
      >
        <span className="flex items-center gap-2">
          <span className="text-2xl">
            {route.icon}
          </span>
          <span className="grid whitespace-nowrap">
            <span>{route.title}</span>
            <span className="text-xs opacity-60">{route.desc}</span>
          </span>
        </span>
        <Icon />
      </a>

      <div
        className={clsx(`
          invisible absolute top-0 z-10 grid w-full gap-2 rounded-[10px] border border-white bg-white p-2 text-sm
          opacity-0 shadow-[0_-3px_6px_0_rgba(244,245,250,0.60)_inset,0_2px_16px_-1px_rgba(17,22,40,0.07)]
          transition-all duration-200 ease-in-out
          dark:border-black/70 dark:bg-black dark:shadow-black
        `, {
          'visible translate-y-12 opacity-100': visible,
        })}
      >
        {routeMap.map(item => (
          <Link
            key={item.pathPrefix}
            className={`
              flex cursor-pointer items-center gap-2 p-2 font-normal text-gray-500 transition-all
              hover:text-gray-700
              dark:hover:text-gray-100
            `}
            href={item.pathPrefix}
          >
            <span
              className="text-2xl"

            >
              {item.icon}
            </span>

            <span className="grid">
              <span className="font-semibold">{item.title}</span>
              <span className="text-xs opacity-60">{item.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
