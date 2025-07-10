export interface IPager {
  pageIndex: number // Current page number
  pageSize: number // How many rows of data are displayed on each page
  total: number // Total number of rows of data
  selectOption: [number, number] // Options that allow setting the number of rows per page
}
