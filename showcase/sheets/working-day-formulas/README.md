# Working-day Formulas

Six rows compare WORKDAY, NETWORKDAYS and their .INTL variants using numeric Excel date serials with native date formatting. Unlike date validation or number-format examples, this demo calculates deadlines and counts working days.

- Standard calendar: Saturday and Sunday plus the editable holiday range H5:H6.
- Without holidays: the same start and offset, excluding weekends only.
- International calendars: Friday/Saturday off (7), Sunday only off (11), or a Monday-to-Sunday text mask (0000110).
- Work backwards: a negative offset calculates an earlier working date.

Edit C5 from 5 to 4: E5 changes from Sep 16 to Sep 15, 2026; F5 changes from 6 to 5. Edit H5:H6 to explore holiday exclusions. Select E5:F10 to inspect the native formulas.

WORKDAY does not count the starting day. NETWORKDAYS counts eligible endpoints, so the two results are not interchangeable. The backwards row counts from its result date to its starting date.

The installed SDK currently mishandles single-cell references for the first two WORKDAY.INTL arguments. These formulas use numeric expressions (`B7+0` and `C7+0`) to pass scalar values. The formulas still reference editable cells and recalculate natively; weekend patterns and holiday ranges remain normal references.

The preview and exported entry use the same factory, full English preset locale and official preset CSS. All edits use the native grid; there are no extra action panels.
