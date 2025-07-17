import type { Workbook } from '@univerjs/presets'
import { clsx, IUniverInstanceService, UniverInstanceType } from '@univerjs/presets'
import { useEffect, useState } from 'react'
import { state } from '../state'

export function SwitchUnits() {
  const univer = state.getUniver()
  const injector = univer?.__getInjector()
  const univerInstanceService = injector?.get(IUniverInstanceService)

  const [sheets, setSheets] = useState<Workbook[]>([])
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null)

  useEffect(() => {
    if (!univerInstanceService) return

    const sheets = univerInstanceService.getAllUnitsForType<Workbook>(UniverInstanceType.UNIVER_SHEET)
    setSheets(sheets)

    const currentUnit$ = univerInstanceService.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_SHEET)
    const subscription = currentUnit$?.subscribe((unit) => {
      if (unit) {
        setActiveSheetId(unit.getUnitId())
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [univerInstanceService])

  function switchSheet(sheet: Workbook) {
    univerInstanceService?.focusUnit(sheet.getUnitId())
  }

  return (
    <div
      className={`
        bg-white
        dark:bg-neutral-900
      `}
    >
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden">
          <span
            className={`
              mr-3 text-sm font-medium text-neutral-600
              dark:text-neutral-100
            `}
          >
            Workbooks
          </span>

          {sheets.map((sheet) => {
            const isActive = sheet.getUnitId() === activeSheetId

            return (
              <div
                key={sheet.getUnitId()}
                onClick={() => switchSheet(sheet)}
                className={clsx(`
                  relative cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none
                  active:scale-95
                `, {
                  [`border-2 border-blue-300 bg-blue-100 text-blue-700 shadow-sm`]: isActive,
                  [`
                    border-2 border-transparent bg-neutral-50 text-neutral-700
                    hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900
                  `]: !isActive,
                })}
                title={sheet.getUnitId()}
              >
                <span className="max-w-32 truncate">
                  {sheet.getUnitId()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
