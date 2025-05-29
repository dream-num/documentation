export interface IluckySheetAuthority {
  selectLockedCells: number // Select locked cells
  selectunLockedCells: number // Select unlocked cells
  formatCells: number // Format cells
  formatColumns: number // Format columns
  formatRows: number // Format rows
  insertColumns: number // Insert columns
  insertRows: number // Insert rows
  insertHyperlinks: number // Insert hyperlinks
  deleteColumns: number // Delete columns
  deleteRows: number // Delete rows
  sort: number // Sort
  filter: number // Filter
  usePivotTablereports: number // Use Pivot Table reports
  editObjects: number // Edit objects
  editScenarios: number // Edit scenarios
  sheet: number // If it is 1 or true, the worksheet is protected; if it is 0 or false, the worksheet is not protected.
  hintText: string // The text of the pop-up prompt
  algorithmName: string// Encryption scheme: MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
  saltValue: string | null // The salt parameter for password decryption is a random value set by yourself
  allowRangeList: IluckySheetAuthorityAllowRangeList[] // Range protection
}

export interface IluckySheetAuthorityAllowRangeList {
  name: string // Name
  password: string // Password
  hintText: string // Prompt text
  algorithmName: string// Encryption scheme: MD2,MD4,MD5,RIPEMD-128,RIPEMD-160,SHA-1,SHA-256,SHA-384,SHA-512,WHIRLPOOL
  saltValue: string | null // The salt parameter for password decryption is a random value set by yourself
  sqref: string // Protected range
}
