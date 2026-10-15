'use client'

import { useLocale } from 'next-intl'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { clsx } from '@/lib/clsx'

const labels: Record<string, string[]> = {
  'en-US': [
    'Text wrapping around an image',
    'Switch layouts and follow the text beside and below the image.',
    'Inline',
    'Square',
    'Top and bottom',
    'Univer Docs illustration',
    'An inline image occupies a position in the text, like a large character.',
    'Square wrapping lets text flow beside the rectangular image.',
    'Top and bottom wrapping reserves the full line width for the image.',
    'Univer Docs combines text, images, and page layout in an editable document. Use headings to organize ideas and images to explain details. The wrapping style controls how surrounding text flows. Choose a layout that keeps the reading order clear as the document changes.',
  ],
  'zh-CN': [
    '图文环绕示意',
    '切换布局，观察图片旁边和下方的文字如何流动。',
    '嵌入型',
    '四周型',
    '上下型',
    'Univer Docs 示意图',
    '嵌入型图片像一个大字符，占据文本中的一个位置。',
    '四周型允许文字沿图片的矩形边界排列。',
    '上下型为图片保留整行宽度，文字位于图片上方和下方。',
    'Univer Docs 将文字、图片与页面布局组合成可编辑的文档。标题让内容层次清晰，图片帮助解释细节。环绕方式决定了附近文字如何流动。选择合适的布局，可以在修改内容时保持清楚的阅读顺序。试着切换图片的环绕方式，比较段落位置、行间距和留白的变化。',
  ],
  'zh-TW': [
    '圖文環繞示意',
    '切換版面配置，觀察圖片旁邊和下方的文字如何流動。',
    '嵌入型',
    '矩形',
    '上下型',
    'Univer Docs 示意圖',
    '嵌入型圖片如同一個大字元，佔據文字中的一個位置。',
    '矩形環繞允許文字沿圖片的矩形邊界排列。',
    '上下型為圖片保留整行寬度，文字位於圖片上方和下方。',
    'Univer Docs 將文字、圖片與頁面配置組合成可編輯的文件。標題讓內容層次清楚，圖片協助解釋細節。環繞方式決定附近文字如何流動。選擇合適的配置，可以在修改內容時維持清楚的閱讀順序。試著切換圖片的環繞方式，比較段落位置、行距和留白的變化。',
  ],
  'ja-JP': [
    '画像と文字列の折り返し',
    '配置を切り替えて、画像の横や下の文字の流れを確認します。',
    '行内',
    '四角形',
    '上下',
    'Univer Docs の模式図',
    '行内画像は大きな文字のようにテキスト内の位置を占めます。',
    '四角形では、画像の矩形の周囲に文字が回り込みます。',
    '上下では画像のために行幅全体を確保します。',
    'Univer Docs は、テキスト、画像、ページレイアウトを編集可能な文書にまとめます。見出しで内容を整理し、画像で詳細を伝えます。折り返しの設定によって周囲の文字の流れが変わります。内容を編集しても読み順がわかりやすい配置を選びましょう。設定を切り替えて、段落や余白の変化を比べてください。',
  ],
  'ko-KR': [
    '이미지 주위 텍스트 배치',
    '배치를 바꾸고 이미지 옆과 아래의 텍스트 흐름을 확인하세요.',
    '글자처럼',
    '사각형',
    '위아래',
    'Univer Docs 예시 그림',
    '인라인 이미지는 큰 글자처럼 텍스트 안의 한 위치를 차지합니다.',
    '사각형 배치는 이미지의 직사각형 경계 옆으로 텍스트를 흐르게 합니다.',
    '위아래 배치는 이미지에 줄 전체 너비를 할당합니다.',
    'Univer Docs는 텍스트, 이미지, 페이지 배치를 편집 가능한 문서로 결합합니다. 제목으로 내용을 정리하고 이미지로 세부 내용을 설명하세요. 배치 방식에 따라 주변 텍스트의 흐름이 달라집니다. 문서를 수정해도 읽는 순서가 명확하도록 배치하세요. 설정을 바꿔 문단의 위치와 여백 변화를 비교해 보세요.',
  ],
  'fr-FR': [
    'Habillage du texte autour d’une image',
    'Changez la disposition et observez le texte à côté et sous l’image.',
    'Aligné sur le texte',
    'Carré',
    'Haut et bas',
    'Illustration Univer Docs',
    'Une image alignée occupe une position dans le texte, comme un grand caractère.',
    'L’habillage carré fait circuler le texte autour du rectangle de l’image.',
    'Le mode haut et bas réserve toute la largeur de la ligne à l’image.',
    'Univer Docs réunit texte, images et mise en page dans un document modifiable. Les titres organisent les idées et les images en expliquent les détails. Le style d’habillage détermine le parcours du texte. Choisissez une disposition qui conserve un ordre de lecture clair quand le contenu évolue.',
  ],
  'es-ES': [
    'Ajuste del texto alrededor de una imagen',
    'Cambia la disposición y observa el texto junto a la imagen y debajo de ella.',
    'En línea',
    'Cuadrado',
    'Arriba y abajo',
    'Ilustración de Univer Docs',
    'Una imagen en línea ocupa una posición en el texto, como un carácter grande.',
    'El ajuste cuadrado permite que el texto fluya junto al rectángulo de la imagen.',
    'El ajuste arriba y abajo reserva todo el ancho de la línea para la imagen.',
    'Univer Docs combina texto, imágenes y diseño de página en un documento editable. Los títulos organizan las ideas y las imágenes explican los detalles. El estilo de ajuste controla el flujo del texto. Elige una disposición que mantenga un orden de lectura claro al modificar el contenido.',
  ],
  'ru-RU': [
    'Обтекание изображения текстом',
    'Переключите размещение и проследите за текстом сбоку и снизу изображения.',
    'В строке',
    'Вокруг рамки',
    'Сверху и снизу',
    'Иллюстрация Univer Docs',
    'Изображение в строке занимает место в тексте, как большой символ.',
    'Обтекание вокруг рамки располагает текст рядом с прямоугольником изображения.',
    'Размещение сверху и снизу отводит изображению всю ширину строки.',
    'Univer Docs объединяет текст, изображения и разметку страницы в редактируемом документе. Заголовки упорядочивают идеи, а изображения поясняют детали. Стиль обтекания управляет потоком текста. Выберите расположение, которое сохраняет понятный порядок чтения при изменении содержимого.',
  ],
}

export function ImageWrapDemo() {
  const text = labels[useLocale()]
  const [mode, setMode] = useState(1)

  return (
    <section aria-label={text[0]} className="not-prose bg-card my-6 space-y-4 rounded-xl border p-4 text-sm sm:p-5">
      <div className="space-y-1">
        <p className="font-medium">{text[0]}</p>
        <p className="text-muted-foreground">{text[1]}</p>
      </div>
      <div role="group" aria-label={text[0]} className="flex flex-wrap gap-2">
        {[0, 1, 2].map((value) => (
          <Button
            key={value}
            size="sm"
            variant={mode === value ? 'default' : 'outline'}
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
          >
            {text[value + 2]}
          </Button>
        ))}
      </div>
      <div className="bg-background mx-auto max-w-xl rounded-md border p-4 sm:p-6">
        <p className="mb-4 font-semibold">Univer Docs</p>
        <p className="text-muted-foreground flow-root text-sm leading-7">
          <span
            role="img"
            aria-label={text[5]}
            className={clsx(
              'border-primary/30 bg-primary/10 text-primary h-24 w-28 overflow-hidden rounded-md border p-3',
              mode === 0 ? 'mr-2 inline-block align-baseline' : mode === 1 ? 'float-left mr-4 mb-2' : 'mb-4 block',
            )}
          >
            <span aria-hidden="true" className="flex h-full flex-col justify-center gap-2">
              <span className="text-base font-semibold">Docs</span>
              <span className="h-1.5 w-full rounded bg-current opacity-40" />
              <span className="h-1.5 w-3/4 rounded bg-current opacity-25" />
              <span className="h-1.5 w-1/2 rounded bg-current opacity-25" />
            </span>
          </span>
          <span>{text[9]}</span>
        </p>
      </div>
      <p role="status" className="text-muted-foreground text-xs leading-5">
        {text[mode + 6]}
      </p>
    </section>
  )
}
