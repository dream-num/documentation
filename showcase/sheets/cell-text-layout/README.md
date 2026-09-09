# Cell Text Layout

Three short native Sheets samples focus on presentation, not text transformation or number formatting. Edit the cells and use the existing Grid ribbon; there are no duplicate host buttons.

## Alignment

B5:D7 contains the same text in nine horizontal/vertical combinations. Columns compare left, center and right; rows compare top, middle and bottom. Tall rows make vertical placement visible.

## Wrap, clip, overflow

B5, B7, B9 and B11 contain the same complete sentence. WRAP displays multiple lines; CLIP hides text beyond the cell edge. OVERFLOW continues through empty neighbors but stops at occupied cells. C11 already contains `BLOCK`.

Select C9 using the name box and enter `BLOCK`: B9 stops overflowing. Delete C9 to restore overflow. Neither action modifies B9's text. Select B7 to inspect its full value in the formula bar.

## Rotation

A5:D5 displays the same label at 0, 45, -45 and 90 degrees. These are native cell text styles, not rotated HTML elements or images.

## Facade recipes

```ts
const workbook = window.univerAPI.getActiveWorkbook()
workbook.setActiveSheet('alignment')
workbook.getActiveSheet().getRange('B5')
  .setHorizontalAlignment('right')
  .setVerticalAlignment('bottom')
```

B5 moves from top-left to bottom-right without changing its text.

```ts
const workbook = window.univerAPI.getActiveWorkbook()
workbook.setActiveSheet('wrapping')
workbook.getActiveSheet().getRange('B7')
  .setWrapStrategy(window.univerAPI.Enum.WrapStrategy.WRAP)
```

B7 switches from clipping to wrapping; increase its row height if more space is needed.

```ts
const workbook = window.univerAPI.getActiveWorkbook()
workbook.setActiveSheet('rotation')
workbook.getActiveSheet().getRange('B5').setTextRotation(0)
```

B5 returns from 45 degrees to horizontal. All recipes use the installed Sheets Facade. Preview and standalone source share the factory, official core preset CSS and complete English locale.
