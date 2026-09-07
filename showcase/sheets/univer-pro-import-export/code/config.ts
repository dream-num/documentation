// Only local snapshot codecs and Blob downloads are exercised in this frontend demo.
// Hiding these native entries does not turn Exchange into a local Office converter.
// Its public import/export APIs still require HTTP and must not be called here.
export const FRONTEND_ONLY_EXCHANGE_MENU = {
  'sheets-exchange-client.operation.exchange': { hidden: true },
  'sheets-exchange-client.operation.import-sheet': { hidden: true },
  'sheets-exchange-client.operation.export-sheet': { hidden: true },
}
