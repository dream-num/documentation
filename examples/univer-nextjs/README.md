# Univer Next.js Example

This example demonstrates how to integrate Univer Sheets into a Next.js application.

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

The application will be available at `http://localhost:3000` by default.

## Project Structure

| File                    | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| `app/page.tsx`          | Index page                                             |
| `components/univer.tsx` | Univer Sheets integration component (client component) |

## Key Integration Points

- Uses `@univerjs/preset-sheets-core` via the preset mode for quick setup.
- The `Univer` component is marked with `'use client'` since it uses React hooks (`useEffect`, `useRef`) to create and manage the Univer instance.
- The component creates a Univer instance inside `useEffect` and mounts it to a container `div`.
- Remember to import the preset CSS file: `@univerjs/preset-sheets-core/lib/index.css`.
- Call `univerAPI.createWorkbook({})` to initialize an empty workbook.

For more details, see the [Univer Sheets Quickstart](https://docs.univer.ai/guides/sheets/getting-started/quickstart) documentation.
