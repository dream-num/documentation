'use client'

import * as icons from '@univerjs/icons'
import { CheckIcon, CopyIcon, RotateCcwIcon, ScanLineIcon, SearchIcon, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMemo, useState } from 'react'

import { ColorPickerPopover } from '@/components/color-picker-popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { clsx } from '@/lib/clsx'
import { searchIcons } from '@/lib/icons/catalog'
import catalog from '@/public/assets/icons/catalog.json'

type GalleryLocale = 'en' | 'zh-CN' | 'zh-TW' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'ru-RU' | 'es-ES'

const translations = {
  'es-ES': {
    accent: 'Acento',
    all: 'Todos',
    channel: 'Canal',
    clearSearch: 'Borrar búsqueda',
    copied: 'Copiado',
    copyImport: 'Copiar import',
    double: 'Dos colores',
    emptyTitle: 'No se encontraron iconos',
    emptyHint: 'Prueba otra búsqueda o categoría.',
    multi: 'Multicolor',
    pickColor: 'Elegir color',
    searchPlaceholder: 'Buscar nombre o uso…',
    showing: 'Mostrando',
    single: 'Un color',
    size: 'Tamaño',
    stroke: 'Principal',
  },
  en: {
    accent: 'Accent',
    all: 'All',
    channel: 'Channel',
    clearSearch: 'Clear search',
    copied: 'Copied',
    copyImport: 'Copy import',
    double: 'Double',
    emptyTitle: 'No icons found',
    emptyHint: 'Try another name or switch category.',
    multi: 'Multi',
    pickColor: 'Pick color',
    searchPlaceholder: 'Search icon name…',
    showing: 'Showing',
    single: 'Single',
    size: 'Size',
    stroke: 'Stroke',
  },
  'zh-CN': {
    accent: '强调色',
    all: '全部',
    channel: '通道',
    clearSearch: '清空搜索',
    copied: '已复制',
    copyImport: '复制 import',
    double: '双色',
    emptyTitle: '没有找到图标',
    emptyHint: '换个关键词，或切换分类再试。',
    multi: '多色',
    pickColor: '选择颜色',
    searchPlaceholder: '搜索图标名称…',
    showing: '显示',
    single: '单色',
    size: '尺寸',
    stroke: '主色',
  },
  'zh-TW': {
    accent: '強調色',
    all: '全部',
    channel: '通道',
    clearSearch: '清空搜尋',
    copied: '已複製',
    copyImport: '複製 import',
    double: '雙色',
    emptyTitle: '沒有找到圖示',
    emptyHint: '換個關鍵字，或切換分類再試。',
    multi: '多色',
    pickColor: '選擇顏色',
    searchPlaceholder: '搜尋圖示名稱…',
    showing: '顯示',
    single: '單色',
    size: '尺寸',
    stroke: '主色',
  },
  'ja-JP': {
    accent: 'アクセント',
    all: 'すべて',
    channel: 'チャンネル',
    clearSearch: '検索をクリア',
    copied: 'コピー済み',
    copyImport: 'import をコピー',
    double: '2 色',
    emptyTitle: 'アイコンが見つかりません',
    emptyHint: '別の名前かカテゴリで試してください。',
    multi: '多色',
    pickColor: '色を選択',
    searchPlaceholder: 'アイコン名を検索…',
    showing: '表示中',
    single: '単色',
    size: 'サイズ',
    stroke: '主色',
  },
  'ko-KR': {
    accent: '강조색',
    all: '전체',
    channel: '채널',
    clearSearch: '검색 지우기',
    copied: '복사됨',
    copyImport: 'import 복사',
    double: '2색',
    emptyTitle: '아이콘을 찾을 수 없습니다',
    emptyHint: '다른 이름으로 검색하거나 카테고리를 바꿔 보세요.',
    multi: '다색',
    pickColor: '색상 선택',
    searchPlaceholder: '아이콘 이름 검색…',
    showing: '표시 중',
    single: '단색',
    size: '크기',
    stroke: '기본색',
  },
  'fr-FR': {
    accent: 'Accent',
    all: 'Tous',
    channel: 'Canal',
    clearSearch: 'Effacer la recherche',
    copied: 'Copié',
    copyImport: 'Copier l’import',
    double: 'Bicolore',
    emptyTitle: 'Aucune icône trouvée',
    emptyHint: 'Essayez un autre nom ou changez de catégorie.',
    multi: 'Multicolore',
    pickColor: 'Choisir une couleur',
    searchPlaceholder: 'Rechercher une icône…',
    showing: 'Affichage',
    single: 'Monochrome',
    size: 'Taille',
    stroke: 'Couleur principale',
  },
  'ru-RU': {
    accent: 'Акцент',
    all: 'Все',
    channel: 'Канал',
    clearSearch: 'Очистить поиск',
    copied: 'Скопировано',
    copyImport: 'Копировать импорт',
    double: 'Двухцветные',
    emptyTitle: 'Значки не найдены',
    emptyHint: 'Попробуйте другое название или смените категорию.',
    multi: 'Многоцветные',
    pickColor: 'Выбрать цвет',
    searchPlaceholder: 'Поиск значка…',
    showing: 'Показано',
    single: 'Одноцветные',
    size: 'Размер',
    stroke: 'Основной цвет',
  },
} satisfies Record<GalleryLocale, Record<string, string>>

const iconComponents = new Map(Object.entries(icons))

const subgroupNames: Record<string, string> = {
  general: 'General',
  diagram: 'Diagram',
  'stroke-size': 'Stroke size',
  brand: 'Brand',
  chart: 'Chart',
  currency: 'Currency',
  function: 'Function',
  formula: 'Formula',
  shape: 'Shape',
  double: 'Double',
  multi: 'Multi',
}
const subgroupNamesZh: Record<string, string> = {
  general: '通用',
  diagram: '图解与连接符',
  'stroke-size': '线宽',
  brand: '品牌与应用',
  chart: '图表',
  currency: '货币',
  function: '函数分类',
  formula: '公式与数学',
  shape: '绘图形状',
  double: '双色',
  multi: '多色',
}

export function IconsGallery({ locale = 'en' }: { locale?: GalleryLocale }) {
  const t = translations[locale]
  const zh = locale === 'zh-CN' || locale === 'zh-TW'
  const { resolvedTheme } = useTheme()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [subgroup, setSubgroup] = useState('all')
  const [size, setSize] = useState(32)
  const [primary, setPrimary] = useState<string | null>(null)
  const [accent, setAccent] = useState<string | null>(null)
  const [preserveStrokeWidth, setPreserveStrokeWidth] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [copyError, setCopyError] = useState(false)
  const color = primary ?? (resolvedTheme === 'dark' ? '#e4e4e7' : '#27272a')
  const channel = accent ?? (resolvedTheme === 'dark' ? '#71717a' : '#d4d4d8')
  const results = useMemo(() => searchIcons(query, group, subgroup), [query, group, subgroup])
  const subgroups = [
    ...new Set(catalog.icons.filter((icon) => group === 'all' || icon.group === group).map((icon) => icon.subgroup)),
  ]
  const sections = [...new Set(results.map((icon) => `${icon.group}/${icon.subgroup}`))]

  function categoryLabel(value: string) {
    return (zh ? subgroupNamesZh[value] : subgroupNames[value]) ?? value
  }

  function resetPreview() {
    setPrimary(null)
    setAccent(null)
    setSize(32)
    setPreserveStrokeWidth(false)
  }

  async function copyIcon(componentName: string) {
    try {
      await navigator.clipboard.writeText(`import { ${componentName} } from '@univerjs/icons'`)
      setCopied(componentName)
      setCopyError(false)
    } catch {
      setCopied(null)
      setCopyError(true)
    }
  }

  return (
    <div className="not-prose text-sm leading-normal [overflow-anchor:none]" data-icon-gallery>
      <div
        className="border-border bg-background relative z-20 mb-7 border-b py-4 lg:sticky lg:-top-8 lg:-mx-6 lg:px-6"
        aria-label={zh ? '图标预览设置' : 'Icon preview controls'}
        data-icon-controls
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_10rem]">
          <div className="relative col-span-2 sm:col-span-1">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
            <Input
              aria-label={zh ? '搜索图标名称或用途' : 'Search icons by name or purpose'}
              className="bg-muted/35 h-9 pr-9 pl-9 shadow-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={zh ? '搜索名称或用途…' : 'Search name or purpose…'}
            />
            {query ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t.clearSearch}
                onClick={() => setQuery('')}
                className="absolute top-0 right-0 size-9"
              >
                <XIcon className="size-4" />
              </Button>
            ) : null}
          </div>
          <Select
            value={group}
            onValueChange={(value) => {
              if (value) {
                setGroup(value)
                setSubgroup('all')
              }
            }}
          >
            <SelectTrigger className="w-full shadow-none" aria-label={zh ? '颜色类型' : 'Color style'}>
              <SelectValue>{group === 'all' ? t.all : t[group as 'single' | 'double' | 'multi']}</SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">{t.all}</SelectItem>
              <SelectItem value="single">{t.single}</SelectItem>
              <SelectItem value="double">{t.double}</SelectItem>
              <SelectItem value="multi">{t.multi}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={subgroup}
            onValueChange={(value) => {
              if (value) setSubgroup(value)
            }}
          >
            <SelectTrigger className="w-full shadow-none" aria-label={zh ? '图标分类' : 'Icon category'}>
              <SelectValue>
                {subgroup === 'all' ? (zh ? '全部分类' : 'All categories') : categoryLabel(subgroup)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">{zh ? '全部分类' : 'All categories'}</SelectItem>
              {subgroups.map((value) => (
                <SelectItem key={value} value={value}>
                  {categoryLabel(value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          className="bg-muted/35 mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg px-3 py-2.5 text-xs"
          data-icon-preview-tools
        >
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t.stroke}</span>
            <ColorPickerPopover ariaLabel={t.stroke} value={color} onValueChange={setPrimary} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{t.accent}</span>
            <ColorPickerPopover ariaLabel={t.accent} value={channel} onValueChange={setAccent} />
          </div>
          <div className="flex min-w-32 flex-1 items-center gap-3">
            <span className="text-muted-foreground">{t.size}</span>
            <Slider
              aria-label={t.size}
              className="min-w-12 flex-1"
              min={16}
              max={48}
              step={1}
              value={size}
              onValueChange={setSize}
            />
            <output className="w-9 text-right tabular-nums">{size} px</output>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={preserveStrokeWidth ? 'secondary' : 'ghost'}
              aria-pressed={preserveStrokeWidth}
              onClick={() => setPreserveStrokeWidth((value) => !value)}
              className="h-8 text-xs"
            >
              <ScanLineIcon className="size-3.5" />
              {zh ? '保持描边' : 'Fixed stroke'}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              aria-label={zh ? '重置预览' : 'Reset preview'}
              onClick={resetPreview}
            >
              <RotateCcwIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="text-muted-foreground mb-7 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span role="status">
          {t.showing} <span className="text-foreground font-medium tabular-nums">{results.length}</span> /{' '}
          {catalog.icons.length}
        </span>
        <a download href="/assets/icons/catalog.json" className="hover:text-foreground transition-colors">
          {zh ? '下载元数据 JSON ↗' : 'Download metadata JSON ↗'}
        </a>
      </div>
      {copyError ? (
        <p role="alert" className="mb-4 text-sm">
          {zh
            ? '无法访问剪贴板，请根据图标名称手动导入。'
            : 'Clipboard access failed. Use the displayed component name to write your import.'}
        </p>
      ) : null}
      {sections.map((section) => {
        const [style, category] = section.split('/')
        const items = results.filter((icon) => icon.group === style && icon.subgroup === category)
        return (
          <section
            key={section}
            className="mb-10"
            aria-label={`${t[style as 'single' | 'double' | 'multi']} / ${categoryLabel(category)}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <h2 className="flex items-baseline gap-2 text-sm font-semibold">
                <span className="text-muted-foreground font-normal">{t[style as 'single' | 'double' | 'multi']}</span>
                <span className="text-border">/</span>
                {categoryLabel(category)}
              </h2>
              <span className="text-muted-foreground text-xs tabular-nums">{items.length}</span>
              <div className="bg-border/60 h-px flex-1" />
            </div>
            <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-3 p-0">
              {items.map((item) => {
                const Icon = iconComponents.get(item.componentName)!
                return (
                  <li key={item.componentName}>
                    <button
                      type="button"
                      onClick={() => copyIcon(item.componentName)}
                      aria-label={`${t.copyImport}: ${item.componentName}`}
                      title={item.description}
                      className="group border-border/70 bg-background hover:border-foreground/25 hover:bg-muted/30 focus-visible:ring-ring relative flex h-full min-h-36 w-full flex-col overflow-hidden rounded-lg border p-2 text-center transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      <span className="bg-muted/30 mb-2 grid h-20 w-full place-items-center rounded-md">
                        <Icon
                          style={{ color, fontSize: size }}
                          extend={{ colorChannel1: channel }}
                          preserveStrokeWidth={preserveStrokeWidth}
                        />
                      </span>
                      <span className="text-foreground px-1 pb-1 font-mono text-[11px] leading-4 break-all">
                        {item.componentName}
                      </span>
                      <span
                        className={clsx(
                          'bg-background/90 absolute top-3 right-3 grid size-5 place-items-center rounded',
                          copied === item.componentName
                            ? 'text-foreground'
                            : 'text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                        )}
                      >
                        {copied === item.componentName ? (
                          <CheckIcon className="size-3" />
                        ) : (
                          <CopyIcon className="size-3" />
                        )}
                      </span>
                      {item.preserveStrokeWidthSupport === 'full' ? (
                        <span
                          title={zh ? '支持保持描边宽度' : 'Supports fixed stroke width'}
                          className="text-muted-foreground/60 absolute top-3 left-3"
                        >
                          <ScanLineIcon className="size-3" />
                        </span>
                      ) : null}
                      {copied === item.componentName ? (
                        <span role="status" className="sr-only">
                          {t.copied}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p>{t.emptyTitle}</p>
          <p className="text-muted-foreground mt-2 text-sm">{t.emptyHint}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setQuery('')
              setGroup('all')
              setSubgroup('all')
            }}
          >
            {t.clearSearch}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
