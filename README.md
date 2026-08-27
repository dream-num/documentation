# Univer Documentation

This is the official documentation site for [Univer](https://github.com/dream-num/univer), built with [Next.js](https://nextjs.org/), Fumadocs headless content tooling, and project-owned UI.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20.9
- [pnpm](https://pnpm.io/) >= 10

## Local Development

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

The site will be available at `http://localhost:3030`.

Build for production:

```bash
pnpm build
```

## Project Structure

```
├── app/              # Next.js application routes and layouts
├── components/       # React components for the documentation site
├── content/          # Documentation content (MDX)
│   ├── blog/         # Blog posts
│   ├── guides/       # User guides (docs, sheets, slides, pro, recipes)
│   ├── icons/        # Icons reference
│   └── reference/    # API reference
├── examples/         # Framework integration examples (React, Vue, Angular, Astro)
├── lib/              # Utility libraries
├── public/           # Static assets
└── scripts/          # Build and automation scripts
```

## Contributing

We welcome contributions to the documentation. Please ensure your changes follow the existing style and conventions. Run `pnpm lint` and `pnpm typecheck` before submitting.

For more information about contributing to Univer, see the [main repository](https://github.com/dream-num/univer).

## Deploy Using ECS

To deploy the documentation site to ECS through GitHub Actions:

1. Open **Actions** and select **🕶️ Deploy Using ECS**.
2. Select the branch to deploy (for example, `dev`).
3. Set **Environment to deploy** to `staging` or `international`.
4. Select the **ACR registry** region: use `cn-shenzhen` for the `staging` environment, or `us-east-1` for the `international` environment.
5. Enter the required **ECS instance size** (for example, `32c64g`) and click **Run workflow**.

The workflow dispatches the deployment to `runner-machine`; the ECS region is derived from the selected ACR region (`cn-shenzhen` → `shenzhen`, `us-east-1` → `us-virginia`).
