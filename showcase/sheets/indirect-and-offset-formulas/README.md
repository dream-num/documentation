# INDIRECT and OFFSET References

Edit the amber selector cells in **Reference lab**, or quantities in either studio tab. All outputs are native formulas; no JavaScript resolves addresses or calculates results. This example focuses on dynamically constructed references, not copied relative formulas or lookup matching.

H5 resolves A1 text (`B5`); H6 resolves absolute R1C1 text (`R5C2`) with the second INDIRECT argument FALSE. Both initially return 12. The formula quotes the selected sheet name because `North Studio` and `South Studio` contain spaces. H7 sums the selected text range B5:C7 and initially returns 125. These are same-workbook references, not external-file references. Relative bracketed R1C1 and defined names are not demonstrated here.

H10 sums a rectangle from the fixed anchor `North Studio!B5`. Initial offsets 1 row/0 columns and size 2 rows × 2 columns select B6:C7, totaling 73. H11 omits height/width and returns the top-left value 18. Changing the INDIRECT sheet selector does not change this explicitly North-anchored OFFSET reference.

H16 exposes an intentional #REF! from invalid text; H17 wraps it with IFERROR. H19 moves above row 1 and exposes #REF!; H20 displays the corresponding fallback. Error handling remains visible beside the raw error instead of hiding it.

## Public Facade recipes

Reload before each independent recipe. Wait for recalculation before reading results with `getRawValue()`.

### Retarget the quoted sheet name

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('lab')
sheet.getRange('B5').setValue('South Studio')
```

H5/H6 become 8 and H7 becomes 141; H10/H11 remain 73/18.

### Change both address styles

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('lab')
sheet.getRange('B6').setValue('C7')
sheet.getRange('B7').setValue('R7C3')
```

H5/H6 both become 30. The A1 and R1C1 selectors are independent text inputs.

### Move and resize the rectangle

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('lab')
sheet.getRange('B11').setValue(0)
sheet.getRange('B12').setValue(1)
sheet.getRange('B13').setValue(3)
sheet.getRange('B14').setValue(2)
```

H10 sums C5:D7 and becomes 107; H11 becomes 40. OFFSET returns a reference; SUM consumes the whole reference, not just its first cell.

### Recover an invalid text reference

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('lab')
sheet.getRange('B16').setValue("'North Studio'!D7")
```

H16/H17 both become 7. H19/H20 retain the separate out-of-bounds comparison.

When typing this reference directly into B16, enter `''North Studio'!D7`: the first apostrophe marks literal text, leaving `'North Studio'!D7` as the stored address. The Facade recipe above sets the stored string directly and does not need that extra apostrophe.

### Edit the real source

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('north')
sheet.getRange('B6').setValue(28)
```

H7 in Reference lab becomes 135; H10/H11 become 83/28. No formula strings or selector values need to change.
