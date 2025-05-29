export interface IShowToolbarConfig {
  undoRedo: boolean // Undo redo
  paintFormat: boolean // Format brush
  currencyFormat: boolean // currency format
  percentageFormat: boolean // Percentage format
  numberDecrease: boolean // 'Decrease the number of decimal places'
  numberIncrease: boolean // 'Increase the number of decimal places
  moreFormats: boolean // 'More Formats'
  font: boolean // 'font'
  fontSize: boolean // 'Font size'
  bold: boolean // 'Bold (Ctrl+B)'
  italic: boolean // 'Italic (Ctrl+I)'
  strikethrough: boolean // 'Strikethrough (Alt+Shift+5)'
  underline: boolean // 'Underline (Alt+Shift+6)'
  textColor: boolean // 'Text color'
  fillColor: boolean // 'Cell color'
  border: boolean // 'border'
  mergeCell: boolean // 'Merge cells'
  horizontalAlignMode: boolean // 'Horizontal alignment'
  verticalAlignMode: boolean // 'Vertical alignment'
  textWrapMode: boolean // 'Wrap mode'
  textRotateMode: boolean // 'Text Rotation Mode'
  image: boolean // 'Insert picture'
  link: boolean // 'Insert link'
  chart: boolean // 'chart' (the icon is hidden, but if the chart plugin is configured, you can still create a new chart by right click)
  postil: boolean // 'comment'
  pivotTable: boolean // 'PivotTable'
  function: boolean // 'formula'
  frozenMode: boolean // 'freeze mode'
  sortAndFilter: boolean // 'Sort and filter'
  conditionalFormat: boolean // 'Conditional Format'
  dataVerification: boolean // 'Data Verification'
  splitColumn: boolean // 'Split column'
  screenshot: boolean // 'screenshot'
  findAndReplace: boolean // 'Find and Replace'
  protection: boolean // 'Worksheet protection'
  print: boolean // 'Print'
}
