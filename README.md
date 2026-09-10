# Univer Documentation

This is the official documentation site for Web SDK, Server SDK, and AI SDK, built with [Next.js](https://nextjs.org/), Fumadocs headless content tooling, and project-owned UI.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22.18
- [pnpm](https://pnpm.io/) >= 12

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

The Icons preview, MCP endpoint, and downloadable metadata use `public/assets/icons/catalog.json`. To refresh it from a matching `univer-icons` checkout, run `node scripts/sync-icons-catalog.mjs ../univer-icons`. The sync checks that the source and installed package versions match and that every exported icon is covered. Production builds use the committed catalog.

The read-only Icons MCP runs at `/mcp/icons` in the existing Next.js Node server. It exposes `search_icons` and `get_icon` over Streamable HTTP without a model API key or separate process. Its Host/Origin allowlist covers `docs.univer.ai` and loopback hosts; update `app/mcp/icons/route.ts` when deploying under another hostname. With the site running, verify the endpoint using `DOCS_TEST_ORIGIN=http://localhost:3030 node --test app/mcp/icons/__tests__/route.spec.mjs`.

## Project Structure

```
├── app/              # Next.js application routes and layouts
├── components/       # React components for the documentation site
├── content/          # Documentation content (MDX)
│   ├── blog/         # Blog posts
│   ├── guides/       # Web SDK: editors, product features, and Icons (/guides)
│   ├── server/       # Server SDK: collaboration and server-side file exchange (/server)
│   ├── ai/           # AI SDK: agent operations, CLI, and Worktree (/ai)
│   └── reference/    # API reference
├── examples/         # Framework integration examples (React, Vue, Angular, Astro)
├── lib/              # Utility libraries
├── public/           # Static assets
└── scripts/          # Build and automation scripts
```

Product import/export feature guides stay in `content/guides/<product>/features`; server conversion, storage, and integration guides live in `content/server/import-export`.

## Contributing

We welcome contributions to the documentation. Please ensure your changes follow the existing style and conventions. Run `pnpm lint` and `pnpm typecheck` before submitting.

For more information about contributing to Web SDK, see the [main repository](https://github.com/dream-num/univer).

## Deploy Using ECS

To deploy the documentation site to ECS through GitHub Actions:

1. Open **Actions** and select **🕶️ Deploy Using ECS**.
2. Select the branch to deploy (for example, `dev`).
3. Set **Environment to deploy** to `staging` or `international`.
4. Select the **ACR registry** region: use `cn-shenzhen` for the `staging` environment, or `us-east-1` for the `international` environment.
5. Enter the required **ECS instance size** (for example, `32c64g`) and click **Run workflow**.

The workflow dispatches the deployment to `runner-machine`; the ECS region is derived from the selected ACR region (`cn-shenzhen` → `shenzhen`, `us-east-1` → `us-virginia`).
