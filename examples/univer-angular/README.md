# Univer Angular Example

This example demonstrates how to integrate Univer Sheets into an Angular application.

## Prerequisites

- Node.js >= 18
- npm / pnpm / yarn
- Angular CLI

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
ng serve
```

The application will be available at `http://localhost:4200` by default.

## Project Structure

| File               | Description                                  |
| ------------------ | -------------------------------------------- |
| `src/main.ts`      | Application bootstrap entry point            |
| `src/app/app.ts`   | Root component with Univer integration logic |
| `src/app/app.html` | Root component template                      |

## Key Integration Points

- Uses `@univerjs/preset-sheets-core` via the preset mode for quick setup.
- The `App` component creates a Univer instance in `ngOnInit` using a `ViewChild` reference to the container element.
- Disposes the Univer instance in `ngOnDestroy` to avoid memory leaks.
- Remember to import the preset CSS file: `@univerjs/preset-sheets-core/lib/index.css`.
- Call `univerAPI.createWorkbook({})` to initialize an empty workbook.

For more details, see the [Univer Sheets Quickstart](https://docs.univer.ai/guides/sheets/getting-started/quickstart) documentation.
