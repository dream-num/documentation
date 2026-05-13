# Univer Vue 3 Example

This example demonstrates how to integrate Univer Sheets into a Vue 3 application using Vite.

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

The application will be available at `http://localhost:5173` by default.

## Project Structure

| File                        | Description                         |
| --------------------------- | ----------------------------------- |
| `src/main.ts`               | Application entry point             |
| `src/App.vue`               | Root component                      |
| `src/components/Univer.vue` | Univer Sheets integration component |

## Key Integration Points

- Uses `@univerjs/preset-sheets-core` via the preset mode for quick setup.
- The `Univer` component creates a Univer instance in the `onMounted` lifecycle hook and mounts it to a container `div`.
- Disposes the Univer instance in `onBeforeUnmount` to avoid memory leaks.
- Remember to import the preset CSS file: `@univerjs/preset-sheets-core/lib/index.css`.
- Call `univerAPI.createWorkbook({})` to initialize an empty workbook.

For more details, see the [Univer Sheets Quickstart](https://docs.univer.ai/guides/sheets/getting-started/quickstart) documentation.
