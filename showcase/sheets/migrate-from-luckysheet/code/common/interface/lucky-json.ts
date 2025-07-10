import type { ICellRightClickConfig } from './cell-right-click'
import type { IFontList } from './font-list'
import type { ILoading } from './loading'
import type { ILuckySheet } from './lucky-sheet'
import type { IPager } from './pager'
import type { IShowSheetBarConfig } from './sheet-bar'
import type { ISheetRightClickConfig } from './sheet-right-click'
import type { IShowStatisticBarConfig } from './statistic-bar'
import type { IShowToolbarConfig } from './toolbar'
import type { IUserInfoObject, IUserMenuItem } from './user-info'

// reference https://dream-num.github.io/LuckysheetDocs/guide/config.html
export interface ILuckyJson {
  container: string // set the id of the DOM container
  title: string // set the name of the table
  lang: string // set language
  gridKey: string // Unique key
  loadUrl: string // Load the entire workbook
  loadSheetUrl: string // Load other worksheet celldata
  allowUpdate: boolean // Allow updates
  updateUrl: string // Update address
  updateImageUrl: string // Thumbnail update address
  data: Partial<ILuckySheet>[] // Worksheet configuration
  plugins: (object | string)[] // Plugins
  column: number // Number of columns
  row: number // Number of rows
  autoFormatw: boolean // Billion format
  accuracy: number // Accuracy
  allowCopy: boolean // Allow copy
  showtoolbar: boolean // Toolbar
  showtoolbarConfig: Partial<IShowToolbarConfig> // Customize Toolbar
  showinfobar: boolean // Information bar
  showsheetbar: boolean // Bottom sheet bar
  showsheetbarConfig: Partial<IShowSheetBarConfig> // Customize the bottom sheet bar
  showstatisticBar: boolean // The bottom count bar
  showstatisticBarConfig: Partial<IShowStatisticBarConfig> // Customize the bottom count bar
  enableAddRow: boolean // Allow adding rows
  enableAddBackTop: boolean // Allow back to top
  userInfo: string | boolean | IUserInfoObject // User Info
  userMenuItem: IUserMenuItem[] // User Information Menu
  myFolderUrl: string // Back button link
  devicePixelRatio: number // Device pixel ratio
  functionButton: string // Function Button
  showConfigWindowResize: boolean // Auto-indent interface
  forceCalculation: boolean // Forced calculation
  cellRightClickConfig: Partial<ICellRightClickConfig> // Custom cell context menu
  sheetRightClickConfig: Partial<ISheetRightClickConfig> // Customize the context menu of the bottom sheet bar
  rowHeaderWidth: number // The width of the row header area
  columnHeaderHeight: number // The height of the column header area
  sheetFormulaBar: boolean // Show the formula bar
  defaultFontSize: number // Default font size
  limitSheetNameLength: boolean // Limit the length of the worksheet name
  defaultSheetNameMaxLength: number // Default maximum allowed sheet name length
  pager: IPager // Pager
  fontList: IFontList[] // Font list
  hook: object // Hook
  loading: ILoading // Loading
}
