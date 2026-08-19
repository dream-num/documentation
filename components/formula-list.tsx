import enUS from '@univerjs/engine-formula/locale/en-US'
import frFR from '@univerjs/engine-formula/locale/fr-FR'
import koKR from '@univerjs/engine-formula/locale/ko-KR'
import ruRU from '@univerjs/engine-formula/locale/ru-RU'
import zhCN from '@univerjs/engine-formula/locale/zh-CN'

import { getFormulaLocale } from '@/i18n/locale-config'

type FormulaLocale = ReturnType<typeof getFormulaLocale>
type FormulaList = Record<string, { description: string }>

const functionList: Record<FormulaLocale, FormulaList> = {
  'zh-CN': zhCN['engine-formula'].functionList,
  'en-US': enUS['engine-formula'].functionList,
  'fr-FR': frFR['engine-formula'].functionList,
  'ko-KR': koKR['engine-formula'].functionList,
  'ru-RU': ruRU['engine-formula'].functionList,
}

interface IProps {
  lang: string
}

export default function FormulaList(props: IProps) {
  const { lang } = props

  const formula = functionList[getFormulaLocale(lang)]

  return (
    <details className="mt-6">
      <summary className="cursor-pointer font-medium">Functions - ({Object.keys(formula).length})</summary>

      <div className="relative mt-6 overflow-x-auto">
        <table className={`w-full text-left text-sm rtl:text-right`}>
          <tbody>
            {Object.keys(formula).map((key) => (
              <tr key={key}>
                <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                  {key}
                </th>
                <td className="px-6 py-4">{formula[key].description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
