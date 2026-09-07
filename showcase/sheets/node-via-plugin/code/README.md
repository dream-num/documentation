# Headless Univer Sheets

Install the generated dependencies, then run the TypeScript entry with Node 22 or newer:

```bash
node --experimental-strip-types src/index.ts
```

The program creates the Northstar workbook through `FUniver.createWorkbook()`, prints the `FWorkbook.save()` snapshot and disposes the owning `Univer`. It has no browser UI, so no Univer UI CSS is required.
