import type { IBorderData, IStyleData, IWorksheetData } from '@univerjs/presets'

export function border(newSheet: Partial<IWorksheetData>, sheet: any) {
  newSheet.cellData = {}
  for (const borderInfo of sheet.config.borderInfo) {
    if (borderInfo.rangeType === 'cell') {
      const rowIndex = borderInfo.value.row_index
      const colIndex = borderInfo.value.col_index

      if (!newSheet.cellData[rowIndex]) {
        newSheet.cellData[rowIndex] = {}
      }

      if (!newSheet.cellData[rowIndex][colIndex]) {
        newSheet.cellData[rowIndex][colIndex] = {}
      }

      if (!newSheet.cellData[rowIndex][colIndex].s) {
        newSheet.cellData[rowIndex][colIndex].s = {}
      }

      const newBorder: IBorderData = {}

      if (borderInfo.value.l) {
        newBorder.l = {
          s: Number(borderInfo.value.l.style),
          cl: {
            rgb: borderInfo.value.l.color,
          },
        }

        if (newSheet.cellData[rowIndex] && (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.r) {
          delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.r
        }
      }
      if (borderInfo.value.r) {
        newBorder.r = {
          s: Number(borderInfo.value.r.style),
          cl: {
            rgb: borderInfo.value.r.color,
          },
        }

        if (newSheet.cellData[rowIndex] && (newSheet.cellData[rowIndex][Number(colIndex) + 1]?.s as IStyleData)?.bd?.l) {
          delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.l
        }
      }
      if (borderInfo.value.t) {
        newBorder.t = {
          s: Number(borderInfo.value.t.style),
          cl: {
            rgb: borderInfo.value.t.color,
          },
        }

        if (newSheet.cellData[rowIndex - 1] && (newSheet.cellData[rowIndex][colIndex]?.s as IStyleData)?.bd?.b) {
          delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.b
        }
      }
      if (borderInfo.value.b) {
        newBorder.b = {
          s: Number(borderInfo.value.b.style),
          cl: {
            rgb: borderInfo.value.b.color,
          },
        }

        if (newSheet.cellData[Number(rowIndex) + 1] && (newSheet.cellData[rowIndex][colIndex]?.s as IStyleData)?.bd?.t) {
          delete (newSheet.cellData[rowIndex][colIndex - 1]?.s as IStyleData)?.bd?.t
        }
      }

      (newSheet.cellData[rowIndex][colIndex].s as IStyleData).bd = Object.assign((newSheet.cellData[rowIndex][colIndex].s as IStyleData).bd || {}, newBorder)
    } else if (borderInfo.rangeType === 'range') {
      for (const range of borderInfo.range) {
        const startRow = range.row[0]
        const endRow = range.row[1]
        const startColumn = range.column[0]
        const endColumn = range.column[1]

        switch (borderInfo.borderType) {
          case 'border-left':
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn; c < startColumn + 1; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                newBorder.l = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                };

                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign((newSheet.cellData[r][c].s as IStyleData).bd || {}, newBorder)
              }
            }

            // remove the right border of the left cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn - 1; c < startColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                  delete (newSheet.cellData[r][c].s as IStyleData)?.bd?.r
                }
              }
            }

            break
          case 'border-right':
            for (let r = startRow; r <= endRow; r++) {
              for (let c = endColumn; c < endColumn + 1; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                newBorder.r = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                };

                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign((newSheet.cellData[r][c].s as IStyleData).bd || {}, newBorder)
              }
            }

            // remove the left border of the right cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = endColumn + 1; c < endColumn + 2; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.l
                }
              }
            }

            break
          case 'border-top':
            for (let r = startRow; r < startRow + 1; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                newBorder.t = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                };

                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign((newSheet.cellData[r][c].s as IStyleData).bd || {}, newBorder)
              }
            }

            // remove the bottom border of the upper cell
            for (let r = startRow - 1; r < startRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.b
                }
              }
            }

            break
          case 'border-bottom':
            for (let r = endRow; r < endRow + 1; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                newBorder.b = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                };

                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign((newSheet.cellData[r][c].s as IStyleData).bd || {}, newBorder)
              }
            }

            // remove the top border of the lower cell
            for (let r = endRow + 1; r < endRow + 2; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.t
                }
              }
            }

            break
          case 'border-all':
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                // All cells have an upper left border, the last column has a right border, and the last row has a bottom border.
                newBorder.l = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                }

                newBorder.t = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                }

                if (c === endColumn) {
                  newBorder.r = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                }

                if (r === endRow) {
                  newBorder.b = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                }

                (newSheet.cellData[r][c].s as IStyleData).bd = newBorder
              }
            }

            // remove the right border of the left cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn - 1; c < startColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.r
                }
              }
            }

            // remove the left border of the right cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = endColumn + 1; c < endColumn + 2; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.l
                }
              }
            }

            // remove the bottom border of the upper cell
            for (let r = startRow - 1; r < startRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.b
                }
              }
            }

            // remove the top border of the lower cell
            for (let r = endRow + 1; r < endRow + 2; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.t
                }
              }
            }

            break
          case 'border-outside':
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                // first row
                if (r === startRow) {
                  newBorder.t = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                }
                // last row
                if (r === endRow) {
                  newBorder.b = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                }
                // first column
                if (c === startColumn) {
                  newBorder.l = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                }
                // last column
                if (c === endColumn) {
                  newBorder.r = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                }

                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign((newSheet.cellData[r][c].s as IStyleData).bd || {}, newBorder)
              }
            }

            // remove the right border of the left cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn - 1; c < startColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.r
                }
              }
            }

            // remove the left border of the right cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = endColumn + 1; c < endColumn + 2; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.l
                }
              }
            }

            // remove the bottom border of the upper cell
            for (let r = startRow - 1; r < startRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.b
                }
              }
            }

            // remove the top border of the lower cell
            for (let r = endRow + 1; r < endRow + 2; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.t
                }
              }
            }

            break
          case 'border-inside':
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                // first row, first column, no style
                // first row, left border
                // first column, top border
                // others, top left border
                if (r === startRow && c === startColumn) {
                  continue
                }

                if (r === startRow) {
                  newBorder.l = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                } else if (c === startColumn) {
                  newBorder.t = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                } else {
                  newBorder.l = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }

                  newBorder.t = {
                    s: Number(borderInfo.style),
                    cl: {
                      rgb: borderInfo.color,
                    },
                  }
                }

                (newSheet.cellData[r][c].s as IStyleData).bd = newBorder
              }
            }

            break
          case 'border-horizontal':
            for (let r = startRow; r < endRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                newBorder.b = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                };

                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign((newSheet.cellData[r][c].s as IStyleData).bd || {}, newBorder)
              }
            }

            // remove the top border starting from the second line
            for (let r = startRow + 1; r <= endRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.t
                }
              }
            }

            break
          case 'border-vertical':
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn; c < endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  newSheet.cellData[r] = {}
                }

                if (!newSheet.cellData[r][c]) {
                  newSheet.cellData[r][c] = {}
                }

                if (!newSheet.cellData[r][c].s) {
                  newSheet.cellData[r][c].s = {}
                }

                const newBorder: IBorderData = {}

                newBorder.r = {
                  s: Number(borderInfo.style),
                  cl: {
                    rgb: borderInfo.color,
                  },
                };

                (newSheet.cellData[r][c].s as IStyleData).bd = Object.assign((newSheet.cellData[r][c].s as IStyleData).bd || {}, newBorder)
              }
            }

            // remove the left border at the beginning of the second column
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn + 1; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.l
                }
              }
            }

            break
          case 'border-none':
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (!newSheet.cellData[r]) {
                  continue
                }

                if (!newSheet.cellData[r][c]) {
                  continue
                }

                if (!newSheet.cellData[r][c].s) {
                  continue
                }

                // place empty
                const newBorder: IBorderData = {};

                (newSheet.cellData[r][c].s as IStyleData).bd = newBorder
              }
            }

            // remove the right border of the left cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startColumn - 1; c < startColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.r) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.r
                }
              }
            }

            // remove the left border of the right cell
            for (let r = startRow; r <= endRow; r++) {
              for (let c = endColumn + 1; c < endColumn + 2; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.l) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.l
                }
              }
            }

            // remove the bottom border of the upper cell
            for (let r = startRow - 1; r < startRow; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.b) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.b
                }
              }
            }

            // remove the top border of the lower cell
            for (let r = endRow + 1; r < endRow + 2; r++) {
              for (let c = startColumn; c <= endColumn; c++) {
                if (newSheet.cellData[r] && (newSheet.cellData[r][c]?.s as IStyleData)?.bd?.t) {
                  delete (newSheet.cellData[r][c].s as IStyleData).bd?.t
                }
              }
            }

            break

          default:
            break
        }
      }
    }
  }
}
