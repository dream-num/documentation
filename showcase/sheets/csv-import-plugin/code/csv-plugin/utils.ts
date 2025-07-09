/**
 * wait user select csv file
 */
export function waitUserSelectCSVFile(onSelect: (data: {
  data: string[][]
  colsCount: number
  rowsCount: number
}) => boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.click()

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result
        if (typeof text !== 'string') return

        // tip: use npm package to parse csv
        const rows = text.split(/\r\n|\n/)
        const data = rows.map(line => line.split(','))

        const colsCount = data.reduce((max, row) => Math.max(max, row.length), 0)

        const result = onSelect({
          data,
          colsCount,
          rowsCount: data.length,
        })

        resolve(result)
      }
      reader.readAsText(file)
    }
  })
}
