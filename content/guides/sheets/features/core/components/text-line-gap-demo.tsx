'use client'

import { useLocale } from 'next-intl'
import { useId, useState } from 'react'
import { Slider } from '@/components/ui/slider'

const labels: Record<string, string[]> = {
  'en-US': [
    'Extra line gap',
    'Fixed row height',
    'Auto-sized row',
    'Univer Sheets',
    'Multi-line cell text',
    'More room between lines',
    'Schematic preview: fixed row heights can clip text when the line gap increases.',
  ],
  'zh-CN': [
    '额外行距',
    '固定行高',
    '自动调整行高',
    'Univer 电子表格',
    '单元格中的多行文字',
    '为每行文字留出更多空间',
    '示意：增大文字行距时，固定行高可能裁切内容，自动调整行高可容纳更多文字。',
  ],
  'zh-TW': [
    '額外行距',
    '固定列高',
    '自動調整列高',
    'Univer 試算表',
    '儲存格中的多行文字',
    '為每行文字保留更多空間',
    '示意：增加文字行距時，固定列高可能裁切內容，自動調整列高可容納更多文字。',
  ],
  'ja-JP': [
    '追加の行間',
    '固定の行高',
    '自動調整した行高',
    'Univer スプレッドシート',
    'セル内の複数行テキスト',
    '行と行の間に余白を追加',
    '模式図：行間を広げると、固定の行高ではテキストが切れる場合があります。',
  ],
  'ko-KR': [
    '추가 줄 간격',
    '고정 행 높이',
    '자동 조정 행 높이',
    'Univer 스프레드시트',
    '셀 안의 여러 줄 텍스트',
    '줄 사이에 여유 공간 추가',
    '개념도: 줄 간격을 늘리면 고정 행 높이에서 텍스트가 잘릴 수 있습니다.',
  ],
  'fr-FR': [
    'Espacement supplémentaire',
    'Hauteur de ligne fixe',
    'Hauteur ajustée',
    'Feuille Univer',
    'Texte multiligne dans une cellule',
    'Plus d’espace entre les lignes',
    'Schéma : une hauteur fixe peut couper le texte quand l’espacement augmente.',
  ],
  'es-ES': [
    'Espacio adicional',
    'Altura de fila fija',
    'Altura ajustada',
    'Hoja de Univer',
    'Texto de varias líneas en una celda',
    'Más espacio entre líneas',
    'Esquema: una altura fija puede recortar el texto al aumentar el espacio entre líneas.',
  ],
  'ru-RU': [
    'Дополнительный интервал',
    'Фиксированная высота',
    'Автоподбор высоты',
    'Таблица Univer',
    'Многострочный текст в ячейке',
    'Больше места между строками',
    'Схема: при увеличении интервала фиксированная высота может обрезать текст.',
  ],
}

export function TextLineGapDemo() {
  const text = labels[useLocale()]
  const id = useId()
  const [gap, setGap] = useState(0)

  return (
    <figure className="not-prose my-6 space-y-4 rounded-lg border p-4" aria-labelledby={id}>
      <div className="flex justify-between gap-3 text-sm">
        <span id={id}>{text[0]}</span>
        <output aria-live="polite">{gap} px</output>
      </div>
      <Slider aria-label={text[0]} value={gap} min={0} max={16} step={1} onValueChange={setGap} />
      <div className="grid items-start gap-4 sm:grid-cols-2">
        {[false, true].map((autoHeight) => (
          <div key={String(autoHeight)} className="min-w-0 space-y-2">
            <p className="text-muted-foreground text-xs">{text[autoHeight ? 2 : 1]}</p>
            <div
              className="bg-muted/30 overflow-hidden rounded border px-3"
              style={{ height: autoHeight ? undefined : 76 }}
            >
              <div className="text-sm" style={{ lineHeight: `${24 + gap}px` }}>
                {text.slice(3, 6).map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <figcaption className="text-muted-foreground text-xs">{text[6]}</figcaption>
    </figure>
  )
}
