'use client'

import type { ComponentType, CSSProperties } from 'react'
import * as icons from '@univerjs/icons'
import { CheckIcon, CopyIcon, SearchIcon, XIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMemo, useState, useSyncExternalStore } from 'react'

import { ColorPickerPopover } from '@/components/color-picker-popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { clsx } from '@/lib/clsx'

interface IconItem {
  componentName: string
  kebabName: string
  component: ComponentType<{
    style?: CSSProperties
    extend?: { colorChannel1?: string }
  }>
}

type IconGroup = 'single' | 'double' | 'multi'
type IconGroupFilter = 'all' | IconGroup
type GalleryLocale = 'en' | 'zh-CN' | 'zh-TW' | 'ja-JP' | 'ko-KR' | 'fr-FR' | 'ru-RU'

const translations = {
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
    searchPlaceholder: 'Search icon name...',
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
    searchPlaceholder: '搜索图标名称...',
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
    searchPlaceholder: '搜尋圖示名稱...',
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
    searchPlaceholder: 'アイコン名を検索...',
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
    searchPlaceholder: '아이콘 이름 검색...',
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
    searchPlaceholder: 'Rechercher une icône...',
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
    searchPlaceholder: 'Поиск значка...',
    showing: 'Показано',
    single: 'Одноцветные',
    size: 'Размер',
    stroke: 'Основной цвет',
  },
} satisfies Record<GalleryLocale, Record<string, string>>

function pascalToKebab(str: string) {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

function buildIconGroups() {
  const groups: Record<'single' | 'double' | 'multi', IconItem[]> = {
    single: [],
    double: [],
    multi: [],
  }

  for (const [componentName, component] of Object.entries(icons)) {
    const kebabName = pascalToKebab(componentName)
    const item: IconItem = {
      componentName,
      kebabName,
      component: component as IconItem['component'],
    }

    if (componentName.endsWith('DoubleIcon')) {
      groups.double.push(item)
    } else if (componentName.endsWith('MultiIcon')) {
      groups.multi.push(item)
    } else {
      groups.single.push(item)
    }
  }

  for (const group of Object.values(groups)) {
    group.sort((a, b) => a.componentName.localeCompare(b.componentName))
  }

  return groups
}

const PRESET_SIZES = [16, 20, 24, 32]
const GROUP_FILTERS: IconGroupFilter[] = ['all', 'single', 'double', 'multi']
const subscribeToMount = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function IconsGallery({ locale = 'en' }: { locale?: GalleryLocale }) {
  const t = translations[locale]
  const { resolvedTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribeToMount, getClientSnapshot, getServerSnapshot)
  const [activeGroup, setActiveGroup] = useState<IconGroupFilter>('all')
  const [fontSize, setFontSize] = useState(22)
  const [search, setSearch] = useState('')
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const defaultColor = useMemo(() => (resolvedTheme === 'dark' ? '#e4e4e7' : '#1b1c1e'), [resolvedTheme])
  const defaultColorChannel1 = useMemo(() => (resolvedTheme === 'dark' ? '#3b82f6' : '#2563eb'), [resolvedTheme])

  const [customColor, setCustomColor] = useState<string | null>(null)
  const [customColorChannel1, setCustomColorChannel1] = useState<string | null>(null)

  const color = customColor ?? defaultColor
  const colorChannel1 = customColorChannel1 ?? defaultColorChannel1

  const iconGroups = useMemo(() => buildIconGroups(), [])

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return iconGroups

    const result: typeof iconGroups = { single: [], double: [], multi: [] }
    for (const [groupName, groupItems] of Object.entries(iconGroups) as Array<[keyof typeof iconGroups, IconItem[]]>) {
      result[groupName] = groupItems.filter(
        (item) => item.componentName.toLowerCase().includes(term) || item.kebabName.toLowerCase().includes(term),
      )
    }
    return result
  }, [iconGroups, search])

  async function handleCopy(text: string, componentName: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Keep the UI responsive in browsers that block clipboard access.
    }

    setCopiedName(componentName)
    window.setTimeout(setCopiedName, 1500, null)
  }

  const displayedGroups = useMemo(
    () =>
      (Object.entries(filteredGroups) as Array<[IconGroup, IconItem[]]>).filter(([groupName, groupItems]) =>
        activeGroup === 'all' ? groupItems.length > 0 : groupName === activeGroup,
      ),
    [activeGroup, filteredGroups],
  )

  const totalCount = useMemo(
    () => Object.values(filteredGroups).reduce((sum, g) => sum + g.length, 0),
    [filteredGroups],
  )

  const visibleCount = useMemo(
    () => displayedGroups.reduce((sum, [, groupItems]) => sum + groupItems.length, 0),
    [displayedGroups],
  )

  return (
    <div className="not-prose">
      <div
        className="bg-background/95 supports-backdrop-filter:bg-background/82 sticky top-18 z-20 -mx-2 rounded-lg border p-3 shadow-sm backdrop-blur-sm lg:-mx-3"
      >
        <div className="grid gap-3">
          <div
            className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
          >
            <div
              className="relative min-w-0 flex-1 xl:max-w-md"
            >
              <SearchIcon className="text-muted-foreground/65 absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder={t.searchPlaceholder}
                className="border-border/80 bg-card h-10 rounded-lg px-9 text-sm shadow-xs"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search ? (
                <button
                  type="button"
                  aria-label={t.clearSearch}
                  onClick={() => setSearch('')}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
                >
                  <XIcon className="size-3.5" />
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-muted/35 flex rounded-lg border p-1">
                {GROUP_FILTERS.map((group) => {
                  const count = group === 'all' ? totalCount : filteredGroups[group].length
                  const isActive = activeGroup === group

                  return (
                    <button
                      key={group}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setActiveGroup(group)}
                      className={clsx(
                        `focus-visible:ring-ring/40 flex h-8 min-w-15 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]`,
                        isActive
                          ? 'bg-background text-foreground shadow-xs'
                          : `text-muted-foreground hover:text-foreground`,
                      )}
                    >
                      <span>{t[group]}</span>
                      <span className="text-muted-foreground text-[10px] tabular-nums">{count}</span>
                    </button>
                  )
                })}
              </div>

              <div className="bg-card flex h-10 items-center gap-2 rounded-lg border px-3 shadow-xs">
                <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                  {t.stroke}
                </span>
                <ColorPickerPopover ariaLabel={t.pickColor} value={color} onValueChange={setCustomColor} />
                <span className="text-muted-foreground ml-1 text-[11px] font-medium tracking-wider uppercase">
                  {t.accent}
                </span>
                <ColorPickerPopover
                  ariaLabel={t.pickColor}
                  value={colorChannel1}
                  onValueChange={setCustomColorChannel1}
                />
              </div>
            </div>
          </div>

          <div
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
              <span>{t.showing}</span>
              <span className="bg-muted text-foreground rounded-md px-2 py-0.5 text-xs font-medium tabular-nums">
                {visibleCount}
              </span>
              {search ? (
                <span className="min-w-0 truncate">
                  "<span className="text-foreground font-medium">{search}</span>"
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">{t.size}</span>
              <div className="flex items-center gap-1">
                {PRESET_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={clsx(
                      'h-7 rounded-md px-2 text-xs font-medium transition-colors',
                      fontSize === size
                        ? 'bg-foreground text-background shadow-xs'
                        : `bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground`,
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <Slider
                className="w-26"
                value={[fontSize]}
                min={12}
                max={40}
                step={1}
                onValueChange={(value) => setFontSize(value[0] ?? 22)}
              />
              <span className="text-muted-foreground w-10 text-right text-xs tabular-nums">
                {fontSize}
                px
              </span>
            </div>
          </div>
        </div>
      </div>

      {visibleCount === 0 && (
        <div className="bg-muted/20 mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed py-20">
          <div className="bg-background mb-4 flex size-12 items-center justify-center rounded-lg border shadow-xs">
            <SearchIcon className="text-muted-foreground size-5" />
          </div>
          <p className="text-foreground text-sm font-medium">{t.emptyTitle}</p>
          <p className="text-muted-foreground mt-1 text-sm">{t.emptyHint}</p>
          <Button className="mt-5" variant="outline" size="sm" onClick={() => setSearch('')}>
            <XIcon className="size-4" />
            {t.clearSearch}
          </Button>
        </div>
      )}

      <div className="mt-8 space-y-10">
        {displayedGroups.map(([groupName, groupItems]) =>
          groupItems.length === 0 ? null : (
            <section key={groupName}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-foreground text-sm font-semibold tracking-wide">{t[groupName]}</h2>
                <span
                  className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-medium tabular-nums"
                >
                  {groupItems.length}
                </span>
              </div>

              <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(116px,1fr))] gap-2">
                {groupItems.map((item) => {
                  const Icon = item.component
                  const isCopied = copiedName === item.componentName
                  const importStatement = `import { ${item.componentName} } from '@univerjs/icons'`

                  return (
                    <li key={item.componentName} className="m-0">
                      <button
                        type="button"
                        title={item.componentName}
                        aria-label={`${t.copyImport}: ${item.componentName}`}
                        className="group bg-card hover:border-foreground/15 focus-visible:ring-ring/40 relative block min-h-30 w-full rounded-lg border p-2.5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:outline-none"
                        onClick={() => handleCopy(importStatement, item.componentName)}
                      >
                        <span
                          className={clsx(
                            `bg-background absolute top-2 right-2 flex h-6 items-center gap-1 rounded-md border px-1.5 text-[10px] font-medium opacity-0 shadow-xs transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100`,
                            isCopied ? `text-emerald-600 opacity-100 dark:text-emerald-400` : `text-muted-foreground`,
                          )}
                        >
                          {isCopied ? <CheckIcon className="size-3" /> : <CopyIcon className="size-3" />}
                          {isCopied ? t.copied : null}
                        </span>

                        <span
                          className="bg-muted/35 group-hover:bg-muted/60 flex h-16 items-center justify-center rounded-md transition-colors"
                        >
                          {mounted ? (
                            <Icon
                              style={{
                                color,
                                fontSize: `${fontSize}px`,
                              }}
                              extend={groupName !== 'single' ? { colorChannel1 } : undefined}
                            />
                          ) : (
                            <span className="bg-muted-foreground/10 size-5 rounded-sm" aria-hidden />
                          )}
                        </span>

                        <span className="mt-2 block min-w-0">
                          <span className="text-foreground block truncate text-center text-[11px] font-medium">
                            {item.componentName}
                          </span>
                          <span className="text-muted-foreground mt-0.5 block truncate text-center text-[10px]">
                            {item.kebabName}
                          </span>
                        </span>
                        <span className="sr-only">{item.componentName}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          ),
        )}
      </div>
    </div>
  )
}
