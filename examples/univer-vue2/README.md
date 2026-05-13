# Univer Vue 2 Example

This example demonstrates how to integrate Univer Sheets into a Vue 2 application.

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
npm run serve
```

The application will be available at `http://localhost:8080` by default.

## Project Structure

| File                        | Description                         |
| --------------------------- | ----------------------------------- |
| `src/main.js`               | Application entry point             |
| `src/App.vue`               | Root component                      |
| `src/components/Univer.vue` | Univer Sheets integration component |

## Key Integration Points

- Uses `@univerjs/preset-sheets-core` via the preset mode for quick setup.
- The `Univer` component creates a Univer instance in the `mounted` lifecycle hook and mounts it to a container `div` via template ref.
- Disposes the Univer instance in `beforeUnmount` to avoid memory leaks.
- Remember to import the preset CSS file: `@univerjs/preset-sheets-core/lib/index.css`.
- Call `univerAPI.createWorkbook({})` to initialize an empty workbook.

For more details, see the [Univer Sheets Quickstart](https://docs.univer.ai/guides/sheets/getting-started/quickstart) documentation.
