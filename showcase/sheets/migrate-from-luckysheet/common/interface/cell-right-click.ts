export interface ICellRightClickConfig {
  copy: boolean // copy
  copyAs: boolean // copy as
  paste: boolean // paste
  insertRow: boolean // insert row
  insertColumn: boolean // insert column
  deleteRow: boolean // delete the selected row
  deleteColumn: boolean // delete the selected column
  deleteCell: boolean // delete cell
  hideRow: boolean // hide the selected row and display the selected row
  hideColumn: boolean // hide the selected column and display the selected column
  rowHeight: boolean // row height
  columnWidth: boolean // column width
  clear: boolean // clear content
  matrix: boolean // matrix operation selection
  sort: boolean // sort selection
  filter: boolean // filter selection
  chart: boolean // chart generation
  image: boolean // insert picture
  link: boolean // insert link
  data: boolean // data verification
  cellFormat: false // Set cell format
  customs: object[] // Custom menu
}
