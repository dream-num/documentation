# Univer Astro Example

This example demonstrates how to integrate Univer Sheets into an Astro application.

## Prerequisites

- Node.js >= 18
- npm / pnpm / yarn

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:4321` by default.

## Project Structure

| File                    | Description                               |
| ----------------------- | ----------------------------------------- |
| `src/pages/index.astro` | Index page with inline Univer integration |

## Key Integration Points

- Uses `@univerjs/preset-sheets-core` via the preset mode for quick setup.
- Univer is initialized directly in an inline `<script>` tag within the Astro page.
- The `container` option receives the DOM element where Univer will be mounted.
- Remember to import the preset CSS file: `@univerjs/preset-sheets-core/lib/index.css`.
- Call `univerAPI.createWorkbook({})` to initialize an empty workbook.

For more details, see the [Univer Sheets Quickstart](https://docs.univer.ai/guides/sheets/getting-started/quickstart) documentation.
