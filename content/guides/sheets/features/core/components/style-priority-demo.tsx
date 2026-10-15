'use client'

import { useLocale } from 'next-intl'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

const labels: Record<string, string[]> = {
  'en-US': [
    'Background style priority',
    'B2 has both a row default and a column default. Change the winner, then add a cell style.',
    'Prefer the row style',
    'Set a background on B2',
    'Worksheet',
    'Row',
    'Column',
    'Cell',
    'B2 uses',
    'This illustration compares background colors; other style properties are merged independently.',
  ],
  'zh-CN': [
    '背景色优先级示意',
    'B2 同时具有行默认样式和列默认样式。切换优先级，再为单元格单独设色。',
    '行样式优先',
    '为 B2 设置单元格背景',
    '工作表',
    '行',
    '列',
    '单元格',
    'B2 使用',
    '示意只比较背景色；其他样式属性分别合并。',
  ],
  'zh-TW': [
    '背景色優先順序示意',
    'B2 同時具有列預設樣式和欄預設樣式。切換優先順序，再為儲存格單獨設色。',
    '橫列樣式優先',
    '為 B2 設定儲存格背景',
    '工作表',
    '橫列',
    '直欄',
    '儲存格',
    'B2 使用',
    '示意只比較背景色；其他樣式屬性各自合併。',
  ],
  'ja-JP': [
    '背景色の優先順位',
    'B2 には行と列の既定スタイルがあります。優先順位を変え、セルにも色を設定してみましょう。',
    '行スタイルを優先',
    'B2 の背景色を設定',
    'シート',
    '行',
    '列',
    'セル',
    'B2 の適用元',
    '背景色を比較する模式図です。他のスタイル属性は個別に合成されます。',
  ],
  'ko-KR': [
    '배경색 우선순위',
    'B2에는 행과 열의 기본 스타일이 모두 있습니다. 우선순위를 바꾸고 셀 배경색도 지정해 보세요.',
    '행 스타일 우선',
    'B2 배경색 지정',
    '시트',
    '행',
    '열',
    '셀',
    'B2 적용 스타일',
    '배경색만 비교하는 예시입니다. 다른 스타일 속성은 각각 병합됩니다.',
  ],
  'fr-FR': [
    'Priorité des couleurs de fond',
    'B2 reçoit les styles de sa ligne et de sa colonne. Changez la priorité, puis ajoutez un style de cellule.',
    'Priorité à la ligne',
    'Définir le fond de B2',
    'Feuille',
    'Ligne',
    'Colonne',
    'Cellule',
    'Style appliqué à B2',
    'Cette illustration compare les fonds ; les autres propriétés sont fusionnées séparément.',
  ],
  'es-ES': [
    'Prioridad del fondo',
    'B2 recibe estilos de fila y columna. Cambia la prioridad y añade un estilo de celda.',
    'Priorizar la fila',
    'Definir el fondo de B2',
    'Hoja',
    'Fila',
    'Columna',
    'Celda',
    'Estilo de B2',
    'La ilustración compara fondos; las demás propiedades se combinan por separado.',
  ],
  'ru-RU': [
    'Приоритет фона',
    'B2 получает стили строки и столбца. Измените приоритет и добавьте собственный фон ячейки.',
    'Приоритет строки',
    'Задать фон B2',
    'Лист',
    'Строка',
    'Столбец',
    'Ячейка',
    'Источник стиля B2',
    'Схема сравнивает фон; остальные свойства стиля объединяются независимо.',
  ],
}
const colors = [
  'bg-muted text-muted-foreground',
  'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
  'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
]

export function StylePriorityDemo() {
  const text = labels[useLocale()]
  const [rowPriority, setRowPriority] = useState(false)
  const [cellStyle, setCellStyle] = useState(false)
  const winner = cellStyle ? 3 : rowPriority ? 1 : 2

  return (
    <section aria-label={text[0]} className="not-prose bg-card my-6 space-y-4 rounded-xl border p-4 text-sm sm:p-5">
      <div className="space-y-1">
        <p className="font-medium">{text[0]}</p>
        <p className="text-muted-foreground">{text[1]}</p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={rowPriority} onCheckedChange={setRowPriority} />
          {text[2]}
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={cellStyle} onCheckedChange={setCellStyle} />
          {text[3]}
        </label>
      </div>
      <div className="bg-border grid grid-cols-3 gap-px overflow-hidden rounded-md border">
        {[0, 1, 2].flatMap((row) =>
          [0, 1, 2].map((column) => {
            const source = row === 1 && column === 1 ? winner : row === 1 ? 1 : column === 1 ? 2 : 0
            const address = `${String.fromCharCode(65 + column)}${row + 1}`
            return (
              <div key={address} className={`space-y-1 px-2 py-4 text-center ${colors[source]}`}>
                <p className="font-mono text-xs">{address}</p>
                <p className="text-xs">{text[source + 4]}</p>
              </div>
            )
          }),
        )}
      </div>
      <p role="status" className="font-medium">
        {text[8]}: {text[winner + 4]}
      </p>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-xs">{`isRowStylePrecedeColumnStyle: ${rowPriority}`}</pre>
      <p className="text-muted-foreground text-xs leading-5">{text[9]}</p>
    </section>
  )
}
