'use client'

import { useLocale } from 'next-intl'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'

const labels: Record<string, string[]> = {
  'en-US': [
    'Freeze panes',
    'Scroll the grid in both directions and watch the frozen cells.',
    'None',
    'First row',
    'First row and column',
    'Row 2 and column B',
    'Scrollable worksheet',
    'The split is a count; the start is the first scrollable index (zero-based). Earlier rows and columns are outside this view.',
  ],
  'zh-CN': [
    '冻结窗格示意',
    '向下、向右滚动，观察哪些单元格留在原位。',
    '不冻结',
    '首行',
    '首行与首列',
    '第 2 行与 B 列',
    '可滚动工作表',
    'split 表示冻结数量，start 表示可滚动区域的起始索引（从 0 开始）；更早的行列不在当前视图中。',
  ],
  'zh-TW': [
    '凍結窗格示意',
    '向下、向右捲動，觀察哪些儲存格留在原位。',
    '不凍結',
    '首列',
    '首列與首欄',
    '第 2 列與 B 欄',
    '可捲動工作表',
    'split 表示凍結數量，start 表示可捲動區域的起始索引（從 0 開始）；更早的列欄不在目前視圖中。',
  ],
  'ja-JP': [
    'ウィンドウ枠の固定',
    '縦横にスクロールして、固定されたセルを確認します。',
    '固定なし',
    '先頭行',
    '先頭行と列',
    '2 行目と B 列',
    'スクロール可能なシート',
    'split は固定する数、start はスクロール領域の開始インデックス（0 始まり）です。それより前の行・列は表示範囲外です。',
  ],
  'ko-KR': [
    '틀 고정 미리보기',
    '가로와 세로로 스크롤하여 고정된 셀을 확인하세요.',
    '고정 없음',
    '첫 행',
    '첫 행과 열',
    '2행과 B열',
    '스크롤 가능한 시트',
    'split은 고정할 개수이고 start는 스크롤 영역의 시작 인덱스(0부터)입니다. 앞쪽 행과 열은 현재 보기에 없습니다.',
  ],
  'fr-FR': [
    'Figer les volets',
    'Faites défiler la grille dans les deux sens pour repérer les cellules figées.',
    'Aucun',
    'Première ligne',
    'Première ligne et colonne',
    'Ligne 2 et colonne B',
    'Feuille défilante',
    'split indique le nombre figé et start le premier indice défilant (à partir de 0). Les lignes et colonnes précédentes sont hors de cette vue.',
  ],
  'es-ES': [
    'Inmovilizar paneles',
    'Desplaza la cuadrícula en ambas direcciones y observa las celdas fijas.',
    'Ninguno',
    'Primera fila',
    'Primera fila y columna',
    'Fila 2 y columna B',
    'Hoja desplazable',
    'split es la cantidad fija y start es el primer índice desplazable (desde 0). Las filas y columnas anteriores quedan fuera de esta vista.',
  ],
  'ru-RU': [
    'Закрепление областей',
    'Прокрутите сетку в обоих направлениях и найдите закреплённые ячейки.',
    'Без закрепления',
    'Первая строка',
    'Первая строка и столбец',
    'Строка 2 и столбец B',
    'Прокручиваемый лист',
    'split — количество закреплённых элементов, start — первый прокручиваемый индекс (от 0). Предыдущие строки и столбцы вне этой области.',
  ],
}
const presets = [
  { startRow: -1, startColumn: -1, ySplit: 0, xSplit: 0 },
  { startRow: 1, startColumn: -1, ySplit: 1, xSplit: 0 },
  { startRow: 1, startColumn: 1, ySplit: 1, xSplit: 1 },
  { startRow: 2, startColumn: 2, ySplit: 1, xSplit: 1 },
]

export function FreezeDemo() {
  const [title, description, ...text] = labels[useLocale()]
  const [preset, setPreset] = useState(2)
  const viewport = useRef<HTMLDivElement>(null)
  const freeze = presets[preset]
  const firstRow = Math.max(0, freeze.startRow - freeze.ySplit)
  const firstColumn = Math.max(0, freeze.startColumn - freeze.xSplit)
  const rows = Array.from({ length: 18 - firstRow }, (_, i) => firstRow + i)
  const columns = Array.from({ length: 8 - firstColumn }, (_, i) => firstColumn + i)

  return (
    <section aria-label={title} className="not-prose bg-card my-6 space-y-4 rounded-xl border p-4 text-sm sm:p-5">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div role="group" aria-label={title} className="flex flex-wrap gap-2">
        {presets.map((value, index) => (
          <Button
            key={`${value.startRow}:${value.startColumn}`}
            size="sm"
            variant={index === preset ? 'default' : 'outline'}
            aria-pressed={index === preset}
            onClick={() => {
              setPreset(index)
              viewport.current?.scrollTo(0, 0)
            }}
          >
            {text[index]}
          </Button>
        ))}
      </div>
      <div
        ref={viewport}
        role="region"
        aria-label={text[4]}
        tabIndex={0}
        className="focus-visible:outline-ring h-64 overflow-auto rounded-md border focus-visible:outline-2"
      >
        <table className="w-max table-fixed border-separate border-spacing-0 text-center text-xs">
          <thead>
            <tr>
              <th className="bg-muted sticky top-0 left-0 z-30 h-8 min-w-10 border-r border-b" aria-label="#" />
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="bg-muted sticky top-0 z-20 h-8 min-w-28 border-r border-b font-medium"
                  style={{
                    left: column < freeze.startColumn ? 40 + (column - firstColumn) * 112 : undefined,
                    zIndex: column < freeze.startColumn ? 25 : 20,
                  }}
                >
                  {String.fromCharCode(65 + column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row}>
                <th
                  scope="row"
                  className="bg-muted sticky left-0 z-20 h-9 min-w-10 border-r border-b font-medium"
                  style={{
                    top: row < freeze.startRow ? 32 + (row - firstRow) * 36 : undefined,
                    zIndex: row < freeze.startRow ? 25 : 20,
                  }}
                >
                  {row + 1}
                </th>
                {columns.map((column) => {
                  const frozenRow = row < freeze.startRow
                  const frozenColumn = column < freeze.startColumn
                  return (
                    <td
                      key={column}
                      className={clsx(
                        'h-9 min-w-28 border-r border-b',
                        frozenRow || frozenColumn
                          ? 'bg-accent text-accent-foreground sticky'
                          : 'bg-background text-muted-foreground',
                      )}
                      style={{
                        top: frozenRow ? 32 + (row - firstRow) * 36 : undefined,
                        left: frozenColumn ? 40 + (column - firstColumn) * 112 : undefined,
                        zIndex: frozenRow && frozenColumn ? 15 : frozenRow || frozenColumn ? 10 : undefined,
                      }}
                    >
                      {String.fromCharCode(65 + column)}
                      {row + 1}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">{JSON.stringify(freeze, null, 2)}</pre>
      <p className="text-muted-foreground text-xs leading-5">{text[5]}</p>
    </section>
  )
}
