import enUS from '@univerjs/sheets-formula/locale/en-US'
import zhCN from '@univerjs/sheets-formula/locale/zh-CN'
import { getFormulaLocale } from '@/i18n/locale-config'

const functionList = {
  'zh-CN': zhCN['sheets-formula'].functionList,
  'en-US': enUS['sheets-formula'].functionList,
}

interface IProps {
  lang: string
}

export default function FormuaList(props: IProps) {
  const { lang } = props

  const formula = functionList[getFormulaLocale(lang)]

  return (
    <details className="mt-6">
      <summary className="cursor-pointer font-medium">
        Functions - (
        {Object.keys(formula).length}
        )
      </summary>

      <div className="relative mt-6 overflow-x-auto">
        <table
          className={`
            w-full text-left text-sm
            rtl:text-right
          `}
        >
          <tbody>
            {Object.keys(formula).map(key => (
              <tr key={key}>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium whitespace-nowrap"
                >
                  {key}
                </th>
                <td className="px-6 py-4">
                  {formula[key as keyof typeof formula].description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
